(function () {
  "use strict";

  if (!Array.isArray(window.TIMELINE_DATA) || window.TIMELINE_DATA.length === 0) {
    return;
  }

  const rawData = [...window.TIMELINE_DATA];
  const policyEvents = Array.isArray(window.POLICY_EVENTS) ? [...window.POLICY_EVENTS] : [];

  const el = {
    nodeSlider: document.getElementById("nodeSlider"),
    yearSlider: document.getElementById("yearSlider"),
    windowSlider: document.getElementById("windowSlider"),
    yearValue: document.getElementById("yearValue"),
    nodeValue: document.getElementById("nodeValue"),
    windowValue: document.getElementById("windowValue"),
    snapHint: document.getElementById("snapHint"),
    countryFilter: document.getElementById("countryFilter"),
    brandFilter: document.getElementById("brandFilter"),
    kindFilter: document.getElementById("kindFilter"),
    searchInput: document.getElementById("searchInput"),
    prevNodeBtn: document.getElementById("prevNodeBtn"),
    nextNodeBtn: document.getElementById("nextNodeBtn"),
    playBtn: document.getElementById("playBtn"),
    engineBtn: document.getElementById("engineBtn"),
    fullscreenBtn: document.getElementById("fullscreenBtn"),
    stopVoiceBtn: document.getElementById("stopVoiceBtn"),
    narrateVisibleBtn: document.getElementById("narrateVisibleBtn"),
    stats: document.getElementById("stats"),
    policyPanel: document.getElementById("policyPanel"),
    timelineList: document.getElementById("timelineList")
  };

  const FALLBACK_EMOJI = {
    "文明里程碑": "🛞",
    "制度标准化": "📏",
    "交通基础设施": "🛣️",
    "蒸汽车辆": "🚂",
    "铁路里程碑": "🚆",
    "发动机技术": "⚙️",
    "履带车辆": "🛞",
    "坦克": "🛡️",
    "军用车辆": "🚙",
    "跑车": "🏎️",
    "皮卡/卡车": "🛻",
    "SUV": "🚘",
    "混动车": "🔋",
    "电动车": "⚡",
    "现代汽车": "🚗",
    "豪华车": "✨",
    "两厢车": "🚙",
    "轿车": "🚗"
  };

  const data = rawData
    .map((item, idx) => normalizeItem(item, idx))
    .filter((item) => Number.isFinite(item.year))
    .sort((a, b) => a.year - b.year);

  const minYear = data[0].year;
  const maxYear = data[data.length - 1].year;
  const globalMaxSales = Math.max(...data.map((item) => item.salesUnits || 0), 1);
  const globalMaxProduction = Math.max(...data.map((item) => item.production || 0), 1);

  const state = {
    currentYear: maxYear,
    currentNodeIndex: 0,
    windowSpan: Number(el.windowSlider.value || 8),
    country: "ALL",
    brand: "ALL",
    kind: "ALL",
    search: "",
    playing: false,
    playTimer: null,
    narrating: false,
    activeYears: []
  };

  const engineAudio = {
    ctx: null,
    running: false,
    interval: null,
    nodes: null,

    async start() {
      if (this.running) {
        return;
      }

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        return;
      }

      this.ctx = new AudioCtx();
      await this.ctx.resume();

      const master = this.ctx.createGain();
      master.gain.value = 0.05;
      master.connect(this.ctx.destination);

      const lowPass = this.ctx.createBiquadFilter();
      lowPass.type = "lowpass";
      lowPass.frequency.value = 900;
      lowPass.Q.value = 1.1;
      lowPass.connect(master);

      const oscA = this.ctx.createOscillator();
      oscA.type = "sawtooth";
      oscA.frequency.value = 52;

      const oscB = this.ctx.createOscillator();
      oscB.type = "square";
      oscB.frequency.value = 104;

      const gainA = this.ctx.createGain();
      gainA.gain.value = 0.08;

      const gainB = this.ctx.createGain();
      gainB.gain.value = 0.03;

      oscA.connect(gainA).connect(lowPass);
      oscB.connect(gainB).connect(lowPass);

      const lfo = this.ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 6.4;

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 8;
      lfo.connect(lfoGain);
      lfoGain.connect(oscA.frequency);
      lfoGain.connect(oscB.frequency);

      const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate);
      const channel = noiseBuffer.getChannelData(0);
      for (let i = 0; i < channel.length; i += 1) {
        channel[i] = (Math.random() * 2 - 1) * 0.34;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const noiseBand = this.ctx.createBiquadFilter();
      noiseBand.type = "bandpass";
      noiseBand.frequency.value = 150;
      noiseBand.Q.value = 0.75;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.value = 0.012;

      noise.connect(noiseBand).connect(noiseGain).connect(lowPass);

      oscA.start();
      oscB.start();
      noise.start();
      lfo.start();

      let pulse = 0;
      this.interval = window.setInterval(() => {
        if (!this.ctx) {
          return;
        }
        pulse += 0.36;
        const base = 58 + Math.abs(Math.sin(pulse)) * 45;
        oscA.frequency.setTargetAtTime(base, this.ctx.currentTime, 0.06);
        oscB.frequency.setTargetAtTime(base * 2, this.ctx.currentTime, 0.06);
      }, 320);

      this.nodes = [oscA, oscB, noise, lfo];
      this.running = true;
      el.engineBtn.textContent = "关闭引擎声";
      el.engineBtn.classList.add("success");
    },

    stop() {
      if (!this.running) {
        return;
      }

      if (this.interval) {
        window.clearInterval(this.interval);
      }

      if (Array.isArray(this.nodes)) {
        for (const node of this.nodes) {
          if (typeof node.stop === "function") {
            try {
              node.stop();
            } catch (error) {
              // ignore stop race
            }
          }
        }
      }

      this.nodes = null;
      this.interval = null;
      this.running = false;

      if (this.ctx) {
        this.ctx.close();
      }

      this.ctx = null;
      el.engineBtn.textContent = "启动引擎声";
      el.engineBtn.classList.remove("success");
    }
  };

  function toNumber(raw) {
    if (raw == null || raw === "") {
      return null;
    }

    if (typeof raw === "number") {
      return Number.isFinite(raw) ? raw : null;
    }

    const text = String(raw);
    const million = text.match(/(\d+(?:\.\d+)?)\s*(million|billion)/i);
    if (million) {
      const base = Number(million[1]);
      if (Number.isFinite(base)) {
        return Math.round(base * (million[2].toLowerCase() === "billion" ? 1_000_000_000 : 1_000_000));
      }
    }

    const matches = [...text.matchAll(/\d{1,3}(?:,\d{3})+/g)].map((m) => Number(m[0].replace(/,/g, "")));
    if (matches.length) {
      return Math.max(...matches);
    }

    const plain = text.match(/\b(\d{4,})\b/);
    if (plain) {
      const n = Number(plain[1]);
      return Number.isFinite(n) ? n : null;
    }

    return null;
  }

  function formatYear(year) {
    if (year < 0) {
      return `公元前 ${Math.abs(year)} 年 / ${Math.abs(year)} BCE`;
    }
    return `${year} 年 / ${year}`;
  }

  function formatNumber(value) {
    return Number(value).toLocaleString("en-US");
  }

  function normalize(text) {
    return String(text || "").toLowerCase();
  }

  function escapeHtml(raw) {
    return String(raw ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function inferPolicy(item) {
    const tags = [];
    let score = 0;

    if (["两厢车", "轿车", "SUV", "现代汽车"].includes(item.kind) && item.year >= 1973 && item.year <= 1990) {
      score += 18;
      tags.push("油价冲击后，省油车型更受欢迎");
    }

    if (["电动车", "混动车"].includes(item.kind) && item.year >= 2010) {
      score += 34;
      tags.push("补贴和碳排法规推动电动化销量");
    }

    if (item.country.includes("美国") && item.kind.includes("皮卡")) {
      score += 14;
      tags.push("轻卡政策和税制影响皮卡长期热销");
    }

    if (item.country.includes("中国") && item.year >= 2018) {
      score += 16;
      tags.push("积分和牌照政策提升新能源渗透");
    }

    if (item.country.includes("中国") && ["电动车", "混动车"].includes(item.kind) && item.year >= 2024) {
      score -= 22;
      tags.push("关税升级影响部分出口市场");
    }

    if (["德国", "法国", "意大利", "西班牙", "捷克", "瑞典"].some((x) => item.country.includes(x)) && item.year >= 1992) {
      score += 10;
      tags.push("欧盟统一市场帮助扩大跨国销售");
    }

    if (!tags.length) {
      tags.push("销量主要由产品力、价格和渠道竞争决定");
    }

    score = Math.max(-100, Math.min(100, score));
    return { score, tags };
  }

  function inferTariffPressure(item, policyTags) {
    let pressure = 12;
    const tags = Array.isArray(policyTags) ? policyTags.join(" ") : "";

    if (item.year >= 1930 && item.year <= 1945) {
      pressure = Math.max(pressure, 52);
    }

    if (item.country.includes("中国") && ["电动车", "混动车"].includes(item.kind) && item.year >= 2024) {
      pressure = Math.max(pressure, 84);
    }

    if (item.kind.includes("皮卡") && item.country.includes("美国")) {
      pressure = Math.max(pressure, 35);
    }

    if (tags.includes("关税")) {
      pressure = Math.max(pressure, 74);
    }

    return Math.max(0, Math.min(100, pressure));
  }

  function normalizeItem(item, index) {
    const year = Number(item.year);
    const sales = toNumber(item.salesUnits) || toNumber(item.unitsSold) || toNumber(item.production);
    const production = toNumber(item.production) || sales;
    const policyRaw = Number(item.policyScore);
    const inferred = inferPolicy(item);
    const policyScore = Number.isFinite(policyRaw) ? Math.max(-100, Math.min(100, policyRaw)) : inferred.score;
    const policyTagsZh = Array.isArray(item.policyTagsZh) && item.policyTagsZh.length ? item.policyTagsZh : inferred.tags;
    const tariffPressure = inferTariffPressure(item, policyTagsZh);

    return {
      id: item.id || `event-${index + 1}`,
      year,
      country: item.country || "未记录",
      brand: item.brand || "未记录",
      model: item.model || "未记录",
      kind: item.kind || "现代汽车",
      titleZh: item.titleZh || `${item.brand || "未知品牌"} ${item.model || "车型"}`,
      titleEn: item.titleEn || `${item.brand || "Unknown Brand"} ${item.model || "Model"}`,
      descZh: item.descZh || "教学描述待补充。",
      descEn: item.descEn || "Description pending.",
      production,
      salesUnits: sales,
      priceOriginal: item.priceOriginal || null,
      goldEquivalent: item.goldEquivalent || null,
      manufacturingSites: item.manufacturingSites || item.plant || item.factory || "未记录",
      image: item.image || item.imageUrl || null,
      policyScore,
      policyTagsZh,
      tariffPressure,
      source: item.source || null
    };
  }

  function uniqueValues(key) {
    const values = new Set(data.map((item) => item[key]).filter(Boolean));
    return [...values].sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
  }

  function makeOption(value, label) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    return option;
  }

  function fillSelect(select, values, allLabel) {
    select.innerHTML = "";
    select.appendChild(makeOption("ALL", allLabel));
    for (const value of values) {
      select.appendChild(makeOption(value, value));
    }
  }

  function itemMatchesFilters(item) {
    if (state.country !== "ALL" && item.country !== state.country) {
      return false;
    }
    if (state.brand !== "ALL" && item.brand !== state.brand) {
      return false;
    }
    if (state.kind !== "ALL" && item.kind !== state.kind) {
      return false;
    }

    if (!state.search) {
      return true;
    }

    const fields = [
      item.titleZh,
      item.titleEn,
      item.descZh,
      item.descEn,
      item.country,
      item.brand,
      item.model,
      item.kind,
      item.manufacturingSites,
      ...(item.policyTagsZh || [])
    ];

    return fields.some((field) => normalize(field).includes(state.search));
  }

  function filteredData() {
    return data.filter(itemMatchesFilters);
  }

  function recalcActiveYears() {
    const years = [...new Set(filteredData().map((item) => item.year))].sort((a, b) => a - b);
    state.activeYears = years;

    if (!years.length) {
      state.currentYear = maxYear;
      state.currentNodeIndex = 0;
      return;
    }

    const nearest = findNearestYear(state.currentYear, 1, years);
    state.currentYear = nearest;
    state.currentNodeIndex = Math.max(0, years.indexOf(nearest));
  }

  function findNearestYear(targetYear, direction, years = state.activeYears) {
    if (!years.length) {
      return targetYear;
    }

    if (years.includes(targetYear)) {
      return targetYear;
    }

    if (direction >= 0) {
      for (const year of years) {
        if (year >= targetYear) {
          return year;
        }
      }
      return years[years.length - 1];
    }

    for (let i = years.length - 1; i >= 0; i -= 1) {
      if (years[i] <= targetYear) {
        return years[i];
      }
    }

    return years[0];
  }

  function clampNodeIndex(idx) {
    if (!state.activeYears.length) {
      return 0;
    }
    return Math.max(0, Math.min(state.activeYears.length - 1, idx));
  }

  function setCurrentYearByNodeIndex(idx) {
    if (!state.activeYears.length) {
      return;
    }
    const safe = clampNodeIndex(idx);
    state.currentNodeIndex = safe;
    state.currentYear = state.activeYears[safe];
  }

  function getVisibleEvents() {
    const maxDistance = state.windowSpan;
    return filteredData()
      .filter((item) => Math.abs(item.year - state.currentYear) <= maxDistance)
      .sort((a, b) => {
        const distA = Math.abs(a.year - state.currentYear);
        const distB = Math.abs(b.year - state.currentYear);
        if (distA !== distB) {
          return distA - distB;
        }
        return (b.salesUnits || b.production || 0) - (a.salesUnits || a.production || 0);
      })
      .slice(0, 24);
  }

  function getUntilNowEvents() {
    return filteredData().filter((item) => item.year <= state.currentYear);
  }

  function salesBarPercent(item) {
    const value = item.salesUnits || 0;
    if (!value) {
      return 2;
    }
    return Math.max(3, Math.round((Math.log10(value + 1) / Math.log10(globalMaxSales + 1)) * 100));
  }

  function productionBarPercent(item) {
    const value = item.production || 0;
    if (!value) {
      return 2;
    }
    return Math.max(3, Math.round((Math.log10(value + 1) / Math.log10(globalMaxProduction + 1)) * 100));
  }

  function siteCount(item) {
    if (!item.manufacturingSites || item.manufacturingSites === "未记录") {
      return 0;
    }

    const count = item.manufacturingSites
      .split(/[,;|、]/)
      .map((x) => x.trim())
      .filter(Boolean).length;

    return Math.max(1, Math.min(12, count));
  }

  function siteBarPercent(item) {
    return Math.round((siteCount(item) / 12) * 100);
  }

  function policyBarPercent(item) {
    return Math.round(((item.policyScore || 0) + 100) / 2);
  }

  function scoreTrackHtml(score) {
    const width = Math.round(Math.abs(score) / 2);
    const cls = score >= 0 ? "pos" : "neg";
    return `<div class="impact-track"><i class="impact-bar ${cls}" style="width:${width}%"></i></div>`;
  }

  function fallbackEmoji(kind) {
    return FALLBACK_EMOJI[kind] || "🚘";
  }

  function renderStats(visible, untilNow) {
    const imageCount = visible.filter((item) => item.image).length;
    const salesSum = visible.reduce((sum, item) => sum + (item.salesUnits || 0), 0);
    const productionSum = visible.reduce((sum, item) => sum + (item.production || 0), 0);
    const avgPolicy = visible.length
      ? Math.round(visible.reduce((sum, item) => sum + (item.policyScore || 0), 0) / visible.length)
      : 0;

    el.stats.innerHTML = `
      <article class="stat-item">
        <b>${formatNumber(state.activeYears.length)}</b>
        <span>当前筛选可用知识点年份</span>
      </article>
      <article class="stat-item">
        <b>${formatNumber(visible.length)} / ${formatNumber(imageCount)}</b>
        <span>当前画面卡片数 / 含图片卡片数</span>
      </article>
      <article class="stat-item">
        <b>${formatNumber(salesSum)} 台</b>
        <span>当前画面累计销量（估算）</span>
      </article>
      <article class="stat-item">
        <b>${formatNumber(productionSum)} · 政策 ${avgPolicy >= 0 ? "+" : ""}${avgPolicy}</b>
        <span>当前画面产量总量与平均政策分</span>
      </article>
    `;

    if (!untilNow.length) {
      return;
    }
  }

  function renderPolicies() {
    const recent = policyEvents
      .filter((p) => p.year <= state.currentYear)
      .sort((a, b) => b.year - a.year)
      .slice(0, 6);

    if (!recent.length) {
      el.policyPanel.innerHTML = '<div class="empty">当前年份之前暂无政策事件。</div>';
      return;
    }

    el.policyPanel.innerHTML = recent
      .map((policy) => {
        const impact = Number(policy.impact) || 0;
        return `
          <article class="policy-row">
            <div class="policy-head">
              <b>${escapeHtml(policy.titleZh)}</b>
              <span>${escapeHtml(String(policy.year))} · ${escapeHtml(policy.region || "")}</span>
            </div>
            ${scoreTrackHtml(impact)}
            <p>${escapeHtml(policy.descZh || "")}</p>
          </article>
        `;
      })
      .join("");
  }

  function renderList(visible) {
    if (!visible.length) {
      el.timelineList.innerHTML = '<div class="empty">当前筛选下没有内容。可以切换品牌/国家，或扩大同屏年份范围。</div>';
      return;
    }

    el.timelineList.innerHTML = visible
      .map((item) => {
        const zhSpeech = `${formatYear(item.year)}。${item.titleZh}。${item.descZh}`;
        const enSpeech = `${item.titleEn}. ${item.descEn}`;
        const salesValue = item.salesUnits ? `${formatNumber(item.salesUnits)} 台` : "待补充";
        const productionValue = item.production ? `${formatNumber(item.production)} 台` : "待补充";
        const siteValue = item.manufacturingSites || "未记录";
        const policyValue = `${item.policyScore >= 0 ? "+" : ""}${item.policyScore}`;
        const imageBlock = item.image
          ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.titleZh)}" loading="lazy" referrerpolicy="no-referrer" />`
          : `<div class="image-fallback" aria-label="no image">${fallbackEmoji(item.kind)}</div>`;

        return `
          <article class="event-card">
            <div class="image-wrap">
              ${imageBlock}
              <span class="image-year">${escapeHtml(formatYear(item.year))}</span>
            </div>
            <div class="card-body">
              <h4>${escapeHtml(item.titleZh)}</h4>
              <p class="en-title">${escapeHtml(item.titleEn)}</p>
              <p class="meta-line">${escapeHtml(item.country)} · ${escapeHtml(item.brand)} · ${escapeHtml(item.model)} · ${escapeHtml(item.kind)}</p>
              <p class="meta-light">生产地：${escapeHtml(siteValue)}</p>

              <div class="bar-stack">
                <div class="bar-row">
                  <span>销量 Sales</span>
                  <div class="bar-track"><div class="bar-fill" style="width:${salesBarPercent(item)}%"></div></div>
                  <b class="bar-value">${escapeHtml(salesValue)}</b>
                </div>
                <div class="bar-row">
                  <span>产量 Output</span>
                  <div class="bar-track"><div class="bar-fill" style="width:${productionBarPercent(item)}%"></div></div>
                  <b class="bar-value">${escapeHtml(productionValue)}</b>
                </div>
                <div class="bar-row">
                  <span>产地覆盖</span>
                  <div class="bar-track"><div class="bar-fill" style="width:${siteBarPercent(item)}%"></div></div>
                  <b class="bar-value">${siteCount(item)} 地</b>
                </div>
                <div class="bar-row">
                  <span>关税压力</span>
                  <div class="bar-track"><div class="bar-fill" style="width:${item.tariffPressure || 0}%"></div></div>
                  <b class="bar-value">${item.tariffPressure || 0}</b>
                </div>
                <div class="bar-row">
                  <span>政策分</span>
                  <div class="bar-track"><div class="bar-fill" style="width:${policyBarPercent(item)}%"></div></div>
                  <b class="bar-value">${policyValue}</b>
                </div>
              </div>

              <div class="policy-tags">
                ${(item.policyTagsZh || []).slice(0, 2).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
              </div>

              <div class="voice-row">
                <button class="voice-btn" data-speak-lang="zh-CN" data-speak-text="${escapeHtml(zhSpeech)}">中文发音</button>
                <button class="voice-btn" data-speak-lang="en-US" data-speak-text="${escapeHtml(enSpeech)}">English Voice</button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function chooseVoice(lang) {
    const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    const langPrefix = lang.toLowerCase().startsWith("zh") ? "zh" : "en";
    return voices.find((voice) => voice.lang.toLowerCase().startsWith(langPrefix)) || null;
  }

  function speakText(text, lang, onEnd) {
    if (!("speechSynthesis" in window)) {
      return;
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = lang.startsWith("zh") ? 0.9 : 0.96;
    utter.pitch = 1;

    const voice = chooseVoice(lang);
    if (voice) {
      utter.voice = voice;
    }

    if (typeof onEnd === "function") {
      utter.onend = onEnd;
      utter.onerror = onEnd;
    }

    window.speechSynthesis.speak(utter);
  }

  function stopSpeech() {
    state.narrating = false;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    el.narrateVisibleBtn.textContent = "朗读当前卡片（中英）";
  }

  function narrateVisibleCards() {
    if (state.narrating) {
      stopSpeech();
      return;
    }

    const visible = getVisibleEvents().slice(0, 6);
    if (!visible.length) {
      return;
    }

    state.narrating = true;
    el.narrateVisibleBtn.textContent = "停止朗读";

    const queue = [];
    for (const item of visible) {
      queue.push({ lang: "zh-CN", text: `${formatYear(item.year)}。${item.titleZh}。${item.descZh}` });
      queue.push({ lang: "en-US", text: `${item.titleEn}. ${item.descEn}` });
    }

    let idx = 0;
    window.speechSynthesis.cancel();

    const next = () => {
      if (!state.narrating || idx >= queue.length) {
        stopSpeech();
        return;
      }
      const current = queue[idx++];
      speakText(current.text, current.lang, () => window.setTimeout(next, 130));
    };

    next();
  }

  function stopPlay() {
    state.playing = false;
    if (state.playTimer) {
      window.clearInterval(state.playTimer);
      state.playTimer = null;
    }
    el.playBtn.textContent = "自动播放";
  }

  function startPlay() {
    if (state.playing) {
      stopPlay();
      return;
    }

    if (!state.activeYears.length) {
      return;
    }

    state.playing = true;
    el.playBtn.textContent = "暂停播放";

    state.playTimer = window.setInterval(() => {
      if (!state.activeYears.length) {
        stopPlay();
        return;
      }

      const nextIndex = state.currentNodeIndex + 1;
      if (nextIndex >= state.activeYears.length) {
        stopPlay();
        return;
      }

      setCurrentYearByNodeIndex(nextIndex);
      renderAll();
    }, 900);
  }

  function updateSliders() {
    el.yearSlider.min = String(minYear);
    el.yearSlider.max = String(maxYear);
    el.yearSlider.value = String(state.currentYear);

    const total = state.activeYears.length;
    el.nodeSlider.min = "0";
    el.nodeSlider.max = String(Math.max(0, total - 1));
    el.nodeSlider.value = String(Math.max(0, state.currentNodeIndex));

    el.yearValue.textContent = formatYear(state.currentYear);
    el.nodeValue.textContent = total
      ? `第 ${state.currentNodeIndex + 1} / ${total} 个知识点`
      : "当前筛选没有知识点";
    el.windowValue.textContent = `显示当前年份前后 ${state.windowSpan} 年`;
    el.snapHint.textContent = "拖动时会自动吸附到最近有数据的年份";
  }

  async function toggleFullscreen() {
    const target = document.documentElement;

    try {
      if (!document.fullscreenElement) {
        if (target.requestFullscreen) {
          await target.requestFullscreen();
        }
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (error) {
      // fullscreen may be unavailable on some browsers
    }
  }

  function renderAll() {
    recalcActiveYears();
    updateSliders();

    const visible = getVisibleEvents();
    const untilNow = getUntilNowEvents();

    renderStats(visible, untilNow);
    renderPolicies();
    renderList(visible);
  }

  function bindEvents() {
    el.nodeSlider.addEventListener("input", (event) => {
      stopPlay();
      const idx = Number(event.target.value);
      setCurrentYearByNodeIndex(idx);
      renderAll();
    });

    el.prevNodeBtn.addEventListener("click", () => {
      stopPlay();
      setCurrentYearByNodeIndex(state.currentNodeIndex - 1);
      renderAll();
    });

    el.nextNodeBtn.addEventListener("click", () => {
      stopPlay();
      setCurrentYearByNodeIndex(state.currentNodeIndex + 1);
      renderAll();
    });

    el.yearSlider.addEventListener("input", (event) => {
      stopPlay();
      const desired = Number(event.target.value);
      const direction = desired >= state.currentYear ? 1 : -1;
      state.currentYear = findNearestYear(desired, direction);
      if (state.activeYears.length) {
        state.currentNodeIndex = Math.max(0, state.activeYears.indexOf(state.currentYear));
      }
      renderAll();
    });

    el.windowSlider.addEventListener("input", (event) => {
      state.windowSpan = Number(event.target.value);
      renderAll();
    });

    el.countryFilter.addEventListener("change", (event) => {
      state.country = event.target.value;
      renderAll();
    });

    el.brandFilter.addEventListener("change", (event) => {
      state.brand = event.target.value;
      renderAll();
    });

    el.kindFilter.addEventListener("change", (event) => {
      state.kind = event.target.value;
      renderAll();
    });

    el.searchInput.addEventListener("input", (event) => {
      state.search = normalize(event.target.value.trim());
      renderAll();
    });

    el.playBtn.addEventListener("click", startPlay);

    el.engineBtn.addEventListener("click", async () => {
      if (engineAudio.running) {
        engineAudio.stop();
        return;
      }
      await engineAudio.start();
    });

    el.fullscreenBtn.addEventListener("click", toggleFullscreen);

    el.stopVoiceBtn.addEventListener("click", stopSpeech);
    el.narrateVisibleBtn.addEventListener("click", narrateVisibleCards);

    el.timelineList.addEventListener("click", (event) => {
      const btn = event.target.closest(".voice-btn");
      if (!btn) {
        return;
      }

      stopSpeech();
      const text = btn.getAttribute("data-speak-text") || "";
      const lang = btn.getAttribute("data-speak-lang") || "zh-CN";
      speakText(text, lang);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopPlay();
        engineAudio.stop();
      }
    });
  }

  function init() {
    fillSelect(el.countryFilter, uniqueValues("country"), "全部国家 / All Countries");
    fillSelect(el.brandFilter, uniqueValues("brand"), "全部品牌 / All Brands");

    const kinds = Array.isArray(window.KINDS) && window.KINDS.length
      ? [...new Set(window.KINDS)]
      : uniqueValues("kind");
    fillSelect(el.kindFilter, kinds, "全部类型 / All Types");

    bindEvents();
    recalcActiveYears();
    if (state.activeYears.length) {
      state.currentYear = state.activeYears[state.activeYears.length - 1];
      state.currentNodeIndex = state.activeYears.length - 1;
    }
    renderAll();

    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }

  init();
})();
