// 對比官方最新英文原文 vs 我們的 CN 字典，列出「官方會顯示、但我們沒翻」的字串。
// 用來追蹤官方新增內容 → 只翻譯增量。
// 掃描官方 Text_*.csv / Interface.csv 的英文值（CSV 第 2 欄）。
import fs from "node:fs";
import path from "node:path";
import { upstreamDir, repoRoot } from "./lib/upstream.js";
import { walk, ensureDir } from "./lib/fsutil.js";
import { generateDict } from "./gen-dict.js";

/** 極簡 CSV 解析（BC 用逗號分隔、值可含引號），只取每行前兩欄 */
function parseCsvKeyValue(text) {
    /** @type {[string, string][]} */
    const rows = [];
    for (const raw of text.replace(/\r\n/g, "\n").split("\n")) {
        if (!raw) continue;
        // 支援簡單的引號包裹
        const cells = [];
        let cur = "", inQ = false;
        for (let i = 0; i < raw.length; i++) {
            const ch = raw[i];
            if (inQ) {
                if (ch === '"' && raw[i + 1] === '"') { cur += '"'; i++; }
                else if (ch === '"') inQ = false;
                else cur += ch;
            } else if (ch === '"') inQ = true;
            else if (ch === ",") { cells.push(cur); cur = ""; if (cells.length >= 2) { /* 已取夠 */ } }
            else cur += ch;
        }
        cells.push(cur);
        if (cells.length >= 2) rows.push([cells[0], cells[1]]);
    }
    return rows;
}

const src = upstreamDir();
const { cnMap } = generateDict();
const have = new Set(Object.keys(cnMap));

const csvFiles = walk(src, (f) => /(?:Text_[^/\\]+|Interface)\.csv$/.test(f.split(path.sep).join("/")));

/** @type {{file: string, missing: string[]}[]} */
const report = [];
let totalMissing = 0;
const seen = new Set();

for (const file of csvFiles) {
    const rel = path.relative(src, file).split(path.sep).join("/");
    const rows = parseCsvKeyValue(fs.readFileSync(file, "utf8"));
    const missing = [];
    for (const [, en] of rows) {
        const key = (en || "").trim();
        if (!key || !/[A-Za-z]/.test(key)) continue;
        if (have.has(key)) continue;
        if (seen.has(key)) continue; // 跨檔去重
        seen.add(key);
        missing.push(key);
    }
    if (missing.length) {
        report.push({ file: rel, missing });
        totalMissing += missing.length;
    }
}

report.sort((a, b) => b.missing.length - a.missing.length);

console.log(`官方 CSV 檔：${csvFiles.length}`);
console.log(`未翻譯字串（去重後）：${totalMissing}`);
console.log("");
console.log("=== 缺口最多的前 25 個檔案 ===");
for (const { file, missing } of report.slice(0, 25)) {
    console.log(`  ${missing.length.toString().padStart(4)}  ${file}`);
}

// 輸出完整報告
const outDir = path.join(repoRoot, "reports");
const outFile = path.join(outDir, "missing-cn.md");
ensureDir(outFile);
let md = `# 未翻譯字串報告\n\n產生時間：${new Date().toISOString()}\n\n` +
    `官方 CSV 檔：${csvFiles.length}，未翻譯字串（去重）：**${totalMissing}**\n\n`;
for (const { file, missing } of report) {
    md += `## ${file} （${missing.length}）\n\n`;
    for (const m of missing) md += `- ${JSON.stringify(m)}\n`;
    md += "\n";
}
fs.writeFileSync(outFile, md, "utf8");
console.log(`\n完整報告：${path.relative(repoRoot, outFile)}`);
