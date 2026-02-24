(function () {
  "use strict";

  const DOMAIN_META = {
    bio: { label: "生物演化", color: "#35c0a6", emoji: "🧬" },
    auto: { label: "汽车文明", color: "#f4b24b", emoji: "🚗" },
    policy: { label: "政策法案", color: "#69a8ff", emoji: "📜" },
    extinction: { label: "灭绝事件", color: "#ff6e59", emoji: "☄️" }
  };

  const KIND_EMOJI = {
    恐龙: "🦖",
    昆虫: "🪲",
    海洋生物: "🐋",
    灭绝事件: "☄️",
    哺乳类: "🐘",
    人类: "🧑",
    大陆漂移: "🌍",
    植物演化: "🌿",
    鸟类起源: "🪶",
    现代汽车: "🚗",
    跑车: "🏎️",
    电动车: "⚡",
    混动车: "🔋",
    皮卡: "🛻",
    "皮卡/卡车": "🛻",
    SUV: "🚙",
    坦克: "🛡️",
    履带车辆: "🚜",
    蒸汽车辆: "🚂",
    交通基础设施: "🛣️",
    制度标准化: "📏"
  };

  const COUNTRY_POINTS = {
    "中国": { lat: 35.8, lng: 104.1 },
    "美国": { lat: 39.8, lng: -98.6 },
    "德国": { lat: 51.1, lng: 10.4 },
    "法国": { lat: 46.2, lng: 2.2 },
    "英国": { lat: 54.5, lng: -2.5 },
    "意大利": { lat: 42.8, lng: 12.8 },
    "日本": { lat: 36.2, lng: 138.3 },
    "韩国": { lat: 36.3, lng: 127.8 },
    "印度": { lat: 22.9, lng: 79.0 },
    "俄罗斯": { lat: 61.5, lng: 105.3 },
    "苏联": { lat: 55.8, lng: 37.6 },
    "西班牙": { lat: 40.4, lng: -3.7 },
    "捷克": { lat: 49.8, lng: 15.4 },
    "瑞典": { lat: 62.0, lng: 15.0 },
    "巴西": { lat: -14.2, lng: -51.9 },
    "墨西哥": { lat: 23.6, lng: -102.5 },
    "加拿大": { lat: 56.1, lng: -106.3 },
    "澳大利亚": { lat: -25.2, lng: 133.8 },
    "土耳其": { lat: 39.0, lng: 35.2 },
    "泰国": { lat: 15.8, lng: 100.9 },
    "印度尼西亚": { lat: -2.2, lng: 118.0 },
    "马来西亚": { lat: 4.2, lng: 102.0 },
    "南非": { lat: -30.6, lng: 22.9 },
    "阿根廷": { lat: -38.4, lng: -63.6 },
    "乌克兰": { lat: 49.0, lng: 31.0 },
    "欧洲": { lat: 50.0, lng: 10.0 },
    "欧盟": { lat: 50.6, lng: 9.4 },
    "全球": { lat: 12.0, lng: 8.0 },
    "多国": { lat: 20.0, lng: 10.0 },
    "美索不达米亚": { lat: 33.2, lng: 44.4 },
    "埃及": { lat: 26.8, lng: 30.8 },
    "古罗马": { lat: 41.9, lng: 12.5 },
    "英国/欧洲": { lat: 51.0, lng: 5.0 }
  };

  const el = {
    nodeSlider: document.getElementById("nodeSlider"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    playBtn: document.getElementById("playBtn"),
    yearValue: document.getElementById("yearValue"),
    nodeValue: document.getElementById("nodeValue"),
    domainFilter: document.getElementById("domainFilter"),
    windowSlider: document.getElementById("windowSlider"),
    windowValue: document.getElementById("windowValue"),
    driftToggle: document.getElementById("driftToggle"),
    ringsToggle: document.getElementById("ringsToggle"),
    stats: document.getElementById("stats"),
    legendGrid: document.getElementById("legendGrid"),
    globeCanvas: document.getElementById("globeCanvas"),
    eventList: document.getElementById("eventList"),
    meteorFlash: document.getElementById("meteorFlash")
  };

  const state = {
    events: [],
    nodes: [],
    nodeIndex: 0,
    windowSize: Number(el.windowSlider.value || 4),
    domain: "all",
    playing: false,
    playTimer: null,
    selectedId: null,
    driftEnabled: true,
    ringsEnabled: true,
    globe: null
  };

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function toNumber(raw) {
    if (raw == null || raw === "") return 0;
    if (typeof raw === "number") return Number.isFinite(raw) ? raw : 0;
    const text = String(raw);
    const million = text.match(/(\d+(?:\.\d+)?)\s*(million|billion)/i);
    if (million) {
      const base = Number(million[1]);
      if (!Number.isFinite(base)) return 0;
      return Math.round(base * (million[2].toLowerCase() === "billion" ? 1_000_000_000 : 1_000_000));
    }
    const withComma = [...text.matchAll(/\d{1,3}(?:,\d{3})+/g)].map((m) => Number(m[0].replaceAll(",", "")));
    if (withComma.length) return Math.max(...withComma);
    const plain = text.match(/\b(\d{4,})\b/);
    if (plain) {
      const n = Number(plain[1]);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  }

  function formatYear(year) {
    const y = Number(year);
    if (!Number.isFinite(y)) return "未定义";
    if (y <= -1_000_000) {
      const ma = Math.abs(y) / 1_000_000;
      const text = ma >= 100 ? Math.round(ma).toLocaleString("en-US") : ma.toFixed(1);
      return `${text} 百万年前 / ${text} Ma`;
    }
    if (y < 0) {
      return `公元前 ${Math.abs(y).toLocaleString("en-US")} 年 / ${Math.abs(y).toLocaleString("en-US")} BCE`;
    }
    return `${y.toLocaleString("en-US")} 年 / ${y.toLocaleString("en-US")}`;
  }

  function normalizeText(text) {
    return String(text || "").toLowerCase();
  }

  function findCountryPoint(raw) {
    const text = String(raw || "").trim();
    if (!text) return null;

    const direct = COUNTRY_POINTS[text];
    if (direct) return direct;

    for (const [key, val] of Object.entries(COUNTRY_POINTS)) {
      if (text.includes(key)) return val;
    }

    const lower = normalizeText(text);
    if (lower.includes("germany")) return COUNTRY_POINTS["德国"];
    if (lower.includes("france")) return COUNTRY_POINTS["法国"];
    if (lower.includes("united states") || lower.includes("usa") || lower.includes("u.s.")) return COUNTRY_POINTS["美国"];
    if (lower.includes("uk") || lower.includes("united kingdom")) return COUNTRY_POINTS["英国"];
    if (lower.includes("japan")) return COUNTRY_POINTS["日本"];
    if (lower.includes("china")) return COUNTRY_POINTS["中国"];
    if (lower.includes("italy")) return COUNTRY_POINTS["意大利"];
    if (lower.includes("europe")) return COUNTRY_POINTS["欧洲"];

    return null;
  }

  function interpolateLng(from, to, t) {
    let delta = to - from;
    if (Math.abs(delta) > 180) {
      delta -= Math.sign(delta) * 360;
    }
    let lng = from + delta * t;
    if (lng > 180) lng -= 360;
    if (lng < -180) lng += 360;
    return lng;
  }

  function toSafeString(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function toPct(value) {
    return clamp(Math.round(Number(value) || 0), 0, 100);
  }

  function autoImpactBySales(item) {
    const sales = toNumber(item.salesUnits) || toNumber(item.production);
    if (!sales) return 38;
    const pct = (Math.log10(sales + 1) / Math.log10(50_000_000 + 1)) * 100;
    return clamp(Math.round(pct), 10, 100);
  }

  function normalizeAutoEvents() {
    const raw = Array.isArray(window.TIMELINE_DATA) ? window.TIMELINE_DATA : [];

    return raw
      .map((item, idx) => {
        const year = Number(item.year);
        if (!Number.isFinite(year)) return null;
        const loc = findCountryPoint(item.country || item.region || "");
        const policyRaw = Number(item.policyScore);
        const spread = item.manufacturingSites
          ? clamp(item.manufacturingSites.split(/[,;|、]/).filter(Boolean).length * 14, 25, 100)
          : (loc ? 55 : 30);

        return {
          id: item.id || `auto-${idx + 1}`,
          year,
          domain: "auto",
          category: item.kind || "现代汽车",
          titleZh: item.titleZh || `${item.brand || "汽车"} ${item.model || "事件"}`.trim(),
          titleEn: item.titleEn || `${item.brand || "Auto"} ${item.model || "Event"}`.trim(),
          descZh: item.descZh || "汽车事件",
          image: item.image || item.imageUrl || null,
          lat: loc ? loc.lat : 0,
          lng: loc ? loc.lng : 0,
          paleoLat: null,
          paleoLng: null,
          impact: autoImpactBySales(item),
          spread,
          policy: Number.isFinite(policyRaw) ? clamp(Math.round((policyRaw + 100) / 2), 0, 100) : 42,
          extinct: false,
          emoji: KIND_EMOJI[item.kind] || "🚗",
          source: item.source || "",
          country: item.country || ""
        };
      })
      .filter(Boolean);
  }

  function normalizePolicyEvents() {
    const raw = Array.isArray(window.POLICY_EVENTS) ? window.POLICY_EVENTS : [];

    return raw
      .map((item, idx) => {
        const year = Number(item.year);
        if (!Number.isFinite(year)) return null;
        const loc = findCountryPoint(item.region || item.country || "全球");
        const impact = clamp(Math.round(Math.abs(Number(item.impact) || 0) * 2.2), 12, 100);
        const policy = clamp(Math.round((Number(item.impact) || 0) + 50), 0, 100);

        return {
          id: item.id || `policy-${idx + 1}`,
          year,
          domain: "policy",
          category: "政策法案",
          titleZh: item.titleZh || "政策事件",
          titleEn: item.titleEn || "Policy Event",
          descZh: item.descZh || "",
          image: null,
          lat: loc ? loc.lat : 0,
          lng: loc ? loc.lng : 0,
          paleoLat: null,
          paleoLng: null,
          impact,
          spread: loc ? 68 : 45,
          policy,
          extinct: false,
          emoji: "📜",
          source: "policy"
        };
      })
      .filter(Boolean);
  }

  function normalizeBioEvents() {
    const raw = Array.isArray(window.EARTH_BIO_EVENTS) ? window.EARTH_BIO_EVENTS : [];

    return raw
      .map((item, idx) => {
        const year = Number(item.year);
        if (!Number.isFinite(year)) return null;

        const domain = item.domain && DOMAIN_META[item.domain] ? item.domain : "bio";

        return {
          id: item.id || `bio-${idx + 1}`,
          year,
          domain,
          category: item.category || "生物演化",
          titleZh: item.titleZh || "生物事件",
          titleEn: item.titleEn || "Biology Event",
          descZh: item.descZh || "",
          image: item.image || null,
          lat: Number(item.lat) || 0,
          lng: Number(item.lng) || 0,
          paleoLat: Number.isFinite(Number(item.paleoLat)) ? Number(item.paleoLat) : null,
          paleoLng: Number.isFinite(Number(item.paleoLng)) ? Number(item.paleoLng) : null,
          impact: toPct(item.impact || 55),
          spread: toPct(item.spread || 50),
          policy: toPct(item.policy || (domain === "extinction" ? 0 : 35)),
          extinct: Boolean(item.extinct),
          emoji: item.emoji || KIND_EMOJI[item.category] || DOMAIN_META[domain].emoji,
          effect: item.effect || null,
          source: item.source || "bio"
        };
      })
      .filter(Boolean);
  }

  function buildDataset() {
    const bio = normalizeBioEvents();
    const auto = normalizeAutoEvents();
    const policy = normalizePolicyEvents();
    const all = [...bio, ...auto, ...policy]
      .filter((x) => Number.isFinite(x.year))
      .sort((a, b) => a.year - b.year);

    state.events = all;
    state.nodes = [...new Set(all.map((x) => x.year))].sort((a, b) => a - b);
    state.nodeIndex = state.nodes.length ? state.nodes.length - 1 : 0;
  }

  function currentYear() {
    return state.nodes[state.nodeIndex] || 0;
  }

  function activeEvents() {
    if (!state.events.length) return [];

    const min = clamp(state.nodeIndex - state.windowSize, 0, state.nodes.length - 1);
    const max = clamp(state.nodeIndex + state.windowSize, 0, state.nodes.length - 1);
    const years = new Set(state.nodes.slice(min, max + 1));

    return state.events
      .filter((evt) => years.has(evt.year))
      .filter((evt) => state.domain === "all" || evt.domain === state.domain)
      .sort((a, b) => {
        const distA = Math.abs(a.year - currentYear());
        const distB = Math.abs(b.year - currentYear());
        if (distA !== distB) return distA - distB;
        return (b.impact || 0) - (a.impact || 0);
      });
  }

  function positionForEvent(evt) {
    let lat = evt.lat;
    let lng = evt.lng;

    if (
      state.driftEnabled &&
      Number.isFinite(evt.paleoLat) &&
      Number.isFinite(evt.paleoLng) &&
      evt.year < 0
    ) {
      const endYear = 0;
      const denom = endYear - evt.year;
      const t = denom > 0 ? clamp((currentYear() - evt.year) / denom, 0, 1) : 1;
      lat = evt.paleoLat + (evt.lat - evt.paleoLat) * t;
      lng = interpolateLng(evt.paleoLng, evt.lng, t);
    }

    return { lat, lng };
  }

  function renderLegend() {
    el.legendGrid.innerHTML = Object.keys(DOMAIN_META)
      .map((key) => {
        const info = DOMAIN_META[key];
        return `<div class="legend-item"><span class="legend-dot" style="background:${info.color}"></span><span>${toSafeString(info.label)}</span></div>`;
      })
      .join("");
  }

  function renderStats(items) {
    const domainCounts = {
      bio: 0,
      auto: 0,
      policy: 0,
      extinction: 0
    };

    items.forEach((x) => {
      if (domainCounts[x.domain] != null) domainCounts[x.domain] += 1;
    });

    const avgImpact = items.length
      ? Math.round(items.reduce((sum, x) => sum + (x.impact || 0), 0) / items.length)
      : 0;

    const extinctCount = items.filter((x) => x.extinct).length;

    el.stats.innerHTML = `
      <article class="stat-card">
        <b>${state.nodes.length.toLocaleString("en-US")}</b>
        <span>时间节点总数</span>
      </article>
      <article class="stat-card">
        <b>${items.length.toLocaleString("en-US")}</b>
        <span>当前窗口事件数</span>
      </article>
      <article class="stat-card">
        <b>Bio ${domainCounts.bio} · Auto ${domainCounts.auto}</b>
        <span>生物与汽车事件</span>
      </article>
      <article class="stat-card">
        <b>Policy ${domainCounts.policy} · Extinct ${extinctCount} · 影响 ${avgImpact}</b>
        <span>政策/灭绝与平均影响值</span>
      </article>
    `;
  }

  function cardHtml(evt) {
    const domain = DOMAIN_META[evt.domain] || DOMAIN_META.bio;
    const icon = evt.emoji || domain.emoji;
    const image = evt.image
      ? `<img src="${toSafeString(evt.image)}" alt="${toSafeString(evt.titleZh)}" loading="lazy" referrerpolicy="no-referrer" />`
      : `<div class="event-fallback">${toSafeString(icon)}</div>`;

    return `
      <article class="event-card" data-event-id="${toSafeString(evt.id)}">
        <div class="event-image">
          ${image}
        </div>
        <div class="event-body">
          <h4>${toSafeString(evt.titleZh)}</h4>
          <p class="event-meta">${toSafeString(formatYear(evt.year))} · ${toSafeString(domain.label)} · ${toSafeString(evt.category)}</p>
          <p class="event-desc">${toSafeString(evt.descZh)}</p>
          <div class="bar-stack">
            <div class="bar-row">
              <span>影响</span>
              <div class="bar-track"><i class="bar-fill" style="width:${toPct(evt.impact)}%"></i></div>
              <b class="bar-value">${toPct(evt.impact)}</b>
            </div>
            <div class="bar-row">
              <span>扩散</span>
              <div class="bar-track"><i class="bar-fill" style="width:${toPct(evt.spread)}%"></i></div>
              <b class="bar-value">${toPct(evt.spread)}</b>
            </div>
            <div class="bar-row">
              <span>政策</span>
              <div class="bar-track"><i class="bar-fill" style="width:${toPct(evt.policy)}%"></i></div>
              <b class="bar-value">${toPct(evt.policy)}</b>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderEventCards(items) {
    if (!items.length) {
      el.eventList.innerHTML = '<div class="muted">当前筛选没有事件。</div>';
      return;
    }

    const sorted = [...items].sort((a, b) => {
      if (state.selectedId && a.id === state.selectedId) return -1;
      if (state.selectedId && b.id === state.selectedId) return 1;
      const distA = Math.abs(a.year - currentYear());
      const distB = Math.abs(b.year - currentYear());
      if (distA !== distB) return distA - distB;
      return (b.impact || 0) - (a.impact || 0);
    });

    el.eventList.innerHTML = sorted.slice(0, 16).map(cardHtml).join("");
  }

  function updateMeteorHint() {
    const active = Math.abs(currentYear() + 66_000_000) <= 5_000_000;
    el.meteorFlash.classList.toggle("show", active);
  }

  function updateGlobe(items) {
    if (!state.globe) return;

    const points = items.slice(0, 160).map((evt) => {
      const pos = positionForEvent(evt);
      const domain = DOMAIN_META[evt.domain] || DOMAIN_META.bio;
      return {
        id: evt.id,
        lat: pos.lat,
        lng: pos.lng,
        color: domain.color,
        radius: 0.1 + (evt.impact || 0) / 450,
        altitude: 0.03 + (evt.impact || 0) / 1400,
        label: `<div style='font-family:Noto Sans SC,sans-serif'><strong>${toSafeString(evt.titleZh)}</strong><br>${toSafeString(formatYear(evt.year))}<br>${toSafeString(domain.label)} · ${toSafeString(evt.category)}</div>`
      };
    });

    state.globe
      .pointsData(points)
      .pointColor((p) => p.color)
      .pointRadius((p) => p.radius)
      .pointAltitude((p) => p.altitude)
      .pointLabel((p) => p.label);

    const driftArcs = state.driftEnabled
      ? items
          .filter((evt) => Number.isFinite(evt.paleoLat) && Number.isFinite(evt.paleoLng) && evt.year < 0)
          .slice(0, 36)
          .map((evt) => {
            const pos = positionForEvent(evt);
            return {
              startLat: evt.paleoLat,
              startLng: evt.paleoLng,
              endLat: pos.lat,
              endLng: pos.lng,
              color: ["rgba(126,208,255,0.05)", "rgba(126,208,255,0.6)"]
            };
          })
      : [];

    state.globe
      .arcsData(driftArcs)
      .arcColor((a) => a.color)
      .arcDashLength(0.45)
      .arcDashGap(1.5)
      .arcDashAnimateTime(2800)
      .arcStroke(0.6);

    const meteorActive = Math.abs(currentYear() + 66_000_000) <= 5_000_000;
    const rings = [];

    if (state.ringsEnabled) {
      items
        .filter((evt) => evt.impact >= 82)
        .slice(0, 20)
        .forEach((evt) => {
          const pos = positionForEvent(evt);
          const color = (DOMAIN_META[evt.domain] || DOMAIN_META.bio).color;
          rings.push({ lat: pos.lat, lng: pos.lng, color, max: 1.7 + (evt.impact || 0) / 80 });
        });

      if (meteorActive) {
        rings.push({ lat: 21.3, lng: -89.5, color: "#ff6e59", max: 3.4 });
      }
    }

    state.globe
      .ringsData(rings)
      .ringColor((r) => r.color)
      .ringMaxRadius((r) => r.max)
      .ringPropagationSpeed(() => 0.9)
      .ringRepeatPeriod(() => 1300);
  }

  function updateControls() {
    el.nodeSlider.min = "0";
    el.nodeSlider.max = String(Math.max(0, state.nodes.length - 1));
    el.nodeSlider.value = String(state.nodeIndex);
    el.yearValue.textContent = formatYear(currentYear());
    el.nodeValue.textContent = `节点 ${state.nodeIndex + 1} / ${Math.max(1, state.nodes.length)}`;
    el.windowValue.textContent = `当前节点前后 ${state.windowSize} 个节点`;
  }

  function focusEvent(evtId) {
    const evt = state.events.find((x) => x.id === evtId);
    if (!evt) return;
    state.selectedId = evt.id;

    if (state.globe) {
      const pos = positionForEvent(evt);
      state.globe.pointOfView({ lat: pos.lat, lng: pos.lng, altitude: 1.45 }, 700);
    }

    renderAll();
  }

  function renderAll() {
    updateControls();
    const items = activeEvents();
    renderStats(items);
    renderEventCards(items);
    updateGlobe(items);
    updateMeteorHint();
  }

  function stopPlay() {
    state.playing = false;
    if (state.playTimer) {
      clearInterval(state.playTimer);
      state.playTimer = null;
    }
    el.playBtn.textContent = "自动播放";
  }

  function togglePlay() {
    if (state.playing) {
      stopPlay();
      return;
    }

    state.playing = true;
    el.playBtn.textContent = "暂停播放";

    state.playTimer = setInterval(() => {
      if (state.nodeIndex >= state.nodes.length - 1) {
        stopPlay();
        return;
      }
      state.nodeIndex += 1;
      renderAll();
    }, 1000);
  }

  function setGlobeStatus(text) {
    el.globeCanvas.innerHTML = `<div class="globe-status">${toSafeString(text)}</div>`;
  }

  function initGlobe() {
    if (!window.Globe) {
      setGlobeStatus("地球仪脚本加载失败，请刷新页面重试。");
      return;
    }

    try {
      const base = window.location.href.endsWith("/") ? window.location.href : `${window.location.href}/`;
      const globeUrl = new URL("../animals/assets/earth-blue-marble.jpg", base).toString();
      const bumpUrl = new URL("../animals/assets/earth-topology.png", base).toString();

      state.globe = window.Globe()(el.globeCanvas)
        .backgroundColor("rgba(0,0,0,0)")
        .globeImageUrl(globeUrl)
        .bumpImageUrl(bumpUrl)
        .showAtmosphere(true)
        .atmosphereColor("#7ed0ff")
        .atmosphereAltitude(0.16)
        .pointLabel(() => "")
        .onPointClick((p) => {
          if (p && p.id) {
            focusEvent(p.id);
          }
        });

      const controls = state.globe.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.42;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 130;
      controls.maxDistance = 430;
      controls.enablePan = false;

      const resize = () => {
        const w = el.globeCanvas.clientWidth;
        const h = el.globeCanvas.clientHeight;
        if (w > 40 && h > 40) {
          state.globe.width(w);
          state.globe.height(h);
        }
      };

      resize();
      window.addEventListener("resize", resize);
      state.globe.pointOfView({ lat: 18, lng: 10, altitude: 2.0 }, 900);
    } catch (error) {
      setGlobeStatus("地球仪初始化失败，请刷新页面重试。");
    }
  }

  function bindEvents() {
    el.nodeSlider.addEventListener("input", (event) => {
      stopPlay();
      state.nodeIndex = clamp(Number(event.target.value), 0, state.nodes.length - 1);
      renderAll();
    });

    el.prevBtn.addEventListener("click", () => {
      stopPlay();
      state.nodeIndex = clamp(state.nodeIndex - 1, 0, state.nodes.length - 1);
      renderAll();
    });

    el.nextBtn.addEventListener("click", () => {
      stopPlay();
      state.nodeIndex = clamp(state.nodeIndex + 1, 0, state.nodes.length - 1);
      renderAll();
    });

    el.playBtn.addEventListener("click", togglePlay);

    el.domainFilter.addEventListener("change", (event) => {
      state.domain = event.target.value;
      renderAll();
    });

    el.windowSlider.addEventListener("input", (event) => {
      state.windowSize = Number(event.target.value || 4);
      renderAll();
    });

    el.driftToggle.addEventListener("change", (event) => {
      state.driftEnabled = Boolean(event.target.checked);
      renderAll();
    });

    el.ringsToggle.addEventListener("change", (event) => {
      state.ringsEnabled = Boolean(event.target.checked);
      renderAll();
    });

    el.eventList.addEventListener("click", (event) => {
      const card = event.target.closest("[data-event-id]");
      if (!card) return;
      focusEvent(card.getAttribute("data-event-id"));
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopPlay();
      }
    });
  }

  function init() {
    buildDataset();
    renderLegend();
    initGlobe();
    bindEvents();
    renderAll();
  }

  init();
})();
