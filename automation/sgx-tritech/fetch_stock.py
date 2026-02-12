#!/usr/bin/env python3
"""SGX Tritech (5G9) Monitor - fetch stock data, generate report, send via WhatsApp.

Environment variables:
  REPORT_TYPE       open | close (default: open)
  BRAVE_API_KEY     Brave Search API key
  HOOK_TOKEN        OpenClaw webhook token
  OPENCLAW_URL      OpenClaw webhook URL (default: http://127.0.0.1:18789/hooks/agent)
  RECIPIENTS        Comma-separated phone numbers
"""

import os
import sys
import json
import subprocess
import datetime
import requests
import yfinance as yf
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
STATE_DIR = SCRIPT_DIR.parent.parent / "state"
LAST_ANNOUNCEMENTS_FILE = STATE_DIR / "last_announcements.json"

BRAVE_API_KEY = os.environ.get("BRAVE_API_KEY", "")
OPENCLAW_URL = os.environ.get("OPENCLAW_URL", "http://127.0.0.1:18789/hooks/agent")
HOOK_TOKEN = os.environ.get("HOOK_TOKEN", "")
RECIPIENTS = [r.strip() for r in os.environ.get("RECIPIENTS", "").split(",") if r.strip()]
STOCK_SYMBOL = "5G9.SI"


def fetch_stock_data():
    """Fetch stock data using yfinance."""
    ticker = yf.Ticker(STOCK_SYMBOL)
    hist = ticker.history(period="5d")
    if hist.empty:
        return None

    latest = hist.iloc[-1]
    prev = hist.iloc[-2] if len(hist) > 1 else None

    data = {
        "price": round(float(latest["Close"]), 4),
        "open": round(float(latest["Open"]), 4),
        "high": round(float(latest["High"]), 4),
        "low": round(float(latest["Low"]), 4),
        "volume": int(latest["Volume"]),
        "date": str(hist.index[-1].date()),
    }

    if prev is not None:
        change = float(latest["Close"]) - float(prev["Close"])
        change_pct = (change / float(prev["Close"])) * 100
        data["change"] = round(change, 4)
        data["change_pct"] = round(change_pct, 2)
        data["prev_close"] = round(float(prev["Close"]), 4)

    return data


def search_brave(query, freshness="pd", count=5):
    """Search using Brave Search API."""
    if not BRAVE_API_KEY:
        return []
    url = "https://api.search.brave.com/res/v1/web/search"
    headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": BRAVE_API_KEY,
    }
    params = {"q": query, "freshness": freshness, "count": count}
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=15)
        resp.raise_for_status()
        results = resp.json().get("web", {}).get("results", [])
        return [
            {"title": r["title"], "url": r["url"], "description": r.get("description", "")}
            for r in results
        ]
    except Exception as e:
        print(f"Brave Search error: {e}", file=sys.stderr)
        return []


def fetch_sgx_announcements():
    """Search for SGX announcements for Tritech."""
    results = search_brave("site:sgx.com Tritech Group announcement", freshness="pm", count=5)
    state = load_state()
    seen_urls = set(state.get("seen_urls", []))
    for r in results:
        seen_urls.add(r["url"])
    state["seen_urls"] = list(seen_urls)[-50:]
    save_state(state)
    return results


def load_state():
    if LAST_ANNOUNCEMENTS_FILE.exists():
        return json.loads(LAST_ANNOUNCEMENTS_FILE.read_text())
    return {}


def save_state(state):
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    LAST_ANNOUNCEMENTS_FILE.write_text(json.dumps(state, indent=2))


