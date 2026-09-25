import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { repoRoot } from "./lib/upstream.js";

const repository = "https://github.com/awdrrawd/Bondage-College-Mirror.git";
const branch = "bcplus";
const directory = path.join(repoRoot, ".upstream/bcplus");
const git = args => execFileSync("git", ["-C", directory, ...args], { encoding: "utf8", timeout: 300000 });
if (!fs.existsSync(directory)) {
    fs.mkdirSync(path.dirname(directory), { recursive: true });
    execFileSync("git", ["clone", "--depth=1", "--single-branch", "--branch", branch, repository, directory], { stdio: "inherit", timeout: 300000 });
} else {
    if (git(["remote", "get-url", "origin"]).trim() !== repository) throw new Error("Unexpected BC+ origin");
    if (git(["status", "--porcelain"]).trim()) throw new Error("BC+ checkout has local edits; preserve them before fetching");
    git(["fetch", "--depth=1", "origin", branch]);
    git(["checkout", "--detach", "FETCH_HEAD"]);
}
if (!fs.existsSync(path.join(directory, "src/ui/Shell.ts"))) throw new Error("BC+ UI source missing");
const commit = git(["rev-parse", "HEAD"]).trim();
fs.writeFileSync(path.join(repoRoot, ".upstream/bcplus-source.json"), JSON.stringify({ repository, branch, commit, fetchedAt: new Date().toISOString() }, null, 2) + "\n");
console.log(`BC+ mirror: ${commit}`);
