import { PATHS } from "./data.js";
import { dictionaryRevision } from "./dictionary.js";

// 把翻譯按「原始檔路徑」餵回遊戲自己的翻譯管線：
//   1. 預先塞進 TranslationCache[路徑]（遊戲會優先用快取，不再去抓官方檔）。
//   2. hook TranslationAvailable，讓遊戲對我們有的路徑回報「可翻譯」。
// 之後畫面文字(CSV)、對話、物品/部位描述都由遊戲原生的 TranslationString 分檔查用，
// 作用域天然正確，不會有全域字典的英文撞名污染。

// 注入快取（覆寫：我方內容為官方超集，需勝過官方）。
// 字庫背景下載完成後先注入，再初始化 SDK/hooks。
// 遊戲可能已用官方資料完成翻譯；setupReapply 會依原始 CSV 補正既有資產及畫面快取。
export function injectTranslationCache() {
    const KEYS = Object.keys(PATHS);
    const cache = (/** @type {any} */ (globalThis).TranslationCache =
        /** @type {any} */ (globalThis).TranslationCache || {});
    for (const k of KEYS) cache[k] = PATHS[k];
    return { count: KEYS.length };
}

/** 讓 TranslationAvailable 對我方路徑回 true（需 bcModSdk，故在載入後才掛）。 */
export function setupInjection(mod) {
    let revision = -1, keys = new Set();
    mod.hookFunction("TranslationAvailable", 0, (args, next) => {
        const p = args[0];
        if (dictionaryRevision !== revision) {
            keys = new Set(Object.keys(PATHS).map(key => key.toUpperCase()));
            revision = dictionaryRevision;
        }
        if (typeof p === "string" && keys.has(p.trim().toUpperCase())) return true;
        return next(args);
    });
}