def generate_report_with_gemini(stock_data, news, announcements, report_type):
    """Call Gemini CLI to generate the report."""
    label = "开盘报告 / Market Open Report" if report_type == "open" else "收盘报告 / Market Close Report"

    prompt = f"""你是一个股票监控助手。根据以下数据，生成一份简洁的 SGX Tritech (5G9) {label}。

要求：
- 格式简洁清晰，适合 WhatsApp 阅读
- 英文内容需中英对照
- 新闻和公告必须带链接
- 不要包含：回报率、财务指标、PE、市值等

股价数据：
{json.dumps(stock_data, indent=2, ensure_ascii=False)}

最近新闻：
{json.dumps(news, indent=2, ensure_ascii=False)}

SGX 公告：
{json.dumps(announcements, indent=2, ensure_ascii=False)}

请直接输出报告文本，不要包含任何额外说明。"""

    try:
        result = subprocess.run(
            ["gemini", "-p", prompt],
            capture_output=True, text=True, timeout=120,
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
        print(f"Gemini CLI error (rc={result.returncode}): {result.stderr}", file=sys.stderr)
        return None
    except FileNotFoundError:
        print("Gemini CLI not found. Install: npm install -g @google/gemini-cli", file=sys.stderr)
        return None
    except subprocess.TimeoutExpired:
        print("Gemini CLI timed out after 120s", file=sys.stderr)
        return None


def fallback_report(stock_data, news, announcements, report_type):
    """Generate a plain report without AI if Gemini fails."""
    header = (
        "SGX Tritech (5G9) 开盘报告 / Market Open Report"
        if report_type == "open"
        else "SGX Tritech (5G9) 收盘报告 / Market Close Report"
    )
    lines = [header, f"日期 Date: {stock_data.get('date', 'N/A')}", ""]
    lines.append(f"价格 Price: ${stock_data.get('price', 'N/A')}")
    lines.append(f"开盘 Open: ${stock_data.get('open', 'N/A')}")
    lines.append(f"最高 High: ${stock_data.get('high', 'N/A')}")
    lines.append(f"最低 Low: ${stock_data.get('low', 'N/A')}")
    lines.append(f"成交量 Volume: {stock_data.get('volume', 'N/A'):,}")
    if "change" in stock_data:
        sign = "+" if stock_data["change"] >= 0 else ""
        lines.append(f"涨跌 Change: {sign}${stock_data['change']} ({sign}{stock_data['change_pct']}%)")
    lines.append("")
    if news:
        lines.append("相关新闻 / Related News:")
        for n in news[:5]:
            lines.append(f"- {n['title']}")
            lines.append(f"  {n['url']}")
        lines.append("")
    if announcements:
        lines.append("SGX 公告 / Announcements:")
        for a in announcements[:3]:
            lines.append(f"- {a['title']}")
            lines.append(f"  {a['url']}")
    return "\n".join(lines)


def send_to_whatsapp(report, recipient):
    """Send report via OpenClaw webhook."""
    payload = {
        "message": f"请将以下报告原文发送到 WhatsApp，不要修改内容：\n\n{report}",
        "name": "SGX-Monitor",
        "channel": "whatsapp",
        "to": recipient,
        "deliver": True,
        "wakeMode": "now",
    }
    headers = {
        "Authorization": f"Bearer {HOOK_TOKEN}",
        "Content-Type": "application/json",
    }
    resp = requests.post(OPENCLAW_URL, json=payload, headers=headers, timeout=30)
    resp.raise_for_status()
    return resp.json()


def main():
    report_type = os.environ.get("REPORT_TYPE", "open")
    print(f"[{datetime.datetime.now()}] Starting {report_type} report...")

    print("Fetching stock data...")
    stock_data = fetch_stock_data()
    if not stock_data:
        print("ERROR: Failed to fetch stock data", file=sys.stderr)
        sys.exit(1)
    print(f"Stock price: {stock_data.get('price')}")

    print("Searching news...")
    news = search_brave("Tritech Group SGX 5G9", freshness="pd", count=5)
    print(f"Found {len(news)} news articles")

    print("Fetching SGX announcements...")
    announcements = fetch_sgx_announcements()
    print(f"Found {len(announcements)} announcements")

    print("Generating report with Gemini...")
    report = generate_report_with_gemini(stock_data, news, announcements, report_type)
    if not report:
        print("Gemini failed, using fallback report")
        report = fallback_report(stock_data, news, announcements, report_type)

    print("--- Report ---")
    print(report)
    print("--- End ---")

    for recipient in RECIPIENTS:
        print(f"Sending to {recipient}...")
        try:
            result = send_to_whatsapp(report, recipient)
            print(f"  Sent OK: {result}")
        except Exception as e:
            print(f"  ERROR sending to {recipient}: {e}", file=sys.stderr)

    print(f"[{datetime.datetime.now()}] Done.")


if __name__ == "__main__":
    main()
