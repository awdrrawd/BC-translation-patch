import { activeLang } from "./lang.js";

// 動作字典與道具描述是在遊戲啟動時就烤進快取的，那時我們還沒注入。
// 注入後強制重跑一次，讓它們吃到我們的翻譯（繞過時序問題）。
export function reapply() {
    if (!activeLang()) return;
    const g = /** @type {any} */ (globalThis);

    // 重建動作字典（TextCache）
    try {
        const c = g.ActivityDictionaryLoad?.();
        c?.buildCache?.();
    } catch (e) {
        console.debug("[BCTP] 動作字典重建失敗", e);
    }

    // 重新套用道具/部位描述翻譯（只填補仍是英文的，不動已翻的）
    try {
        g.TranslationAsset?.("Female3DCG");
    } catch (e) {
        console.debug("[BCTP] 道具描述重譯失敗", e);
    }
}
