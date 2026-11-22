// Galia's Gambling Club (GGC, registered with the ModSDK as "ClubGaming"). The add-on ships one minified
// bundle (club-gaming.js) and no source, so every surface below was found by reading that bundle.
//
// Three dictionaries (translations/mods/galia/*.json):
//   galia        its own canvases (phone, games, bank, contracts, chats, radial menu), its DOM (modDom.js),
//                its preference page, its chat notices and its ChatRoomSendLocal lines;
//   galiaRoom    what it draws over the room on MainCanvas (skirmish, item text, dice) and the Action
//                messages GGC players send. Those are translated on arrival for this player only; what is
//                sent is never changed, so a player without this patch still reads the original;
//   galiaDialog  labels it puts into BC's own item/activity dialog (positioning, underwear, skirmish).
//
// Item data (crafted names and descriptions of the restraints it puts on) is BC's, not GGC's, and stays as is.

import { translateModText } from "./modSurfaces.js";
import { createEchsCanvasText, getMainCanvas } from "./echsCanvas.js";
import { isGaliaLoaded } from "./modDom.js";
import { updateDisplay } from "./displayText.js";

export { isGaliaLoaded };

/** PreferenceRegisterExtensionSetting Identifier and ButtonText. */
export const GALIA_PREFERENCE_ID = "ClubGaming";
export const GALIA_BUTTON_TEXT = "Galia's Gambling Club Settings";
/** Every canvas GGC appends to the page carries one of these ids (phone, overlay, bank, chats, trade, menu). */
export const GALIA_CANVAS_SELECTOR = 'canvas[id^="clubgaming-"]';
/** The <strong> label GGC puts in front of its own chat log notices. */
export const GALIA_NOTICE_SENDERS = new Set(["Galia's Gambling Club:", "GGC Bank:", "GGC Phone:", "GGC Chats:"]);
const UNREAD_MARKER = "clubgaming-group-chat-unread-marker";

// BC declares these with `let` (see echsCanvas.js): read them through `typeof`, after env.
const lexical = {
    current: () => typeof PreferenceExtensionsCurrent !== "undefined" ? PreferenceExtensionsCurrent : undefined,
    settings: () => typeof PreferenceExtensionsSettings !== "undefined" ? PreferenceExtensionsSettings : undefined,
    characters: () => typeof ChatRoomCharacter !== "undefined" ? ChatRoomCharacter : undefined,
};

/**
 * GGC's preference page is drawn with BC's DrawText / DrawButton / DrawTextFit, so the existing hooks see it.
 * Its dictionary is used only while that page is open, plus its button label on the extension list.
 */
export function galiaPreferenceText(text, map, env = globalThis) {
    if (!map || typeof text !== "string" || env.CurrentScreen !== "Preference") return undefined;
    const current = env.PreferenceExtensionsCurrent ?? lexical.current();
    const settings = env.PreferenceExtensionsSettings ?? lexical.settings();
    if (current && current === settings?.[GALIA_PREFERENCE_ID]) return translateModText(text, map);
    return text.trim() === GALIA_BUTTON_TEXT ? translateModText(text, map) : undefined;
}

/** Names and nicknames of everyone in the room: drawn as typed even when a dictionary key matches. */
const NO_NAMES = new Set();
let names = { list: null, length: -1, set: new Set() };
export function roomNames(env = globalThis) {
    const list = env.ChatRoomCharacter ?? lexical.characters();
    if (!Array.isArray(list)) return NO_NAMES;
    if (list === names.list && list.length === names.length) return names.set;
    const set = new Set();
    for (const character of list) {
        for (const name of [character?.Name, character?.Nickname]) if (typeof name === "string" && name.trim()) set.add(name.trim());
    }
    names = { list, length: list.length, set };
    return set;
}

const is2d = ctx => !!ctx && typeof ctx.fillText === "function" && typeof ctx.measureText === "function";

