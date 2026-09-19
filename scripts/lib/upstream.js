import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(import.meta.url), "../../..");

/**
 * 找出官方 Bondage Club 原始碼目錄（用來 seed CN 與做 upstream diff）。
 * 優先順序：
 *   1. 環境變數 BC_UPSTREAM_DIR
 *   2. npm run upstream:fetch 的已驗證 checkout
 *   3. repo 內的 .upstream/BondageClub（手動 clone）
 *   4. 本機開發預設：../BCJS/Bondage-College-master/BondageClub
 * @returns {string}
 */
export function upstreamDir() {
    // An explicit path must never silently fall back to a different source.
    if (process.env.BC_UPSTREAM_DIR) {
        const dir = path.resolve(process.env.BC_UPSTREAM_DIR);
        if (!fs.existsSync(path.join(dir, "Scripts", "Translation.js"))) {
            throw new Error(`BC_UPSTREAM_DIR 缺少 Scripts/Translation.js：${dir}`);
        }
        return dir;
    }
    const sourceFile = path.join(repoRoot, ".upstream", "source.json");
    if (fs.existsSync(sourceFile)) {
        const source = JSON.parse(fs.readFileSync(sourceFile, "utf8"));
        const dir = path.resolve(repoRoot, source.directory);
        if (!fs.existsSync(path.join(dir, "Scripts", "Translation.js"))) {
            throw new Error("已抓取的上游目錄不完整，請重新執行 npm run upstream:fetch。");
        }
        return dir;
    }
    const candidates = [
        path.join(repoRoot, ".upstream", "BondageClub"),
        path.resolve(repoRoot, "..", "BCJS", "Bondage-College-master", "BondageClub"),
    ].filter(Boolean);

    for (const c of candidates) {
        if (c && fs.existsSync(path.join(c, "Scripts", "Translation.js"))) return c;
    }
    throw new Error(
        "找不到官方 Bondage Club 原始碼。請設定環境變數 BC_UPSTREAM_DIR 指向 BondageClub 目錄，\n" +
        "或執行 npm run upstream:fetch 抓取文本。\n已嘗試：\n  " + candidates.join("\n  ")
    );
}

export { repoRoot };
