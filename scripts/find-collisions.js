import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "./lib/upstream.js";
import { walk } from "./lib/fsutil.js";
import { parseTxtPairs } from "./lib/parseTxt.js";

const trRoot = path.join(repoRoot, "translations");
const cnRoot = path.join(trRoot, "cn");

/** @type {Map<string, Map<string,string[]>>} */
const seen = new Map(); // en -> Map(zh -> [files])

for (const file of walk(cnRoot, (f) => f.endsWith(".txt"))) {
    const base = path.relative(cnRoot, file).split(path.sep).join("/").replace(/\.txt$/, "");
    if (base.includes("KinkyDungeon")) continue;
    const pairs = parseTxtPairs(fs.readFileSync(file, "utf8"));
    for (const [en, zh] of pairs) {
        const k = en.trim();
        if (!k || !zh) continue;
        if (k.length > 50) continue; // matches "base" dict length filter used for DOM lookups
        if (!seen.has(k)) seen.set(k, new Map());
        const m = seen.get(k);
        if (!m.has(zh)) m.set(zh, []);
        m.get(zh).push(base);
    }
}

let count = 0;
for (const [en, variants] of seen) {
    if (variants.size > 1) {
        count++;
        if (count <= 40) {
            console.log(`EN: "${en}"`);
            for (const [zh, files] of variants) {
                console.log(`   -> "${zh}"   [${files.slice(0, 3).join(", ")}${files.length > 3 ? ` +${files.length - 3} more` : ""}]`);
            }
        }
    }
}
console.log(`\nTotal ambiguous keys (<=50 chars, appear with >1 distinct translation): ${count}`);