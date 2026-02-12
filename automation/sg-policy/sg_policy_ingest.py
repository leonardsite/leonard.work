#!/usr/bin/env python3
"""Ingest Singapore policy news into Notion: one row per department, announcements appended inside the department page.

Current Notion DB design (per Leonard):
- Database: 新加坡政策监测
- One row (page) per department/agency.
- No per-announcement rows.

This script:
- Reads local sources from tools/sg_policy_sources.yml
- For each selected source, fetches RSS or newsroom list page to discover candidate announcement URLs.
- For unseen announcements, fetches the detail page, computes content_hash, archives raw HTML (+ a few attachments),
  and appends a bullet under the department page in Notion.
- Maintains local state for dedup + traceability.

State:
- ~/clawd/tmp/sg_policy_ingest_state.json
Archive:
- ~/clawd/archive/sg_policy/YYYY-MM-DD/

Usage:
  python3 tools/sg_policy_ingest.py --notion-db <dbid> --only ICA --max-new 3 -v
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

try:
    import yaml  # type: ignore
except Exception:
    yaml = None

try:
    import requests  # type: ignore
except Exception:
    requests = None

ROOT = Path(os.getenv('SG_GOV_MONITOR_ROOT') or os.path.expanduser('~/Desktop/新加坡政府部门监控'))
SOURCES_YML = ROOT / 'scripts' / 'sg_policy_sources.yml'
STATE_PATH = ROOT / 'state' / 'sg_policy_ingest_state.json'
ARCHIVE_ROOT = ROOT / 'archive'

UA = "Mozilla/5.0 (X11; Linux x86_64) sg_policy_ingest/1.0"
NOTION_VERSION = "2022-06-28"

LINK_RE = re.compile(r"(?:href|data-href)=[\"']([^\"'#]+)[\"']", re.I)


def http_get(url: str, timeout: int = 20) -> str:
    if requests:
        r = requests.get(url, headers={"User-Agent": UA}, timeout=timeout)
        r.raise_for_status()
        return r.text
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="ignore")


def http_get_bytes(url: str, timeout: int = 20) -> bytes:
    if requests:
        r = requests.get(url, headers={"User-Agent": UA}, timeout=timeout)
        r.raise_for_status()
        return r.content
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def http_get_quick(url: str, timeout: int = 10) -> str:
    try:
        return http_get(url, timeout=timeout)
    except Exception:
        return ""


def normalize_url(u: str) -> str:
    p = urllib.parse.urlsplit(u)
    qs = urllib.parse.parse_qsl(p.query, keep_blank_values=True)
    drop_prefix = ("utm_", "gclid", "fbclid", "mc_cid", "mc_eid")
    qs2 = [(k, v) for (k, v) in qs if not k.lower().startswith(drop_prefix)]
    query = urllib.parse.urlencode(qs2, doseq=True)
    return urllib.parse.urlunsplit((p.scheme, p.netloc, p.path, query, ""))


def extract_links(html: str, base: str) -> list[str]:
    links: list[str] = []
    for m in LINK_RE.finditer(html or ""):
        href = m.group(1).strip()
        if not href:
            continue
        if href.startswith("javascript:") or href.startswith("mailto:"):
            continue
        if re.search(r"\.(css|js|map|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot)$", href, re.I):
            continue
        u = urllib.parse.urljoin(base, href)
        if u.startswith("http://") or u.startswith("https://"):
            links.append(normalize_url(u))

    out: list[str] = []
    seen: set[str] = set()
    for u in links:
        if u in seen:
            continue
        seen.add(u)
        out.append(u)
    return out


def extract_rss_links(xml_text: str) -> list[str]:
    if not (xml_text or "").strip():
        return []
    try:
        root = ET.fromstring(xml_text)
    except Exception:
        return []

    links: list[str] = []
    for el in root.findall(".//item/link"):
        if el.text:
            u = el.text.strip()
            if u.startswith("http://") or u.startswith("https://"):
                links.append(normalize_url(u))
    for el in root.findall(".//{*}entry/{*}link"):
        href = (el.attrib.get("href") or "").strip()
        if href.startswith("http://") or href.startswith("https://"):
            links.append(normalize_url(href))

    out: list[str] = []
    seen: set[str] = set()
    for u in links:
        if u in seen:
            continue
        seen.add(u)
        out.append(u)
    return out


def visible_text(html: str) -> str:
    s = html or ""
    s = re.sub(r"<script.*?</script>", " ", s, flags=re.I | re.S)
    s = re.sub(r"<style.*?</style>", " ", s, flags=re.I | re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def sha256_text(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def load_state() -> dict[str, Any]:
    if STATE_PATH.exists():
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    return {"seen_hashes": {}, "seen_urls": {}}


def save_state(state: dict[str, Any]) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def load_sources() -> list[dict[str, Any]]:
    txt = SOURCES_YML.read_text(encoding="utf-8")
    if yaml is None:
        raise SystemExit("PyYAML is required for sg_policy_ingest.py (install python3-yaml).")
    data = yaml.safe_load(txt)
    if not isinstance(data, list):
        raise SystemExit("sg_policy_sources.yml must be a list")
    return data


def notion_key() -> str:
    cfg = json.loads(Path(os.path.expanduser("~/.openclaw/openclaw.json")).read_text(encoding="utf-8"))
    return cfg["skills"]["entries"]["notion"]["apiKey"]


def notion_req(method: str, url: str, payload: dict[str, Any] | None, key: str) -> dict[str, Any]:
    headers = {
        "Authorization": f"Bearer {key}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def rt(text: str, url: str | None = None) -> list[dict[str, Any]]:
    if url:
        return [{"type": "text", "text": {"content": text, "link": {"url": url}}}]
    return [{"type": "text", "text": {"content": text}}]


def dept_code(name: str) -> str:
    return (name or "").strip().split()[0]


def find_dept_page_id(*, key: str, db_id: str, dept_name: str) -> str:
    # Query pages and match title exactly (best-effort)
    cursor = None
    while True:
        payload: dict[str, Any] = {"page_size": 100}
        if cursor:
            payload["start_cursor"] = cursor
        out = notion_req("POST", f"https://api.notion.com/v1/databases/{db_id}/query", payload, key)
        for r in out.get("results", []):
            props = r.get("properties", {})
            title = "".join([t.get("plain_text", "") for t in props.get("政府部门", {}).get("title", [])])
            if title.strip() == dept_name.strip():
                return r["id"]
        if not out.get("has_more"):
            break
        cursor = out.get("next_cursor")
    raise RuntimeError(f"Department row not found in Notion DB: {dept_name}")


def append_announcement(*, key: str, page_id: str, dept: str, item_url: str, title: str, content_hash: str, archive_rel: str) -> None:
    # Append a bullet line at end of the page.
    line = f"{title}"
    blocks = [
        {
            "object": "block",
            "type": "bulleted_list_item",
            "bulleted_list_item": {
                "rich_text": [
                    {"type": "text", "text": {"content": line, "link": {"url": item_url}}},
                    {"type": "text", "text": {"content": f"  （hash:{content_hash[:10]} | archive:{archive_rel}）"}},
                ]
            },
        }
    ]
    notion_req("PATCH", f"https://api.notion.com/v1/blocks/{page_id}/children", {"children": blocks}, key)


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--notion-db", required=True)
    p.add_argument("--only", default="", help="Only ingest for this department code (e.g. ICA)")
    p.add_argument("--max-new", type=int, default=5)
    p.add_argument("--timeout", type=int, default=15)
    p.add_argument("--budget", type=int, default=60)
    p.add_argument("-v", "--verbose", action="store_true")
    args = p.parse_args(argv)

    key = notion_key()
    state = load_state()
    seen_hashes: dict[str, str] = state.get("seen_hashes", {})
    seen_urls: dict[str, list[str]] = state.get("seen_urls", {})

    now = dt.datetime.now(dt.timezone(dt.timedelta(hours=8)))
    started = time.time()

    sources = load_sources()

    # filter sources by --only code
    if args.only:
        sources = [s for s in sources if dept_code(str(s.get("name", ""))) == args.only]

    new_total = 0

    for src in sources:
        if time.time() - started > args.budget:
            break
        if new_total >= args.max_new:
            break

        name = str(src.get("name") or "").strip()
        code = dept_code(name)
        domain = str(src.get("domain") or "").strip()
        newsroom = str(src.get("newsroom") or "").strip()
        rss = str(src.get("rss") or "").strip()
        api_list = str(src.get("api_list") or "").strip()
        api_json_post = src.get("api_json_post") or None
        sgpc_agency = str(src.get("sgpc_agency") or "").strip()
        if not name or not domain or (not newsroom and not rss and not api_list and not api_json_post and not sgpc_agency):
            continue

        src_key = sha256_text("|".join([name, domain, newsroom, rss, api_list]))[:16]
        prev = set(seen_urls.get(src_key, []))

        if args.verbose:
            sys.stderr.write(f"SOURCE {name} ({code})\n")

        candidates: list[str] = []

        # 0) SGPC API (for Incapsula-blocked sites like EDB, EMA, EnterpriseSG)
        if sgpc_agency:
            sgpc_url = f"https://www.sgpc.gov.sg/api/ApiMainListing/SubmitData?Agency={urllib.parse.quote(sgpc_agency)}&page=1"
            sgpc_txt = http_get_quick(sgpc_url, timeout=args.timeout)
            if sgpc_txt:
                try:
                    sgpc_data = json.loads(sgpc_txt)
                    for it in (sgpc_data.get("result") or {}).get("items") or []:
                        u = it.get("Url")
                        if u:
                            candidates.append(normalize_url(urllib.parse.urljoin("https://www.sgpc.gov.sg", u)))
                except Exception:
                    pass

        # 1) RSS
        if rss:
            feed = http_get_quick(rss, timeout=args.timeout)
            candidates.extend(extract_rss_links(feed)[:60])

        # 2) Official JSON/API list endpoint (preferred when provided)
        if api_list:
            year = now.year
            api_url = api_list.format(year=year)
            api_txt = http_get_quick(api_url, timeout=args.timeout)
            if api_txt.strip().startswith("{"):
                try:
                    data = json.loads(api_txt)
                    for it in (data.get("data") or [])[:80]:
                        u = it.get("url")
                        if not u:
                            continue
                        full = urllib.parse.urljoin(domain, u)
                        candidates.append(normalize_url(full))
                except Exception:
                    pass

        # 2b) JSON POST API (e.g. HPB /api/listingdata/getarticles)
        if api_json_post and isinstance(api_json_post, dict):
            api_url = str(api_json_post.get("url") or "")
            api_body = str(api_json_post.get("body") or "{}")
            items_path = str(api_json_post.get("items_path") or "items")
            url_field = str(api_json_post.get("url_field") or "url")
            if api_url:
                try:
                    post_data = api_body.encode("utf-8")
                    req = urllib.request.Request(api_url, data=post_data, headers={
                        "User-Agent": UA, "Content-Type": "application/json"
                    })
                    with urllib.request.urlopen(req, timeout=args.timeout) as resp:
                        api_resp = json.loads(resp.read().decode("utf-8"))
                    items = api_resp.get(items_path) or []
                    for it in items[:80]:
                        u = it.get(url_field)
                        if u:
                            candidates.append(normalize_url(urllib.parse.urljoin(domain, u)))
                except Exception:
                    pass

        # 3) Newsroom HTML list page (best-effort; may be JS-rendered)
        if newsroom:
            html = http_get_quick(newsroom, timeout=args.timeout)
            if html:
                links = extract_links(html, newsroom)
                dom = urllib.parse.urlsplit(domain).netloc
                links = [u for u in links if urllib.parse.urlsplit(u).netloc.endswith(dom)]

                hint = ""
                for h in ["media-releases", "media-release", "press-releases", "press-release", "press-releases-and-statements", "news-releases", "news-release"]:
                    if h in newsroom.lower():
                        hint = h
                        break

                if hint:
                    links = [u for u in links if hint in u.lower()]
                else:
                    if "newsroom" in newsroom.lower():
                        links = [u for u in links if "/newsroom/" in u.lower()]
                        type_hints = ["/media-release/", "/press-release/", "/news-release/", "/response/", "/statement/"]
                        links2 = [u for u in links if any(t in u.lower() for t in type_hints)]
                        if links2:
                            links = links2

                links = [u for u in links if len(urllib.parse.urlsplit(u).path.strip("/").split("/")) >= 2]
                candidates.extend(links[:120])

        # dedupe candidates
        cand2: list[str] = []
        sset: set[str] = set()
        for u in candidates:
            if u in sset:
                continue
            sset.add(u)
            cand2.append(u)

        # find dept page
        try:
            dept_page_id = find_dept_page_id(key=key, db_id=args.notion_db, dept_name=name)
        except Exception as e:
            sys.stderr.write(f"WARN: {e}\n")
            continue

        added = 0
        for item_url in cand2:
            if time.time() - started > args.budget:
                break
            if new_total >= args.max_new:
                break
            if added >= args.max_new:
                break
            if item_url in prev:
                continue

            raw_html = http_get_quick(item_url, timeout=args.timeout)
            prev.add(item_url)
            if not raw_html:
                continue

            # title
            title = ""
            m = re.search(r"<title>(.*?)</title>", raw_html, re.I | re.S)
            if m:
                title = re.sub(r"\s+", " ", m.group(1)).strip()
            title = title or item_url

            text = visible_text(raw_html)[:20000]
            atts = [u for u in extract_links(raw_html, item_url) if re.search(r"\.(pdf|docx?|xlsx?|pptx?)$", u, re.I)]
            atts = list(dict.fromkeys(atts))[:20]
            norm = "\n".join([title.strip(), text, "\n".join(atts)])
            content_hash = sha256_text(norm)

            if content_hash in seen_hashes:
                continue

            # archive
            date_dir = ARCHIVE_ROOT / now.strftime("%Y-%m-%d")
            date_dir.mkdir(parents=True, exist_ok=True)
            safe = re.sub(r"[^a-zA-Z0-9\u4e00-\u9fff_-]+", "-", title)[:80]
            stem = f"{code}-{safe}-{content_hash[:10]}"
            html_path = date_dir / f"{stem}.html"
            html_path.write_text(raw_html, encoding="utf-8", errors="ignore")

            # download a couple attachments best-effort
            dl = 0
            for au in atts:
                if dl >= 2:
                    break
                try:
                    b = http_get_bytes(au, timeout=args.timeout)
                except Exception:
                    continue
                ext = os.path.splitext(urllib.parse.urlsplit(au).path)[1] or ".bin"
                (date_dir / f"{stem}-att{dl+1}{ext}").write_bytes(b)
                dl += 1

            archive_rel = str(html_path.relative_to(ROOT))
            append_announcement(
                key=key,
                page_id=dept_page_id,
                dept=name,
                item_url=item_url,
                title=title,
                content_hash=content_hash,
                archive_rel=archive_rel,
            )

            seen_hashes[content_hash] = item_url
            added += 1
            new_total += 1

            if args.verbose:
                sys.stderr.write(f"  NEW: {title[:80]}\n")

            if new_total >= args.max_new:
                break

        seen_urls[src_key] = list(sorted(prev))[-5000:]

    state["seen_hashes"] = seen_hashes
    state["seen_urls"] = seen_urls
    save_state(state)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
