// 產生外掛用的翻譯資料 src/generated/dict.json
//
// 完全依賴 repo 內檔案，**不需要 clone 官方原始碼**。分層設計：
//   - translations/cn/**/*.txt         官方 CN 鏡像（由 `npm run seed` 覆蓋生成，勿手改）
//   - translations/cn-extra/**/*.txt    你的補充/覆寫（seed 不會動它，手改都放這）
//   - translations/official-tw.json      官方已有 _TW.txt 的路徑（避免覆蓋官方手工繁中）
//
// 合併規則（分檔、分作用域，避免全域字典英文撞名污染）：
//   - 每個路徑：merged = 官方 cn 基底 + cn-extra 疊加（同英文則 extra 覆寫，新英文則追加）。
//   - CN：只在「有 cn-extra 補充」或「官方根本沒有此檔」時輸出覆寫；否則交給官方（不會過期）。
//   - TW：官方沒有 _TW.txt、或你有補充時輸出，值由 merged 逐行 OpenCC(s2twp) 轉換 + tw-terms/overrides。
//   - 輸出為遊戲 TranslationParseTXT 的攤平陣列：[en0, zh0, en1, zh1, ...]。
import fs from "node:fs";
import path from "node:path";
import * as OpenCC from "opencc-js";
import { repoRoot } from "./lib/upstream.js";
import { walk } from "./lib/fsutil.js";
import { parseTxtPairs } from "./lib/parseTxt.js";

const trRoot = path.join(repoRoot, "translations");
const cnRoot = path.join(trRoot, "cn");
const cnExtraRoot = path.join(trRoot, "cn-extra");

function readJsonOptional(file, fallback) {
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback;
}
function readPairsFile(file) {
    return fs.existsSync(file) ? parseTxtPairs(fs.readFileSync(file, "utf8")) : [];
}
/** [[en,zh]] -> [en,zh,en,zh,...] */
function flat(pairs) {
    const arr = [];
    for (const [en, zh] of pairs) arr.push(en, zh);
    return arr;
}
/** 以 base 為底，套上 extra：同英文覆寫、新英文追加，保留順序 */
function mergePairs(base, extra) {
    const out = base.map(([en, zh]) => [en, zh]);
    const idx = new Map();
    out.forEach(([en], i) => {
        const k = en.trim();
        if (!idx.has(k)) idx.set(k, i);
    });
    for (const [en, zh] of extra) {
        const k = en.trim();
        if (idx.has(k)) out[idx.get(k)][1] = zh;
        else {
            idx.set(k, out.length);
            out.push([en, zh]);
        }
    }
    return out;
}

// 這些「資料/名稱」檔即使官方有 TW 也用完整的 CN 轉出來覆蓋：
// 官方 TW 常是舊快照、缺新道具/動作，官方 CN 較完整。
const TW_FORCE_PREFIXES = [
    "Assets/Female3DCG/", // Female3DCG, AssetStrings, LayerNames, ColorGroups
    "Screens/Character/Preference/ActivityDictionary",
    "Screens/Interface",
];
const twForced = (base) => TW_FORCE_PREFIXES.some((p) => base === p || base.startsWith(p));

