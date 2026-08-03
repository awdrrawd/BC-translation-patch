import fs from "node:fs";
import path from "node:path";

/**
 * 遞迴列出目錄下所有符合副檔名的檔案（絕對路徑）。
 * @param {string} dir
 * @param {(file: string) => boolean} [filter]
 * @returns {string[]}
 */
export function walk(dir, filter = () => true) {
    /** @type {string[]} */
    const out = [];
    if (!fs.existsSync(dir)) return out;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) out.push(...walk(full, filter));
        else if (filter(full)) out.push(full);
    }
    return out;
}

/**
 * 確保檔案的父目錄存在。
 * @param {string} file
 */
export function ensureDir(file) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
}
