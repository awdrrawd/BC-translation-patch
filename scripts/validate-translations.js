import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { repoRoot } from "./lib/upstream.js";
import { walk } from "./lib/fsutil.js";

// Recognized machine tokens only: prose and command examples are not placeholders.
export const tokens = text => (text.match(/\b(?:PLAYER_NAME|HELP_DESCRIPTION|SourceCharacter|DestinationCharacterName|DestinationCharacter|TargetCharacter|(?:Source|Target)?Pronoun(?:Possessive|Subject|Object|Self)|ActivityAsset|ActivityGroup|FocusAssetGroup|AssetName|SourceName|SourceNumber|TargetName|TargetNumber|OptionOdds|ActionOdds|ActionRNG|ItemDesc|TIMEREMAINING)\b|\{\w+\}|\$\w+\$/g) || []).sort();

export function inspectText(content, file) {
    const rows = content.replace(/\r\n/g, "\n").split("\n")
        .map((text, i) => ({ text: text.trim(), line: i + 1, comment: text.startsWith("###") }))
        .filter(row => !row.comment);
    while (rows.length && !rows.at(-1).text) rows.pop();
    const issues = [], seen = new Set();
    const add = (code, row, source, target = "") => issues.push({ file, code, line: row.line, source, target });
    if (rows.length % 2) add("unpaired-line", rows.at(-1), rows.at(-1).text);
    for (let i = 0; i + 1 < rows.length; i += 2) {
        const a = rows[i], b = rows[i + 1];
        if (!a.text || !b.text) add("empty-pair", a, a.text, b.text);
        if (seen.has(a.text)) add("duplicate-key", a, a.text, b.text);
        seen.add(a.text);
        if (JSON.stringify(tokens(a.text)) !== JSON.stringify(tokens(b.text))) add("token-mismatch", a, a.text, b.text);
    }
    return issues;
}

export function fingerprint({ file, code, source, target }) {
    return createHash("sha256").update(JSON.stringify([file, code, source, target])).digest("hex");
}

function main() {
    const issues = walk(path.join(repoRoot, "translations"), f => f.endsWith(".txt")).flatMap(file =>
        inspectText(fs.readFileSync(file, "utf8"), path.relative(repoRoot, file).split(path.sep).join("/")));
    const baselinePath = path.join(repoRoot, "scripts/translation-quality-baseline.json");
    if (process.argv.includes("--write-baseline")) {
        if (process.env.CI) throw new Error("Baseline updates must be reviewed locally, never in CI");
        fs.writeFileSync(baselinePath, JSON.stringify({ description: "Existing issues only; review changes before accepting new exceptions.", issues: issues.map(issue => ({ ...issue, id: fingerprint(issue) })) }, null, 2) + "\n");
        console.log(`Recorded ${issues.length} existing issues for review.`);
        return;
    }
    const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
    // Multiset: repeating an existing bad entry must still fail.
    const known = new Map();
    for (const issue of baseline.issues) known.set(issue.id, (known.get(issue.id) || 0) + 1);
    const fresh = issues.filter(issue => {
        const id = fingerprint(issue), count = known.get(id) || 0;
        if (!count) return true;
        known.set(id, count - 1);
        return false;
    });
    fs.mkdirSync(path.join(repoRoot, "reports"), { recursive: true });
    fs.writeFileSync(path.join(repoRoot, "reports/translation-quality.json"), JSON.stringify({ existing: issues.length - fresh.length, newIssues: fresh, allIssues: issues }, null, 2));
    console.log(`Translation quality: ${fresh.length} new issues; ${issues.length - fresh.length} known issues (not fixed or hidden).`);
    for (const issue of fresh.slice(0, 30)) console.error(`${issue.file}:${issue.line} ${issue.code}: ${issue.source}`);
    if (fresh.length) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
