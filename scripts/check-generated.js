import { runtimeDictionary } from "./gen-dict.js";
// Run after build: prove the independent gen CLI produces the same artifact.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { repoRoot } from "./lib/upstream.js";

const file = path.join(repoRoot, "src/generated/dict.json");
const built = JSON.parse(fs.readFileSync(file, "utf8"));
execFileSync(process.execPath, [path.join(repoRoot, "scripts/gen-dict.js")], { cwd: repoRoot, stdio: "inherit" });
assert.deepEqual(JSON.parse(fs.readFileSync(file, "utf8")), built);
const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
const entry = fs.readFileSync(path.join(repoRoot, "dist", pkg.bctp.bundleName), "utf8");
for (const language of ["CN", "TW"]) {
    const text = JSON.stringify(runtimeDictionary(built, language));
    const name = `translations-${language}-${createHash("sha256").update(text).digest("hex").slice(0, 16)}.json`;
    assert.equal(fs.readFileSync(path.join(repoRoot, "dist", name), "utf8"), text);
    assert.ok(entry.includes(new URL(name, pkg.bctp.pagesBaseUrl).href), "entry must reference language data");
}
assert.ok(Buffer.byteLength(entry) < 500000, "dictionary must remain outside the entry bundle");
console.log("gen/build artifact parity passed");
