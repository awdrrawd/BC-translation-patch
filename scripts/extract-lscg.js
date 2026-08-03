// 從 LSCG activities.ts 抽出動作名與訊息模板（name/label/TargetAction/TargetSelfAction/SelfAction）。
import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "./lib/upstream.js";
import { ensureDir } from "./lib/fsutil.js";

const SRC = process.env.LSCG_SRC || path.resolve(repoRoot, "..", "BCJS", "LSCG-main", "src");
const file = path.join(SRC, "Modules", "activities.ts");
const src = fs.readFileSync(file, "utf8");

const set = new Set();
const re = /(?:name|label|TargetAction|TargetSelfAction|SelfAction|tooltipText):\s*"((?:[^"\\]|\\.)+)"/g;
let m;
while ((m = re.exec(src))) {
    const s = m[1].replace(/\\"/g, '"');
    if (/[A-Za-z]/.test(s)) set.add(s);
}
const arr = [...set].sort();
const out = path.join(repoRoot, "reports", "lscg-activities.txt");
ensureDir(out);
fs.writeFileSync(out, arr.join("\n"));
console.log("LSCG 動作字串:", arr.length, "→", path.relative(repoRoot, out));
