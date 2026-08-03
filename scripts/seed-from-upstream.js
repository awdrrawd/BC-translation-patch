// 從官方 BC 原始碼把現有的 CN 翻譯檔複製進 translations/cn/，
// 作為翻譯的起始基礎（官方 CN 覆蓋率高，直接站在它肩膀上）。
// 檔名去掉 _CN 後綴：Screens/.../Text_Cell_CN.txt -> translations/cn/Screens/.../Text_Cell.txt
import fs from "node:fs";
import path from "node:path";
import { upstreamDir, repoRoot } from "./lib/upstream.js";
import { walk, ensureDir } from "./lib/fsutil.js";

const src = upstreamDir();
const dstRoot = path.join(repoRoot, "translations", "cn");

const files = walk(src, (f) => f.endsWith("_CN.txt"));
let copied = 0;

for (const file of files) {
    const rel = path.relative(src, file).split(path.sep).join("/");
    const target = path.join(dstRoot, rel.replace(/_CN\.txt$/, ".txt"));
    ensureDir(target);
    // 加一行來源註記在檔首（### 會被解析器忽略），方便日後追蹤
    const body = fs.readFileSync(file, "utf8");
    const header = `### seeded from upstream: ${rel}\n### 此檔由 scripts/seed-from-upstream.js 產生，可直接編輯補充缺漏行\n`;
    fs.writeFileSync(target, header + body, "utf8");
    copied++;
}

console.log(`已從官方 CN 種入 ${copied} 個檔案到 translations/cn/`);
console.log(`來源：${src}`);
