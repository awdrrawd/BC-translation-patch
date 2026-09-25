import { activeLang } from "../lang.js";
import GEN from "../dictionary.js";
import { translateValue } from "./displayText.js";

// BCX 匯出/匯入等說明是塞進 textarea.value（程式賦值，不觸發 MutationObserver）。
// 用定時輪詢：值完全等於某已知說明時替換成中文。值固定、無 PLAYER_NAME，精確比對安全；
// 使用者匯出/匯入後 value 變成代碼→不再匹配，不受影響。
const HELP = /** @type {any} */ (GEN).bcxHelp || { CN: {}, TW: {} };

export function setupBcxHelp(addCleanup) {
    const active = new Set();
    const timer = setInterval(() => {
        if (document.hidden) return;
        if (!globalThis.BCX_Loaded || globalThis.CurrentScreen !== "InformationSheet") {
            for (const ta of active) translateValue(ta, "value", () => undefined);
            active.clear();
            return;
        }
        const lang = activeLang();
        const map = lang && HELP[lang];
        if (!map) {
            for (const ta of active) translateValue(ta, "value", () => undefined);
            active.clear();
            return;
        }
        for (const ta of active) if (!ta.isConnected) active.delete(ta);
        for (const ta of document.querySelectorAll("textarea")) {
            const before = ta.value;
            translateValue(ta, "value", text => map?.[text]);
            if (before !== ta.value) active.add(ta);
        }
    }, 1000);
    addCleanup(() => clearInterval(timer));
}
