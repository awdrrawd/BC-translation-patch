// Static display candidates only; upstream code is read, never executed.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { repoRoot } from "./lib/upstream.js";
import { walk } from "./lib/fsutil.js";
import { translateBcplusText } from "../src/mods/bcplus.js";

const root = path.resolve(process.env.BCPLUS_SRC || path.join(repoRoot, ".upstream/bcplus/src"));
if (!fs.existsSync(root)) throw new Error("BC+ source missing; run npm run upstream:bcplus first.");
const entries = new Map();
const dynamicCandidates = [];
const normalize = text => text.replace(/\s+/g, " ").trim();
function add(text, file) {
    const key = normalize(text);
    if (!/[A-Za-z]/.test(key) || key.includes("{{") || key.includes("}}") || key.includes("${") || key.includes('class="')) return;
    if (["BC+", "ID", "/bcp help"].includes(key)) return; // product names and commands stay unchanged
    if (!entries.has(key)) entries.set(key, new Set());
    entries.get(key).add(path.relative(root, file).replaceAll("\\", "/"));
}
for (const file of walk(root, f => /\.(ts|vue)$/.test(f))) {
    const source = fs.readFileSync(file, "utf8");
    // Statically concatenated strings in display metadata, including long tooltips.
    const literal = '"(?:[^"\\\\\r\n]|\\\\.)*"';
    const properties = new RegExp(`\\b(?:label|hoverText|HoverText|description|Description|MenuString|category|blurb|title|placeholder|setting)\\s*:\\s*(${literal}(?:\\s*\\+\\s*${literal})*)`, "g");
    for (const match of source.matchAll(properties)) {
        try { add([...match[1].matchAll(new RegExp(literal, "g"))].map(m => JSON.parse(m[0])).join(""), file); }
        catch { /* Non-JSON escapes are left for manual review. */ }
    }
    if (file.includes(`${path.sep}rules${path.sep}`) || file.endsWith("CommandTypes.ts")) {
        for (const match of source.matchAll(/^\s*name:\s*("(?:[^"\\\r\n]|\\.)*")/gm)) {
            const name = JSON.parse(match[1]);
            if (/^[A-Z]/.test(name)) add(name, file);
        }
        const argument = `${literal}(?:\\s*\\+\\s*${literal})*`;
        const factory = new RegExp(`\\b\\w+Rule\\(\\s*${literal}\\s*,\\s*(${argument})\\s*,\\s*(${argument})`, "g");
        for (const match of source.matchAll(factory)) for (const group of [match[1], match[2]]) {
            add([...group.matchAll(new RegExp(literal, "g"))].map(m => JSON.parse(m[0])).join(""), file);
        }
    }
    for (const match of source.matchAll(/\boptions:\s*\[([^\]]+)\]/g)) {
        for (const text of match[1].matchAll(new RegExp(literal, "g"))) add(JSON.parse(text[0]), file);
    }
    if (file.endsWith(".vue")) {
        const template = source.slice(source.indexOf("<template>"))
            .replace(/<!--[\s\S]*?-->/g, "");
        for (const match of template.matchAll(/>([^<>]+)</g)) {
            add(match[1].replaceAll("&amp;", "&").replaceAll("&middot;", "·"), file);
        }
        for (const match of template.matchAll(/(?<![:\w-])(?:title|placeholder|aria-label)="([^"{}]+)"/g)) add(match[1], file);
        for (const match of template.matchAll(/\{\{([\s\S]*?)\}\}/g)) {
            dynamicCandidates.push({ expression: normalize(match[1]), file: path.relative(root, file).replaceAll("\\", "/"), review: "Must verify rendered composition, not only component literals" });
            for (const literalMatch of match[1].matchAll(new RegExp(`${literal}(?:\\s*\\+\\s*${literal})*`, "g"))) {
                const text = [...literalMatch[0].matchAll(new RegExp(literal, "g"))].map(part => JSON.parse(part[0])).join("");
                if (/^[A-Z(]/.test(text.trim())) add(text, file);
            }
        }
    }
    if (file.endsWith("ContractTypes.ts") || file.endsWith("MemberSelect.ts")) {
        for (const match of source.matchAll(new RegExp(literal, "g"))) {
            const text = JSON.parse(match[0]);
            if (/^[A-Za-z][A-Za-z ]+$/.test(text) && text.includes(" ")) add(text, file);
        }
    }
    for (const match of source.matchAll(/`([^`]*\$\{[^`]+)`/g)) {
        if (/[A-Z][a-z]+ /.test(match[1])) dynamicCandidates.push({ expression: normalize(match[1]), file: path.relative(root, file).replaceAll("\\", "/"), review: "Template requires rendered fixture" });
    }
}
const dictionary = JSON.parse(fs.readFileSync(path.join(repoRoot, "translations/mods/bcplus/ui.json"), "utf8"));
const candidates = [...entries].sort(([a], [b]) => a.localeCompare(b)).map(([text, files]) => ({ text, files: [...files], translated: Object.hasOwn(dictionary, text) || translateBcplusText(text, { CN: { bcplus: dictionary } }, "CN") !== text }));
const commit = execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const report = { commit, note: "Not UI coverage. Dynamic expressions are listed separately and require rendered fixtures; dictionary hits alone do not prove a display surface is handled.", candidates, dynamicCandidates };
fs.mkdirSync(path.join(repoRoot, "reports"), { recursive: true });
fs.writeFileSync(path.join(repoRoot, "reports/bcplus-coverage.json"), JSON.stringify(report, null, 2) + "\n");
console.log(`BC+ static candidates: ${candidates.length}; translated: ${candidates.filter(x => x.translated).length}; missing: ${candidates.filter(x => !x.translated).length}`);
