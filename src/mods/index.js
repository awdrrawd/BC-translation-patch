import { translateLscgMessage } from "./lscgMessages.js";
import { translateNecklaceAction } from "./necklaceActions.js";
import { roomAdminText, isRoomTemplateName, translateRoomTemplateName } from "./roomAdmin.js";
import { setupSurfaceObserver, translateCraftShare } from "./surfaces.js";
import { activeLang } from "../lang.js";
import GEN from "../dictionary.js";
import { ChatHistoryTranslator } from "./html/utils/chatObserver.js";
import { setupDomObserver } from "./domObserver.js";
import { translateLscgText } from "./lscgText.js";
import { setupBcxHelp } from "./bcxHelp.js";
import { setupBcplusObserver } from "./bcplus.js";
import { translateBcplusRoomNotice } from "./bcplusRooms.js";
import { setupBcxCanvas, translateBcxLog } from "./bcxCanvas.js";
import { translateModText } from "./modSurfaces.js";
import { setupModDomObserver, isEchsLoaded } from "./modDom.js";
import { setupEchsCanvas } from "./echsCanvas.js";
import { isGaliaLoaded, galiaPreferenceText, setupGaliaCanvas, setupGaliaChat, setupGaliaRadialMenu } from "./galia.js";

import { createLookup } from "./lookup.js";
import { createMissingCollector } from "./missing.js";

const lookup = createLookup(GEN, activeLang);
const { menu: tryMenu, activity: tryActivity, any: translateAny, crafting: translateDfn } = lookup;
const missing = createMissingCollector();

// ECHS draws its settings, setup wizard and prompts on the canvas; its own strings win over generic lookups.
// Loaded-state is cached because DrawText runs for every label of every frame.
let echsState = { at: 0, loaded: false };
const echsLoaded = () => {
    const now = Date.now();
    if (now - echsState.at > 2000) echsState = { at: now, loaded: isEchsLoaded() };
    return echsState.loaded;
};
const echsDictionary = () => activeLang() ? GEN.surfaces?.[activeLang()]?.echs : undefined;
const echsText = text => echsLoaded() ? translateModText(text, echsDictionary()) : undefined;

// Galia's Gambling Club (see galia.js). Same cached loaded-state as ECHS.
let galiaState = { at: 0, loaded: false };
const galiaLoaded = () => {
    const now = Date.now();
    if (now - galiaState.at > 2000) galiaState = { at: now, loaded: isGaliaLoaded() };
    return galiaState.loaded;
};
const surface = scope => activeLang() ? GEN.surfaces?.[activeLang()]?.[scope] : undefined;
const galiaPrefText = text => galiaLoaded() ? galiaPreferenceText(text, surface("galia")) : undefined;
const galiaLocalText = text => galiaLoaded() ? translateModText(text, surface("galia")) : undefined;
// Incoming GGC Action messages are translated for whoever reads them, as LSCG's are; only this copy changes.
const galiaRoomText = text => translateModText(text, surface("galiaRoom"));
const galiaDialogText = text => galiaLoaded() ? translateModText(text, surface("galiaDialog")) : undefined;
const translateInventory = text => translateAny(text) || galiaDialogText(text);

export const getMissing = missing.list;
export const clearMissing = missing.clear;

/** @param {any} mod bcModSdk 註冊物件 */
export function setupMods(mod, addCleanup) {
    const on = () => !!activeLang();
    const observeBcxCanvas = setupBcxCanvas(mod, tryMenu, activeLang);

    for (const fn of ["DrawText", "DrawTextFit", "DrawTextWrap", "DynamicDrawText"]) {
        mod.hookFunction(fn, 10, (args, next) => {
            observeBcxCanvas(fn, args);
            if (on() && typeof args[0] === "string") {
                const screen = globalThis.CurrentScreen;
                if (isRoomTemplateName(fn, args, screen)) {
                    const name = translateRoomTemplateName(fn, args, GEN.surfaces || {}, activeLang(), screen);
                    if (name) args[0] = name;
                    return next(args);
                }
                const t = galiaPrefText(args[0]) || echsText(args[0]) || translateBcxLog(fn, args, activeLang(), tryMenu) || roomAdminText(args[0], GEN.surfaces || {}, activeLang(), screen) || tryMenu(args[0]);
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
                const shared = data.Type === "Action" && data.Content === "Beep"
                    ? translateCraftShare(target.Text, activeLang()) || translateNecklaceAction(target.Text, activeLang()) || translateLscgMessage(target.Text, GEN.surfaces?.[activeLang()]?.lscgMessages, activeLang()) || galiaRoomText(target.Text) : undefined;
                // GGC also sends contract results as its own Action ("GGC_Action").
                const galia = data.Type === "Action" && data.Content === "GGC_Action" ? galiaRoomText(target.Text) : undefined;
                const t = shared || galia || tryActivity(target.Text);
                if (t) {
                    args = [...args];
                    args[0] = { ...data, Dictionary: data.Dictionary.map(entry =>
                        entry === target ? { ...entry, Text: t } : entry) };
                }
            }
        }
        return next(args);
    });

    // 本地訊息（部分 mod 的提示/動作）
    mod.hookFunction("ChatRoomSendLocal", 0, (args, next) => {
        if (on() && typeof args[0] === "string") {
            // ECHS wraps its private notices in [brackets]; translate the inside and keep the brackets.
            const bracketed = /^\[([\s\S]*)\]$/.exec(args[0]);
            const echs = bracketed && echsText(bracketed[1]);
            const t = (echs && `[${echs}]`) || galiaLocalText(args[0]) || translateBcplusRoomNotice(args[0], GEN.surfaces, activeLang()) || tryMenu(args[0]);
            if (t) args[0] = t;
        }
        return next(args);
    });

    // 動作訊息由上面的 ActivityDictionaryText hook 翻模板、遊戲再自行 CommonStringSubstitute 填名字，
    // 不需要在聊天記錄 DOM 上做 regex（那條已移除）。

    // BCX 在聊天記錄輸出的 HTML 說明
    addCleanup(ChatHistoryTranslator.registerTranslationFunc((src) => lookup.html(src)));

    // dialog-inventory(DOM) 的道具/動作名；製作屬性(dfn)用作用域字典
    // GALIA 的站位／內衣選單也放在 dialog-inventory，同一條管線補上它的字庫，避免兩個 observer 互相還原。
    setupDomObserver(translateInventory, translateDfn, addCleanup, text => translateLscgText(text, translateAny, lookup.exactAny));

    // BCX 匯出/匯入等 textarea.value 說明
    setupBcxHelp(addCleanup);
    setupSurfaceObserver(GEN.surfaces || {}, activeLang, addCleanup);
    setupBcplusObserver(GEN.surfaces || {}, activeLang, addCleanup);
    setupModDomObserver(GEN.surfaces || {}, activeLang, addCleanup);

    // ECHS 設定頁的多數文字由 MainCanvas.fillText 直接繪製（不經 DrawText hook），在此補翻。
    setupEchsCanvas(echsDictionary, echsLoaded, addCleanup);

    // GALIA：自有 canvas（手機、遊戲、銀行、契約、聊天、環形選單）與聊天室 MainCanvas 上的對決／動畫文字，
    // 以及它寫進聊天記錄的系統通知。
    setupGaliaCanvas(() => surface("galia"), () => surface("galiaRoom"), galiaLoaded, addCleanup);
    setupGaliaRadialMenu(() => surface("galia"), galiaLoaded, addCleanup);
    setupGaliaChat(GEN.surfaces || {}, activeLang, galiaLoaded, addCleanup);
}
