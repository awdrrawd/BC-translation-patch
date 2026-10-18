// 從官方 BC 原始碼把現有的 CN 翻譯檔複製進 translations/cn/，
// 作為翻譯的起始基礎（官方 CN 覆蓋率高，直接站在它肩膀上）。
// 檔名去掉 _CN 後綴：Screens/.../Text_Cell_CN.txt -> translations/cn/Screens/.../Text_Cell.txt
import fs from "node:fs";
import path from "node:path";
import { upstreamDir, repoRoot } from "./lib/upstream.js";
import { walk, ensureDir } from "./lib/fsutil.js";
import { parseTxtPairs } from "./lib/parseTxt.js";
import { parseCsv } from "./diff-upstream.js";

const src = upstreamDir();
const trRoot = path.join(repoRoot, "translations");
const dstRoot = path.join(trRoot, "cn");

// 1) 複製官方 CN 檔到 translations/cn/（去掉 _CN 後綴）
const files = walk(src, (f) => f.endsWith("_CN.txt"));
let copied = 0;
for (const file of files) {
    const rel = path.relative(src, file).split(path.sep).join("/");
    const target = path.join(dstRoot, rel.replace(/_CN\.txt$/, ".txt"));
    ensureDir(target);
    let body = fs.readFileSync(file, "utf8");
    const csv = file.replace(/_CN\.txt$/, ".csv");
    if (!/\/Dialog_/.test(rel) && fs.existsSync(csv)) {
        const rows = parseCsv(fs.readFileSync(csv, "utf8"));
        if (rows.every(row => row.length === 2)) {
            const keys = new Map(rows);
            const english = new Set(rows.map(([, value]) => value.trim()));
            const pairs = parseTxtPairs(body);
            // Detect identifier-based files; retain the English maintenance format.
            if (pairs.filter(([key]) => keys.has(key)).length > pairs.filter(([key]) => english.has(key)).length) {
                const normalized = new Map(pairs.map(([key, value]) => [(keys.get(key) || key).trim(), value]));
                body = [...normalized].map(([key, value]) => `${key}\n${value}`).join("\n") + "\n";
            }
        }
    }
    const header = `### seeded from upstream: ${rel}\n### 此檔由 scripts/seed-from-upstream.js 產生；補充請放 cn-extra\n`;
    fs.writeFileSync(target, header + body, "utf8");
    copied++;
}

// 2) 產生 manifest：official-tw.json = [ 官方已有 _TW.txt 的基底路徑 ]
//    （讓建置知道哪些檔官方已有手工繁中，不要用機翻覆蓋）
const officialTW = walk(src, (f) => f.endsWith("_TW.txt"))
    .map((f) => path.relative(src, f).split(path.sep).join("/").replace(/_TW\.txt$/, ""))
    .sort();
fs.writeFileSync(path.join(trRoot, "official-tw.json"), JSON.stringify(officialTW, null, 1) + "\n", "utf8");

console.log(`已從官方 CN 種入 ${copied} 個檔案到 translations/cn/`);
console.log(`已產生 manifest：official-tw.json（${officialTW.length}）`);
console.log(`來源：${src}`);
