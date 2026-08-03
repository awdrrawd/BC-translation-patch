import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(import.meta.url), "../../..");

/**
 * 找出官方 Bondage Club 原始碼目錄（用來 seed CN 與做 upstream diff）。
 * 優先順序：
 *   1. 環境變數 BC_UPSTREAM_DIR
 *   2. repo 內的 .upstream/BondageClub（CI clone 到這）
 *   3. 本機開發預設：../BCJS/Bondage-College-master/BondageClub
 * @returns {string}
 */
export function upstreamDir() {
    const candidates = [
        process.env.BC_UPSTREAM_DIR,
        path.join(repoRoot, ".upstream", "BondageClub"),
        path.resolve(repoRoot, "..", "BCJS", "Bondage-College-master", "BondageClub"),
    ].filter(Boolean);

    for (const c of candidates) {
        if (c && fs.existsSync(path.join(c, "Scripts", "Translation.js"))) return c;
    }
    throw new Error(
        "找不到官方 Bondage Club 原始碼。請設定環境變數 BC_UPSTREAM_DIR 指向 BondageClub 目錄，\n" +
        "或將其 clone 到 .upstream/BondageClub。\n已嘗試：\n  " + candidates.join("\n  ")
    );
}

export { repoRoot };
