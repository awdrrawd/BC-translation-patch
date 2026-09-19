// Fetch data only. Never execute upstream scripts or overwrite project translations.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { repoRoot } from "./lib/upstream.js";

const url = "https://github.com/awdrrawd/Bondage-College-Mirror.git";
const branch = "bondageclub";
const checkout = path.join(repoRoot, ".upstream", "repository");
fs.mkdirSync(checkout, { recursive: true });
const git = (args, input) => execFileSync("git", ["-c", `safe.directory=${checkout.replaceAll("\\", "/")}`,
    "-C", checkout, ...args], {
    encoding: "utf8", timeout: 300000, maxBuffer: 10 * 1024 * 1024,
    stdio: ["pipe", "pipe", "inherit"], input,
});

if (!fs.existsSync(path.join(checkout, ".git"))) {
    if (fs.readdirSync(checkout).length) throw new Error(`抓取目錄不是空目錄：${checkout}`);
    git(["init"]);
    git(["remote", "add", "origin", url]);
} else {
    if (git(["remote", "get-url", "origin"]).trim() !== url) {
        throw new Error("上游快取的 origin 不符，請使用另一個目錄保存自訂 checkout。");
    }
    if (git(["status", "--porcelain"]).trim()) {
        throw new Error("上游快取有本機修改，請先保存修改後再更新。");
    }
}

// Sparse checkout avoids images/audio; partial clone downloads only selected blobs.
git(["config", "remote.origin.promisor", "true"]);
git(["config", "remote.origin.partialclonefilter", "blob:none"]);
git(["sparse-checkout", "init", "--no-cone"]);
git(["sparse-checkout", "set", "--no-cone", "--stdin"],
    "*.csv\n*.txt\n/Scripts/Translation.js\n/BondageClub/Scripts/Translation.js\n");
console.log(`抓取 ${url} (${branch})…`);
git(["fetch", "--depth=1", "--filter=blob:none", "origin", branch]);
git(["checkout", "--detach", "FETCH_HEAD"]);
const game = [checkout, path.join(checkout, "BondageClub")]
    .find(dir => fs.existsSync(path.join(dir, "Scripts", "Translation.js")));
if (!game) throw new Error("抓取結果缺少 Scripts/Translation.js，無法作為翻譯來源。");
const commit = git(["rev-parse", "HEAD"]).trim();
fs.writeFileSync(path.join(repoRoot, ".upstream", "source.json"), JSON.stringify({
    repository: url, branch, commit, fetchedAt: new Date().toISOString(),
    directory: path.relative(repoRoot, game).split(path.sep).join("/"),
}, null, 2) + "\n");
console.log(`已取得文本：${game}\ncommit: ${commit}\n可執行 npm run diff；更新官方 CN 鏡像則執行 npm run seed。`);