export function generateDict() {
    const officialTW = new Set(readJsonOptional(path.join(trRoot, "official-tw.json"), []));

    const converter = OpenCC.Converter({ from: "cn", to: "twp" });
    const terms = readJsonOptional(path.join(trRoot, "tw-terms.json"), {});
    const termEntries = Object.entries(terms);
    const applyTerms = (s) => {
        for (const [from, to] of termEntries) s = s.split(from).join(to);
        return s;
    };
    const overrideMap = new Map(readPairsFile(path.join(trRoot, "tw-overrides.txt")).map(([en, tw]) => [en.trim(), tw]));

    // 收集所有路徑的 base / extra 配對
    /** @type {Map<string, { base: [string,string][], extra: [string,string][] }>} */
    const bases = new Map();
    for (const file of walk(cnRoot, (f) => f.endsWith(".txt"))) {
        const base = path.relative(cnRoot, file).split(path.sep).join("/").replace(/\.txt$/, "");
        bases.set(base, { base: parseTxtPairs(fs.readFileSync(file, "utf8")), extra: [] });
    }
    for (const file of walk(cnExtraRoot, (f) => f.endsWith(".txt"))) {
        const base = path.relative(cnExtraRoot, file).split(path.sep).join("/").replace(/\.txt$/, "");
        const e = bases.get(base) || { base: [], extra: [] };
        e.extra = parseTxtPairs(fs.readFileSync(file, "utf8"));
        bases.set(base, e);
    }

    /** @type {Record<string, string[]>} */
    const paths = {};
    /** @type {Record<string, string>} */
    const cnMap = {};
    // 動作字典（英文→中文），供 runtime hook ActivityDictionaryText 用，繞過時序
    const activity = { CN: /** @type {Record<string,string>} */ ({}), TW: /** @type {Record<string,string>} */ ({}) };
    const assetName = { CN: /** @type {Record<string,string>} */ ({}), TW: /** @type {Record<string,string>} */ ({}) };
    let cnFiles = 0;
    let twFiles = 0;

    for (const [base, { base: basePairs, extra: extraPairs }] of bases) {
        const merged = extraPairs.length ? mergePairs(basePairs, extraPairs) : basePairs;
        if (!merged.length) continue;

        for (const [en, zh] of merged) {
            const k = en.trim();
            if (k && zh && cnMap[k] === undefined) cnMap[k] = zh;
        }

        if (base === "Screens/Character/Preference/ActivityDictionary") {
            for (const [en, zh] of merged) {
                const k = en.trim();
                if (k && zh) {
                    activity.CN[k] = zh;
                    activity.TW[k] = overrideMap.has(k) ? overrideMap.get(k) : applyTerms(converter(zh));
                }
            }
        }

        // 道具/部位名（Female3DCG 描述）→ 供 DOM observer 在 dialog-inventory 顯示時翻
        if (base === "Assets/Female3DCG/Female3DCG") {
            for (const [en, zh] of merged) {
                const k = en.trim();
                if (k && zh) {
                    assetName.CN[k] = zh;
                    assetName.TW[k] = overrideMap.has(k) ? overrideMap.get(k) : applyTerms(converter(zh));
                }
            }
        }

        const hasExtra = extraPairs.length > 0;
        const officialHasBase = basePairs.length > 0; // 官方 cn 鏡像有此檔

        // CN：有補充、或官方沒有此檔 → 輸出覆寫；否則交給官方
        if (hasExtra || !officialHasBase) {
            paths[base + "_CN.txt"] = flat(merged);
            cnFiles++;
        }

        // TW：官方沒有 _TW.txt、有補充、或屬於需強制完整覆蓋的資料檔 → 輸出（轉換）
        if (!officialTW.has(base) || hasExtra || twForced(base)) {
            const twPairs = merged.map(([en, zh]) => {
                const k = en.trim();
                if (overrideMap.has(k)) return [en, overrideMap.get(k)];
                return [en, applyTerms(converter(zh))];
            });
            paths[base + "_TW.txt"] = flat(twPairs);
            twFiles++;
        }
    }

    // BCX / LSCG 補充字典（translations/mods/*.txt，英文→中文），TW 由 OpenCC 轉
    const modMenu = { CN: /** @type {Record<string,string>} */ ({}), TW: /** @type {Record<string,string>} */ ({}) };
    for (const f of walk(path.join(trRoot, "mods"), (p) => p.endsWith(".txt"))) {
        for (const [en, zh] of parseTxtPairs(fs.readFileSync(f, "utf8"))) {
            const k = en.trim();
            if (k && zh) {
                modMenu.CN[k] = zh;
                modMenu.TW[k] = overrideMap.has(k) ? overrideMap.get(k) : applyTerms(converter(zh));
            }
        }
    }

    return { paths, cnMap, activity, assetName, modMenu, stats: { cnFiles, twFiles, mod: Object.keys(modMenu.CN).length } };
}

// 允許 `npm run gen` 直接執行
if (process.argv[1]?.endsWith("gen-dict.js")) {
    const { paths, stats } = generateDict();
    const out = path.join(repoRoot, "src", "generated", "dict.json");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify({ paths }), "utf8");
    console.log(`已產生字典：CN 覆寫 ${stats.cnFiles} 檔、TW 補充 ${stats.twFiles} 檔（路徑鍵 ${Object.keys(paths).length}）`);
}
