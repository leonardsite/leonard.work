(function () {
  "use strict";

  const TYPE_META = {
    auto: { label: "汽车事件", color: "#f4b24b", emoji: "🚗" },
    policy: { label: "政策法案", color: "#69a8ff", emoji: "📜" }
  };

  const LOCATION_POINTS = {
    "中国": [104.1, 35.8],
    "美国": [-98.6, 39.8],
    "德国": [10.4, 51.1],
    "法国": [2.2, 46.2],
    "英国": [-2.5, 54.5],
    "日本": [138.3, 36.2],
    "韩国": [127.8, 36.3],
    "意大利": [12.8, 42.8],
    "西班牙": [-3.7, 40.4],
    "瑞典": [15.0, 62.0],
    "俄罗斯": [105.3, 61.5],
    "苏联": [37.6, 55.8],
    "印度": [79.0, 22.9],
    "马来西亚": [102.0, 4.2],
    "泰国": [100.9, 15.8],
    "印度尼西亚": [118.0, -2.2],
    "巴西": [-51.9, -14.2],
    "墨西哥": [-102.5, 23.6],
    "加拿大": [-106.3, 56.1],
    "乌克兰": [31.0, 49.0],
    "欧洲": [10.0, 50.0],
    "欧盟": [9.4, 50.6],
    "全球": [8.0, 12.0],
    "多国": [10.0, 20.0],
    "美索不达米亚": [44.4, 33.2],
    "埃及": [30.8, 26.8],
    "古罗马": [12.5, 41.9],
    "英国/欧洲": [5.0, 51.0],
    "美国/中国": [160.0, 42.0],
    "欧盟/中国": [70.0, 40.0],
    "欧洲/全球": [30.0, 46.0],
    "埃及/西亚": [36.0, 30.0]
  };

  const EN_FALLBACK = [
    ["united states", [-98.6, 39.8]],
    ["usa", [-98.6, 39.8]],
    ["u.s.", [-98.6, 39.8]],
    ["germany", [10.4, 51.1]],
    ["france", [2.2, 46.2]],
    ["united kingdom", [-2.5, 54.5]],
    ["uk", [-2.5, 54.5]],
    ["japan", [138.3, 36.2]],
    ["china", [104.1, 35.8]],
    ["italy", [12.8, 42.8]],
    ["europe", [10.0, 50.0]],
    ["russia", [105.3, 61.5]],
    ["sweden", [15.0, 62.0]],
    ["spain", [-3.7, 40.4]],
    ["brazil", [-51.9, -14.2]],
    ["mexico", [-102.5, 23.6]],
    ["canada", [-106.3, 56.1]],
    ["india", [79.0, 22.9]],
    ["korea", [127.8, 36.3]],
    ["malaysia", [102.0, 4.2]],
    ["thailand", [100.9, 15.8]],
    ["indonesia", [118.0, -2.2]],
    ["global", [8.0, 12.0]]
  ];

  const el = {
    nodeSlider: document.getElementById("nodeSlider"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    playBtn: document.getElementById("playBtn"),
    yearValue: document.getElementById("yearValue"),
    nodeValue: document.getElementById("nodeValue"),
    windowSlider: document.getElementById("windowSlider"),
    windowValue: document.getElementById("windowValue"),
    showAuto: document.getElementById("showAuto"),
    showPolicy: document.getElementById("showPolicy"),
    projectionBtn: document.getElementById("projectionBtn"),
    projectionLabel: document.getElementById("projectionLabel"),
    legendGrid: document.getElementById("legendGrid"),
    stats: document.getElementById("stats"),
    mapCanvas: document.getElementById("mapCanvas"),
    eventList: document.getElementById("eventList")
  };

  const initialProjection = new URLSearchParams(window.location.search).get("projection") === "mercator" ? "mercator" : "globe";

  const state = {
    events: [],
    nodes: [],
    nodeIndex: 0,
    windowSize: Number(el.windowSlider.value || 3),
    showAuto: true,
    showPolicy: true,
    projection: initialProjection,
    selectedId: null,
    playing: false,
    timer: null,
    map: null,
    popup: null
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function safe(value) {
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

  function formatYear(year) {
    const n = Number(year);
    if (!Number.isFinite(n)) return "未定义";
    if (n < 0) return `公元前 ${Math.abs(n).toLocaleString("en-US")} 年`;
    return `${n.toLocaleString("en-US")} 年`;
  }

  function toNumber(raw) {
    if (raw == null || raw === "") return 0;
    if (typeof raw === "number") return Number.isFinite(raw) ? raw : 0;
    const text = String(raw);
    const withComma = [...text.matchAll(/\d{1,3}(?:,\d{3})+/g)].map((m) => Number(m[0].replaceAll(",", "")));
    if (withComma.length) return Math.max(...withComma);
    const plain = text.match(/\b(\d{4,})\b/);
    if (plain) {
      const value = Number(plain[1]);
      return Number.isFinite(value) ? value : 0;
    }
    return 0;
  }

  function resolveLocation(raw) {
    const text = String(raw || "").trim();
    if (!text) return [8, 12];

    if (LOCATION_POINTS[text]) return LOCATION_POINTS[text];

    for (const [key, coord] of Object.entries(LOCATION_POINTS)) {
      if (text.includes(key)) return coord;
    }

    const lower = text.toLowerCase();
    for (const [key, coord] of EN_FALLBACK) {
      if (lower.includes(key)) return coord;
    }

    return [8, 12];
  }

  function autoImpact(item) {
    const sales = toNumber(item.salesUnits) || toNumber(item.production);
    if (!sales) return 34;
    const normalized = (Math.log10(sales + 1) / Math.log10(50000000 + 1)) * 100;
    return clamp(Math.round(normalized), 12, 100);
  }

  function autoSpread(item) {
    const sites = String(item.manufacturingSites || "").split(/[,;|、]/).map((x) => x.trim()).filter(Boolean);
    if (sites.length) return clamp(20 + sites.length * 14, 30, 95);
    const countryText = String(item.country || "");
    if (countryText.includes("/")) return 68;
    if (countryText.includes("多国") || countryText.includes("全球")) return 80;
    return 42;
  }

  function autoPolicy(item) {
    const score = Number(item.policyScore);
    if (!Number.isFinite(score)) return 40;
    if (score >= -50 && score <= 50) return clamp(Math.round(score + 50), 0, 100);
    return clamp(Math.round(score), 0, 100);
  }

  function normalizeAutoEvents() {
    const raw = Array.isArray(window.TIMELINE_DATA) ? window.TIMELINE_DATA : [];

    return raw
      .map((item, idx) => {
        const year = Number(item.year);
        if (!Number.isFinite(year)) return null;

        const [lng, lat] = resolveLocation(item.country || item.region || item.manufacturingSites || "");

        return {
          id: item.id || `auto-${idx + 1}`,
          year,
          type: "auto",
          category: item.kind || "汽车文明",
          country: item.country || "",
          titleZh: item.titleZh || `${item.brand || "汽车"} ${item.model || "事件"}`.trim(),
          titleEn: item.titleEn || `${item.brand || "Auto"} ${item.model || "Event"}`.trim(),
          descZh: item.descZh || "",
          image: item.image || item.imageUrl || "",
          lng,
          lat,
          impact: autoImpact(item),
          spread: autoSpread(item),
          policy: autoPolicy(item),
          salesUnits: toNumber(item.salesUnits || item.production),
          emoji: "🚗"
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

        const [lng, lat] = resolveLocation(item.region || item.country || "全球");
        const impactRaw = Number(item.impact) || 0;

        return {
          id: item.id || `policy-${idx + 1}`,
          year,
          type: "policy",
          category: "政策法案",
          country: item.region || item.country || "全球",
          titleZh: item.titleZh || "政策事件",
          titleEn: item.titleEn || "Policy Event",
          descZh: item.descZh || "",
          image: "",
          lng,
          lat,
          impact: clamp(Math.round(Math.abs(impactRaw) * 2.2), 15, 100),
          spread: clamp(65 + Math.round(Math.abs(impactRaw) * 0.5), 40, 100),
          policy: clamp(Math.round(impactRaw + 50), 0, 100),
          salesUnits: 0,
          emoji: "📜"
        };
      })
      .filter(Boolean);
  }

  function currentYear() {
    return state.nodes[state.nodeIndex] || 0;
  }

  function eventEnabled(evt) {
    if (evt.type === "auto" && !state.showAuto) return false;
    if (evt.type === "policy" && !state.showPolicy) return false;
    return true;
  }

  function activeEvents() {
    if (!state.events.length) return [];
    const start = Math.max(0, state.nodeIndex - state.windowSize);
    const end = Math.min(state.nodes.length - 1, state.nodeIndex + state.windowSize);
    const years = new Set(state.nodes.slice(start, end + 1));

    return state.events
      .filter((evt) => years.has(evt.year) && eventEnabled(evt))
      .sort((a, b) => {
        const da = Math.abs(a.year - currentYear());
        const db = Math.abs(b.year - currentYear());
        return da - db || b.impact - a.impact;
      });
  }

  function setupLegend() {
    el.legendGrid.innerHTML = Object.entries(TYPE_META)
      .map(([key, meta]) => (`
        <span class="legend-item" data-type="${key}">
          <i class="legend-dot" style="background:${meta.color}"></i>
          <span>${meta.emoji} ${safe(meta.label)}</span>
        </span>
      `))
      .join("");
  }

  function ensureSelected(items) {
    if (!items.length) {
      state.selectedId = null;
      return null;
    }

    if (!state.selectedId || !items.some((evt) => evt.id === state.selectedId)) {
      state.selectedId = items[0].id;
    }

    return items.find((evt) => evt.id === state.selectedId) || items[0];
  }

  function updateStats(items) {
    const autoCount = items.filter((x) => x.type === "auto").length;
    const policyCount = items.filter((x) => x.type === "policy").length;
    const avgImpact = items.length ? Math.round(items.reduce((sum, x) => sum + x.impact, 0) / items.length) : 0;
    const avgPolicy = items.length ? Math.round(items.reduce((sum, x) => sum + x.policy, 0) / items.length) : 0;
    const countries = new Set(items.map((x) => x.country).filter(Boolean)).size;

    el.stats.innerHTML = [
      { label: "当前年份", value: formatYear(currentYear()) },
      { label: "当前事件数", value: `${items.length}` },
      { label: "汽车事件", value: `${autoCount}` },
      { label: "政策法案", value: `${policyCount}` },
      { label: "平均影响", value: `${avgImpact}%` },
      { label: "平均政策强度", value: `${avgPolicy}%` },
      { label: "涉及地区", value: `${countries}` },
      { label: "地图模式", value: state.projection === "globe" ? "地球仪" : "平面" }
    ].map((card) => (`
      <article class="stat-card">
        <b>${safe(card.value)}</b>
        <span>${safe(card.label)}</span>
      </article>
    `)).join("");
  }

  function cardHtml(evt, active) {
    const meta = TYPE_META[evt.type] || TYPE_META.auto;
    const media = evt.image
      ? `<img src="${safe(evt.image)}" alt="${safe(evt.titleZh)}" loading="lazy" referrerpolicy="no-referrer" />`
      : `<div class="event-fallback">${safe(evt.emoji || meta.emoji)}</div>`;

    return `
      <article class="event-card ${active ? "active" : ""}" data-event-id="${safe(evt.id)}">
        <div class="event-media">${media}</div>
        <div class="event-body">
          <p class="event-meta">${safe(formatYear(evt.year))} · ${safe(meta.label)} · ${safe(evt.country || "全球")}</p>
          <h4 class="event-title">${safe(evt.titleZh)}</h4>
          <p class="event-desc">${safe(evt.descZh || evt.titleEn)}</p>
          <div class="bars">
            <div class="bar-row">
              <span>影响</span>
              <div class="bar-track"><i class="bar-fill" style="width:${toPct(evt.impact)}%"></i></div>
              <b>${toPct(evt.impact)}</b>
            </div>
            <div class="bar-row">
              <span>扩散</span>
              <div class="bar-track"><i class="bar-fill" style="width:${toPct(evt.spread)}%"></i></div>
              <b>${toPct(evt.spread)}</b>
            </div>
            <div class="bar-row">
              <span>政策</span>
              <div class="bar-track"><i class="bar-fill" style="width:${toPct(evt.policy)}%"></i></div>
              <b>${toPct(evt.policy)}</b>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function updateCards(items) {
    if (!items.length) {
      el.eventList.innerHTML = "<p class='muted'>当前筛选条件下无事件</p>";
      return;
    }

    const selected = ensureSelected(items);
    el.eventList.innerHTML = items.slice(0, 18).map((evt) => cardHtml(evt, selected && evt.id === selected.id)).join("");
  }

  function setProjectionLabel() {
    const isGlobe = state.projection === "globe";
    el.projectionLabel.textContent = isGlobe ? "当前：地球仪 Globe" : "当前：平面地图 Mercator";
    el.projectionBtn.textContent = isGlobe ? "切换到平面地图" : "切换到地球仪";
  }

  function syncProjectionQuery() {
    try {
      const url = new URL(window.location.href);
      if (state.projection === "mercator") {
        url.searchParams.set("projection", "mercator");
      } else {
        url.searchParams.delete("projection");
      }
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    } catch (_) {
      // ignore
    }
  }

  function setMapProjection() {
    if (!state.map) return false;
    if (typeof state.map.setProjection !== "function") return false;

    let switched = false;
    try {
      state.map.setProjection(state.projection);
      switched = true;
    } catch (error) {
      try {
        state.map.setProjection({ type: state.projection });
        switched = true;
      } catch (_) {
        switched = false;
      }
    }
    return switched;
  }

  function mapCenterFallback() {
    const selected = state.events.find((evt) => evt.id === state.selectedId);
    if (selected) return [selected.lng, selected.lat];
    return [12, 24];
  }

  function remountMap() {
    const keepCenter = state.map && typeof state.map.getCenter === "function"
      ? [state.map.getCenter().lng, state.map.getCenter().lat]
      : mapCenterFallback();

    if (state.popup) {
      state.popup.remove();
      state.popup = null;
    }

    if (state.map) {
      state.map.remove();
      state.map = null;
    }

    initMap(keepCenter);
  }

  function eventPoint(evt, selected) {
    return {
      type: "Feature",
      properties: {
        id: evt.id,
        type: evt.type,
        title: evt.titleZh,
        radius: clamp(6 + evt.impact * 0.08 + (selected ? 3 : 0), 6, 17),
        selected: selected ? 1 : 0
      },
      geometry: {
        type: "Point",
        coordinates: [evt.lng, evt.lat]
      }
    };
  }

  function updateMap(items) {
    if (!state.map || !state.map.isStyleLoaded()) return;

    const selected = ensureSelected(items);
    const points = items.map((evt) => eventPoint(evt, selected && evt.id === selected.id));
    const policyRings = points.filter((feature) => feature.properties.type === "policy");

    const eventsSource = state.map.getSource("auto-events");
    const ringsSource = state.map.getSource("policy-rings");
    if (!eventsSource || !ringsSource) return;

    eventsSource.setData({ type: "FeatureCollection", features: points });
    ringsSource.setData({ type: "FeatureCollection", features: policyRings });

    if (selected) {
      state.map.easeTo({
        center: [selected.lng, selected.lat],
        zoom: state.projection === "globe" ? 0.95 : 1.35,
        pitch: state.projection === "globe" ? 18 : 0,
        duration: 760,
        essential: true
      });
    }
  }

  function popupHtml(evt) {
    const meta = TYPE_META[evt.type] || TYPE_META.auto;
    return `<div style="font-family:'Noto Sans SC',sans-serif;line-height:1.55"><b>${safe(evt.titleZh)}</b><br>${safe(formatYear(evt.year))}<br>${safe(meta.label)} · ${safe(evt.country || "全球")}</div>`;
  }

  function findEventById(id) {
    return state.events.find((evt) => evt.id === id) || null;
  }

  function onEventSelected(id) {
    const evt = findEventById(id);
    if (!evt) return;
    state.selectedId = evt.id;
    const idx = state.nodes.indexOf(evt.year);
    if (idx >= 0) state.nodeIndex = idx;
    render();

    if (state.map && state.popup) state.popup.remove();
    if (state.map) {
      state.popup = new maplibregl.Popup({ closeButton: false, offset: 14 })
        .setLngLat([evt.lng, evt.lat])
        .setHTML(popupHtml(evt))
        .addTo(state.map);
    }
  }

  function render() {
    if (!state.nodes.length) return;

    const items = activeEvents();

    el.nodeSlider.value = String(state.nodeIndex);
    el.yearValue.textContent = formatYear(currentYear());
    el.nodeValue.textContent = `节点 ${state.nodeIndex + 1} / ${state.nodes.length}`;
    el.windowValue.textContent = `范围：前后 ${state.windowSize} 个节点`;

    updateStats(items);
    updateCards(items);
    updateMap(items);
  }

  function setNodeIndex(next) {
    state.nodeIndex = clamp(next, 0, state.nodes.length - 1);
    render();
  }

  function togglePlay() {
    state.playing = !state.playing;
    el.playBtn.textContent = state.playing ? "停止" : "自动播放";

    if (!state.playing) {
      if (state.timer) clearInterval(state.timer);
      state.timer = null;
      return;
    }

    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(() => {
      if (state.nodeIndex >= state.nodes.length - 1) {
        state.playing = false;
        clearInterval(state.timer);
        state.timer = null;
        el.playBtn.textContent = "自动播放";
        return;
      }
      setNodeIndex(state.nodeIndex + 1);
    }, 1600);
  }

  function bindControls() {
    el.nodeSlider.addEventListener("input", (event) => {
      setNodeIndex(Number(event.target.value));
    });

    el.prevBtn.addEventListener("click", () => setNodeIndex(state.nodeIndex - 1));
    el.nextBtn.addEventListener("click", () => setNodeIndex(state.nodeIndex + 1));
    el.playBtn.addEventListener("click", togglePlay);

    el.windowSlider.addEventListener("input", (event) => {
      state.windowSize = Number(event.target.value || 3);
      render();
    });

    el.showAuto.addEventListener("change", (event) => {
      state.showAuto = Boolean(event.target.checked);
      render();
    });

    el.showPolicy.addEventListener("change", (event) => {
      state.showPolicy = Boolean(event.target.checked);
      render();
    });

    el.projectionBtn.addEventListener("click", () => {
      state.projection = state.projection === "globe" ? "mercator" : "globe";
      setProjectionLabel();
      syncProjectionQuery();
      if (!setMapProjection()) remountMap();
      render();
    });

    el.eventList.addEventListener("click", (event) => {
      const card = event.target.closest("[data-event-id]");
      if (!card) return;
      onEventSelected(card.dataset.eventId || "");
    });
  }

  function initMap(centerHint) {
    const center = Array.isArray(centerHint) && centerHint.length === 2 ? centerHint : mapCenterFallback();

    state.map = new maplibregl.Map({
      container: el.mapCanvas,
      style: "https://demotiles.maplibre.org/style.json",
      projection: state.projection,
      center,
      zoom: state.projection === "globe" ? 0.95 : 1.35,
      pitch: state.projection === "globe" ? 18 : 0,
      minZoom: 0.45,
      maxZoom: 7
    });

    state.map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), "top-right");

    state.map.on("style.load", () => {
      try {
        state.map.setFog({
          range: [0.6, 8],
          color: "rgba(198,212,247,0.44)",
          "horizon-blend": 0.15,
          "space-color": "rgba(5,7,14,0.9)",
          "star-intensity": 0.2
        });
      } catch (_) {
        // ignore
      }

      state.map.addSource("auto-events", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      state.map.addSource("policy-rings", { type: "geojson", data: { type: "FeatureCollection", features: [] } });

      state.map.addLayer({
        id: "policy-rings-layer",
        type: "circle",
        source: "policy-rings",
        paint: {
          "circle-radius": 20,
          "circle-color": "rgba(105,168,255,0.14)",
          "circle-stroke-color": "rgba(105,168,255,0.62)",
          "circle-stroke-width": 2
        }
      });

      state.map.addLayer({
        id: "auto-events-circle",
        type: "circle",
        source: "auto-events",
        paint: {
          "circle-color": [
            "match",
            ["get", "type"],
            "policy", "#69a8ff",
            "#f4b24b"
          ],
          "circle-radius": ["coalesce", ["get", "radius"], 8],
          "circle-stroke-color": "rgba(235,245,255,0.95)",
          "circle-stroke-width": ["case", ["==", ["get", "selected"], 1], 2.2, 1]
        }
      });

      state.map.addLayer({
        id: "auto-events-icon",
        type: "symbol",
        source: "auto-events",
        layout: {
          "text-field": ["case", ["==", ["get", "selected"], 1], "★", ""],
          "text-size": 13,
          "text-offset": [0, 1.35],
          "text-allow-overlap": true
        },
        paint: {
          "text-color": "#fff6cc",
          "text-halo-color": "rgba(0,0,0,0.75)",
          "text-halo-width": 1.2
        }
      });

      state.map.on("click", "auto-events-circle", (event) => {
        const feature = event.features && event.features[0];
        if (!feature) return;
        onEventSelected(feature.properties.id || "");
      });

      state.map.on("mouseenter", "auto-events-circle", () => {
        state.map.getCanvas().style.cursor = "pointer";
      });

      state.map.on("mouseleave", "auto-events-circle", () => {
        state.map.getCanvas().style.cursor = "";
      });

      setMapProjection();
      render();
    });
  }

  function init() {
    const autoEvents = normalizeAutoEvents();
    const policyEvents = normalizePolicyEvents();

    state.events = [...autoEvents, ...policyEvents].sort((a, b) => a.year - b.year || b.impact - a.impact);
    state.nodes = [...new Set(state.events.map((evt) => evt.year))].sort((a, b) => a - b);

    el.nodeSlider.max = String(Math.max(0, state.nodes.length - 1));

    setupLegend();
    setProjectionLabel();
    bindControls();
    initMap();
    render();
  }

  init();
})();
