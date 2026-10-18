// Save data only; regular builds do not require network or an upstream checkout.
import fs from "node:fs";
import path from "node:path";
import { upstreamDir, repoRoot } from "./lib/upstream.js";
import { walk } from "./lib/fsutil.js";
import { parseCsv } from "./diff-upstream.js";

const source = upstreamDir();
const files = {};
for (const file of walk(source, f => f.endsWith(".csv")).sort()) {
    const base = path.relative(source, file).split(path.sep).join("/").replace(/\.csv$/, "");
    if (base.includes("KinkyDungeon") || /\/Dialog_/.test(base)) continue;
    const rows = parseCsv(fs.readFileSync(file, "utf8"));
    if (rows.length && rows.every(row => row.length === 2)) files[base] = rows;
}
fs.writeFileSync(path.join(repoRoot, "translations/text-keys.json"), JSON.stringify(files, null, 2) + "\n");
console.log(`Saved CSV identifiers for ${Object.keys(files).length} scopes`);
