// 從 BCX 指定原始檔抽出 UI 字串（name/description/longDescription/shortDescription/helpDescription）。
// 扣掉 bcx.txt 已翻的，輸出待翻清單。
import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "./lib/upstream.js";
import { ensureDir } from "./lib/fsutil.js";
import { parseTxtPairs } from "./lib/parseTxt.js";

const BCX_SRC = process.env.BCX_SRC || path.resolve(repoRoot, "..", "BCJS", "bondage-club-extended-master", "src");
const files = [
    "rules/bc_blocks.ts",
    "rules/speech_control.ts",
    "commands/command_definitions.ts",
];
const FIELDS = /(?:name|shortDescription|description|longDescription|helpDescription):\s*"((?:[^"\\]|\\.)*)"/g;

const done = new Set();
const bcxTxt = path.join(repoRoot, "translations", "mods", "bcx.txt");
if (fs.existsSync(bcxTxt)) for (const [en] of parseTxtPairs(fs.readFileSync(bcxTxt, "utf8"))) done.add(en.trim());

const set = new Set();
for (const rel of files) {
    const f = path.join(BCX_SRC, rel);
    if (!fs.existsSync(f)) {
        console.warn("找不到", rel);
        continue;
    }
    const src = fs.readFileSync(f, "utf8");
    let m;
    while ((m = FIELDS.exec(src))) {
        const s = m[1].replace(/\\"/g, '"').replace(/\\n/g, " ").trim();
        if (s && /[A-Za-z]/.test(s) && !done.has(s)) set.add(s);
    }
}
const arr = [...set];
const out = path.join(repoRoot, "reports", "bcx-rules.txt");
ensureDir(out);
fs.writeFileSync(out, arr.join("\n"));
console.log("BCX 規則/指令 待翻:", arr.length, "→", path.relative(repoRoot, out));
