// Run after build: prove the independent gen CLI produces the same artifact.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { repoRoot } from "./lib/upstream.js";

const file = path.join(repoRoot, "src/generated/dict.json");
const built = JSON.parse(fs.readFileSync(file, "utf8"));
execFileSync(process.execPath, [path.join(repoRoot, "scripts/gen-dict.js")], { cwd: repoRoot, stdio: "inherit" });
assert.deepEqual(JSON.parse(fs.readFileSync(file, "utf8")), built);
console.log("gen/build artifact parity passed");
