// 從 BCX / LSCG 原始碼抽取 UI 字串候選，扣掉 ECHO 已翻的，產出待翻清單。
// 來源目錄可用環境變數覆蓋：BCX_SRC / LSCG_SRC，預設抓 BCJS 旁邊的 repo。
import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "./lib/upstream.js";
import { walk, ensureDir } from "./lib/fsutil.js";

const BCX_SRC = process.env.BCX_SRC || path.resolve(repoRoot, "..", "BCJS", "bondage-club-extended-master", "src");
const LSCG_SRC = process.env.LSCG_SRC || path.resolve(repoRoot, "..", "BCJS", "LSCG-main", "src");

// 大寫開頭、含空白、看起來像 UI 句子的雙/單引號字面值
const RE = /["']([A-Z][A-Za-z0-9]+(?:[ ,.:!?'"()/&%-]+[A-Za-z0-9]+)+[ .:!?'"()%-]*)["']/g;

function extract(dir) {
    const set = new Set();
    for (const f of walk(dir, (p) => /\.tsx?$/.test(p) && !p.endsWith(".d.ts"))) {
        const txt = fs.readFileSync(f, "utf8");
        let m;
        while ((m = RE.exec(txt))) {
            const s = m[1].trim();
            // 濾掉明顯非 UI：純大寫常數、含底線/路徑/類名、程式碼片段
            if (/^[A-Z0-9 _]+$/.test(s)) continue;
            if (/[_/\\]|\.(ts|js|png|json|csv)\b/.test(s)) continue;
            if (/["`]|=>|\?\.|\bthis\.|\(\)|;/.test(s)) continue; // 拼接/程式碼片段
            if (s.length < 4) continue;
            set.add(s);
        }
    }
    return [...set].sort();
}

// 載入 ECHO 字典（需要 stub 幾個全域）
globalThis.CurrentScreen = "InformationSheet";
globalThis.BCX_Loaded = true;
globalThis.Player = { LSCG: true };
globalThis.TranslationLanguage = "CN";
const { BCX } = await import("../src/mods/bc/BCX/index.js");
const { LSCG } = await import("../src/mods/bc/LSCG/index.js");
const { supplement } = await import("../src/mods/supplement.js");

function echoHas(s) {
    if (supplement.menu[s]) return true;
    return !!(BCX.translateMenuText?.(s) || LSCG.translateMenuText?.(s));
}

function report(name, dir) {
    if (!fs.existsSync(dir)) {
        console.warn(`[extract] 找不到 ${name} 原始碼：${dir}（設 ${name.toUpperCase()}_SRC 覆蓋）`);
        return { total: 0, missing: [] };
    }
    const all = extract(dir);
    const missing = all.filter((s) => !echoHas(s));
    return { total: all.length, missing };
}

const bcx = report("BCX", BCX_SRC);
const lscg = report("LSCG", LSCG_SRC);

console.log(`BCX  候選 ${bcx.total}，ECHO 未翻 ${bcx.missing.length}`);
console.log(`LSCG 候選 ${lscg.total}，ECHO 未翻 ${lscg.missing.length}`);

const out = path.join(repoRoot, "reports", "missing-mods.md");
ensureDir(out);
let md = `# BCX / LSCG 待翻清單\n\n產生時間：${new Date().toISOString()}\n\n`;
for (const [n, r] of [["BCX", bcx], ["LSCG", lscg]]) {
    md += `## ${n} （${r.missing.length}）\n\n`;
    for (const s of r.missing) md += `- ${JSON.stringify(s)}\n`;
    md += "\n";
}
fs.writeFileSync(out, md, "utf8");
console.log(`清單：${path.relative(repoRoot, out)}`);
