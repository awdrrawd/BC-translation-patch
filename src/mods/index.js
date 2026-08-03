import { activeLang } from "../lang.js";
import GEN from "../generated/dict.json";
import { BCX } from "./bc/BCX/index.js";
import { LSCG } from "./bc/LSCG/index.js";
import { BCXHelp } from "./html/BCX.js";
import { ChatHistoryTranslator } from "./html/utils/chatObserver.js";
import { supplement } from "./supplement.js";
import { setupDomObserver } from "./domObserver.js";

// BCX / LSCG 翻譯層（字典移植自 Echo 的动作拓展 https://github.com/SugarChain-Studio/echo-activity-ext ）。
// 這些 mod 自己畫 HTML/canvas，不走遊戲 CSV 管線，所以用 hook + observer 攔截。
const units = [BCX, LSCG];

// 收集畫面上翻不到的英文（官方缺口 + ECHO 沒收錄的 mod 字串），供 BCTP.missing() 匯出。
const missing = new Set();
export function getMissing() {
    return [...missing].sort();
}

// 我們補譯的 BCX/LSCG 字典（translations/mods/*.txt），優先於 ECHO
const MOD = /** @type {any} */ (GEN).modMenu || { CN: {}, TW: {} };

function tryMenu(key) {
    if (supplement.menu[key]) return supplement.menu[key];
    const lang = activeLang();
    const m = lang && MOD[lang] && MOD[lang][key];
    if (m) return m;
    for (const u of units) {
        const t = u.translateMenuText?.(key);
        if (t) return t;
    }
    return undefined;
}

// 完整的 base 動作字典（英文→中文），繞過時序直接在存取時翻譯動作名/訊息
const ACT = /** @type {any} */ (GEN).activity || { CN: {}, TW: {} };

function tryActivity(key) {
    if (supplement.activity[key]) return supplement.activity[key];
    const lang = activeLang();
    const base = lang && ACT[lang] && ACT[lang][key];
    if (base) return base;
    for (const u of units) {
        const t = u.translateActivityText?.(key);
        if (t) return t;
    }
    return undefined;
}

/** @param {any} mod bcModSdk 註冊物件 */
export function setupMods(mod) {
    const on = () => !!activeLang();

    for (const fn of ["DrawText", "DrawTextFit", "DrawTextWrap", "DynamicDrawText"]) {
        mod.hookFunction(fn, 10, (args, next) => {
            if (on() && typeof args[0] === "string") {
                const t = tryMenu(args[0]);
                if (t) args[0] = t;
                else if (/[A-Za-z]/.test(args[0])) missing.add(args[0].trim());
            }
            return next(args);
        });
    }

    mod.hookFunction("ActivityDictionaryText", 1, (args, next) => {
        let r = next(args);
        if (on() && typeof r === "string") {
            const t = tryActivity(r);
            if (t) r = t;
        }
        return r;
    });

    // BCX 在聊天記錄輸出的 HTML 說明
    ChatHistoryTranslator.registerTranslationFunc((src) => supplement.html[src] || BCXHelp(src));

    // dialog-inventory(DOM) 的道具/動作名
    setupDomObserver();
}
