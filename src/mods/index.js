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

function lookupMenu(key) {
    if (supplement.menu[key]) return supplement.menu[key];
    const lang = activeLang();
    if (lang && MOD[lang] && MOD[lang][key]) return MOD[lang][key];
    for (const u of units) {
        const t = u.translateMenuText?.(key);
        if (t) return t;
    }
    return undefined;
}

function tryMenu(key) {
    const direct = lookupMenu(key);
    if (direct) return direct;
    // BCX 把「名稱 (副標)」合併成一句畫出（rules_add.ts）；拆開分別翻再合併
    const combo = key.match(/^(.+?) \((.+)\)$/);
    if (combo) {
        const a = lookupMenu(combo[1]);
        const b = lookupMenu(combo[2]);
        if (a && b) return `${a}（${b}）`;
    }
    return undefined;
}

// 完整的 base 動作字典 / 道具名字典（英文→中文），繞過時序直接在存取時翻譯
const ACT = /** @type {any} */ (GEN).activity || { CN: {}, TW: {} };
const ASSET = /** @type {any} */ (GEN).assetName || { CN: {}, TW: {} };

function tryActivity(key) {
    if (supplement.activity[key]) return supplement.activity[key];
    const lang = activeLang();
    if (lang) {
        if (ACT[lang] && ACT[lang][key]) return ACT[lang][key]; // base 動作字典
        if (MOD[lang] && MOD[lang][key]) return MOD[lang][key]; // LSCG/BCX 動作模板(lscg.txt 等)
    }
    for (const u of units) {
        const t = u.translateActivityText?.(key);
        if (t) return t;
    }
    return undefined;
}

// DOM 選單用的統一翻譯：完整 base 字典(道具/動作/快捷鍵/所有 CSV) → mod
const BASE = /** @type {any} */ (GEN).base || { CN: {}, TW: {} };
function translateAny(key) {
    const lang = activeLang();
    if (lang && BASE[lang] && BASE[lang][key]) return BASE[lang][key];
    return tryMenu(key) || tryActivity(key);
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

    // 動作/動作訊息在聊天室：翻 Dictionary 裡的英文模板（替換名字前），涵蓋 base 與 LSCG/mod
    mod.hookFunction("ChatRoomMessage", 0, (args, next) => {
        const data = args[0];
        if (on() && data && ["Action", "Activity"].includes(data.Type) && data.Content && Array.isArray(data.Dictionary)) {
            const tag = data.Type === "Activity"
                ? `MISSING ACTIVITY DESCRIPTION FOR KEYWORD ${data.Content}`
                : data.Content === "Beep" ? "msg" : `MISSING TEXT IN "Interface.csv": ${data.Content}`;
            const target = data.Dictionary.find((it) => it && it.Tag === tag);
            if (target && typeof target.Text === "string") {
                const t = tryActivity(target.Text);
                if (t) target.Text = t;
            }
        }
        return next(args);
    });

    // 本地訊息（部分 mod 的提示/動作）
    mod.hookFunction("ChatRoomSendLocal", 0, (args, next) => {
        if (on() && typeof args[0] === "string") {
            const t = tryMenu(args[0]);
            if (t) args[0] = t;
        }
        return next(args);
    });

    // 動作訊息由上面的 ActivityDictionaryText hook 翻模板、遊戲再自行 CommonStringSubstitute 填名字，
    // 不需要在聊天記錄 DOM 上做 regex（那條已移除）。

    // BCX 在聊天記錄輸出的 HTML 說明
    ChatHistoryTranslator.registerTranslationFunc((src) => supplement.html[src] || BCXHelp(src));

    // dialog-inventory(DOM) 的道具/動作名
    setupDomObserver(translateAny);
}
