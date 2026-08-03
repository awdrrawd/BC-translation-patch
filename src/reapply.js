import { activeLang } from "./lang.js";

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
}
