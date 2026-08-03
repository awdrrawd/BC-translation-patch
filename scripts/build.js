// 建置流程：
//   1. 產生字典 src/generated/dict.json
//   2. esbuild 打包 src/index.js -> dist/<bundle>.js（IIFE，載入頁面即執行）
//   3. 產生 Tampermonkey 載入器 dist/<loader>.user.js（指向 Pages 上的 bundle）
import fs from "node:fs";
import path from "node:path";
import esbuild from "esbuild";
import { repoRoot } from "./lib/upstream.js";
import { ensureDir } from "./lib/fsutil.js";
import { generateDict } from "./gen-dict.js";

const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
const cfg = pkg.bctp;
const distDir = path.join(repoRoot, "dist");

// 1) 字典
const { paths, activity, stats } = generateDict();
const dictOut = path.join(repoRoot, "src", "generated", "dict.json");
ensureDir(dictOut);
fs.writeFileSync(dictOut, JSON.stringify({ paths, activity }), "utf8");
console.log(`字典：CN 覆寫 ${stats.cnFiles} 檔、TW 補充 ${stats.twFiles} 檔（路徑鍵 ${Object.keys(paths).length}）`);

// 2) 打包
ensureDir(path.join(distDir, "x"));
await esbuild.build({
    entryPoints: [path.join(repoRoot, "src", "index.js")],
    outfile: path.join(distDir, cfg.bundleName),
    bundle: true,
    format: "iife",
    target: "es2020",
    charset: "utf8",
    legalComments: "none",
    define: {
        __BCTP_VERSION__: JSON.stringify(pkg.version),
        __BCTP_NAME__: JSON.stringify(cfg.modName),
        __BCTP_FULLNAME__: JSON.stringify(cfg.modFullName),
        __BCTP_REPO__: JSON.stringify(cfg.repository),
    },
    banner: {
        js: `/* ${cfg.modFullName} v${pkg.version} | ${cfg.repository} | build ${new Date().toISOString()} */`,
    },
});
console.log(`已打包：dist/${cfg.bundleName}`);

// 3) Tampermonkey 載入器
const bundleUrl = cfg.pagesBaseUrl + cfg.bundleName;
const loaderUrl = cfg.pagesBaseUrl + cfg.loaderName;
const loader = `// ==UserScript==
// @name         ${cfg.modFullName}
// @name:zh-TW   ${cfg.modFullName}
// @namespace    ${cfg.repository}
// @version      ${pkg.version}
// @description  Bondage Club 補完翻譯（簡中/繁中），補上官方尚未翻譯的字串
// @author       ${pkg.author}
// @match        https://bondageprojects.elementfx.com/*
// @match        https://www.bondageprojects.elementfx.com/*
// @match        https://bondage-europe.com/*
// @match        https://www.bondage-europe.com/*
// @run-at       document-end
// @grant        none
// @downloadURL  ${loaderUrl}
// @updateURL    ${loaderUrl}
// ==/UserScript==

(function () {
    "use strict";
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.src = ${JSON.stringify(bundleUrl)} + "?t=" + Date.now();
    s.onload = function () { s.remove(); };
    document.head.appendChild(s);
})();
`;
// 同時輸出到 dist（供 Pages）與 repo 根目錄（方便在 repo 直接看到/連結）
fs.writeFileSync(path.join(distDir, cfg.loaderName), loader, "utf8");
fs.writeFileSync(path.join(repoRoot, cfg.loaderName), loader, "utf8");
console.log(`已產生載入器：dist/${cfg.loaderName} 與根目錄 ${cfg.loaderName}`);
