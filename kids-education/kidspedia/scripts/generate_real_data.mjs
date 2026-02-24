#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const TARGET_PER_MODULE = 100;

const MODULE_CATEGORIES = {
    dinosaurs: ["Dinosaurs", "Dinosaur genera", "Theropods", "Sauropods", "Ceratopsians"],
    insects: ["Insects", "Insect families", "Butterflies", "Beetles", "Ants"],
    marine: ["Marine animals", "Fish", "Cetaceans", "Sharks", "Cephalopods"],
    space: ["Astronomy", "Solar System", "Space exploration", "Spacecraft", "Observatories"],
    vehicles: ["Vehicles", "Road transport", "Rail transport", "Aircraft", "Water transport"],
    construction: ["Construction equipment", "Engineering vehicles", "Earthmoving equipment", "Cranes", "Road construction"],
    humanbody: ["Human anatomy", "Organs (anatomy)", "Organ systems", "Skeletal system", "Cardiovascular system"],
    weather: ["Weather", "Meteorological phenomena", "Clouds", "Storms", "Climate"],
    plants: ["Plants", "Plant common names", "Trees", "Flowering plants", "Crops"],
    countries: ["Sovereign states", "Countries in Asia", "Countries in Europe", "Countries in Africa", "Countries in North America", "Countries in South America", "Countries in Oceania"],
    jobs: ["Occupations", "Medical professions", "Engineering occupations", "Science occupations", "Education occupations", "Business occupations"],
    festivals: ["Festivals", "Religious festivals", "Cultural festivals", "Public holidays", "Harvest festivals"]
};

const MODULE_SEARCH_TERMS = {
    dinosaurs: ["dinosaur species", "theropod", "sauropod", "ceratopsian", "ornithischian dinosaur"],
    insects: ["insect species", "butterfly species", "beetle species", "ant species", "pollinator insects"],
    marine: ["marine life", "ocean animal", "fish species", "whale species", "reef animal"],
    space: ["planet", "moon", "space mission", "space telescope", "astronomy object"],
    vehicles: ["vehicle type", "transport vehicle", "rail vehicle", "road vehicle", "aircraft model"],
    construction: ["construction machine", "earthmoving machine", "road construction machine", "crane type", "industrial vehicle"],
    humanbody: ["human organ", "human anatomy structure", "body system", "bone anatomy", "muscle anatomy"],
    weather: ["weather phenomenon", "storm type", "cloud type", "climate phenomenon", "meteorology term"],
    plants: ["plant species", "tree species", "crop plant", "flower species", "medicinal plant"],
    countries: ["sovereign state", "country profile", "nation", "independent state", "world country"],
    jobs: ["occupation", "profession", "career role", "job title", "skilled trade"],
    festivals: ["festival", "holiday", "cultural celebration", "religious festival", "annual event"]
};

const MODULE_KEYWORDS = {
    dinosaurs: ["dinosaur", "theropod", "sauropod", "fossil", "jurassic", "cretaceous", "triassic", "paleontology"],
    insects: ["insect", "butterfly", "beetle", "ant", "wasp", "moth", "dragonfly", "arthropod", "larva"],
    marine: ["marine", "ocean", "sea", "fish", "shark", "whale", "dolphin", "coral", "cephalopod", "crustacean"],
    space: ["planet", "moon", "star", "galaxy", "astronomy", "space", "orbit", "telescope", "asteroid", "spacecraft"],
    vehicles: ["vehicle", "transport", "car", "truck", "bus", "train", "rail", "aircraft", "ship", "bicycle"],
    construction: ["construction", "excavator", "bulldozer", "loader", "crane", "engineering", "road", "machine", "earthmoving"],
    humanbody: ["human", "anatomy", "organ", "system", "bone", "muscle", "blood", "nerve", "tissue", "cell"],
    weather: ["weather", "climate", "meteorology", "storm", "cloud", "rain", "snow", "wind", "hurricane", "temperature"],
    plants: ["plant", "tree", "flower", "crop", "botany", "seed", "leaf", "fruit", "species"],
    countries: ["country", "sovereign state", "nation", "republic", "kingdom"],
    jobs: ["occupation", "profession", "trade", "worker", "career", "specialist", "technician", "engineer", "teacher", "doctor"],
    festivals: ["festival", "holiday", "celebration", "feast", "observance", "event"]
};

