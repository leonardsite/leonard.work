(function () {
  "use strict";

  const DOMAIN_META = {
    bio: { label: "生物演化", color: "#35c0a6", emoji: "🧬" },
    extinction: { label: "灭绝事件", color: "#ff6e59", emoji: "☄️" }
  };

  const PLATE_SNAPSHOTS = [
    {
      key: "pangaea",
      label: "盘古大陆期",
      maxYear: -250000000,
      features: [
        poly("盘古主体", "#f5c97a", [[-95, -50], [-52, -58], [8, -56], [52, -42], [96, -18], [109, 16], [87, 44], [36, 59], [-19, 66], [-67, 47], [-94, 16], [-95, -50]])
      ]
    },
    {
      key: "breakup",
      label: "盘古裂解期",
      maxYear: -150000000,
      features: [
        poly("劳亚大陆", "#e9b86c", [[-82, 8], [-56, -6], [-24, -2], [8, 14], [30, 38], [19, 56], [-18, 68], [-54, 56], [-74, 28], [-82, 8]]),
        poly("冈瓦纳大陆", "#d99b5f", [[-50, -56], [-6, -60], [36, -54], [74, -42], [86, -16], [64, 8], [28, 4], [-6, -8], [-38, -26], [-50, -56]])
      ]
    },
    {
      key: "late-cretaceous",
      label: "晚白垩纪",
      maxYear: -70000000,
      features: [
        poly("北美", "#e8c57a", [[-166, 9], [-145, 18], [-130, 31], [-112, 51], [-88, 66], [-63, 64], [-52, 46], [-72, 23], [-103, 11], [-134, 3], [-166, 9]]),
        poly("南美", "#d8a86a", [[-82, 13], [-68, 7], [-56, -6], [-51, -23], [-55, -43], [-67, -56], [-79, -54], [-85, -31], [-84, -10], [-82, 13]]),
        poly("欧亚", "#dcbf72", [[-10, 31], [7, 34], [25, 46], [53, 56], [86, 63], [115, 58], [143, 49], [158, 38], [149, 24], [117, 11], [82, 8], [52, 13], [30, 26], [9, 24], [-10, 31]]),
        poly("非洲", "#ca925f", [[-16, 35], [4, 33], [24, 20], [31, -1], [30, -25], [16, -37], [-2, -33], [-14, -7], [-16, 35]]),
        poly("澳洲", "#dcb37f", [[109, -14], [122, -16], [139, -21], [151, -31], [143, -41], [121, -40], [111, -30], [109, -14]])
      ]
    },
    {
      key: "modern",
      label: "现代大陆",
      maxYear: Infinity,
      features: [
        poly("北美", "#7db3d7", [[-168, 7], [-151, 17], [-131, 31], [-113, 52], [-89, 70], [-53, 60], [-54, 42], [-78, 20], [-104, 10], [-131, 4], [-168, 7]]),
        poly("南美", "#6a9ec3", [[-82, 13], [-71, 7], [-58, -8], [-54, -26], [-60, -43], [-73, -56], [-82, -52], [-85, -31], [-84, -11], [-82, 13]]),
        poly("欧亚", "#88bbdf", [[-10, 36], [8, 38], [28, 48], [52, 55], [84, 61], [113, 57], [143, 49], [156, 34], [145, 22], [112, 9], [81, 9], [49, 13], [26, 25], [9, 28], [-10, 36]]),
        poly("非洲", "#5d8ead", [[-17, 36], [5, 36], [24, 21], [33, -2], [31, -26], [17, -35], [-1, -33], [-15, -8], [-17, 36]]),
        poly("澳洲", "#7ca8c6", [[112, -10], [125, -16], [140, -21], [154, -30], [145, -41], [121, -39], [113, -31], [112, -10]]),
        poly("格陵兰", "#7eaed4", [[-73, 59], [-56, 60], [-39, 71], [-44, 82], [-62, 82], [-73, 72], [-73, 59]])
      ]
    }
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
    driftToggle: document.getElementById("driftToggle"),
    platesToggle: document.getElementById("platesToggle"),
    projectionBtn: document.getElementById("projectionBtn"),
    projectionLabel: document.getElementById("projectionLabel"),
    legendGrid: document.getElementById("legendGrid"),
    stats: document.getElementById("stats"),
    mapCanvas: document.getElementById("mapCanvas"),
    eventList: document.getElementById("eventList"),
    meteorFlash: document.getElementById("meteorFlash")
  };

  const state = {
    events: [],
    nodes: [],
    nodeIndex: 0,
    windowSize: Number(el.windowSlider.value || 2),
    projection: "globe",
    showDrift: true,
    showPlates: true,
    selectedId: null,
    playing: false,
    timer: null,
    map: null,
    popup: null
  };

  function poly(name, color, coords) {
    return {
      type: "Feature",
      properties: { name, color },
      geometry: { type: "Polygon", coordinates: [coords] }
    };
  }

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
    if (n <= -1000000) {
      const ma = Math.abs(n) / 1000000;
      const text = ma >= 100 ? Math.round(ma).toLocaleString("en-US") : ma.toFixed(1);
      return `${text} 百万年前 / ${text} Ma`;
    }
    if (n < 0) return `公元前 ${Math.abs(n).toLocaleString("en-US")} 年`;
    return `${n.toLocaleString("en-US")} 年`;
  }

  function domainOf(event) {
    return event.domain === "extinction" ? "extinction" : "bio";
  }

  function normalizeBioEvents() {
    const raw = Array.isArray(window.EARTH_BIO_EVENTS) ? window.EARTH_BIO_EVENTS : [];
    return raw
      .map((item, idx) => {
        const year = Number(item.year);
        if (!Number.isFinite(year)) return null;
        return {
          id: item.id || `bio-${idx + 1}`,
          year,
          domain: domainOf(item),
          category: item.category || "生物演化",
          titleZh: item.titleZh || "生物事件",
          titleEn: item.titleEn || "Biology event",
          descZh: item.descZh || "",
          image: item.image || "",
          lat: Number(item.lat) || 0,
          lng: Number(item.lng) || 0,
          paleoLat: Number.isFinite(Number(item.paleoLat)) ? Number(item.paleoLat) : null,
          paleoLng: Number.isFinite(Number(item.paleoLng)) ? Number(item.paleoLng) : null,
          impact: toPct(item.impact),
          spread: toPct(item.spread),
          extinct: Boolean(item.extinct),
          emoji: item.emoji || (domainOf(item) === "extinction" ? "☄️" : "🧬")
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.year - b.year);
  }

  function setupLegend() {
    el.legendGrid.innerHTML = Object.entries(DOMAIN_META)
      .map(([key, meta]) => (`
        <span class="legend-item" data-domain="${key}">
          <i class="legend-dot" style="background:${meta.color}"></i>
          <span>${meta.emoji} ${safe(meta.label)}</span>
        </span>
      `))
      .join("");
  }

  function currentYear() {
    return state.nodes[state.nodeIndex] || 0;
  }

  function activeEvents() {
    if (!state.events.length) return [];
    const start = Math.max(0, state.nodeIndex - state.windowSize);
    const end = Math.min(state.nodes.length - 1, state.nodeIndex + state.windowSize);
    const years = new Set(state.nodes.slice(start, end + 1));

    return state.events
      .filter((evt) => years.has(evt.year))
      .sort((a, b) => {
        const da = Math.abs(a.year - currentYear());
        const db = Math.abs(b.year - currentYear());
        return da - db || b.impact - a.impact;
      });
  }

  function plateSnapshotByYear(year) {
    return PLATE_SNAPSHOTS.find((snap) => year <= snap.maxYear) || PLATE_SNAPSHOTS[PLATE_SNAPSHOTS.length - 1];
  }

  function geoJson(features) {
    return { type: "FeatureCollection", features };
  }

  function pointFeature(evt, selected) {
    return {
      type: "Feature",
      properties: {
        id: evt.id,
        title: evt.titleZh,
        year: evt.year,
        domain: evt.domain,
        category: evt.category,
        impact: evt.impact,
        selected: selected ? 1 : 0,
        radius: clamp(6 + evt.impact * 0.08 + (selected ? 4 : 0), 6, 18)
      },
      geometry: {
        type: "Point",
        coordinates: [evt.lng, evt.lat]
      }
    };
  }

  function driftLineFeature(evt) {
    return {
      type: "Feature",
      properties: {
        id: evt.id,
        title: evt.titleZh
      },
      geometry: {
        type: "LineString",
        coordinates: [[evt.paleoLng, evt.paleoLat], [evt.lng, evt.lat]]
      }
    };
  }

  function paleoPointFeature(evt) {
    return {
      type: "Feature",
      properties: {
        id: evt.id,
        title: evt.titleZh
      },
      geometry: {
        type: "Point",
        coordinates: [evt.paleoLng, evt.paleoLat]
      }
    };
  }

  function meteorRingFeature(evt) {
    return {
      type: "Feature",
      properties: { id: evt.id },
      geometry: { type: "Point", coordinates: [evt.lng, evt.lat] }
    };
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

  function updateStats(items, snapshot) {
    const extinct = items.filter((x) => x.extinct).length;
    const avgImpact = items.length ? Math.round(items.reduce((sum, x) => sum + x.impact, 0) / items.length) : 0;
    const earliest = state.nodes[0];
    const latest = state.nodes[state.nodes.length - 1];

    el.stats.innerHTML = [
      { label: "当前年份", value: formatYear(currentYear()) },
      { label: "当前事件数", value: `${items.length}` },
      { label: "灭绝事件", value: `${extinct}` },
      { label: "平均影响", value: `${avgImpact}%` },
      { label: "板块快照", value: snapshot.label },
      { label: "时间轴范围", value: `${formatYear(earliest)} → ${formatYear(latest)}` },
      { label: "地图模式", value: state.projection === "globe" ? "地球仪" : "平面" },
      { label: "漂移线", value: state.showDrift ? "显示" : "隐藏" }
    ].map((card) => (`
      <article class="stat-card">
        <b>${safe(card.value)}</b>
        <span>${safe(card.label)}</span>
      </article>
    `)).join("");
  }

  function cardHtml(evt, active) {
    const meta = DOMAIN_META[evt.domain] || DOMAIN_META.bio;
    const media = evt.image
      ? `<img src="${safe(evt.image)}" alt="${safe(evt.titleZh)}" loading="lazy" referrerpolicy="no-referrer" />`
      : `<div class="event-fallback">${safe(evt.emoji || meta.emoji)}</div>`;

    return `
      <article class="event-card ${active ? "active" : ""}" data-event-id="${safe(evt.id)}">
        <div class="event-media">${media}</div>
        <div class="event-body">
          <p class="event-meta">${safe(formatYear(evt.year))} · ${safe(meta.label)} · ${safe(evt.category)}</p>
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
          </div>
        </div>
      </article>
    `;
  }

  function updateCards(items) {
    if (!items.length) {
      el.eventList.innerHTML = "<p class='muted'>当前节点暂无事件</p>";
      return;
    }

    const selected = ensureSelected(items);
    el.eventList.innerHTML = items.slice(0, 18).map((evt) => cardHtml(evt, selected && evt.id === selected.id)).join("");
  }

  function setMeteorFlash(show) {
    el.meteorFlash.classList.toggle("show", Boolean(show));
  }

  function setProjectionLabel() {
    const isGlobe = state.projection === "globe";
    el.projectionLabel.textContent = isGlobe ? "当前：地球仪 Globe" : "当前：平面地图 Mercator";
    el.projectionBtn.textContent = isGlobe ? "切换到平面地图" : "切换到地球仪";
  }

  function setMapProjection() {
    if (!state.map) return;
    try {
      state.map.setProjection(state.projection);
    } catch (_) {
      state.map.setProjection({ type: state.projection });
    }
  }

  function updateMap(items, snapshot) {
    if (!state.map || !state.map.isStyleLoaded()) return;

    const selected = ensureSelected(items);
    const pointFeatures = items.map((evt) => pointFeature(evt, selected && evt.id === selected.id));

    const driftItems = state.showDrift
      ? items.filter((evt) => Number.isFinite(evt.paleoLat) && Number.isFinite(evt.paleoLng) && (Math.abs(evt.paleoLat - evt.lat) > 6 || Math.abs(evt.paleoLng - evt.lng) > 6))
      : [];

    const driftFeatures = driftItems.map(driftLineFeature);
    const paleoFeatures = driftItems.map(paleoPointFeature);

    const plateFeatures = state.showPlates ? snapshot.features : [];

    const meteor = items.find((evt) => evt.id.includes("chicxulub") || evt.titleEn.toLowerCase().includes("chicxulub"));
    const ringFeatures = meteor ? [meteorRingFeature(meteor)] : [];
    setMeteorFlash(Boolean(meteor));

    state.map.getSource("bio-events").setData(geoJson(pointFeatures));
    state.map.getSource("bio-drift").setData(geoJson(driftFeatures));
    state.map.getSource("bio-paleo").setData(geoJson(paleoFeatures));
    state.map.getSource("bio-plates").setData(geoJson(plateFeatures));
    state.map.getSource("bio-meteor").setData(geoJson(ringFeatures));

    if (selected) {
      state.map.easeTo({
        center: [selected.lng, selected.lat],
        zoom: state.projection === "globe" ? 1.8 : 2.2,
        duration: 700,
        essential: true
      });
    }
  }

  function popupHtml(evt) {
    const meta = DOMAIN_META[evt.domain] || DOMAIN_META.bio;
    return `<div style="font-family:'Noto Sans SC',sans-serif;line-height:1.55"><b>${safe(evt.titleZh)}</b><br>${safe(formatYear(evt.year))}<br>${safe(meta.label)} · ${safe(evt.category)}</div>`;
  }

  function render() {
    if (!state.nodes.length) return;

    const year = currentYear();
    const items = activeEvents();
    const snapshot = plateSnapshotByYear(year);

    el.nodeSlider.value = String(state.nodeIndex);
    el.yearValue.textContent = formatYear(year);
    el.nodeValue.textContent = `节点 ${state.nodeIndex + 1} / ${state.nodes.length}`;
    el.windowValue.textContent = `范围：前后 ${state.windowSize} 个节点`;

    updateStats(items, snapshot);
    updateCards(items);
    updateMap(items, snapshot);
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
    }, 1700);
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

  function bindControls() {
    el.nodeSlider.addEventListener("input", (event) => {
      setNodeIndex(Number(event.target.value));
    });

    el.prevBtn.addEventListener("click", () => setNodeIndex(state.nodeIndex - 1));
    el.nextBtn.addEventListener("click", () => setNodeIndex(state.nodeIndex + 1));
    el.playBtn.addEventListener("click", togglePlay);

    el.windowSlider.addEventListener("input", (event) => {
      state.windowSize = Number(event.target.value || 2);
      render();
    });

    el.driftToggle.addEventListener("change", (event) => {
      state.showDrift = Boolean(event.target.checked);
      render();
    });

    el.platesToggle.addEventListener("change", (event) => {
      state.showPlates = Boolean(event.target.checked);
      render();
    });

    el.projectionBtn.addEventListener("click", () => {
      state.projection = state.projection === "globe" ? "mercator" : "globe";
      setProjectionLabel();
      setMapProjection();
    });

    el.eventList.addEventListener("click", (event) => {
      const card = event.target.closest("[data-event-id]");
      if (!card) return;
      onEventSelected(card.dataset.eventId || "");
    });
  }

  function initMap() {
    state.map = new maplibregl.Map({
      container: el.mapCanvas,
      style: "https://demotiles.maplibre.org/style.json",
      projection: "globe",
      center: [12, 20],
      zoom: 1.25,
      minZoom: 0.7,
      maxZoom: 6.5
    });

    state.map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), "top-right");

    state.map.on("style.load", () => {
      try {
        state.map.setFog({
          range: [0.6, 8],
          color: "rgba(186,218,255,0.42)",
          "horizon-blend": 0.15,
          "space-color": "rgba(2,9,18,0.88)",
          "star-intensity": 0.2
        });
      } catch (_) {
        // ignore
      }

      state.map.addSource("bio-events", { type: "geojson", data: geoJson([]) });
      state.map.addSource("bio-drift", { type: "geojson", data: geoJson([]) });
      state.map.addSource("bio-paleo", { type: "geojson", data: geoJson([]) });
      state.map.addSource("bio-plates", { type: "geojson", data: geoJson([]) });
      state.map.addSource("bio-meteor", { type: "geojson", data: geoJson([]) });

      state.map.addLayer({
        id: "bio-plates-fill",
        type: "fill",
        source: "bio-plates",
        paint: {
          "fill-color": ["coalesce", ["get", "color"], "#8db7d8"],
          "fill-opacity": 0.28
        }
      });

      state.map.addLayer({
        id: "bio-plates-line",
        type: "line",
        source: "bio-plates",
        paint: {
          "line-color": "rgba(198, 233, 255, 0.55)",
          "line-width": 1.2,
          "line-dasharray": [2, 1]
        }
      });

      state.map.addLayer({
        id: "bio-drift-line",
        type: "line",
        source: "bio-drift",
        paint: {
          "line-color": "rgba(111, 211, 180, 0.7)",
          "line-width": 1.4,
          "line-dasharray": [1.5, 1.5]
        }
      });

      state.map.addLayer({
        id: "bio-paleo-point",
        type: "circle",
        source: "bio-paleo",
        paint: {
          "circle-radius": 4,
          "circle-color": "rgba(53,192,166,0.2)",
          "circle-stroke-color": "rgba(53,192,166,0.9)",
          "circle-stroke-width": 1.2
        }
      });

      state.map.addLayer({
        id: "bio-events-circle",
        type: "circle",
        source: "bio-events",
        paint: {
          "circle-color": [
            "match",
            ["get", "domain"],
            "extinction", "#ff6e59",
            "#35c0a6"
          ],
          "circle-radius": ["coalesce", ["get", "radius"], 8],
          "circle-stroke-color": "rgba(230,247,255,0.95)",
          "circle-stroke-width": ["case", ["==", ["get", "selected"], 1], 2.4, 1]
        }
      });

      state.map.addLayer({
        id: "bio-events-icon",
        type: "symbol",
        source: "bio-events",
        layout: {
          "text-field": ["case", ["==", ["get", "selected"], 1], "★", ""],
          "text-size": 13,
          "text-offset": [0, 1.35],
          "text-allow-overlap": true
        },
        paint: {
          "text-color": "#fff5c1",
          "text-halo-color": "rgba(0,0,0,0.8)",
          "text-halo-width": 1.2
        }
      });

      state.map.addLayer({
        id: "bio-meteor-ring",
        type: "circle",
        source: "bio-meteor",
        paint: {
          "circle-radius": 28,
          "circle-color": "rgba(255,110,89,0.2)",
          "circle-stroke-color": "rgba(255,110,89,0.85)",
          "circle-stroke-width": 2.4
        }
      });

      state.map.on("click", "bio-events-circle", (event) => {
        const feature = event.features && event.features[0];
        if (!feature) return;
        onEventSelected(feature.properties.id || "");
      });

      state.map.on("mouseenter", "bio-events-circle", () => {
        state.map.getCanvas().style.cursor = "pointer";
      });

      state.map.on("mouseleave", "bio-events-circle", () => {
        state.map.getCanvas().style.cursor = "";
      });

      setMapProjection();
      render();
    });
  }

  function init() {
    state.events = normalizeBioEvents();
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
