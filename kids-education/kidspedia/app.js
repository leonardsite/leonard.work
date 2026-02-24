(function () {
    const data = window.KIDSPEDIA_DATA || { modules: [] };

    function uniqueItems(items) {
        const list = Array.isArray(items) ? items : [];
        const seen = new Set();
        const out = [];

        list.forEach((item) => {
            if (!item) return;
            const zh = (item.zh || "").trim().toLowerCase();
            const en = (item.en || "").trim().toLowerCase();
            const wiki = (item.wiki || "").trim().toLowerCase();
            const key = `${zh}::${en}::${wiki}`;
            if (seen.has(key)) return;
            seen.add(key);
            out.push(item);
        });

        return out;
    }

    if (Array.isArray(data.modules)) {
        data.modules.forEach((module) => {
            module.items = uniqueItems(module.items);
        });
    }

    const moduleMap = new Map((data.modules || []).map((m) => [m.id, m]));
    const imageCacheKey = "kidspedia.imageCache.v1";

    const state = {
        moduleId: data.modules[0] ? data.modules[0].id : "",
        query: "",
        type: "all",
        region: "all",
        view: "cards",
        filtered: [],
        voices: [],
        imageCache: new Map(),
        imageInflight: new Map(),
        imageObserver: null,
        toastTimer: null,
        selectedMindId: "",
        globe: null,
        globeAutoRotate: false,
        audioCtx: null,
        noiseBuffer: null
    };

    function currentModule() {
        return moduleMap.get(state.moduleId) || data.modules[0] || { items: [], semantic: {}, relations: [] };
    }

    function normalize(value) {
        return (value || "")
            .toString()
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function escapeHtml(value) {
        return (value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function showToast(message) {
        const toast = document.getElementById("toast");
        toast.textContent = message;
        toast.classList.add("show");

        if (state.toastTimer) clearTimeout(state.toastTimer);
        state.toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 1800);
    }

    function formatYear(year) {
        if (year === null || year === undefined || Number.isNaN(Number(year))) return "--";
        if (year === 0) return "现代";
        if (year > 0) return `${year} 年`;

        const abs = Math.abs(year);
        if (abs >= 1000000000) {
            return `${(abs / 1000000000).toFixed(1)} 十亿年前`;
        }
        if (abs >= 1000000) {
            return `${(abs / 1000000).toFixed(1)} 百万年前`;
        }
        return `公元前 ${abs} 年`;
    }

    function itemSearchText(item) {
        const tags = Array.isArray(item.tags) ? item.tags.join(" ") : "";
        const text = [item.zh, item.en, item.summary, item.type, item.period, item.region, tags].join(" ");
        return `${normalize(text)} ${text}`;
    }

    function expandSemanticTokens(query, module) {
        const raw = query.trim();
        const normalized = normalize(raw);
        const tokens = new Set(normalized.split(/[\s,，;；/]+/).filter((x) => x.length >= 2));
        if (raw.length >= 2) tokens.add(raw);

        Object.entries(module.semantic || {}).forEach(([k, arr]) => {
            const keyNorm = normalize(k);
            if (normalized.includes(keyNorm) || raw.includes(k)) {
                (arr || []).forEach((value) => tokens.add(normalize(value)));
            }
        });

        return [...tokens];
    }

    function scoreItem(item, query, tokens) {
        const raw = query.trim();
        if (!raw) return 1;

        const qn = normalize(raw);
        let score = 0;

        if ((item.zh || "").includes(raw)) score += 8;
        if (normalize(item.en || "").includes(qn)) score += 7;
        if (normalize(item.type || "").includes(qn)) score += 5;
        if (normalize(item.summary || "").includes(qn)) score += 4;

        const blob = itemSearchText(item);
        tokens.forEach((token) => {
            if (token.length < 2) return;
            if (blob.includes(token)) score += token.length > 4 ? 3 : 2;
        });

        return score;
    }

    function updateHeader(module, shownCount) {
        const subtitle = document.getElementById("module-subtitle");
        const countChip = document.getElementById("item-count");

        subtitle.textContent = `${module.icon} ${module.titleZh} · ${module.titleEn} ｜ ${module.description}`;
        countChip.textContent = `当前 ${shownCount}/${module.items.length} 条`;
    }

    function fillFilterOptions(module) {
        const typeSelect = document.getElementById("type-filter");
        const regionSelect = document.getElementById("region-filter");

        const types = [...new Set(module.items.map((x) => x.type).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-CN"));
        const regions = [...new Set(module.items.map((x) => x.region).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-CN"));

        typeSelect.innerHTML = `<option value="all">全部分类</option>${types.map((x) => `<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join("")}`;
        regionSelect.innerHTML = `<option value="all">全部地区</option>${regions.map((x) => `<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join("")}`;

        typeSelect.value = "all";
        regionSelect.value = "all";
    }

    function renderModuleTabs() {
        const tabs = document.getElementById("module-tabs");

        tabs.innerHTML = data.modules.map((module) => {
            const active = module.id === state.moduleId ? "active" : "";
            return `<button class="module-tab ${active}" data-module-id="${escapeHtml(module.id)}" type="button">${module.icon} ${escapeHtml(module.titleZh)}</button>`;
        }).join("");
    }

    function renderSemanticHints(module) {
        const hints = document.getElementById("semantic-hints");
        const keys = Object.keys(module.semantic || {});
        hints.innerHTML = keys.length
            ? `语义示例：${keys.slice(0, 8).map((k) => `<span>${escapeHtml(k)}</span>`).join("")}`
            : "";
    }

    function setModule(moduleId) {
        if (!moduleMap.has(moduleId)) return;

        state.moduleId = moduleId;
        state.query = "";
        state.type = "all";
        state.region = "all";
        state.selectedMindId = "";

        document.getElementById("search-input").value = "";
        renderModuleTabs();
        fillFilterOptions(currentModule());
        renderSemanticHints(currentModule());

        applyFilters();
    }

    function applyFilters() {
        const module = currentModule();
        const query = state.query.trim();
        const tokens = expandSemanticTokens(query, module);

        const next = [];
        module.items.forEach((item) => {
            if (state.type !== "all" && item.type !== state.type) return;
            if (state.region !== "all" && item.region !== state.region) return;

            const score = scoreItem(item, query, tokens);
            if (query && score <= 0) return;
            next.push({ item, score });
        });

        next.sort((a, b) => b.score - a.score || (a.item.zh || "").localeCompare(b.item.zh || "", "zh-CN"));
        state.filtered = next.map((x) => x.item);

        updateHeader(module, state.filtered.length);
        renderCards();
        renderList();
        renderTimeline();

        if (state.view === "mind") renderMind();
        if (state.globe) updateGlobe();
    }

    function renderCards() {
        const root = document.getElementById("card-grid");
        if (!state.filtered.length) {
            root.innerHTML = `<div class="empty">没有匹配结果，请调整搜索条件。</div>`;
            return;
        }

        root.innerHTML = state.filtered.map((item) => {
            return `
            <article class="entry-card">
                <div class="media">
                    <img data-image-id="${escapeHtml(item.id)}" alt="${escapeHtml(item.en)}" loading="lazy">
                    <div class="fallback" data-fallback-id="${escapeHtml(item.id)}">📘</div>
                </div>
                <div class="body">
                    <div class="title-row">
                        <h3>${escapeHtml(item.zh)}</h3>
                        <p>${escapeHtml(item.en)}</p>
                    </div>
                    <div class="badges">
                        <span>${escapeHtml(item.type || "未分类")}</span>
                        <span>${escapeHtml(item.region || "--")}</span>
                        <span>${escapeHtml(formatYear(item.year))}</span>
                    </div>
                    <p class="summary">${escapeHtml(item.summary || "")}</p>
                    <div class="actions">
                        <button class="mini-btn" data-action="speak-zh" data-id="${escapeHtml(item.id)}" type="button">中文</button>
                        <button class="mini-btn" data-action="speak-en" data-id="${escapeHtml(item.id)}" type="button">English</button>
                        <button class="mini-btn" data-action="sound" data-id="${escapeHtml(item.id)}" type="button">音效</button>
                        <button class="mini-btn" data-action="locate" data-id="${escapeHtml(item.id)}" type="button">定位</button>
                    </div>
                </div>
            </article>`;
        }).join("");

        observeLazyImages();
    }

    function renderList() {
        const body = document.getElementById("list-body");
        if (!state.filtered.length) {
            body.innerHTML = `<tr><td colspan="5">没有匹配结果</td></tr>`;
            return;
        }

        body.innerHTML = state.filtered.map((item) => {
            return `
            <tr>
                <td>
                    <div class="list-entry">
                        <div class="list-media">
                            <img data-image-id="${escapeHtml(item.id)}" alt="${escapeHtml(item.en)}" loading="lazy">
                            <div class="fallback" data-fallback-id="${escapeHtml(item.id)}">📘</div>
                        </div>
                        <div>
                            <div class="name">${escapeHtml(item.zh)}</div>
                            <div class="sub">${escapeHtml(item.en)}</div>
                            <div class="sub">${escapeHtml(formatYear(item.year))}</div>
                        </div>
                    </div>
                </td>
                <td>${escapeHtml(item.type || "--")}</td>
                <td class="summary-cell">${escapeHtml(item.summary || "")}</td>
                <td>${escapeHtml(item.region || "--")}</td>
                <td>
                    <div class="row-actions">
                        <button class="mini-btn" data-action="speak-zh" data-id="${escapeHtml(item.id)}" type="button">中</button>
                        <button class="mini-btn" data-action="speak-en" data-id="${escapeHtml(item.id)}" type="button">EN</button>
                        <button class="mini-btn" data-action="sound" data-id="${escapeHtml(item.id)}" type="button">音</button>
                        <button class="mini-btn" data-action="locate" data-id="${escapeHtml(item.id)}" type="button">图</button>
                    </div>
                </td>
            </tr>`;
        }).join("");

        observeLazyImages();
    }

    function renderTimeline() {
        const root = document.getElementById("timeline");
        const withYear = state.filtered
            .filter((x) => x.year !== null && x.year !== undefined && Number.isFinite(Number(x.year)))
            .sort((a, b) => Number(a.year) - Number(b.year));

        if (!withYear.length) {
            root.innerHTML = `<div class="empty">当前筛选下暂无可展示的时间线数据。</div>`;
            return;
        }

        root.innerHTML = withYear.map((item) => {
            return `
            <div class="timeline-item">
                <div class="time">${escapeHtml(formatYear(item.year))}</div>
                <div class="dot"></div>
                <div class="content">
                    <h4>${escapeHtml(item.zh)} · ${escapeHtml(item.en)}</h4>
                    <p>${escapeHtml(item.summary || "")}</p>
                </div>
            </div>`;
        }).join("");
    }

    function buildMindEdges(module, shownIds) {
        const ids = new Set(shownIds);
        let edges = (module.relations || [])
            .filter((r) => ids.has(r[0]) && ids.has(r[1]))
            .map((r) => ({ from: r[0], to: r[1], label: r[2] || "关联" }));

        if (!edges.length) {
            const fallback = state.filtered.slice(0, 12);
            edges = fallback.slice(1).map((item, index) => ({
                from: fallback[index].id,
                to: item.id,
                label: "关联"
            }));
        }
        return edges;
    }

    function layoutMindNodes(items, width, height) {
        const grouped = new Map();
        items.forEach((item) => {
            const key = item.type || "其他";
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key).push(item);
        });

        const typeKeys = [...grouped.keys()];
        const centerX = width / 2;
        const centerY = height / 2;
        const typeRadius = Math.min(width, height) * 0.28;
        const nodePos = new Map();

        typeKeys.forEach((type, typeIndex) => {
            const typeAngle = (Math.PI * 2 * typeIndex) / Math.max(typeKeys.length, 1) - Math.PI / 2;
            const cx = centerX + Math.cos(typeAngle) * typeRadius;
            const cy = centerY + Math.sin(typeAngle) * typeRadius;
            const group = grouped.get(type) || [];
            const inner = 60;

            group.forEach((item, itemIndex) => {
                const a = (Math.PI * 2 * itemIndex) / Math.max(group.length, 1);
                const x = cx + Math.cos(a) * inner;
                const y = cy + Math.sin(a) * inner;
                nodePos.set(item.id, { x, y, item });
            });
        });

        return nodePos;
    }

    function renderMind() {
        const canvas = document.getElementById("mind-canvas");
        if (!state.filtered.length) {
            canvas.innerHTML = `<div class="empty">没有匹配结果。</div>`;
            return;
        }

        const shown = state.filtered.slice(0, 24);
        const width = Math.max(canvas.clientWidth || 700, 700);
        const height = Math.max(canvas.clientHeight || 560, 560);
        const nodePos = layoutMindNodes(shown, width, height);
        const edges = buildMindEdges(currentModule(), shown.map((x) => x.id));

        const lines = edges.map((edge) => {
            const from = nodePos.get(edge.from);
            const to = nodePos.get(edge.to);
            if (!from || !to) return "";
            return `<line x1="${Math.round(from.x)}" y1="${Math.round(from.y)}" x2="${Math.round(to.x)}" y2="${Math.round(to.y)}"></line>`;
        }).join("");

        const nodes = [...nodePos.values()].map(({ x, y, item }) => {
            const active = item.id === state.selectedMindId ? "active" : "";
            return `<button class="mind-node ${active}" data-mind-id="${escapeHtml(item.id)}" style="left:${Math.round(x)}px; top:${Math.round(y)}px;" type="button">${escapeHtml(item.zh)}</button>`;
        }).join("");

        canvas.innerHTML = `
            <div class="mind-stage" style="width:${Math.round(width)}px;height:${Math.round(height)}px;">
                <svg viewBox="0 0 ${Math.round(width)} ${Math.round(height)}" preserveAspectRatio="none">
                    ${lines}
                </svg>
                ${nodes}
            </div>
        `;

        if (!state.selectedMindId && shown[0]) state.selectedMindId = shown[0].id;
        updateMindSide(state.selectedMindId);
    }

    function updateMindSide(itemId) {
        const side = document.getElementById("mind-side");
        const item = currentModule().items.find((x) => x.id === itemId);
        if (!item) {
            side.innerHTML = `<h3>关系图说明</h3><p>点击节点查看详情。</p>`;
            return;
        }

        const relationText = (currentModule().relations || [])
            .filter((r) => r[0] === item.id || r[1] === item.id)
            .map((r) => r[2] || "关联")
            .join("、") || "暂无";

        side.innerHTML = `
            <h3>${escapeHtml(item.zh)} · ${escapeHtml(item.en)}</h3>
            <p>分类：${escapeHtml(item.type || "--")}</p>
            <p>时间：${escapeHtml(formatYear(item.year))}</p>
            <p>地区：${escapeHtml(item.region || "--")}</p>
            <p>${escapeHtml(item.summary || "")}</p>
            <p>关联关键词：${escapeHtml(relationText)}</p>
        `;
    }

    function initImageCache() {
        try {
            const raw = localStorage.getItem(imageCacheKey);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            Object.entries(parsed).forEach(([k, v]) => {
                if (typeof v === "string" && v.startsWith("http")) {
                    state.imageCache.set(k, v);
                }
            });
        } catch (_) {
            // ignore
        }
    }

    function persistImageCache() {
        const obj = {};
        state.imageCache.forEach((v, k) => {
            obj[k] = v;
        });

        try {
            localStorage.setItem(imageCacheKey, JSON.stringify(obj));
        } catch (_) {
            // ignore
        }
    }

    async function fetchThumb(item) {
        const key = item.wiki || item.en || item.zh;
        if (state.imageCache.has(key)) return state.imageCache.get(key);
        if (state.imageInflight.has(key)) return state.imageInflight.get(key);

        const task = fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(key)}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((json) => {
                const src = json && json.thumbnail && json.thumbnail.source
                    ? json.thumbnail.source
                    : json && json.originalimage && json.originalimage.source
                        ? json.originalimage.source
                        : "";
                if (src) {
                    state.imageCache.set(key, src);
                    persistImageCache();
                }
                return src;
            })
            .catch(() => "")
            .finally(() => {
                state.imageInflight.delete(key);
            });

        state.imageInflight.set(key, task);
        return task;
    }

    function setupImageObserver() {
        if (!("IntersectionObserver" in window)) return;

        state.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const img = entry.target;
                state.imageObserver.unobserve(img);
                loadImage(img);
            });
        }, { rootMargin: "120px" });
    }

    function observeLazyImages() {
        document.querySelectorAll("img[data-image-id]").forEach((img) => {
            if (img.dataset.loaded === "1") return;
            if (state.imageObserver) state.imageObserver.observe(img);
            else loadImage(img);
        });
    }

    async function loadImage(img) {
        if (!img || img.dataset.loaded === "1") return;
        img.dataset.loaded = "1";

        const item = currentModule().items.find((x) => x.id === img.dataset.imageId);
        if (!item) return;

        const src = await fetchThumb(item);
        if (!src) return;

        img.src = src;
        img.addEventListener("load", () => {
            document.querySelectorAll(`[data-fallback-id="${item.id}"]`).forEach((el) => {
                el.style.display = "none";
            });
        }, { once: true });
    }

    function loadVoices() {
        if (!("speechSynthesis" in window)) return;
        state.voices = window.speechSynthesis.getVoices();
    }

    function pickVoice(prefix) {
        const list = state.voices.filter((v) => (v.lang || "").toLowerCase().startsWith(prefix));
        if (!list.length) return null;
        const preferred = list.find((v) => /siri|ting|mei|li|xiaoxiao|samantha|daniel|karen/i.test(v.name));
        return preferred || list[0];
    }

    function speak(text, lang) {
        return new Promise((resolve) => {
            if (!("speechSynthesis" in window)) {
                showToast("当前浏览器不支持 TTS");
                resolve();
                return;
            }

            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = lang;
            utter.rate = lang.startsWith("en") ? 0.93 : 0.9;
            const voice = pickVoice(lang.startsWith("zh") ? "zh" : "en");
            if (voice) utter.voice = voice;
            utter.onend = resolve;
            utter.onerror = resolve;
            window.speechSynthesis.speak(utter);
        });
    }

    async function speakName(action, item) {
        if (action === "speak-zh") {
            showToast(`中文：${item.zh}`);
            await speak(item.zh, "zh-CN");
            return;
        }

        showToast(`English: ${item.en}`);
        await speak(item.en, "en-US");
    }

    function getAudioContext() {
        if (state.audioCtx) return state.audioCtx;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        state.audioCtx = new Ctx();
        return state.audioCtx;
    }

    function getNoiseBuffer(ctx) {
        if (state.noiseBuffer) return state.noiseBuffer;
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const dataArr = buffer.getChannelData(0);
        for (let i = 0; i < dataArr.length; i += 1) {
            dataArr[i] = Math.random() * 2 - 1;
        }
        state.noiseBuffer = buffer;
        return buffer;
    }

    function tone(ctx, { freq, endFreq, start, dur, type = "sine", gain = 0.1 }) {
        const osc = ctx.createOscillator();
        const amp = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), start + dur);

        amp.gain.setValueAtTime(0.0001, start);
        amp.gain.exponentialRampToValueAtTime(gain, start + dur * 0.2);
        amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        osc.connect(amp);
        amp.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur + 0.01);
    }

    function noise(ctx, { start, dur, gain = 0.07, band = 1200 }) {
        const src = ctx.createBufferSource();
        src.buffer = getNoiseBuffer(ctx);

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = band;
        filter.Q.value = 0.8;

        const amp = ctx.createGain();
        amp.gain.setValueAtTime(0.0001, start);
        amp.gain.exponentialRampToValueAtTime(gain, start + dur * 0.2);
        amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        src.connect(filter);
        filter.connect(amp);
        amp.connect(ctx.destination);

        src.start(start);
        src.stop(start + dur + 0.01);
    }

    async function playSound(item) {
        const ctx = getAudioContext();
        if (!ctx) {
            showToast("当前浏览器不支持音效");
            return;
        }
        if (ctx.state === "suspended") await ctx.resume();

        const now = ctx.currentTime + 0.02;
        const moduleId = state.moduleId;

        if (moduleId === "dinosaurs") {
            noise(ctx, { start: now, dur: 0.45, gain: 0.09, band: 400 });
            tone(ctx, { start: now, dur: 0.5, freq: 160, endFreq: 90, type: "sawtooth", gain: 0.1 });
        } else if (moduleId === "insects") {
            tone(ctx, { start: now, dur: 0.14, freq: 1450, endFreq: 1850, type: "triangle", gain: 0.06 });
            tone(ctx, { start: now + 0.12, dur: 0.14, freq: 1600, endFreq: 1300, type: "triangle", gain: 0.06 });
            noise(ctx, { start: now, dur: 0.3, gain: 0.025, band: 2400 });
        } else if (moduleId === "marine") {
            noise(ctx, { start: now, dur: 0.16, gain: 0.04, band: 1400 });
            tone(ctx, { start: now + 0.05, dur: 0.3, freq: 420, endFreq: 260, type: "sine", gain: 0.06 });
        } else if (moduleId === "space") {
            tone(ctx, { start: now, dur: 0.18, freq: 680, endFreq: 920, type: "square", gain: 0.05 });
            tone(ctx, { start: now + 0.22, dur: 0.22, freq: 840, endFreq: 420, type: "triangle", gain: 0.05 });
        } else if (moduleId === "vehicles") {
            // Engine + horn profile tuned for phone/TV speakers.
            noise(ctx, { start: now, dur: 0.42, gain: 0.1, band: 480 });
            tone(ctx, { start: now, dur: 0.4, freq: 140, endFreq: 210, type: "sawtooth", gain: 0.12 });
            tone(ctx, { start: now, dur: 0.34, freq: 280, endFreq: 360, type: "square", gain: 0.08 });
            tone(ctx, { start: now + 0.2, dur: 0.11, freq: 720, endFreq: 620, type: "triangle", gain: 0.09 });
            tone(ctx, { start: now + 0.34, dur: 0.1, freq: 690, endFreq: 590, type: "triangle", gain: 0.09 });
        } else if (moduleId === "construction") {
            noise(ctx, { start: now, dur: 0.46, gain: 0.11, band: 360 });
            tone(ctx, { start: now, dur: 0.44, freq: 110, endFreq: 150, type: "sawtooth", gain: 0.12 });
            tone(ctx, { start: now + 0.1, dur: 0.22, freq: 210, endFreq: 170, type: "square", gain: 0.08 });
            tone(ctx, { start: now + 0.32, dur: 0.12, freq: 460, endFreq: 390, type: "triangle", gain: 0.07 });
        } else if (moduleId === "humanbody") {
            tone(ctx, { start: now, dur: 0.1, freq: 90, endFreq: 80, type: "sine", gain: 0.09 });
            tone(ctx, { start: now + 0.2, dur: 0.12, freq: 110, endFreq: 95, type: "sine", gain: 0.09 });
        } else if (moduleId === "weather") {
            noise(ctx, { start: now, dur: 0.45, gain: 0.08, band: 700 });
            tone(ctx, { start: now + 0.08, dur: 0.35, freq: 320, endFreq: 120, type: "square", gain: 0.05 });
        } else if (moduleId === "plants") {
            tone(ctx, { start: now, dur: 0.16, freq: 720, endFreq: 980, type: "sine", gain: 0.05 });
            tone(ctx, { start: now + 0.18, dur: 0.16, freq: 980, endFreq: 760, type: "sine", gain: 0.05 });
        } else {
            tone(ctx, { start: now, dur: 0.14, freq: 640, endFreq: 820, type: "triangle", gain: 0.05 });
            tone(ctx, { start: now + 0.16, dur: 0.14, freq: 880, endFreq: 660, type: "triangle", gain: 0.05 });
        }

        showToast(`音效：${item.zh}`);
    }

    function createGlobePin(point) {
        const item = currentModule().items.find((x) => x.id === point.id);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "globe-pin";
        btn.title = `${item.zh} / ${item.en}`;

        const fallback = document.createElement("span");
        fallback.className = "pin-fallback";
        fallback.textContent = "📍";
        btn.appendChild(fallback);

        fetchThumb(item).then((src) => {
            if (!src || !btn.isConnected) return;
            const img = document.createElement("img");
            img.className = "pin-img";
            img.src = src;
            img.alt = item.en;
            btn.appendChild(img);
        });

        btn.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            focusOnGlobe(item.id, false);
        });

        return btn;
    }

    function ensureGlobe() {
        if (state.globe) return;

        const canvas = document.getElementById("globe-canvas");
        if (!window.Globe) {
            canvas.innerHTML = "<div class='empty'>地球仪脚本未加载成功。</div>";
            return;
        }

        state.globe = window.Globe()(canvas)
            .backgroundColor("rgba(0,0,0,0)")
            .globeImageUrl("../animals/assets/earth-blue-marble.jpg")
            .bumpImageUrl("../animals/assets/earth-topology.png")
            .showAtmosphere(true)
            .atmosphereColor("#8fd9ff")
            .atmosphereAltitude(0.15)
            .pointRadius((d) => d.radius)
            .pointAltitude((d) => d.altitude)
            .pointColor((d) => d.color)
            .pointLabel((d) => `<strong>${escapeHtml(d.zh)} / ${escapeHtml(d.en)}</strong><br>${escapeHtml(d.region || "--")}`)
            .htmlElementsData([])
            .htmlElement((d) => createGlobePin(d))
            .onPointClick((d) => {
                focusOnGlobe(d.id, false);
            });

        const controls = state.globe.controls();
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.rotateSpeed = 0.85;
        controls.zoomSpeed = 0.9;
        controls.minDistance = 140;
        controls.maxDistance = 430;
        controls.enablePan = false;

        setGlobeRotate(false);
        updateGlobe();
    }

    function updateGlobe() {
        if (!state.globe) return;

        const points = state.filtered
            .filter((x) => Number.isFinite(Number(x.lat)) && Number.isFinite(Number(x.lng)))
            .map((item) => ({
                id: item.id,
                zh: item.zh,
                en: item.en,
                region: item.region,
                lat: Number(item.lat),
                lng: Number(item.lng),
                radius: 0.15,
                altitude: 0.07,
                color: "#7ed0ff"
            }));

        state.globe.pointsData(points);
        state.globe.htmlElementsData(points);
    }

    async function updateGlobeDetail(item) {
        const detail = document.getElementById("globe-detail");
        detail.innerHTML = `<p>正在加载 ${escapeHtml(item.zh)}...</p>`;

        const src = await fetchThumb(item);
        const img = src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(item.en)}">` : "";
        detail.innerHTML = `
            ${img}
            <p><strong>${escapeHtml(item.zh)} · ${escapeHtml(item.en)}</strong></p>
            <p>${escapeHtml(item.type || "--")} · ${escapeHtml(item.region || "--")}</p>
            <p>${escapeHtml(item.summary || "")}</p>
        `;
    }

    function focusOnGlobe(itemId, switchView) {
        const item = currentModule().items.find((x) => x.id === itemId);
        if (!item) return;

        if (!Number.isFinite(Number(item.lat)) || !Number.isFinite(Number(item.lng))) {
            showToast("该条目暂无地理坐标");
            return;
        }

        if (switchView) setView("globe");
        ensureGlobe();
        if (!state.globe) return;

        state.globe.pointOfView({ lat: Number(item.lat), lng: Number(item.lng), altitude: 1.6 }, 850);
        updateGlobeDetail(item);
    }

    function setGlobeRotate(on) {
        state.globeAutoRotate = Boolean(on);
        if (state.globe) {
            const controls = state.globe.controls();
            controls.autoRotate = state.globeAutoRotate;
            controls.autoRotateSpeed = 0.45;
        }

        const btn = document.querySelector('[data-globe-action="toggle-rotate"]');
        if (btn) btn.textContent = state.globeAutoRotate ? "停止旋转" : "自动旋转";
    }

    function zoomGlobe(multiplier) {
        if (!state.globe) return;
        const pov = state.globe.pointOfView();
        const alt = Math.max(0.5, Math.min(4, pov.altitude * multiplier));
        state.globe.pointOfView({ lat: pov.lat, lng: pov.lng, altitude: alt }, 450);
    }

    function resetGlobeView() {
        if (!state.globe) return;
        state.globe.pointOfView({ lat: 10, lng: 20, altitude: 2.2 }, 700);
    }

    function setView(view) {
        state.view = view;
        document.querySelectorAll(".view-btn").forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.view === view);
        });
        document.querySelectorAll(".view").forEach((panel) => {
            panel.classList.remove("active");
        });

        const panel = document.getElementById(`${view}-view`);
        if (panel) panel.classList.add("active");

        if (view === "mind") renderMind();
        if (view === "globe") {
            ensureGlobe();
            updateGlobe();
        }
    }

    function bindEvents() {
        let timer = null;

        document.getElementById("search-input").addEventListener("input", (event) => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                state.query = event.target.value.trim();
                applyFilters();
            }, 120);
        });

        document.getElementById("type-filter").addEventListener("change", (event) => {
            state.type = event.target.value;
            applyFilters();
        });

        document.getElementById("region-filter").addEventListener("change", (event) => {
            state.region = event.target.value;
            applyFilters();
        });

        document.getElementById("reset-btn").addEventListener("click", () => {
            state.query = "";
            state.type = "all";
            state.region = "all";
            document.getElementById("search-input").value = "";
            document.getElementById("type-filter").value = "all";
            document.getElementById("region-filter").value = "all";
            applyFilters();
        });

        document.body.addEventListener("click", async (event) => {
            const moduleBtn = event.target.closest("[data-module-id]");
            if (moduleBtn) {
                setModule(moduleBtn.dataset.moduleId || "");
                return;
            }

            const viewBtn = event.target.closest("[data-view]");
            if (viewBtn) {
                setView(viewBtn.dataset.view || "cards");
                return;
            }

            const actionBtn = event.target.closest("[data-action]");
            if (actionBtn) {
                const item = currentModule().items.find((x) => x.id === actionBtn.dataset.id);
                if (!item) return;

                const action = actionBtn.dataset.action;
                if (action === "speak-zh" || action === "speak-en") {
                    await speakName(action, item);
                    return;
                }

                if (action === "sound") {
                    await playSound(item);
                    return;
                }

                if (action === "locate") {
                    focusOnGlobe(item.id, true);
                }
                return;
            }

            const nodeBtn = event.target.closest("[data-mind-id]");
            if (nodeBtn) {
                state.selectedMindId = nodeBtn.dataset.mindId || "";
                document.querySelectorAll(".mind-node").forEach((n) => n.classList.remove("active"));
                nodeBtn.classList.add("active");
                updateMindSide(state.selectedMindId);
                return;
            }

            const globeCtl = event.target.closest("[data-globe-action]");
            if (globeCtl) {
                if (globeCtl.dataset.globeAction === "zoom-in") zoomGlobe(0.8);
                if (globeCtl.dataset.globeAction === "zoom-out") zoomGlobe(1.25);
                if (globeCtl.dataset.globeAction === "toggle-rotate") setGlobeRotate(!state.globeAutoRotate);
                if (globeCtl.dataset.globeAction === "reset") resetGlobeView();
            }
        });

        window.addEventListener("resize", () => {
            if (state.view === "mind") renderMind();
        });
    }

    function init() {
        if (!data.modules.length) {
            document.getElementById("module-subtitle").textContent = "数据未加载";
            return;
        }

        initImageCache();
        setupImageObserver();
        renderModuleTabs();
        fillFilterOptions(currentModule());
        renderSemanticHints(currentModule());
        bindEvents();

        if ("speechSynthesis" in window) {
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        applyFilters();
        setView("cards");
        showToast("KidsPedia 已加载 12 个百科专题");
    }

    init();
})();