const BAD_TEXT = /mythical|legendary creature|fictional|video game|album|song|novel|film|tv series|comic|disambiguation|wrestler|politician|actor|actress|footballer|cricketer|basketball player/i;

const SKIP_TITLE = /^(List of|Timeline of|Outline of|Index of|Glossary of|Category:|Template:|Portal:|History of |Bibliography of )/i;

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, retries = 3) {
    let lastErr = null;
    for (let i = 0; i < retries; i += 1) {
        try {
            const res = await fetch(url, { headers: { "User-Agent": "KidspediaDataBuilder/1.0 (educational)" } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            lastErr = err;
            await delay(250 * (i + 1));
        }
    }
    throw lastErr;
}

function slugify(input) {
    return (input || "")
        .toLowerCase()
        .replace(/['".,()/[\]:;!?+]/g, "")
        .replace(/&/g, " and ")
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
}

function normalizeKey(value) {
    return (value || "").toString().trim().toLowerCase();
}

function safeText(value, fallback = "") {
    return (value || fallback || "").toString().replace(/\s+/g, " ").trim();
}

function toShortSummary(extract) {
    const text = safeText(extract);
    if (!text) return "";
    const first = text.split(/(?<=[.?!])\s+/)[0];
    return first.length > 180 ? `${first.slice(0, 177)}...` : first;
}

function deriveType(page, moduleTitleZh) {
    const desc = safeText(page.description);
    if (!desc) return `${moduleTitleZh}条目`;
    const short = desc.replace(/\.$/, "");
    return short.length > 24 ? `${short.slice(0, 24)}...` : short;
}

function makeTags(page, moduleTitleZh) {
    const desc = safeText(page.description);
    const parts = desc
        .split(/[,;，；]/)
        .map((s) => safeText(s))
        .filter(Boolean)
        .slice(0, 2);
    return [...new Set([moduleTitleZh, "真实百科", ...parts])];
}

function pageToItem(page, module) {
    const en = safeText(page.title);
    const zh = safeText(page.langlinks && page.langlinks[0] && page.langlinks[0].title, en);
    const summary = toShortSummary(page.extract) || safeText(page.description, `${en} is a knowledge entry.`);
    const coord = page.coordinates && page.coordinates[0] ? page.coordinates[0] : null;
    const baseId = slugify(en) || `item_${page.pageid || Math.random().toString(36).slice(2, 8)}`;
    const id = `${baseId}_${page.pageid || "x"}`;

    return {
        id,
        zh,
        en,
        wiki: en.replaceAll(" ", "_"),
        type: deriveType(page, module.titleZh),
        summary,
        period: "现代",
        year: 0,
        region: "全球",
        lat: coord ? Number(coord.lat) : null,
        lng: coord ? Number(coord.lon) : null,
        tags: makeTags(page, module.titleZh)
    };
}

function isGoodPage(page, moduleId) {
    if (!page || !page.title) return false;
    if (page.ns !== 0) return false;
    if (page.missing) return false;
    if (page.pageprops && page.pageprops.disambiguation !== undefined) return false;
    if (SKIP_TITLE.test(page.title)) return false;
    const combined = `${safeText(page.title)} ${safeText(page.description)} ${safeText(page.extract)}`;
    if (BAD_TEXT.test(combined)) return false;
    const extract = safeText(page.extract);
    if (extract.length < 40) return false;
    const keywords = MODULE_KEYWORDS[moduleId] || [];
    if (keywords.length) {
        const hay = combined.toLowerCase();
        const hit = keywords.some((k) => hay.includes(k.toLowerCase()));
        if (!hit) return false;
    }
    return true;
}

async function fetchCategoryPages(categoryTitle, moduleId, maxPages = 400) {
    const pages = [];
    const seen = new Set();
    let gcmcontinue = "";
    let guard = 0;

    while (pages.length < maxPages && guard < 30) {
        guard += 1;
        const params = new URLSearchParams({
            action: "query",
            format: "json",
            formatversion: "2",
            generator: "categorymembers",
            gcmtitle: `Category:${categoryTitle}`,
            gcmnamespace: "0",
            gcmlimit: "max",
            prop: "description|extracts|coordinates|langlinks|pageprops",
            exintro: "1",
            explaintext: "1",
            exchars: "320",
            lllang: "zh",
            lllimit: "1",
            redirects: "1",
            origin: "*"
        });

        if (gcmcontinue) {
            params.set("continue", "||");
            params.set("gcmcontinue", gcmcontinue);
        }

        const url = `https://en.wikipedia.org/w/api.php?${params.toString()}`;
        let json;
        try {
            json = await fetchJson(url);
        } catch {
            break;
        }

        const batch = json?.query?.pages || [];
        batch.forEach((page) => {
            if (!isGoodPage(page, moduleId)) return;
            const k = normalizeKey(page.title);
            if (!k || seen.has(k)) return;
            seen.add(k);
            pages.push(page);
        });

        if (!json.continue || !json.continue.gcmcontinue) break;
        gcmcontinue = json.continue.gcmcontinue;
    }

    return pages;
}

async function fetchSearchTitles(term, limit = 60) {
    const titles = [];
    const seen = new Set();
    let sroffset = 0;
    let guard = 0;

    while (titles.length < limit && guard < 8) {
        guard += 1;
        const params = new URLSearchParams({
            action: "query",
            format: "json",
            formatversion: "2",
            list: "search",
            srsearch: term,
            srnamespace: "0",
            srlimit: "50",
            sroffset: `${sroffset}`,
            origin: "*"
        });

        let json;
        try {
            json = await fetchJson(`https://en.wikipedia.org/w/api.php?${params.toString()}`);
        } catch {
            break;
        }

        const arr = json?.query?.search || [];
        if (!arr.length) break;
        arr.forEach((row) => {
            const title = safeText(row.title);
            if (!title || SKIP_TITLE.test(title)) return;
            const key = normalizeKey(title);
            if (seen.has(key)) return;
            seen.add(key);
            titles.push(title);
        });

        if (!json.continue || !json.continue.sroffset) break;
        sroffset = json.continue.sroffset;
    }

    return titles.slice(0, limit);
}

async function fetchPagesByTitles(titles, moduleId) {
    const pages = [];
    const chunkSize = 20;
    for (let i = 0; i < titles.length; i += chunkSize) {
        const chunk = titles.slice(i, i + chunkSize);
        if (!chunk.length) continue;
        const params = new URLSearchParams({
            action: "query",
            format: "json",
            formatversion: "2",
            prop: "description|extracts|coordinates|langlinks|pageprops",
            exintro: "1",
            explaintext: "1",
            exchars: "320",
            lllang: "zh",
            lllimit: "1",
            redirects: "1",
            titles: chunk.join("|"),
            origin: "*"
        });
        try {
            const json = await fetchJson(`https://en.wikipedia.org/w/api.php?${params.toString()}`);
            const batch = json?.query?.pages || [];
            batch.forEach((page) => {
                if (isGoodPage(page, moduleId)) pages.push(page);
            });
        } catch {
            // Ignore a failed chunk and continue.
        }
    }
    return pages;
}

function loadCurrentData(dataJsPath, extraJsPath) {
    const context = { window: {} };
    vm.createContext(context);
    const dataCode = fs.readFileSync(dataJsPath, "utf8");
    const extraCode = fs.readFileSync(extraJsPath, "utf8");
    vm.runInContext(dataCode, context, { filename: dataJsPath });
    vm.runInContext(extraCode, context, { filename: extraJsPath });
    return context.window.KIDSPEDIA_DATA || { modules: [] };
}

function buildExistingSet(items) {
    const set = new Set();
    (items || []).forEach((item) => {
        const keys = [
            normalizeKey(item.wiki),
            normalizeKey(item.en),
            normalizeKey(item.zh)
        ].filter(Boolean);
        keys.forEach((k) => set.add(k));
    });
    return set;
}

function toJsLiteral(obj) {
    return JSON.stringify(obj, null, 4)
        .replace(/"([^"]+)":/g, "$1:")
        .replaceAll("\\u003c", "<")
        .replaceAll("\\u003e", ">");
}

async function main() {
    const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
    const dataJsPath = path.join(rootDir, "data.js");
    const extraJsPath = path.join(rootDir, "data.extra.js");
    const outPath = path.join(rootDir, "data.real.js");

    const current = loadCurrentData(dataJsPath, extraJsPath);
    const patch = {};

    for (const module of current.modules || []) {
        const moduleId = module.id;
        const categories = MODULE_CATEGORIES[moduleId] || [];
        const existing = Array.isArray(module.items) ? module.items : [];
        const needed = Math.max(0, TARGET_PER_MODULE - existing.length);
        console.log(`[${moduleId}] existing=${existing.length}, need=${needed}`);

        if (!needed) {
            patch[moduleId] = { items: [] };
            continue;
        }

        const existingSet = buildExistingSet(existing);
        const candidateMap = new Map();

        for (const category of categories) {
            const pages = await fetchCategoryPages(category, moduleId, needed * 4);
            pages.forEach((page) => {
                const titleKey = normalizeKey(page.title);
                if (!titleKey || candidateMap.has(titleKey) || existingSet.has(titleKey)) return;
                candidateMap.set(titleKey, page);
            });
            console.log(`  - ${category}: +${pages.length} candidates`);
            if (candidateMap.size >= needed * 3) break;
        }

        if (candidateMap.size < needed) {
            const terms = MODULE_SEARCH_TERMS[moduleId] || [];
            for (const term of terms) {
                const titles = await fetchSearchTitles(term, needed * 3);
                const pages = await fetchPagesByTitles(titles, moduleId);
                pages.forEach((page) => {
                    const titleKey = normalizeKey(page.title);
                    if (!titleKey || candidateMap.has(titleKey) || existingSet.has(titleKey)) return;
                    candidateMap.set(titleKey, page);
                });
                console.log(`  - search:${term}: +${pages.length} candidates`);
                if (candidateMap.size >= needed * 3) break;
            }
        }

        const picked = [];
        for (const page of candidateMap.values()) {
            const item = pageToItem(page, module);
            const keys = [normalizeKey(item.wiki), normalizeKey(item.en), normalizeKey(item.zh)];
            if (keys.some((k) => existingSet.has(k))) continue;
            keys.filter(Boolean).forEach((k) => existingSet.add(k));
            picked.push(item);
            if (picked.length >= needed) break;
        }

        console.log(`  -> selected=${picked.length}`);
        patch[moduleId] = { items: picked };
    }

    const content = `window.KIDSPEDIA_REAL_PATCH = ${toJsLiteral(patch)};
(function () {
    const root = window.KIDSPEDIA_DATA;
    const patch = window.KIDSPEDIA_REAL_PATCH;
    if (!root || !Array.isArray(root.modules) || !patch) return;

    root.modules.forEach((module) => {
        const m = patch[module.id];
        if (!m || !Array.isArray(m.items) || !m.items.length) return;
        const seen = new Set((module.items || []).flatMap((item) => [
            (item.wiki || "").toLowerCase(),
            (item.en || "").toLowerCase(),
            (item.zh || "").toLowerCase()
        ]).filter(Boolean));
        const next = module.items || [];
        m.items.forEach((item) => {
            const keys = [(item.wiki || "").toLowerCase(), (item.en || "").toLowerCase(), (item.zh || "").toLowerCase()].filter(Boolean);
            if (keys.some((k) => seen.has(k))) return;
            keys.forEach((k) => seen.add(k));
            next.push(item);
        });
        module.items = next;
    });
})();
`;

    fs.writeFileSync(outPath, content, "utf8");
    console.log(`generated: ${outPath}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
