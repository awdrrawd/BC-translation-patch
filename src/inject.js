import { PATHS } from "./data.js";

// 把翻譯按「原始檔路徑」餵回遊戲自己的翻譯管線：
//   1. 預先塞進 TranslationCache[路徑]（遊戲會優先用快取，不再去抓官方檔）。
//   2. hook TranslationAvailable，讓遊戲對我們有的路徑回報「可翻譯」。
// 之後畫面文字(CSV)、對話、物品/部位描述都由遊戲原生的 TranslationString 分檔查用，
// 作用域天然正確，不會有全域字典的英文撞名污染。

const KEYS = Object.keys(PATHS);
const KEYSET_UPPER = new Set(KEYS.map((k) => k.toUpperCase()));

// 注入快取（覆寫：我方內容為官方超集，需勝過官方）。
// ⚠️ 必須在載入 bcModSdk（有 await 網路延遲）之前同步呼叫：TranslationAsset() 在資產載入時
// 只讀一次 TranslationCache[路徑]，讀不到就去抓官方檔並就地翻譯，且不會再重來（見 reapply.js）。
// 若晚於 TranslationAsset 才注入，道具/服裝描述會停在官方版（缺 cn-extra 新增字）→ 顯示英文。
// TranslationCache 是 Translation.js 頂層 `var`（解析期就存在），document-end 注入必定安全。
export function injectTranslationCache() {
    const cache = (/** @type {any} */ (globalThis).TranslationCache =
        /** @type {any} */ (globalThis).TranslationCache || {});
    for (const k of KEYS) cache[k] = PATHS[k];
    return { count: KEYS.length };
}

/** 讓 TranslationAvailable 對我方路徑回 true（需 bcModSdk，故在載入後才掛）。 */
export function setupInjection(mod) {
    mod.hookFunction("TranslationAvailable", 0, (args, next) => {
        const p = args[0];
        if (typeof p === "string" && KEYSET_UPPER.has(p.trim().toUpperCase())) return true;
        return next(args);
    });
}