/**
 * GGC draws almost everything with fillText/strokeText/measureText:
 *  - on its own canvases (found by id, polled like the other mod roots), always while GGC is loaded;
 *  - on BC's MainCanvas while in a chat room (skirmish, item text and dice over characters), from the
 *    room dictionary only, which holds GGC's own sentences rather than single generic words.
 * @param {() => Record<string,string>|undefined} uiDictionary
 * @param {() => Record<string,string>|undefined} roomDictionary
 * @param {() => boolean} loaded
 */
export function setupGaliaCanvas(uiDictionary, roomDictionary, loaded, addCleanup, env = globalThis) {
    const isName = text => roomNames(env).has(text.trim());
    const own = createEchsCanvasText({ dictionary: uiDictionary, enabled: () => !!uiDictionary() && loaded(), skip: isName });
    const room = createEchsCanvasText({
        dictionary: roomDictionary,
        enabled: () => env.CurrentScreen === "ChatRoom" && !!roomDictionary() && loaded(),
        skip: isName,
    });
    const installed = new Map(); // canvas element -> uninstall
    let main = null, uninstallMain = null;
    const scan = () => {
        if (env.document?.hidden) return;
        for (const [canvas, uninstall] of installed) {
            if (!canvas.isConnected) { uninstall(); installed.delete(canvas); }
        }
        if (!loaded()) return;
        for (const canvas of env.document?.querySelectorAll?.(GALIA_CANVAS_SELECTOR) ?? []) {
            if (installed.has(canvas)) continue;
            let ctx;
            try { ctx = canvas.getContext?.("2d"); } catch { ctx = undefined; }
            if (is2d(ctx)) installed.set(canvas, own.install(ctx));
        }
        const ctx = getMainCanvas(env);
        if (ctx && ctx !== main) {
            uninstallMain?.();
            main = ctx;
            uninstallMain = room.install(ctx);
        }
    };
    const timer = env.setInterval(scan, 500);
    addCleanup(() => {
        env.clearInterval(timer);
        for (const uninstall of installed.values()) uninstall();
        installed.clear();
        uninstallMain?.();
        main = uninstallMain = null;
    });
    scan();
}

