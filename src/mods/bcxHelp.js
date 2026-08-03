import { activeLang } from "../lang.js";
import GEN from "../generated/dict.json";

// BCX 匯出/匯入等說明是塞進 textarea.value（程式賦值，不觸發 MutationObserver）。
// 用定時輪詢：值完全等於某已知說明時替換成中文。值固定、無 PLAYER_NAME，精確比對安全；
// 使用者匯出/匯入後 value 變成代碼→不再匹配，不受影響。
const HELP = /** @type {any} */ (GEN).bcxHelp || { CN: {}, TW: {} };

export function setupBcxHelp() {
    if (!Object.keys(HELP.CN || {}).length) return;
    setInterval(() => {
        const lang = activeLang();
        const map = lang && HELP[lang];
        if (!map) return;
        for (const ta of document.querySelectorAll("textarea")) {
            const t = map[ta.value];
            if (t) ta.value = t;
        }
    }, 1000);
}
