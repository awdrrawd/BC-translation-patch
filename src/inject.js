import { PATHS } from "./data.js";

// 把翻譯按「原始檔路徑」餵回遊戲自己的翻譯管線：
//   1. 預先塞進 TranslationCache[路徑]（遊戲會優先用快取，不再去抓官方檔）。
//   2. hook TranslationAvailable，讓遊戲對我們有的路徑回報「可翻譯」。
// 之後畫面文字(CSV)、對話、物品/部位描述都由遊戲原生的 TranslationString 分檔查用，
// 作用域天然正確，不會有全域字典的英文撞名污染。

const KEYS = Object.keys(PATHS);
const KEYSET_UPPER = new Set(KEYS.map((k) => k.toUpperCase()));

/** @param {any} mod bcModSdk 註冊回傳的物件 */
export function setupInjection(mod) {
    // 1) 注入快取（覆寫：我方內容為官方超集，需勝過官方）
    const cache = (/** @type {any} */ (globalThis).TranslationCache =
        /** @type {any} */ (globalThis).TranslationCache || {});
    for (const k of KEYS) cache[k] = PATHS[k];

    // 2) 讓 TranslationAvailable 對我方路徑回 true
    mod.hookFunction("TranslationAvailable", 0, (args, next) => {
        const p = args[0];
        if (typeof p === "string" && KEYSET_UPPER.has(p.trim().toUpperCase())) return true;
        return next(args);
    });

    return { count: KEYS.length };
}
