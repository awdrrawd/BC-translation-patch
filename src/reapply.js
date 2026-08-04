import { activeLang } from "./lang.js";

/* global TextAllScreenCache */

// 動作字典與道具描述是在遊戲啟動時就烤進快取的，那時我們還沒注入。
// 注入後強制重跑一次，讓它們吃到我們的翻譯（繞過時序問題）。
export function reapply() {
    if (!activeLang()) return;
    const g = /** @type {any} */ (globalThis);

    // 重建動作字典（TextCache）。buildCache 從英文 CSV 重跑，冪等安全。
    // 注意：不要重跑 TranslationAsset —— 它就地翻譯，二次呼叫會把已翻的中文
    //       用 findIndex 反查成下一個英文詞（腐化回英文）。道具描述交給官方啟動時處理。
    try {
        const c = g.ActivityDictionaryLoad?.();
        c?.buildCache?.();
    } catch (e) {
        console.debug("[BCTP] 動作字典重建失敗", e);
    }

    // 螢幕文字快取（Interface / InformationSheet 等）在第一次建置時就記憶化，之後只在語言
    // 切換時才自更新（Text.js getOptional）。瀏覽器上我們早於遊戲注入所以沒事；Electron 載入
    // 較晚（page-loaded 才注入腳本），常在我們注入前就把英文/官方文字烤進 cache，導致 year(s)、
    // On trial by 等維持英文。這裡強制重建所有已載入的螢幕快取，讓它們吃到注入的 TranslationCache，
    // 使結果與載入時序無關。buildCache 從 CSV 快取重跑翻譯，冪等安全。
    try {
        if (typeof TextAllScreenCache !== "undefined") {
            TextAllScreenCache.forEach((c) => c?.buildCache?.());
        }
    } catch (e) {
        console.debug("[BCTP] 螢幕文字快取重建失敗", e);
    }
}
