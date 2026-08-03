// 產生外掛用的翻譯資料 src/generated/dict.json
//
// 策略（分檔、分作用域，避免全域字典的英文撞名污染）：
//   - 以 translations/cn/**/*.txt 為來源，鏡像官方檔案路徑。
//   - 對每個檔案的「基底路徑」P（例如 Screens/Room/Cell/Text_Cell）：
//       * CN：只在「官方沒有此 _CN.txt」或「我們的內容和官方不同（=有補充）」時才輸出，
//              作為 P_CN.txt 覆寫，餵回遊戲管線。
//       * TW：只在「官方沒有此 _TW.txt」時才輸出（不覆蓋官方手工繁中），
//              值以 OpenCC(s2twp) 由 CN 逐行轉換，再套 tw-terms / tw-overrides。
//   - 輸出格式為遊戲 TranslationParseTXT 的攤平陣列：[en0, zh0, en1, zh1, ...]，
//     直接塞進 TranslationCache[路徑] 即可被 TranslationString 分檔查用。
import fs from "node:fs";
import path from "node:path";
import * as OpenCC from "opencc-js";
import { repoRoot } from "./lib/upstream.js";
import { walk } from "./lib/fsutil.js";
import { parseTxtPairs } from "./lib/parseTxt.js";

const trRoot = path.join(repoRoot, "translations");
const cnRoot = path.join(trRoot, "cn");

// 取得官方原始碼目錄；取不到則降級為輸出全部 CN/TW
let UPSTREAM = null;
try {
    const mod = await import("./lib/upstream.js");
    UPSTREAM = mod.upstreamDir();
} catch (e) {
    console.warn("[gen] 找不到官方原始碼，降級為輸出全部 CN/TW（可能覆蓋官方翻譯）。原因：" + e.message);
}

/** [[en,zh]] -> [en,zh,en,zh,...] */
function flat(pairs) {
    const arr = [];
    for (const [en, zh] of pairs) arr.push(en, zh);
    return arr;
}

/** 比較兩組 pairs 是否完全相同 */
function samePairs(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i][0] !== b[i][0] || a[i][1] !== b[i][1]) return false;
    }
    return true;
}

function readPairsFile(file) {
    return fs.existsSync(file) ? parseTxtPairs(fs.readFileSync(file, "utf8")) : null;
}

function readJsonOptional(file, fallback) {
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback;
}

export function generateDict() {
    const converter = OpenCC.Converter({ from: "cn", to: "twp" });

    const terms = readJsonOptional(path.join(trRoot, "tw-terms.json"), {});
    const termEntries = Object.entries(terms);
    const applyTerms = (s) => {
        for (const [from, to] of termEntries) s = s.split(from).join(to);
        return s;
    };
    const overridePairs = readPairsFile(path.join(trRoot, "tw-overrides.txt")) || [];
    const overrideMap = new Map(overridePairs.map(([en, tw]) => [en.trim(), tw]));

    /** @type {Record<string, string[]>} 路徑 -> 攤平陣列 */
    const paths = {};
    // 供 diff 用的整體 CN 英文->中文（分檔攤平、首個優先）
    /** @type {Record<string, string>} */
    const cnMap = {};

    let cnFiles = 0;
    let twFiles = 0;

    for (const file of walk(cnRoot, (f) => f.endsWith(".txt"))) {
        const rel = path.relative(cnRoot, file).split(path.sep).join("/");
        const base = rel.replace(/\.txt$/, ""); // 例如 Screens/Room/Cell/Text_Cell
        const ourPairs = parseTxtPairs(fs.readFileSync(file, "utf8"));

        for (const [en, zh] of ourPairs) {
            const k = en.trim();
            if (k && zh && cnMap[k] === undefined) cnMap[k] = zh;
        }

        // ---- CN：只輸出補充/新增的檔 ----
        const upCN = UPSTREAM ? readPairsFile(path.join(UPSTREAM, base + "_CN.txt")) : null;
        if (!UPSTREAM || upCN === null || !samePairs(ourPairs, upCN)) {
            paths[base + "_CN.txt"] = flat(ourPairs);
            cnFiles++;
        }

        // ---- TW：只在官方沒有 _TW.txt 時輸出（不覆蓋官方手工繁中）----
        const upTWexists = UPSTREAM ? fs.existsSync(path.join(UPSTREAM, base + "_TW.txt")) : false;
        if (!upTWexists) {
            const twPairs = ourPairs.map(([en, zh]) => {
                const k = en.trim();
                if (overrideMap.has(k)) return [en, overrideMap.get(k)];
                return [en, applyTerms(converter(zh))];
            });
            paths[base + "_TW.txt"] = flat(twPairs);
            twFiles++;
        }
    }

    return { paths, cnMap, stats: { cnFiles, twFiles, upstream: !!UPSTREAM } };
}

// 允許 `npm run gen` 直接執行
if (process.argv[1]?.endsWith("gen-dict.js")) {
    const { paths, stats } = generateDict();
    const out = path.join(repoRoot, "src", "generated", "dict.json");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify({ paths }), "utf8");
    console.log(`已產生字典：CN 覆寫 ${stats.cnFiles} 檔、TW 補充 ${stats.twFiles} 檔（路徑鍵 ${Object.keys(paths).length}）`);
    console.log(`upstream 感知：${stats.upstream ? "是" : "否（降級全輸出）"}`);
}
