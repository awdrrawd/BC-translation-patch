// 按遊戲實際翻譯作用域比對；預設只檢查連線及共用介面。
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { upstreamDir, repoRoot } from "./lib/upstream.js";
import { walk, ensureDir } from "./lib/fsutil.js";
import { parseTxtPairs } from "./lib/parseTxt.js";
import { generateDict } from "./gen-dict.js";

export function parseCsv(text) {
    text = text.replace(/\r\n/g, "\n").trim();
    const rows = [];
    let row = [], cell = "", quoted = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === '"') {
            if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
            else quoted = !quoted;
        } else if (!quoted && (ch === "," || ch === "\n")) {
            row.push(cell.replace(/\r$/, "")); cell = "";
            if (ch === "\n") { rows.push(row); row = []; }
        } else cell += ch;
    }
    if (cell || row.length) { row.push(cell.replace(/\r$/, "")); rows.push(row); }
    return rows;
}

export function isOnlineCsv(rel) {
    return /^(Assets\/Female3DCG\/|Backgrounds\/|Screens\/(Online\/|Character\/|Interface\.csv|Room\/Crafting\/))/.test(rel);
}

export function missingStrings(base, rows, have) {
    const strings = rows.flatMap(row => /\/Dialog_[^/]+$/.test(base) ? row.slice(2, 4) : [row[base === "Assets/Female3DCG/Female3DCG" ? 2 : 1]]);
    return [...new Set(strings.map(s => (s || "").trim()).filter(s => /[A-Za-z]/.test(s) && !have.get(s)))];
}

function main() {
    const src = upstreamDir();
    const all = process.argv.includes("--all");
    const tw = process.argv.includes("--tw");
    const lang = tw ? "tw" : "cn";
    const generated = tw ? generateDict().paths : {};
    const report = [];
    let scanned = 0;
    for (const file of walk(src, f => f.endsWith(".csv"))) {
        const rel = path.relative(src, file).split(path.sep).join("/");
        const online = isOnlineCsv(rel);
        if (!all && !online) continue;
        if (rel.includes("KinkyDungeon")) continue;
        const base = rel.replace(/\.csv$/, "");
        const have = new Map();
        if (tw) {
            const flat = generated[base + "_TW.txt"];
            const official = path.join(src, base + "_TW.txt");
            if (flat) {
                for (let i = 0; i < flat.length; i += 2) have.set(flat[i], flat[i + 1]);
            } else if (fs.existsSync(official)) {
                for (const [en, zh] of parseTxtPairs(fs.readFileSync(official, "utf8"))) have.set(en, zh);
            }
        } else {
            for (const root of ["cn", "cn-extra"]) {
                const tr = path.join(repoRoot, "translations", root, base + ".txt");
                if (fs.existsSync(tr)) for (const [en, zh] of parseTxtPairs(fs.readFileSync(tr, "utf8"))) have.set(en, zh);
            }
        }
        const rows = parseCsv(fs.readFileSync(file, "utf8"));
        const missing = missingStrings(base, rows, have);
        scanned++;
        if (missing.length) report.push({ file: rel, missing });
    }
    report.sort((a, b) => b.missing.length - a.missing.length || a.file.localeCompare(b.file));
    const total = report.reduce((n, r) => n + r.missing.length, 0);
    const out = path.join(repoRoot, `reports/missing-${lang}.md`);
    ensureDir(out);
    fs.writeFileSync(out, `# 未翻譯字串報告\n\n範圍：${all ? "全部（不含 KinkyDungeon）" : "連線、角色、道具、背景、製作及共用介面"}\n來源：${src}\n掃描 ${scanned} 個 CSV；缺少 ${total} 條（各檔案內去重）。\n\n` + report.map(r => `## ${r.file} （${r.missing.length}）\n\n${r.missing.map(s => `- ${JSON.stringify(s)}`).join("\n")}\n`).join("\n"));
    fs.writeFileSync(path.join(repoRoot, `reports/missing-${lang}.json`), JSON.stringify(report, null, 2) + "\n");
    console.log(`${lang.toUpperCase()}：掃描 ${scanned} 個 CSV；缺少 ${total} 條。`);
    for (const r of report) console.log(`${r.missing.length.toString().padStart(5)}  ${r.file}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
