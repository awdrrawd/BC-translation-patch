// 產生外掛用的翻譯資料 src/generated/dict.json
//
// 完全依賴 repo 內檔案，**不需要 clone 官方原始碼**：
//   - translations/cn/**/*.txt          翻譯來源（鏡像官方路徑）
//   - translations/official-cn.json      官方 CN 內容指紋，判斷某檔是否被你改過
//   - translations/official-tw.json      官方已有 _TW.txt 的路徑，避免覆蓋官方手工繁中
//   （manifest 由 `npm run seed` 產生並提交）
//
// 策略（分檔、分作用域，避免全域字典的英文撞名污染）：
//   - CN：只在「官方沒有此檔」或「你改過（指紋不符）」時輸出覆寫；未改動的檔交給官方，避免過期。
//   - TW：只在「官方沒有此 _TW.txt」時輸出，值由 CN 逐行 OpenCC(s2twp) 轉換 + tw-terms/tw-overrides。
//   - 輸出為遊戲 TranslationParseTXT 的攤平陣列：[en0, zh0, en1, zh1, ...]。
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import * as OpenCC from "opencc-js";
import { repoRoot } from "./lib/upstream.js";
import { walk } from "./lib/fsutil.js";
import { parseTxtPairs } from "./lib/parseTxt.js";

const trRoot = path.join(repoRoot, "translations");
const cnRoot = path.join(trRoot, "cn");

function readJsonOptional(file, fallback) {
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback;
}
function readPairsFile(file) {
    return fs.existsSync(file) ? parseTxtPairs(fs.readFileSync(file, "utf8")) : [];
}
function pairsHash(pairs) {
    return crypto.createHash("sha1").update(JSON.stringify(pairs)).digest("hex");
}
/** [[en,zh]] -> [en,zh,en,zh,...] */
function flat(pairs) {
    const arr = [];
    for (const [en, zh] of pairs) arr.push(en, zh);
    return arr;
}

export function generateDict() {
    const officialCN = readJsonOptional(path.join(trRoot, "official-cn.json"), null); // { base: hash } | null
    const officialTW = new Set(readJsonOptional(path.join(trRoot, "official-tw.json"), [])); // Set<base>
    const hasManifest = officialCN !== null;
    if (!hasManifest) {
        console.warn("[gen] 找不到 official-cn.json，降級為輸出全部 CN/TW（可能覆蓋官方翻譯）。請先跑 `npm run seed`。");
    }

    const converter = OpenCC.Converter({ from: "cn", to: "twp" });
    const terms = readJsonOptional(path.join(trRoot, "tw-terms.json"), {});
    const termEntries = Object.entries(terms);
    const applyTerms = (s) => {
        for (const [from, to] of termEntries) s = s.split(from).join(to);
        return s;
    };
    const overrideMap = new Map(readPairsFile(path.join(trRoot, "tw-overrides.txt")).map(([en, tw]) => [en.trim(), tw]));

    /** @type {Record<string, string[]>} 路徑 -> 攤平陣列 */
    const paths = {};
    /** @type {Record<string, string>} 供 diff 用的整體 CN 英文->中文 */
    const cnMap = {};
    let cnFiles = 0;
    let twFiles = 0;

    for (const file of walk(cnRoot, (f) => f.endsWith(".txt"))) {
        const rel = path.relative(cnRoot, file).split(path.sep).join("/");
        const base = rel.replace(/\.txt$/, "");
        const ourPairs = parseTxtPairs(fs.readFileSync(file, "utf8"));

        for (const [en, zh] of ourPairs) {
            const k = en.trim();
            if (k && zh && cnMap[k] === undefined) cnMap[k] = zh;
        }

        // CN：官方沒有、或指紋不符（=被你改過）才輸出覆寫
        const untouched = hasManifest && officialCN[base] !== undefined && officialCN[base] === pairsHash(ourPairs);
        if (!untouched) {
            paths[base + "_CN.txt"] = flat(ourPairs);
            cnFiles++;
        }

        // TW：官方沒有 _TW.txt 才輸出（不蓋官方手工繁中）
        const officialHasTW = hasManifest && officialTW.has(base);
        if (!officialHasTW) {
            const twPairs = ourPairs.map(([en, zh]) => {
                const k = en.trim();
                if (overrideMap.has(k)) return [en, overrideMap.get(k)];
                return [en, applyTerms(converter(zh))];
            });
            paths[base + "_TW.txt"] = flat(twPairs);
            twFiles++;
        }
    }

    return { paths, cnMap, stats: { cnFiles, twFiles, manifest: hasManifest } };
}

// 允許 `npm run gen` 直接執行
if (process.argv[1]?.endsWith("gen-dict.js")) {
    const { paths, stats } = generateDict();
    const out = path.join(repoRoot, "src", "generated", "dict.json");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify({ paths }), "utf8");
    console.log(`已產生字典：CN 覆寫 ${stats.cnFiles} 檔、TW 補充 ${stats.twFiles} 檔（路徑鍵 ${Object.keys(paths).length}，manifest：${stats.manifest ? "是" : "否"}）`);
}
