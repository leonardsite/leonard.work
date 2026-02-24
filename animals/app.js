(function () {
    const GROUP_LABEL = {
        mammal: "哺乳类",
        bird: "鸟类",
        reptile: "爬行类",
        amphibian: "两栖类",
        fish: "鱼类",
        invertebrate: "无脊椎"
    };

    const DIET_LABEL = {
        carnivore: "肉食",
        herbivore: "草食",
        omnivore: "杂食",
        insectivore: "食虫",
        piscivore: "食鱼",
        planktivore: "浮游生物食",
        scavenger: "食腐"
    };

    const LEVEL_LABEL = {
        apex: "顶级捕食者",
        predator: "中级捕食者",
        omnivore: "杂食层",
        herbivore: "初级消费者",
        filter: "滤食者",
        scavenger: "清道夫",
        insectivore: "食虫捕食者"
    };

    const HABITAT_LABEL = {
        savanna: "稀树草原",
        grassland: "草地",
        forest: "森林",
        jungle: "热带雨林",
        mountain: "山地",
        desert: "沙漠",
        wetland: "湿地",
        river: "河流",
        ocean: "海洋",
        coast: "海岸",
        polar: "极地",
        urban: "城市",
        farmland: "农田",
        cave: "洞穴",
        island: "岛屿",
        freshwater: "淡水",
        cliff: "悬崖",
        garden: "花园",
        reef: "珊瑚礁"
    };

    const GROUP_ICON = {
        mammal: "🐾",
        bird: "🪶",
        reptile: "🦎",
        amphibian: "🐸",
        fish: "🐟",
        invertebrate: "🪼"
    };

    const GROUP_COLOR = {
        mammal: "#f4a261",
        bird: "#7ed0ff",
        reptile: "#9ccc65",
        amphibian: "#2ec4b6",
        fish: "#4e83ff",
        invertebrate: "#c084fc"
    };

    const LEVEL_COLOR = {
        apex: "#ff6f61",
        predator: "#f6ad55",
        omnivore: "#63b3ed",
        herbivore: "#2ac7b8",
        filter: "#95d5b2",
        scavenger: "#d6a2e8",
        insectivore: "#ffd166"
    };

    const LEVEL_ORDER = {
        apex: 1,
        predator: 2,
        scavenger: 2,
        omnivore: 3,
        insectivore: 3,
        herbivore: 4,
        filter: 4
    };

    const FOOD_ROWS = [
        { key: "row-1", label: "顶层：顶级捕食者", levels: ["apex"] },
        { key: "row-2", label: "中层：捕食者 / 清道夫", levels: ["predator", "scavenger"] },
        { key: "row-3", label: "中层：杂食 / 食虫", levels: ["omnivore", "insectivore"] },
        { key: "row-4", label: "底层：草食 / 滤食", levels: ["herbivore", "filter"] }
    ];

    const SEMANTIC_HINTS = {
        "大猫": ["lion", "tiger", "leopard", "jaguar", "cheetah", "snow leopard", "猫科", "feline"],
        feline: ["lion", "tiger", "leopard", "jaguar", "cheetah", "snow leopard"],
        "海洋": ["ocean", "coast", "reef", "whale", "shark", "dolphin", "seal", "walrus", "octopus", "jellyfish"],
        ocean: ["ocean", "coast", "reef", "fish", "shark"],
        "极地": ["polar", "penguin", "polar bear", "walrus", "orca", "seal", "冰雪"],
        polar: ["polar", "penguin", "walrus", "seal", "orca"],
        "会飞": ["bird", "bat", "eagle", "falcon", "owl", "hummingbird", "albatross", "puffin"],
        flying: ["bird", "bat", "falcon", "eagle"],
        "雨林": ["jungle", "forest", "orangutan", "gorilla", "toucan", "macaw", "tree frog"],
        jungle: ["jungle", "forest", "orangutan", "gorilla", "macaw"],
        "草原": ["savanna", "grassland", "lion", "zebra", "giraffe", "wildebeest", "ostrich"],
        "宠物": ["cat", "dog", "rabbit", "horse", "pig"],
        pet: ["cat", "dog", "rabbit", "horse", "pig"],
        "食肉": ["carnivore", "predator", "apex", "捕食者"],
        "食草": ["herbivore", "草食"],
        "猛禽": ["eagle", "falcon", "owl", "vulture"],
        raptor: ["eagle", "falcon", "owl", "vulture"],
        "两栖": ["amphibian", "frog", "toad", "salamander", "axolotl"],
        "爬行": ["reptile", "snake", "lizard", "crocodile", "turtle"],
        "鱼类": ["fish", "salmon", "tuna", "shark", "seahorse"],
        fish: ["fish", "salmon", "tuna", "shark", "seahorse"]
    };

    const IMAGE_CACHE_KEY = "animalImageCache.v1";

    const state = {
        animals: [],
        animalMap: new Map(),
        filtered: [],
        foodEdges: [],
        allFoodEdges: [],
        foodFocusId: null,
        detailAnimalId: null,
        lastNonDetailView: "cards",
        query: "",
        filters: {
            group: "all",
            diet: "all",
            level: "all",
            habitat: "all",
            region: "all"
        },
        activeView: "cards",
        voices: [],
        toastTimer: null,
        imageCache: new Map(),
        imageInflight: new Map(),
        imageObserver: null,
        globe: null,
        globeAutoRotate: false,
        globePov: { lat: 20, lng: 10, altitude: 2.0 },
        globeResizeObserver: null,
        audioCtx: null,
        noiseBuffer: null,
        speechAudio: null,
        isRoutingByHash: false
    };

    const ROUTABLE_VIEWS = new Set(["cards", "list", "food", "globe"]);
    const ALL_VIEWS = new Set([...ROUTABLE_VIEWS, "detail"]);

    function parseCatalog(raw) {
        const lines = raw.trim().split("\n");
        const header = lines[0].split("|");

        return lines.slice(1).map((line) => {
            const cols = line.split("|");
            const row = {};

            header.forEach((key, index) => {
                row[key] = (cols[index] || "").trim();
            });

            const habitats = row.habitats ? row.habitats.split(",").map((x) => x.trim()).filter(Boolean) : [];
            const tags = row.tags ? row.tags.split(",").map((x) => x.trim()).filter(Boolean) : [];

            const animal = {
                id: row.id,
                zh: row.zh,
                en: row.en,
                wiki: row.wiki,
                group: row.group,
                diet: row.diet,
                level: row.level,
                habitats,
                region: row.region,
                lat: Number.parseFloat(row.lat),
                lng: Number.parseFloat(row.lng),
                callZh: row.callZh,
                callEn: row.callEn,
                tags,
                size: Number.parseInt(row.size, 10) || 1
            };

            animal.searchBlob = buildSearchBlob(animal);
            return animal;
        });
    }

    function normalizeText(value) {
        return (value || "")
            .toString()
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function buildSearchBlob(animal) {
        const habitatsZh = animal.habitats.map((h) => HABITAT_LABEL[h] || h);
        const chunks = [
            animal.zh,
            animal.en,
            animal.wiki,
            animal.region,
            GROUP_LABEL[animal.group],
            DIET_LABEL[animal.diet],
            LEVEL_LABEL[animal.level],
            ...animal.habitats,
            ...habitatsZh,
            ...animal.tags
        ].filter(Boolean);

        const merged = chunks.join(" ");
        return `${normalizeText(merged)} ${merged}`;
    }

    function escapeHtml(value) {
        return (value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function uniqueSorted(values, mapLabel) {
        return [...new Set(values)].sort((a, b) => mapLabel(a).localeCompare(mapLabel(b), "zh-CN"));
    }

    function optionHtml(value, label) {
        return `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
    }

    function buildSelectOptions() {
        const groups = uniqueSorted(state.animals.map((x) => x.group), (x) => GROUP_LABEL[x] || x);
        const diets = uniqueSorted(state.animals.map((x) => x.diet), (x) => DIET_LABEL[x] || x);
        const levels = uniqueSorted(state.animals.map((x) => x.level), (x) => LEVEL_LABEL[x] || x);
        const habitats = uniqueSorted(state.animals.flatMap((x) => x.habitats), (x) => HABITAT_LABEL[x] || x);
        const regions = uniqueSorted(state.animals.map((x) => x.region), (x) => x);

        document.getElementById("group-filter").innerHTML = optionHtml("all", "全部种类") + groups.map((x) => optionHtml(x, GROUP_LABEL[x] || x)).join("");
        document.getElementById("diet-filter").innerHTML = optionHtml("all", "全部食性") + diets.map((x) => optionHtml(x, DIET_LABEL[x] || x)).join("");
        document.getElementById("level-filter").innerHTML = optionHtml("all", "全部食物链分类") + levels.map((x) => optionHtml(x, LEVEL_LABEL[x] || x)).join("");
        document.getElementById("habitat-filter").innerHTML = optionHtml("all", "全部栖息地") + habitats.map((x) => optionHtml(x, HABITAT_LABEL[x] || x)).join("");
        document.getElementById("region-filter").innerHTML = optionHtml("all", "全部区域") + regions.map((x) => optionHtml(x, x)).join("");
    }

    function expandSemanticTokens(query) {
        const queryRaw = query.trim();
        const queryNormalized = normalizeText(queryRaw);
        const tokenSet = new Set(queryNormalized.split(/[\s,，;；/]+/).filter((x) => x.length >= 2));

        if (queryRaw.length >= 2) tokenSet.add(queryRaw);

        Object.entries(SEMANTIC_HINTS).forEach(([key, values]) => {
            const normalizedKey = normalizeText(key);
            if (queryNormalized.includes(normalizedKey) || queryRaw.includes(key)) {
                values.forEach((value) => tokenSet.add(normalizeText(value)));
            }
        });

        return [...tokenSet];
    }

    function scoreByQuery(animal, query, tokens) {
        const raw = query.trim();
        if (!raw) return 1;

        const qn = normalizeText(raw);
        let score = 0;

        if (animal.zh.includes(raw)) score += 8;
        if (normalizeText(animal.en).includes(qn)) score += 7;
        if (normalizeText(animal.wiki).includes(qn)) score += 5;

        tokens.forEach((token) => {
            if (token.length < 2) return;
            if (animal.searchBlob.includes(token)) {
                score += token.length > 4 ? 3 : 2;
            }
        });

        return score;
    }

    function formatHabitats(animal) {
        return animal.habitats.map((x) => HABITAT_LABEL[x] || x).join(" / ");
    }

    function updateCountChip() {
        const total = state.animals.length;
        const shown = state.filtered.length;
        document.getElementById("count-chip").textContent = `共 ${total} 种，当前 ${shown} 种`;
    }

    function filterAnimals() {
        const q = state.query.trim();
        const tokens = expandSemanticTokens(q);

        const next = [];
        state.animals.forEach((animal) => {
            if (state.filters.group !== "all" && animal.group !== state.filters.group) return;
            if (state.filters.diet !== "all" && animal.diet !== state.filters.diet) return;
            if (state.filters.level !== "all" && animal.level !== state.filters.level) return;
            if (state.filters.habitat !== "all" && !animal.habitats.includes(state.filters.habitat)) return;
            if (state.filters.region !== "all" && animal.region !== state.filters.region) return;

            const score = scoreByQuery(animal, q, tokens);
            if (q && score <= 0) return;

            next.push({ animal, score });
        });

        next.sort((a, b) => b.score - a.score || a.animal.zh.localeCompare(b.animal.zh, "zh-CN"));
        state.filtered = next.map((x) => x.animal);
        if (!state.filtered.some((x) => x.id === state.foodFocusId)) {
            state.foodFocusId = state.filtered.length ? state.filtered[0].id : null;
        }

        updateCountChip();
        renderCards();
        renderList();

        if (state.activeView === "food") renderFoodWeb();
        if (state.globe) updateGlobePoints();
    }

    function renderCards() {
        const grid = document.getElementById("card-grid");

        if (state.filtered.length === 0) {
            grid.innerHTML = `<div class="animal-card"><div class="card-body"><h3>没有匹配结果</h3><p class="meta">请尝试更换关键词或筛选条件。</p></div></div>`;
            return;
        }

        grid.innerHTML = state.filtered.map((animal) => {
            const levelClass = `level-${animal.level}`;
            const emoji = GROUP_ICON[animal.group] || "🐾";

            return `
            <article class="animal-card" data-id="${escapeHtml(animal.id)}" data-open-animal="${escapeHtml(animal.id)}">
                <div class="card-media">
                    <img data-image-id="${escapeHtml(animal.id)}" alt="${escapeHtml(animal.en)} photo" loading="lazy">
                    <div class="img-fallback" data-fallback-id="${escapeHtml(animal.id)}">${emoji}</div>
                </div>
                <div class="card-body">
                    <div class="card-title">
                        <h3>${escapeHtml(animal.zh)}</h3>
                        <p>${escapeHtml(animal.en)}</p>
                    </div>
                    <div class="badges">
                        <span class="badge">${escapeHtml(GROUP_LABEL[animal.group] || animal.group)}</span>
                        <span class="badge">${escapeHtml(DIET_LABEL[animal.diet] || animal.diet)}</span>
                        <span class="badge ${levelClass}">${escapeHtml(LEVEL_LABEL[animal.level] || animal.level)}</span>
                    </div>
                    <p class="meta">${escapeHtml(animal.region)} · ${escapeHtml(formatHabitats(animal))}</p>
                    <p class="meta">点击卡片可进入详情页（双向链接）</p>
                    <div class="card-actions">
                        <button class="action-btn" data-action="speak-zh" data-id="${escapeHtml(animal.id)}">中文</button>
                        <button class="action-btn" data-action="speak-en" data-id="${escapeHtml(animal.id)}">English</button>
                        <button class="action-btn" data-action="speak-call" data-id="${escapeHtml(animal.id)}">叫声</button>
                        <button class="action-btn" data-action="locate" data-id="${escapeHtml(animal.id)}">地球定位</button>
                    </div>
                </div>
            </article>`;
        }).join("");

        observeLazyImages();
    }

    function renderList() {
        const body = document.getElementById("list-body");

        if (state.filtered.length === 0) {
            body.innerHTML = `<tr><td colspan="6">没有匹配结果</td></tr>`;
            return;
        }

        body.innerHTML = state.filtered.map((animal) => {
            const emoji = GROUP_ICON[animal.group] || "🐾";
            return `
            <tr data-id="${escapeHtml(animal.id)}" data-open-animal="${escapeHtml(animal.id)}" class="list-row-clickable">
                <td>
                    <div class="list-animal">
                        <div class="list-thumb-wrap">
                            <img class="list-thumb" data-image-id="${escapeHtml(animal.id)}" alt="${escapeHtml(animal.en)}" loading="lazy">
                            <span class="list-thumb-fallback" data-fallback-id="${escapeHtml(animal.id)}">${emoji}</span>
                        </div>
                        <div>
                            <div class="table-name">${escapeHtml(animal.zh)}</div>
                            <div class="table-sub">${escapeHtml(animal.en)}</div>
                        </div>
                    </div>
                </td>
                <td>${escapeHtml(GROUP_LABEL[animal.group] || animal.group)}</td>
                <td>${escapeHtml(DIET_LABEL[animal.diet] || animal.diet)}</td>
                <td>${escapeHtml(LEVEL_LABEL[animal.level] || animal.level)}</td>
                <td>${escapeHtml(formatHabitats(animal))}</td>
                <td>
                    <div class="row-actions">
                        <button class="action-btn" data-action="speak-zh" data-id="${escapeHtml(animal.id)}">中</button>
                        <button class="action-btn" data-action="speak-en" data-id="${escapeHtml(animal.id)}">EN</button>
                        <button class="action-btn" data-action="speak-call" data-id="${escapeHtml(animal.id)}">叫</button>
                        <button class="action-btn" data-action="locate" data-id="${escapeHtml(animal.id)}">地球</button>
                    </div>
                </td>
            </tr>`;
        }).join("");

        observeLazyImages();
    }

    function initImageCache() {
        try {
            const raw = localStorage.getItem(IMAGE_CACHE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            Object.entries(parsed).forEach(([k, v]) => {
                if (typeof v === "string" && v.startsWith("http")) {
                    state.imageCache.set(k, v);
                }
            });
        } catch (_) {
            // Ignore corrupted local cache.
        }
    }

    function persistImageCache() {
        const obj = {};
        state.imageCache.forEach((value, key) => {
            obj[key] = value;
        });

        try {
            localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(obj));
        } catch (_) {
            // Ignore storage quota/private mode errors.
        }
    }

    async function fetchWikiThumb(animal) {
        const key = animal.wiki;
        if (state.imageCache.has(key)) return state.imageCache.get(key);
        if (state.imageInflight.has(key)) return state.imageInflight.get(key);

        const task = fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(key)}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                const src = data && data.thumbnail && data.thumbnail.source
                    ? data.thumbnail.source
                    : data && data.originalimage && data.originalimage.source
                        ? data.originalimage.source
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
                loadImageForElement(img);
            });
        }, { rootMargin: "120px" });
    }

    function observeLazyImages() {
        const images = document.querySelectorAll("img[data-image-id]");

        images.forEach((img) => {
            if (img.dataset.loaded === "1") return;
            if (!state.imageObserver) {
                loadImageForElement(img);
                return;
            }
            state.imageObserver.observe(img);
        });
    }

    async function loadImageForElement(imgEl) {
        if (!imgEl || imgEl.dataset.loaded === "1") return;
        imgEl.dataset.loaded = "1";

        const animal = state.animalMap.get(imgEl.dataset.imageId);
        if (!animal) return;

        const src = await fetchWikiThumb(animal);
        if (!src) return;

        imgEl.src = src;
        imgEl.addEventListener("load", () => {
            const id = animal.id;
            document.querySelectorAll(`[data-fallback-id="${id}"]`).forEach((node) => {
                node.style.display = "none";
            });
        }, { once: true });
    }

    function showToast(message) {
        const toast = document.getElementById("toast");
        toast.textContent = message;
        toast.classList.add("show");

        if (state.toastTimer) clearTimeout(state.toastTimer);
        state.toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 1600);
    }

    function isIOSDevice() {
        const ua = navigator.userAgent || "";
        const touchMac = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
        return /iPad|iPhone|iPod/i.test(ua) || touchMac;
    }

    function ensureSpeechAudio() {
        if (state.speechAudio) return state.speechAudio;
        const audio = new Audio();
        audio.preload = "none";
        audio.playsInline = true;
        audio.setAttribute("playsinline", "");
        state.speechAudio = audio;
        return audio;
    }

    function stopSpeechAudio() {
        if (!state.speechAudio) return;
        state.speechAudio.pause();
        state.speechAudio.removeAttribute("src");
        state.speechAudio.load();
    }

    function buildSpeechStreamUrls(text, lang) {
        const q = encodeURIComponent((text || "").trim().slice(0, 120));
        if (!q) return [];
        const isEnglish = (lang || "").toLowerCase().startsWith("en");
        const targetLang = isEnglish ? "en-US" : "zh-CN";
        const youdaoType = isEnglish ? "2" : "1";
        return [
            `https://dict.youdao.com/dictvoice?audio=${q}&type=${youdaoType}`,
            `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(targetLang)}&q=${q}`
        ];
    }

    function tryPlaySpeechStream(audio, src) {
        return new Promise((resolve) => {
            let done = false;

            const finish = (ok) => {
                if (done) return;
                done = true;
                clearTimeout(timer);
                audio.removeEventListener("playing", onPlaying);
                audio.removeEventListener("error", onError);
                audio.removeEventListener("stalled", onError);
                audio.removeEventListener("abort", onError);
                resolve(ok);
            };

            const onPlaying = () => finish(true);
            const onError = () => finish(false);
            const timer = setTimeout(() => finish(false), 7000);

            audio.addEventListener("playing", onPlaying);
            audio.addEventListener("error", onError);
            audio.addEventListener("stalled", onError);
            audio.addEventListener("abort", onError);

            audio.src = src;
            audio.load();
            audio.play().catch(() => finish(false));
        });
    }

    async function speakByStream(text, lang) {
        const urls = buildSpeechStreamUrls(text, lang);
        if (!urls.length) return false;

        const audio = ensureSpeechAudio();
        for (const src of urls) {
            const ok = await tryPlaySpeechStream(audio, src);
            if (ok) return true;
        }
        return false;
    }

    function loadVoices() {
        if (!("speechSynthesis" in window)) return;
        state.voices = window.speechSynthesis.getVoices();
    }

    function pickVoice(langPrefix) {
        const prefix = langPrefix.toLowerCase();
        const candidates = state.voices.filter((v) => (v.lang || "").toLowerCase().startsWith(prefix));
        if (!candidates.length) return null;

        const preferred = candidates.find((v) => /siri|ting|mei|li|sin|xiaoxiao|yunjian|karen|samantha|daniel/i.test(v.name));
        return preferred || candidates[0];
    }

    function speakOne(text, lang) {
        return new Promise((resolve) => {
            if (!("speechSynthesis" in window)) {
                resolve(false);
                return;
            }

            let finished = false;
            let started = false;

            const finish = (ok) => {
                if (finished) return;
                finished = true;
                clearTimeout(startTimer);
                clearTimeout(hardTimer);
                resolve(ok);
            };

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = lang.startsWith("en") ? 0.92 : 0.9;
            utterance.pitch = 1;
            const voice = pickVoice(lang.startsWith("zh") ? "zh" : "en");
            if (voice) utterance.voice = voice;

            utterance.onstart = () => {
                started = true;
            };
            utterance.onend = () => finish(true);
            utterance.onerror = () => finish(false);

            const startTimer = setTimeout(() => {
                if (!started) finish(false);
            }, 1200);
            const hardTimer = setTimeout(() => finish(started), 9000);

            window.speechSynthesis.speak(utterance);
        });
    }

    async function speakWithFallback(text, lang) {
        const preferStream = isIOSDevice();
        if (preferStream) {
            const streamOk = await speakByStream(text, lang);
            if (streamOk) return true;
        }

        const ttsOk = await speakOne(text, lang);
        if (ttsOk) return true;

        if (!preferStream) {
            const streamOk = await speakByStream(text, lang);
            if (streamOk) return true;
        }

        return false;
    }

    async function speakAnimalName(action, animal) {
        if ("speechSynthesis" in window) window.speechSynthesis.cancel();
        stopSpeechAudio();

        if (action === "speak-zh") {
            showToast(`中文发音：${animal.zh}`);
            const ok = await speakWithFallback(animal.zh, "zh-CN");
            if (!ok) showToast("读音播放失败，请检查网络或系统语音设置");
            return;
        }

        showToast(`English：${animal.en}`);
        const ok = await speakWithFallback(animal.en, "en-US");
        if (!ok) showToast("读音播放失败，请检查网络或系统语音设置");
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
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i += 1) {
            data[i] = Math.random() * 2 - 1;
        }
        state.noiseBuffer = buffer;
        return buffer;
    }

    function scheduleTone(ctx, { freq, start, dur, type = "sine", gain = 0.12, endFreq = null }) {
        const osc = ctx.createOscillator();
        const amp = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        if (endFreq && endFreq !== freq) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 20), start + dur);
        }

        amp.gain.setValueAtTime(0.0001, start);
        amp.gain.exponentialRampToValueAtTime(gain, start + dur * 0.15);
        amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        osc.connect(amp);
        amp.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur + 0.01);
    }

    function scheduleNoise(ctx, { start, dur, gain = 0.08, band = 800 }) {
        const src = ctx.createBufferSource();
        src.buffer = getNoiseBuffer(ctx);

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = band;
        filter.Q.value = 0.7;

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

    function normalizeCallText(text) {
        return (text || "")
            .replace(/[~～_]+/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 24);
    }

    function hashValue(text) {
        let hash = 2166136261;
        for (let i = 0; i < text.length; i += 1) {
            hash ^= text.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
    }

    function seeded(seed, min, max, offset = 0) {
        const x = Math.sin((seed + offset) * 12.9898) * 43758.5453;
        const frac = x - Math.floor(x);
        return min + frac * (max - min);
    }

    async function playAnimalCallByText(animal) {
        const zhCall = normalizeCallText(animal.callZh);
        const enCall = normalizeCallText((animal.callEn || "").replaceAll("-", " "));

        if (zhCall) {
            const ok = await speakByStream(`${zhCall} ${zhCall}`, "zh-CN");
            if (ok) return true;
        }

        if (enCall) {
            const ok = await speakByStream(`${enCall} ${enCall}`, "en-US");
            if (ok) return true;
        }

        return false;
    }

    async function playAnimalCallSynth(animal) {
        const ctx = getAudioContext();
        if (!ctx) return false;

        if (ctx.state === "suspended") {
            await ctx.resume();
        }

        const seed = hashValue(animal.id || animal.en || animal.zh || "animal");
        const now = ctx.currentTime + 0.02;

        if (animal.group === "bird") {
            const chirps = Math.round(seeded(seed, 2, 4, 1));
            for (let i = 0; i < chirps; i += 1) {
                const start = now + i * seeded(seed, 0.11, 0.17, 2 + i);
                scheduleTone(ctx, {
                    freq: seeded(seed, 1200, 1900, 3 + i),
                    endFreq: seeded(seed, 1000, 2200, 7 + i),
                    start,
                    dur: seeded(seed, 0.08, 0.14, 11 + i),
                    type: "triangle",
                    gain: seeded(seed, 0.05, 0.1, 15 + i)
                });
            }
        } else if (animal.group === "mammal") {
            scheduleNoise(ctx, { start: now, dur: seeded(seed, 0.28, 0.46, 20), gain: seeded(seed, 0.06, 0.1, 21), band: seeded(seed, 320, 700, 22) });
            scheduleTone(ctx, {
                freq: seeded(seed, 110, 240, 23),
                endFreq: seeded(seed, 70, 160, 24),
                start: now,
                dur: seeded(seed, 0.32, 0.48, 25),
                type: "sawtooth",
                gain: seeded(seed, 0.07, 0.12, 26)
            });
            scheduleTone(ctx, {
                freq: seeded(seed, 150, 320, 27),
                endFreq: seeded(seed, 90, 210, 28),
                start: now + seeded(seed, 0.12, 0.22, 29),
                dur: seeded(seed, 0.24, 0.4, 30),
                type: "sawtooth",
                gain: seeded(seed, 0.05, 0.1, 31)
            });
        } else if (animal.group === "reptile") {
            scheduleNoise(ctx, { start: now, dur: seeded(seed, 0.32, 0.55, 32), gain: seeded(seed, 0.05, 0.09, 33), band: seeded(seed, 1600, 2800, 34) });
            scheduleTone(ctx, {
                freq: seeded(seed, 260, 460, 35),
                endFreq: seeded(seed, 180, 360, 36),
                start: now,
                dur: seeded(seed, 0.3, 0.48, 37),
                type: "square",
                gain: seeded(seed, 0.03, 0.07, 38)
            });
        } else if (animal.group === "amphibian") {
            const calls = Math.round(seeded(seed, 2, 4, 40));
            for (let i = 0; i < calls; i += 1) {
                scheduleTone(ctx, {
                    freq: seeded(seed, 190, 320, 41 + i),
                    endFreq: seeded(seed, 150, 280, 45 + i),
                    start: now + i * seeded(seed, 0.2, 0.3, 49 + i),
                    dur: seeded(seed, 0.14, 0.28, 53 + i),
                    type: "sine",
                    gain: seeded(seed, 0.06, 0.1, 57 + i)
                });
            }
        } else if (animal.group === "fish") {
            scheduleNoise(ctx, { start: now, dur: seeded(seed, 0.1, 0.18, 60), gain: seeded(seed, 0.035, 0.06, 61), band: seeded(seed, 1000, 1800, 62) });
            scheduleNoise(ctx, { start: now + seeded(seed, 0.08, 0.14, 63), dur: seeded(seed, 0.08, 0.14, 64), gain: seeded(seed, 0.03, 0.055, 65), band: seeded(seed, 900, 1500, 66) });
            scheduleTone(ctx, {
                freq: seeded(seed, 380, 620, 67),
                endFreq: seeded(seed, 260, 480, 68),
                start: now + seeded(seed, 0.01, 0.05, 69),
                dur: seeded(seed, 0.18, 0.28, 70),
                type: "sine",
                gain: seeded(seed, 0.03, 0.05, 71)
            });
        } else {
            scheduleTone(ctx, {
                freq: seeded(seed, 620, 980, 72),
                endFreq: seeded(seed, 420, 760, 73),
                start: now,
                dur: seeded(seed, 0.16, 0.24, 74),
                type: "triangle",
                gain: seeded(seed, 0.05, 0.08, 75)
            });
            scheduleNoise(ctx, { start: now + seeded(seed, 0.06, 0.14, 76), dur: seeded(seed, 0.18, 0.34, 77), gain: seeded(seed, 0.04, 0.065, 78), band: seeded(seed, 1100, 1700, 79) });
        }

        return true;
    }

    async function playAnimalCall(animal) {
        stopSpeechAudio();
        if ("speechSynthesis" in window) window.speechSynthesis.cancel();

        const streamed = await playAnimalCallByText(animal);
        if (!streamed) {
            const synthesized = await playAnimalCallSynth(animal);
            if (!synthesized) {
                showToast("当前浏览器不支持叫声播放");
                return;
            }
        }

        showToast(`叫声播放：${animal.callZh} (${animal.callEn})`);
    }

    function overlapCount(arrA, arrB) {
        let n = 0;
        arrA.forEach((value) => {
            if (arrB.includes(value)) n += 1;
        });
        return n;
    }

    function buildFoodEdges(animals) {
        const edges = [];
        const predatorDiets = new Set(["carnivore", "omnivore", "piscivore", "insectivore", "scavenger"]);

        animals.forEach((predator) => {
            if (!predatorDiets.has(predator.diet)) return;

            const candidates = animals
                .filter((prey) => prey.id !== predator.id)
                .map((prey) => {
                    const overlap = overlapCount(predator.habitats, prey.habitats);
                    if (overlap === 0) return null;
                    if (prey.size >= predator.size) return null;

                    let score = overlap * 2 + (predator.size - prey.size);

                    if (prey.diet === "herbivore") score += 2;
                    if (predator.level === "apex") score += 1;

                    if (predator.diet === "piscivore") {
                        if (prey.group === "fish" || prey.habitats.includes("ocean") || prey.habitats.includes("river") || prey.habitats.includes("freshwater")) score += 3;
                        else score -= 2;
                    }

                    if (predator.diet === "insectivore") {
                        if (prey.group === "invertebrate" || prey.size <= 1) score += 3;
                        else score -= 1;
                    }

                    if (predator.group === "bird" && prey.size <= 2) score += 1;

                    return score > 0 ? { preyId: prey.id, score } : null;
                })
                .filter(Boolean)
                .sort((a, b) => b.score - a.score);

            const maxTargets = predator.level === "apex" ? 4 : predator.diet === "omnivore" ? 2 : 3;
            candidates.slice(0, maxTargets).forEach((x) => {
                edges.push({ from: predator.id, to: x.preyId });
            });
        });

        const dedup = new Map();
        edges.forEach((edge) => {
            dedup.set(`${edge.from}->${edge.to}`, edge);
        });

        return [...dedup.values()];
    }

    function renderFoodLegend() {
        const legend = document.getElementById("food-legend");

        legend.innerHTML = Object.keys(LEVEL_LABEL).map((level) => {
            const color = LEVEL_COLOR[level] || "#999";
            return `<div class="legend-item"><span class="legend-dot" style="background:${color}"></span><span>${escapeHtml(LEVEL_LABEL[level])}</span></div>`;
        }).join("");
    }

    function foodAnimalCardHtml(animal, relationLabel) {
        const emoji = GROUP_ICON[animal.group] || "🐾";
        return `
            <article class="food-animal-card" data-open-animal="${escapeHtml(animal.id)}">
                <div class="food-animal-media">
                    <img data-image-id="${escapeHtml(animal.id)}" alt="${escapeHtml(animal.en)} photo" loading="lazy">
                    <div class="food-animal-fallback" data-fallback-id="${escapeHtml(animal.id)}">${emoji}</div>
                </div>
                <div class="food-animal-body">
                    <strong>${escapeHtml(animal.zh)}</strong>
                    <p>${escapeHtml(animal.en)}</p>
                    <span class="food-animal-chip">${escapeHtml(relationLabel)}</span>
                    <button class="food-mini-btn" type="button" data-food-id="${escapeHtml(animal.id)}">看关系图</button>
                </div>
            </article>
        `;
    }

    function describeAnimalInFood(animal, predatorsArg, preyArg) {
        const predators = Array.isArray(predatorsArg)
            ? predatorsArg
            : state.foodEdges.filter((e) => e.to === animal.id).map((e) => state.animalMap.get(e.from)).filter(Boolean);
        const prey = Array.isArray(preyArg)
            ? preyArg
            : state.foodEdges.filter((e) => e.from === animal.id).map((e) => state.animalMap.get(e.to)).filter(Boolean);

        const preyText = prey.length ? prey.slice(0, 8).map((x) => x.zh).join("、") : "暂无明显捕食对象";
        const predatorText = predators.length ? predators.slice(0, 8).map((x) => x.zh).join("、") : "几乎没有天敌或当前筛选中未显示";

        const side = document.getElementById("food-side");
        const pressure = predators.length ? Math.min(100, predators.length * 22) : 5;
        const hunting = prey.length ? Math.min(100, prey.length * 20) : 8;
        const habitat = Math.min(100, animal.habitats.length * 24);

        side.innerHTML = `
            <h3>${escapeHtml(animal.zh)} · ${escapeHtml(animal.en)}</h3>
            <p>${escapeHtml(GROUP_LABEL[animal.group])} / ${escapeHtml(DIET_LABEL[animal.diet])} / ${escapeHtml(LEVEL_LABEL[animal.level])}</p>
            <div class="food-bars">
                <div class="food-bar-row">
                    <span>捕食能力</span>
                    <div class="food-bar-track"><i style="width:${hunting}%"></i></div>
                </div>
                <div class="food-bar-row">
                    <span>生存压力</span>
                    <div class="food-bar-track"><i style="width:${pressure}%"></i></div>
                </div>
                <div class="food-bar-row">
                    <span>栖息适应</span>
                    <div class="food-bar-track"><i style="width:${habitat}%"></i></div>
                </div>
            </div>
            <p>它会吃：<strong>${escapeHtml(preyText)}</strong></p>
            <p>可能被：<strong>${escapeHtml(predatorText)}</strong> 捕食</p>
            <p>分布：${escapeHtml(animal.region)}（${escapeHtml(formatHabitats(animal))}）</p>
            <div class="legend" id="food-legend"></div>
        `;

        renderFoodLegend();
    }

    function renderFoodWeb() {
        const canvas = document.getElementById("food-canvas");

        if (!state.filtered.length) {
            canvas.innerHTML = "<p style='padding:12px'>没有匹配结果。</p>";
            const side = document.getElementById("food-side");
            side.innerHTML = `<h3>食物链图片版</h3><p>当前筛选没有可展示的动物。</p><div class="legend" id="food-legend"></div>`;
            renderFoodLegend();
            return;
        }

        state.foodEdges = buildFoodEdges(state.filtered);
        const focus = state.animalMap.get(state.foodFocusId) || state.filtered[0];
        state.foodFocusId = focus.id;

        const predators = state.foodEdges
            .filter((e) => e.to === focus.id)
            .map((e) => state.animalMap.get(e.from))
            .filter((x) => x && state.filtered.some((y) => y.id === x.id))
            .slice(0, 10);

        const prey = state.foodEdges
            .filter((e) => e.from === focus.id)
            .map((e) => state.animalMap.get(e.to))
            .filter((x) => x && state.filtered.some((y) => y.id === x.id))
            .slice(0, 12);

        const neighbors = state.filtered
            .filter((x) => x.id !== focus.id && x.habitats.some((h) => focus.habitats.includes(h)))
            .sort((a, b) => b.size - a.size)
            .slice(0, 8);

        const focusEmoji = GROUP_ICON[focus.group] || "🐾";
        canvas.innerHTML = `
            <div class="food-gallery">
                <section class="food-focus-card">
                    <div class="food-focus-media">
                        <img data-image-id="${escapeHtml(focus.id)}" alt="${escapeHtml(focus.en)} photo" loading="lazy">
                        <div class="food-animal-fallback food-focus-fallback" data-fallback-id="${escapeHtml(focus.id)}">${focusEmoji}</div>
                    </div>
                    <div class="food-focus-body">
                        <h3>${escapeHtml(focus.zh)} <small>${escapeHtml(focus.en)}</small></h3>
                        <p>${escapeHtml(GROUP_LABEL[focus.group])} · ${escapeHtml(DIET_LABEL[focus.diet])} · ${escapeHtml(LEVEL_LABEL[focus.level])}</p>
                        <p>${escapeHtml(focus.region)} · ${escapeHtml(formatHabitats(focus))}</p>
                        <div class="food-focus-actions">
                            <button class="food-mini-btn" type="button" data-open-animal="${escapeHtml(focus.id)}">打开详情页</button>
                        </div>
                    </div>
                </section>

                <section class="food-group">
                    <h4>它的天敌（谁可能吃它）</h4>
                    <div class="food-card-grid">
                        ${predators.length ? predators.map((x) => foodAnimalCardHtml(x, "天敌")).join("") : '<div class="food-empty">当前筛选下暂无明显天敌</div>'}
                    </div>
                </section>

                <section class="food-group">
                    <h4>它的猎物（它可能吃谁）</h4>
                    <div class="food-card-grid">
                        ${prey.length ? prey.map((x) => foodAnimalCardHtml(x, "猎物")).join("") : '<div class="food-empty">当前筛选下暂无明显猎物</div>'}
                    </div>
                </section>

                <section class="food-group">
                    <h4>同生态位邻居（共享栖息地）</h4>
                    <div class="food-card-grid">
                        ${neighbors.length ? neighbors.map((x) => foodAnimalCardHtml(x, "邻居")).join("") : '<div class="food-empty">当前筛选下暂无同生态位邻居</div>'}
                    </div>
                </section>
            </div>
        `;

        observeLazyImages();
        describeAnimalInFood(focus, predators, prey);
        renderFoodLegend();
    }

    function uniqueAnimals(items) {
        const seen = new Set();
        return items.filter((animal) => {
            if (!animal || seen.has(animal.id)) return false;
            seen.add(animal.id);
            return true;
        });
    }

    function getAnimalPredators(animalId) {
        return uniqueAnimals(
            state.allFoodEdges
                .filter((edge) => edge.to === animalId)
                .map((edge) => state.animalMap.get(edge.from))
        );
    }

    function getAnimalPrey(animalId) {
        return uniqueAnimals(
            state.allFoodEdges
                .filter((edge) => edge.from === animalId)
                .map((edge) => state.animalMap.get(edge.to))
        );
    }

    function getAnimalHabitatPeers(animal, limit = 12) {
        return state.animals
            .filter((candidate) => candidate.id !== animal.id)
            .map((candidate) => {
                const overlap = overlapCount(animal.habitats, candidate.habitats);
                if (!overlap) return null;
                const score = overlap * 3 + Math.max(0, 3 - Math.abs(animal.size - candidate.size));
                return { animal: candidate, score };
            })
            .filter(Boolean)
            .sort((a, b) => b.score - a.score || b.animal.size - a.animal.size)
            .slice(0, limit)
            .map((item) => item.animal);
    }

    function obsidianAnimalLinksHtml(animals, emptyText) {
        if (!animals.length) {
            return `<span class="wiki-empty">${escapeHtml(emptyText)}</span>`;
        }

        return animals.map((animal) => (
            `<button type="button" class="wiki-link" data-open-animal="${escapeHtml(animal.id)}" title="${escapeHtml(animal.en)}">[[${escapeHtml(animal.zh)}]]</button>`
        )).join("");
    }

    function habitatTagLinksHtml(habitats) {
        if (!habitats.length) return `<span class="wiki-empty">暂无栖息地数据</span>`;

        return habitats.map((habitat) => (
            `<button type="button" class="wiki-link wiki-tag" data-open-habitat="${escapeHtml(habitat)}">#${escapeHtml(HABITAT_LABEL[habitat] || habitat)}</button>`
        )).join("");
    }

    function renderAnimalDetail(animalId) {
        const container = document.getElementById("detail-body");
        if (!container) return;

        const animal = state.animalMap.get(animalId);
        if (!animal) {
            container.innerHTML = "<p>未找到该动物信息。</p>";
            return;
        }

        state.detailAnimalId = animal.id;

        const predators = getAnimalPredators(animal.id).slice(0, 16);
        const prey = getAnimalPrey(animal.id).slice(0, 16);
        const peers = getAnimalHabitatPeers(animal, 16);

        const pressure = predators.length ? Math.min(100, predators.length * 16) : 4;
        const hunting = prey.length ? Math.min(100, prey.length * 14) : 6;
        const habitat = Math.min(100, Math.max(8, animal.habitats.length * 26));
        const emoji = GROUP_ICON[animal.group] || "🐾";

        container.innerHTML = `
            <article class="detail-card">
                <header class="detail-header">
                    <div class="detail-media">
                        <img data-image-id="${escapeHtml(animal.id)}" alt="${escapeHtml(animal.en)} photo" loading="lazy">
                        <div class="food-animal-fallback detail-fallback" data-fallback-id="${escapeHtml(animal.id)}">${emoji}</div>
                    </div>
                    <div class="detail-summary">
                        <h2>${escapeHtml(animal.zh)} <small>${escapeHtml(animal.en)}</small></h2>
                        <p>${escapeHtml(GROUP_LABEL[animal.group])} · ${escapeHtml(DIET_LABEL[animal.diet])} · ${escapeHtml(LEVEL_LABEL[animal.level])}</p>
                        <p>地区：${escapeHtml(animal.region)}</p>
                        <div class="detail-actions">
                            <button class="action-btn" data-action="speak-zh" data-id="${escapeHtml(animal.id)}">中文发音</button>
                            <button class="action-btn" data-action="speak-en" data-id="${escapeHtml(animal.id)}">English</button>
                            <button class="action-btn" data-action="speak-call" data-id="${escapeHtml(animal.id)}">叫声</button>
                            <button class="action-btn" data-action="locate" data-id="${escapeHtml(animal.id)}">地球定位</button>
                            <button class="food-mini-btn" type="button" data-food-id="${escapeHtml(animal.id)}">在食物链中查看</button>
                        </div>
                        <div class="food-bars detail-bars">
                            <div class="food-bar-row">
                                <span>捕食能力</span>
                                <div class="food-bar-track"><i style="width:${hunting}%"></i></div>
                            </div>
                            <div class="food-bar-row">
                                <span>生存压力</span>
                                <div class="food-bar-track"><i style="width:${pressure}%"></i></div>
                            </div>
                            <div class="food-bar-row">
                                <span>栖息适应</span>
                                <div class="food-bar-track"><i style="width:${habitat}%"></i></div>
                            </div>
                        </div>
                    </div>
                </header>

                <section class="detail-section">
                    <h3>栖息地标签</h3>
                    <div class="wiki-links">${habitatTagLinksHtml(animal.habitats)}</div>
                </section>

                <section class="detail-section">
                    <h3>它会捕食谁（出链）</h3>
                    <div class="wiki-links">${obsidianAnimalLinksHtml(prey, "当前暂无明显猎物")}</div>
                </section>

                <section class="detail-section">
                    <h3>谁会捕食它（反向链接）</h3>
                    <div class="wiki-links">${obsidianAnimalLinksHtml(predators, "当前暂无明显天敌")}</div>
                </section>

                <section class="detail-section">
                    <h3>同栖息地邻居（双向关联）</h3>
                    <div class="wiki-links">${obsidianAnimalLinksHtml(peers, "当前暂无共享栖息地邻居")}</div>
                </section>
            </article>
        `;

        observeLazyImages();
    }

    function openAnimalDetail(animalId, options = {}) {
        const animal = state.animalMap.get(animalId);
        if (!animal) return;

        if (state.activeView !== "detail" && ROUTABLE_VIEWS.has(state.activeView)) {
            state.lastNonDetailView = state.activeView;
        }
        if (options.preferredView && ROUTABLE_VIEWS.has(options.preferredView)) {
            state.lastNonDetailView = options.preferredView;
        }

        renderAnimalDetail(animal.id);
        setView("detail", { syncHash: false });

        if (options.syncHash !== false) {
            syncHashRoute(`animal/${encodeURIComponent(animal.id)}`);
        }
    }

    function backFromDetail() {
        const target = ROUTABLE_VIEWS.has(state.lastNonDetailView) ? state.lastNonDetailView : "cards";
        setView(target);
    }

    function syncHashRoute(route) {
        const nextHash = `#${route}`;
        if (window.location.hash === nextHash) return;
        state.isRoutingByHash = true;
        window.location.hash = nextHash;
        setTimeout(() => {
            state.isRoutingByHash = false;
        }, 120);
    }

    function parseHashRoute() {
        const raw = (window.location.hash || "").replace(/^#/, "").trim();
        if (!raw) return null;

        if (raw.startsWith("animal/")) {
            return { type: "animal", value: decodeURIComponent(raw.slice("animal/".length)) };
        }
        if (raw.startsWith("view/")) {
            return { type: "view", value: decodeURIComponent(raw.slice("view/".length)) };
        }
        return null;
    }

    function applyHashRoute() {
        if (state.isRoutingByHash) {
            state.isRoutingByHash = false;
            return;
        }

        const route = parseHashRoute();
        if (!route) return;

        if (route.type === "animal") {
            openAnimalDetail(route.value, { syncHash: false });
            return;
        }

        if (route.type === "view" && ROUTABLE_VIEWS.has(route.value)) {
            setView(route.value, { syncHash: false });
        }
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

    function createGlobePinElement(point) {
        const animal = state.animalMap.get(point.id);
        const el = document.createElement("button");
        el.className = "globe-pin";
        el.type = "button";
        el.dataset.id = point.id;
        el.title = `${animal.zh} / ${animal.en}`;

        const fallback = document.createElement("span");
        fallback.className = "globe-pin-fallback";
        fallback.textContent = GROUP_ICON[animal.group] || "🐾";
        el.appendChild(fallback);

        const cached = state.imageCache.get(animal.wiki);
        if (cached) {
            const img = document.createElement("img");
            img.className = "globe-pin-img";
            img.src = cached;
            img.alt = animal.en;
            el.appendChild(img);
        } else {
            fetchWikiThumb(animal).then((src) => {
                if (!src || !el.isConnected) return;
                const img = document.createElement("img");
                img.className = "globe-pin-img";
                img.src = src;
                img.alt = animal.en;
                el.appendChild(img);
            });
        }

        el.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            focusAnimalOnGlobe(point.id, false);
        });

        return el;
    }

    function setGlobeStatus(message, detail) {
        const canvas = document.getElementById("globe-canvas");
        if (!canvas) return;
        canvas.innerHTML = `
            <div class="globe-status">
                <p>${escapeHtml(message || "地球仪暂不可用")}</p>
                ${detail ? `<small>${escapeHtml(detail)}</small>` : ""}
            </div>
        `;
    }

    function getGlobeTextureUrls() {
        try {
            const base = window.location.href.endsWith("/") ? window.location.href : `${window.location.href}/`;
            return {
                globe: new URL("assets/earth-blue-marble.jpg", base).toString(),
                bump: new URL("assets/earth-topology.png", base).toString()
            };
        } catch (_) {
            return {
                globe: "assets/earth-blue-marble.jpg",
                bump: "assets/earth-topology.png"
            };
        }
    }

    function resizeGlobeIfNeeded() {
        const canvas = document.getElementById("globe-canvas");
        if (!canvas || !state.globe) return;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (width > 50 && height > 50) {
            state.globe.width(width);
            state.globe.height(height);
            const globeCanvas = canvas.querySelector("canvas");
            if (globeCanvas) {
                globeCanvas.style.display = "block";
                globeCanvas.style.margin = "0 auto";
            }
            const pov = state.globePov || { lat: 20, lng: 10, altitude: 2.0 };
            state.globe.pointOfView(pov, 0);
        }
    }

    function initGlobe(retry = 0) {
        const canvas = document.getElementById("globe-canvas");
        if (!canvas) return;

        if (!window.Globe) {
            setGlobeStatus("3D 地球仪脚本未加载成功", "正在尝试备用加载源，请稍候重试。");
            return;
        }

        if (canvas.clientWidth < 50 || canvas.clientHeight < 50) {
            if (retry < 12) {
                requestAnimationFrame(() => initGlobe(retry + 1));
            } else {
                setGlobeStatus("地球仪容器尺寸异常", "请切换一次视图或刷新页面后重试。");
            }
            return;
        }

        try {
            const textures = getGlobeTextureUrls();
            let createGlobe = null;
            try {
                createGlobe = window.Globe({
                    animateIn: true,
                    waitForGlobeReady: true,
                    rendererConfig: { antialias: true, alpha: true }
                });
            } catch (_) {
                createGlobe = window.Globe();
            }

            state.globe = createGlobe(canvas)
                .backgroundColor("rgba(0,0,0,0)")
                .globeImageUrl(textures.globe)
                .bumpImageUrl(textures.bump)
                .showAtmosphere(true)
                .atmosphereColor("#7ed0ff")
                .atmosphereAltitude(0.16)
                .pointRadius((d) => d.radius)
                .pointAltitude((d) => d.altitude)
                .pointColor((d) => d.color)
                .pointLabel((d) => `<div style='font-family:Noto Sans SC,sans-serif;'><strong>${escapeHtml(d.zh)} / ${escapeHtml(d.en)}</strong><br>${escapeHtml(d.region)}<br>${escapeHtml(d.habitatsZh)}</div>`)
                .htmlElementsData([])
                .htmlElement((d) => createGlobePinElement(d))
                .onPointClick((d) => {
                    focusAnimalOnGlobe(d.id, false);
                });

            const controls = state.globe.controls();
            controls.enableDamping = true;
            controls.dampingFactor = 0.08;
            controls.rotateSpeed = 0.78;
            controls.zoomSpeed = 0.8;
            controls.minDistance = 140;
            controls.maxDistance = 430;
            controls.enablePan = false;

            canvas.style.touchAction = "none";
            resizeGlobeIfNeeded();
            setGlobeRotate(true);
            updateGlobePoints();
            state.globe.pointOfView(state.globePov, 0);
        } catch (error) {
            state.globe = null;
            const detail = error && error.message ? error.message : String(error || "Unknown error");
            setGlobeStatus("地球仪初始化失败", detail);
            console.error("[animals] globe init failed:", error);
        }
    }

    function updateGlobePoints() {
        if (!state.globe) return;

        const points = state.filtered.map((animal) => ({
            id: animal.id,
            wiki: animal.wiki,
            zh: animal.zh,
            en: animal.en,
            region: animal.region,
            habitatsZh: formatHabitats(animal),
            lat: animal.lat,
            lng: animal.lng,
            radius: 0.14 + animal.size * 0.015,
            altitude: 0.04 + animal.size * 0.008,
            color: GROUP_COLOR[animal.group] || "#7ed0ff"
        }));

        state.globe.pointsData(points);
        state.globe.htmlElementsData(points);

        if (typeof state.globe.ringsData === "function") {
            const rings = points.filter((_, idx) => idx % 3 === 0).slice(0, 36);
            state.globe
                .ringsData(rings)
                .ringColor(() => "rgba(126, 208, 255, 0.58)")
                .ringMaxRadius(() => 2.8)
                .ringPropagationSpeed(() => 0.9)
                .ringRepeatPeriod(() => 1200);
        }
    }

    async function updateGlobeSide(animal) {
        const side = document.getElementById("globe-detail");
        side.innerHTML = `<p>正在加载 <strong>${escapeHtml(animal.zh)}</strong> 的图片...</p>`;

        const src = await fetchWikiThumb(animal);

        const imgHtml = src
            ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(animal.en)}" style="width:100%;border-radius:10px;margin-bottom:8px;object-fit:cover;max-height:170px;">`
            : "";

        side.innerHTML = `
            ${imgHtml}
            <p><strong>${escapeHtml(animal.zh)} / ${escapeHtml(animal.en)}</strong></p>
            <p>${escapeHtml(GROUP_LABEL[animal.group])} · ${escapeHtml(DIET_LABEL[animal.diet])}</p>
            <p>食物链：${escapeHtml(LEVEL_LABEL[animal.level])}</p>
            <p>分布区域：${escapeHtml(animal.region)}</p>
            <p>栖息地：${escapeHtml(formatHabitats(animal))}</p>
        `;
    }

    function focusAnimalOnGlobe(animalId, switchView) {
        const animal = state.animalMap.get(animalId);
        if (!animal) return;

        if (switchView) {
            setView("globe");
        }

        if (!state.globe) {
            initGlobe();
        }

        if (state.globe) {
            state.globePov = { lat: animal.lat, lng: animal.lng, altitude: 1.5 };
            state.globe.pointOfView(state.globePov, 800);
        }

        updateGlobeSide(animal);
    }

    function zoomGlobe(multiplier) {
        if (!state.globe) return;
        const pov = state.globe.pointOfView();
        const nextAlt = Math.min(3.8, Math.max(0.5, pov.altitude * multiplier));
        state.globePov = { lat: pov.lat, lng: pov.lng, altitude: nextAlt };
        state.globe.pointOfView(state.globePov, 500);
    }

    function resetGlobeView() {
        if (!state.globe) return;
        state.globePov = { lat: 20, lng: 10, altitude: 2.0 };
        state.globe.pointOfView(state.globePov, 700);
    }

    function setView(view, options = {}) {
        let nextView = view;
        if (!ALL_VIEWS.has(nextView)) nextView = "cards";

        state.activeView = nextView;
        if (ROUTABLE_VIEWS.has(nextView)) {
            state.lastNonDetailView = nextView;
        }

        document.querySelectorAll(".view-btn").forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.view === nextView);
        });

        document.querySelectorAll(".view").forEach((panel) => {
            panel.classList.remove("active");
        });

        const panel = document.getElementById(`${nextView}-view`);
        if (panel) panel.classList.add("active");

        if (nextView === "food") {
            renderFoodWeb();
        }

        if (nextView === "globe") {
            if (!state.globe) initGlobe();
            else {
                resizeGlobeIfNeeded();
                updateGlobePoints();
            }
        }

        if (nextView === "detail" && state.detailAnimalId) {
            renderAnimalDetail(state.detailAnimalId);
        }

        if (options.syncHash !== false && ROUTABLE_VIEWS.has(nextView)) {
            syncHashRoute(`view/${nextView}`);
        }
    }

    function setupGlobeResizeObserver() {
        const canvas = document.getElementById("globe-canvas");
        if (!canvas || typeof ResizeObserver === "undefined") return;

        if (state.globeResizeObserver) {
            state.globeResizeObserver.disconnect();
        }

        state.globeResizeObserver = new ResizeObserver(() => {
            if (state.activeView === "globe") {
                resizeGlobeIfNeeded();
            }
        });

        state.globeResizeObserver.observe(canvas);
    }

    function bindControls() {
        const searchInput = document.getElementById("search-input");

        let timer = null;
        searchInput.addEventListener("input", () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                state.query = searchInput.value.trim();
                filterAnimals();
            }, 120);
        });

        const map = {
            "group-filter": "group",
            "diet-filter": "diet",
            "level-filter": "level",
            "habitat-filter": "habitat",
            "region-filter": "region"
        };

        Object.entries(map).forEach(([id, key]) => {
            document.getElementById(id).addEventListener("change", (event) => {
                state.filters[key] = event.target.value;
                filterAnimals();
            });
        });

        document.getElementById("reset-btn").addEventListener("click", () => {
            state.query = "";
            state.filters = {
                group: "all",
                diet: "all",
                level: "all",
                habitat: "all",
                region: "all"
            };

            document.getElementById("search-input").value = "";
            document.getElementById("group-filter").value = "all";
            document.getElementById("diet-filter").value = "all";
            document.getElementById("level-filter").value = "all";
            document.getElementById("habitat-filter").value = "all";
            document.getElementById("region-filter").value = "all";
            filterAnimals();
        });

        document.querySelectorAll(".view-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                setView(btn.dataset.view);
            });
        });

        document.body.addEventListener("click", async (event) => {
            const actionButton = event.target.closest("[data-action]");
            if (actionButton) {
                const action = actionButton.dataset.action;
                const animal = state.animalMap.get(actionButton.dataset.id || "");
                if (!animal) return;

                if (action === "locate") {
                    focusAnimalOnGlobe(animal.id, true);
                    return;
                }

                if (action === "speak-call") {
                    await playAnimalCall(animal);
                    return;
                }

                if (action === "speak-zh" || action === "speak-en") {
                    await speakAnimalName(action, animal);
                    return;
                }
            }

            const detailControl = event.target.closest("[data-detail-action]");
            if (detailControl) {
                if (detailControl.dataset.detailAction === "back") {
                    backFromDetail();
                }
                return;
            }

            const foodNode = event.target.closest("[data-food-id]");
            if (foodNode) {
                const animal = state.animalMap.get(foodNode.dataset.foodId || "");
                if (animal) {
                    state.foodFocusId = animal.id;
                    if (state.activeView !== "food") {
                        setView("food");
                    } else {
                        renderFoodWeb();
                    }
                }
                return;
            }

            const openAnimal = event.target.closest("[data-open-animal]");
            if (openAnimal) {
                const animalId = openAnimal.dataset.openAnimal || "";
                openAnimalDetail(animalId);
                return;
            }

            const habitatNode = event.target.closest("[data-open-habitat]");
            if (habitatNode) {
                const habitat = habitatNode.dataset.openHabitat || "";
                if (!habitat) return;
                state.filters.habitat = habitat;
                document.getElementById("habitat-filter").value = habitat;
                filterAnimals();
                setView("cards");
                showToast(`已筛选栖息地：${HABITAT_LABEL[habitat] || habitat}`);
                return;
            }

            const globeCtl = event.target.closest("[data-globe-action]");
            if (globeCtl) {
                const action = globeCtl.dataset.globeAction;
                if (action === "zoom-in") zoomGlobe(0.78);
                else if (action === "zoom-out") zoomGlobe(1.26);
                else if (action === "toggle-rotate") setGlobeRotate(!state.globeAutoRotate);
                else if (action === "reset") resetGlobeView();
            }
        });

        window.addEventListener("resize", () => {
            if (state.activeView === "food") {
                renderFoodWeb();
            }
            if (state.activeView === "globe") {
                resizeGlobeIfNeeded();
            }
        });

        window.addEventListener("hashchange", applyHashRoute);
    }

    function init() {
        state.animals = parseCatalog(window.ANIMAL_CATALOG_RAW || "");
        state.animals.forEach((animal) => state.animalMap.set(animal.id, animal));
        state.allFoodEdges = buildFoodEdges(state.animals);

        initImageCache();
        setupImageObserver();
        buildSelectOptions();
        bindControls();
        setupGlobeResizeObserver();

        if ("speechSynthesis" in window) {
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        filterAnimals();
        renderFoodLegend();
        if (window.location.hash) {
            applyHashRoute();
        } else {
            syncHashRoute("view/cards");
        }
        showToast("已加载 100 种动物");
    }

    init();
})();