/** Same dictionary, keyed in upper case: the radial menu draws `label.toUpperCase()` (placeholders kept as is). */
const upperMaps = new WeakMap();
function upperCased(map) {
    if (!map) return undefined;
    let upper = upperMaps.get(map);
    if (!upper) {
        upper = {};
        for (const [key, value] of Object.entries(map)) {
            const shout = key.toUpperCase().replace(/\{(#?)(\w+)\}/g, token => token.toLowerCase());
            if (!(shout in upper)) upper[shout] = value;
        }
        upperMaps.set(map, upper);
    }
    return upper;
}

/**
 * The radial menu (GAMES / MISC / OTHERS … around the character) draws each label one character at a time along
 * an arc (drawArcText) and its centre (CLOSE / BACK) through drawCenterText, so a canvas-level lookup only ever
 * sees single letters. Both methods are wrapped on the live instance (window.ClubGamingInstance.radialDialogMenu),
 * which GGC replaces when it updates itself, so the instance is checked again on every poll.
 */
export function setupGaliaRadialMenu(uiDictionary, loaded, addCleanup, env = globalThis) {
    const patched = new Map(); // menu -> originals
    const translate = text => {
        if (typeof text !== "string" || !loaded()) return text;
        return translateModText(text, upperCased(uiDictionary())) ?? text;
    };
    const restore = menu => {
        for (const name of ["drawArcText", "drawCenterText"]) {
            if (Object.prototype.hasOwnProperty.call(menu, name)) delete menu[name];
        }
    };
    const scan = () => {
        const menu = env.ClubGamingInstance?.radialDialogMenu;
        for (const old of patched.keys()) if (old !== menu) { restore(old); patched.delete(old); }
        if (!menu || patched.has(menu) || typeof menu.drawArcText !== "function") return;
        const arc = menu.drawArcText, centre = menu.drawCenterText;
        // (ctx, text, ...) for both.
        menu.drawArcText = function (ctx, text, ...rest) { return arc.call(this, ctx, translate(text), ...rest); };
        if (typeof centre === "function") {
            menu.drawCenterText = function (ctx, text, ...rest) { return centre.call(this, ctx, translate(text), ...rest); };
        }
        patched.set(menu, true);
    };
    const timer = env.setInterval(scan, 500);
    addCleanup(() => {
        env.clearInterval(timer);
        for (const menu of patched.keys()) restore(menu);
        patched.clear();
    });
    scan();
}

/** The sender label of a GGC chat notice, or undefined. Notices are `<strong>Sender:</strong> text`, the
 * action variant wraps that in a <span>, and group chat system lines put BC's metadata block in front. */
function senderOf(element) {
    for (const child of element.children ?? []) {
        if (child.tagName === "STRONG") return child.textContent.trim();
        if (child.tagName === "SPAN") {
            const strong = [...child.children].find(node => node.tagName === "STRONG");
            if (strong) return strong.textContent.trim();
        }
    }
    return undefined;
}

/** True for GGC's own lines in the chat log; never for what a player wrote (their names are not senders). */
export function isGaliaNotice(element) {
    if (element?.nodeType !== 1) return false;
    if (element.id === UNREAD_MARKER) return true;
    return !!element.classList?.contains("ChatMessageLocalMessage") && GALIA_NOTICE_SENDERS.has(senderOf(element));
}

/** Text nodes only: a notice is `<strong>label</strong> message`, and matching its markup as a whole would
 * let a `{name} …` template swallow the label. BC's time/sender block is left alone. */
function translateNotice(element, dictionaries, lang) {
    const map = lang ? dictionaries[lang]?.galia : undefined;
    const visit = node => {
        for (const child of node.childNodes) {
            if (child.nodeType === 3) {
                updateDisplay(child, "data", () => child.data, value => { child.data = value; },
                    source => translateModText(source, map) ?? source);
            } else if (child.nodeType === 1 && !child.classList?.contains("chat-room-metadata")) visit(child);
        }
    };
    visit(element);
}

/**
 * GGC writes its notices (and group chat system lines) straight into #TextAreaChatLog. Only those are
 * translated: everything a player wrote, and every other add-on's lines, are left alone.
 */
export function setupGaliaChat(dictionaries, getLang, loaded, addCleanup, env = globalThis) {
    const document = env.document;
    const seen = new Set();
    let log = null;
    const prune = () => { for (const element of seen) if (!element.isConnected) seen.delete(element); };
    const consider = node => {
        if (node?.nodeType !== 1) return;
        const found = [node, ...(node.querySelectorAll?.(`.ChatMessageLocalMessage, #${UNREAD_MARKER}`) ?? [])];
        for (const element of found) {
            if (!isGaliaNotice(element)) continue;
            if (seen.size > 300) prune();
            seen.add(element);
            translateNotice(element, dictionaries, getLang());
        }
    };
    const observer = new env.MutationObserver(records => {
        if (!loaded() || !getLang()) return;
        for (const record of records) record.addedNodes.forEach(consider);
    });
    const attach = () => {
        if (document.hidden) return;
        const current = document.getElementById("TextAreaChatLog");
        if (current === log) return;
        observer.disconnect();
        log = current;
        if (!current) return;
        observer.observe(current, { childList: true, subtree: true });
        if (loaded() && getLang()) consider(current);
    };
    const refresh = () => {
        prune();
        for (const element of seen) translateNotice(element, dictionaries, getLang());
        if (log?.isConnected && loaded() && getLang()) consider(log);
    };
    const timer = env.setInterval(attach, 500);
    document.addEventListener("bctp-language-change", refresh);
    addCleanup(() => {
        env.clearInterval(timer);
        observer.disconnect();
        document.removeEventListener("bctp-language-change", refresh);
        prune();
        for (const element of seen) translateNotice(element, dictionaries, null);
        seen.clear();
        log = null;
    });
    attach();
}
