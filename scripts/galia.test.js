import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parseHTML } from "linkedom";
import { generateDict } from "./gen-dict.js";
import { translateModText } from "../src/mods/modSurfaces.js";
import { setupModDomObserver } from "../src/mods/modDom.js";
import { GALIA_CANVAS_SELECTOR, galiaPreferenceText, isGaliaNotice, setupGaliaCanvas, setupGaliaChat, setupGaliaRadialMenu } from "../src/mods/galia.js";

const dictionaries = generateDict().surfaces;
const FILES = { galia: "ui", galiaRoom: "room", galiaDialog: "dialog" };
const placeholders = text => [...text.matchAll(/\{#?\w+\}/g)].map(match => match[0]).sort();
const CJK = /[\u3400-\u9fff]/;

test("GALIA dictionaries have unique keys, matching placeholders, a translation and a TW rendering", () => {
    for (const [scope, file] of Object.entries(FILES)) {
        const text = fs.readFileSync(new URL(`../translations/mods/galia/${file}.json`, import.meta.url), "utf8");
        const keys = [...text.matchAll(/^  ("(?:[^"\\]|\\.)*"):/gm)].map(match => JSON.parse(match[1]));
        assert.equal(new Set(keys).size, keys.length, `${file}: duplicate JSON keys`);
        for (const [source, target] of Object.entries(JSON.parse(text))) {
            assert.ok(source.trim() && target.trim(), source);
            assert.deepEqual(placeholders(target), placeholders(source), `${file}: ${source}`);
            assert.ok(CJK.test(target), `${file}: untranslated ${source}`);
            assert.ok(dictionaries.TW[scope][source], `${file}: no TW for ${source}`);
        }
    }
});

test("GALIA's own selectors and BC item data are never dictionary keys", () => {
    // GGC finds its call window by aria-label="Phone calls"; the message window is our DOM root by its label.
    for (const scope of Object.keys(FILES)) {
        for (const key of ["Phone calls", "Phone messages", "Trade Collar", "BJ Ballgag", "Text message"]) {
            assert.equal(dictionaries.CN[scope][key], undefined, `${scope}: ${key}`);
        }
    }
});

test("GGC room messages are translated with names kept; other lines are left alone", () => {
    assert.equal(translateModText("Missy rolled 2 dice for a 7.", dictionaries.CN.galiaRoom), "Missy 掷了 2 颗骰子，点数为 7。");
    for (const lang of ["CN", "TW"]) {
        const t = text => translateModText(text, dictionaries[lang].galiaRoom);
        for (const [line, ...names] of [
            ["Missy takes out her phone.", "Missy"],
            ["Missy looks at Rei's phone and notices that the screen is cracked.", "Missy", "Rei"],
            ["Missy walks over and kneels at Rei's feet, directly in front.", "Missy", "Rei"],
            ["Missy lowers her Panties to her thighs.", "Missy", "Panties"],
            ["Missy has won the skirmish and stolen the phone.", "Missy"],
            ["Missy throws a coin into the air. The result is: heads.", "Missy"],
            ["Missy lost a bet against Rei, and the contract was forcibly enforced.", "Missy", "Rei"],
        ]) {
            const translated = t(line);
            assert.ok(translated && CJK.test(translated), `${lang}: ${line}`);
            for (const name of names) assert.ok(translated.includes(name), `${lang}: ${line} keeps ${name}`);
        }
        assert.ok(CJK.test(t("Phone stolen · Surrendered")));
        assert.equal(t("Missy waves at everyone."), undefined);
        assert.equal(t("Send money"), undefined, "UI words are not in the room dictionary");
    }
});

test("the GGC preference dictionary is used only on its own page (and its button on the extension list)", () => {
    const mine = { run() {} };
    const settings = { ClubGaming: mine };
    const cn = dictionaries.CN.galia;
    const at = (current, screen = "Preference") => ({ CurrentScreen: screen, PreferenceExtensionsCurrent: current, PreferenceExtensionsSettings: settings });
    assert.equal(galiaPreferenceText("Play sounds", cn, at(mine)), "播放音效");
    assert.equal(galiaPreferenceText("Version 0.4.122", cn, at(mine)), "版本 0.4.122");
    assert.equal(galiaPreferenceText("Play sounds", cn, at({ run() {} })), undefined);
    assert.equal(galiaPreferenceText("Play sounds", cn, at(null)), undefined);
    assert.equal(galiaPreferenceText("Galia's Gambling Club Settings", cn, at(null)), "Galia 赌博俱乐部设置");
    assert.equal(galiaPreferenceText("Play sounds", cn, at(mine, "ChatRoom")), undefined);
});

test("the phone lock screen date (en-GB weekday, day, month) is translated for every day of the year", () => {
    const format = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" });
    for (const lang of ["CN", "TW"]) {
        for (let day = 0; day < 366; day++) {
            const date = new Date(2024, 0, 1 + day);
            const shown = translateModText(format.format(date), dictionaries[lang].galia);
            assert.ok(shown && !/[A-Za-z]/.test(shown), `${lang}: ${format.format(date)} -> ${shown}`);
            assert.ok(shown.startsWith(`${date.getMonth() + 1}月${date.getDate()}日`), shown);
        }
    }
});

test("radial menu labels are translated before GGC draws them letter by letter, and restored on cleanup", () => {
    const drawn = [];
    class Menu {
        drawArcText(ctx, text) { drawn.push(text); }
        drawCenterText(ctx, text) { drawn.push(text); }
    }
    let lang = "CN", cleanup, poll;
    const env = { ClubGamingInstance: { radialDialogMenu: new Menu() }, setInterval(fn) { poll = fn; return 1; }, clearInterval() {} };
    setupGaliaRadialMenu(() => dictionaries[lang].galia, () => true, fn => { cleanup = fn; }, env);
    const menu = env.ClubGamingInstance.radialDialogMenu;
    for (const label of ["GAMES", "MISC", "OTHERS", "PHONE SERVICES", "BUY PHONE · $50", "LIAR'S DICE", "1D6"]) menu.drawArcText(null, label);
    menu.drawCenterText(null, "CLOSE");
    menu.drawCenterText(null, "GGC");
    assert.deepEqual(drawn, ["游戏", "杂项", "其他", "手机服务", "购买手机 · $50", "大话骰", "1D6", "关闭", "GGC"]);
    // GGC builds a new instance when it updates itself.
    env.ClubGamingInstance = { radialDialogMenu: new Menu() };
    poll();
    drawn.length = 0;
    env.ClubGamingInstance.radialDialogMenu.drawArcText(null, "TRADE");
    assert.deepEqual(drawn, ["交易"]);
    cleanup();
    assert.equal(Object.hasOwn(env.ClubGamingInstance.radialDialogMenu, "drawArcText"), false);
});

class FakeContext {
    constructor() { this.drawn = []; this.font = "16px Arial"; this.fillStyle = "black"; this.textAlign = "left"; this.textBaseline = "alphabetic"; }
    fillText(text) { this.drawn.push(["fill", text]); }
    strokeText(text) { this.drawn.push(["stroke", text]); }
    measureText(text) { return { width: String(text).length * 8 }; }
    save() {}
    restore() {}
}

test("GGC canvases: own text and outlines are translated, room names are not, MainCanvas only in a chat room", () => {
    let lang = "CN", loaded = true, cleanup, poll;
    const own = new FakeContext(), main = new FakeContext();
    const canvas = { id: "clubgaming-bank-canvas", isConnected: true, getContext: () => own };
    const env = {
        document: { hidden: false, querySelectorAll: selector => selector === GALIA_CANVAS_SELECTOR ? [canvas] : [], getElementById: () => null },
        MainCanvas: main, CurrentScreen: "ChatRoom", ChatRoomCharacter: [{ Name: "Love", Nickname: "" }],
        setInterval(fn) { poll = fn; return 1; }, clearInterval() {},
    };
    setupGaliaCanvas(() => dictionaries[lang]?.galia, () => dictionaries[lang]?.galiaRoom, () => loaded, fn => { cleanup = fn; }, env);

    own.fillText("Send money", 0, 0);
    own.strokeText("BATTLESHIP", 0, 0);
    own.fillText("Love", 0, 0); // a player's name that is also a dictionary key
    assert.deepEqual(own.drawn, [["fill", "转账"], ["stroke", "海战棋"], ["fill", "Love"]]);

    main.fillText("SURRENDER", 0, 0);
    main.fillText("Send money", 0, 0);
    env.CurrentScreen = "Preference";
    main.fillText("SURRENDER", 0, 0);
    assert.deepEqual(main.drawn.map(d => d[1]), ["投降", "Send money", "SURRENDER"]);

    lang = "TW";
    own.drawn = [];
    own.fillText("Send money", 0, 0);
    assert.equal(own.drawn[0][1], dictionaries.TW.galia["Send money"]);
    loaded = false;
    own.fillText("Send money", 0, 0);
    assert.equal(own.drawn[1][1], "Send money");

    canvas.isConnected = false;
    poll();
    assert.equal(Object.hasOwn(own, "fillText"), false, "a removed canvas is released");
    cleanup();
    for (const method of ["fillText", "strokeText", "measureText"]) assert.equal(Object.hasOwn(main, method), false, method);
});

function harness(extra = {}) {
    const { window } = parseHTML("<html><body></body></html>");
    let lang = "CN", poll;
    const work = new Map(); let id = 0;
    const cleanups = [];
    const env = {
        document: window.document, MutationObserver: window.MutationObserver,
        setInterval(fn) { poll = fn; return 1; }, clearInterval() { poll = null; },
        requestIdleCallback(fn) { work.set(++id, fn); return id; }, cancelIdleCallback(key) { work.delete(key); },
        bcModSdk: { getModsInfo: () => [{ name: "ClubGaming" }] },
        ...extra,
    };
    const flush = async () => {
        for (let i = 0; i < 10; i++) {
            await Promise.resolve();
            for (const [key, fn] of [...work]) { work.delete(key); fn({ didTimeout: true }); }
        }
    };
    return { window, env, flush, cleanups, setLang: value => { lang = value; }, getLang: () => lang, poll: () => poll?.() };
}

test("GGC chat notices are translated; players' lines and other add-ons' notices are not", async () => {
    const h = harness();
    const document = h.window.document;
    document.body.innerHTML = `<div id="TextAreaChatLog"></div>`;
    setupGaliaChat(dictionaries, h.getLang, () => true, fn => h.cleanups.push(fn), h.env);
    const log = document.getElementById("TextAreaChatLog");
    const add = html => {
        const holder = document.createElement("div");
        holder.innerHTML = html;
        const element = holder.firstElementChild;
        log.appendChild(element);
        return element;
    };
    const notice = add(`<div class="ChatMessage ChatMessageLocalMessage"><strong>Galia's Gambling Club:</strong> The call could not be sent.</div>`);
    const bank = add(`<div class="ChatMessage ChatMessageLocalMessage"><span><strong>GGC Bank:</strong> Missy wants to send you 50$.</span><span><button>Accept</button><button>Decline</button></span></div>`);
    const group = add(`<div class="ChatMessage ChatMessageLocalMessage"><div class="chat-room-metadata"><time class="chat-room-time">12:00</time><span class="chat-room-sender">GGC</span></div><strong>GGC Chats:</strong> Missy [123] has joined the group.</div>`);
    const marker = add(`<div id="clubgaming-group-chat-unread-marker" class="ChatMessage ChatMessageLocalMessage">3 unread messages ↓</div>`);
    const player = add(`<div class="ChatMessage ChatMessageLocalMessage"><div class="chat-room-metadata"><span class="chat-room-sender">123</span></div><strong>Missy:</strong> Yes</div>`);
    const other = add(`<div class="ChatMessage ChatMessageLocalMessage"><strong>BCX:</strong> Close</div>`);
    await h.flush();

    assert.equal(isGaliaNotice(player), false);
    assert.equal(notice.querySelector("strong").textContent, "Galia 赌博俱乐部：");
    assert.equal(notice.lastChild.data.trim(), "无法拨出通话。");
    assert.equal(bank.querySelector("span").lastChild.data.trim(), "Missy 想转给你 50$。");
    assert.deepEqual([...bank.querySelectorAll("button")].map(b => b.textContent), ["接受", "拒绝"]);
    assert.equal(group.lastChild.data.trim(), "Missy [123] 加入了群组。");
    assert.equal(group.querySelector(".chat-room-sender").textContent, "GGC");
    assert.equal(marker.textContent, "3 条未读消息 ↓");
    assert.equal(player.lastChild.data, " Yes");
    assert.equal(other.lastChild.data, " Close");

    h.setLang("TW");
    document.dispatchEvent(new h.window.Event("bctp-language-change"));
    await h.flush();
    assert.equal(notice.querySelector("strong").textContent, dictionaries.TW.galia["Galia's Gambling Club:"]);

    h.cleanups.forEach(fn => fn());
    assert.equal(notice.querySelector("strong").textContent, "Galia's Gambling Club:");
    assert.equal(notice.lastChild.data, " The call could not be sent.");
});

test("GGC phone DOM is translated while GGC is loaded; what players wrote is not", async () => {
    let mods = [];
    const h = harness({ bcModSdk: { getModsInfo: () => mods } });
    const body = h.window.document.body;
    body.innerHTML = `<div aria-label="Phone messages"><div id="title">Messages</div>
        <button><div><div>Missy</div><div id="preview">Yes</div></div></button>
        <div aria-label="Text message"><div id="bubble">OK</div></div>
        <input id="url" placeholder="Direct image URL"></div>
        <div id="clubgaming-phone-calls"><div id="calls">No recent calls.</div></div>`;
    setupModDomObserver(dictionaries, h.getLang, fn => h.cleanups.push(fn), h.env);
    await h.flush();
    assert.equal(body.querySelector("#title").textContent, "Messages", "not loaded: untouched");
    mods = [{ name: "ClubGaming" }];
    h.poll(); await h.flush();
    assert.equal(body.querySelector("#title").textContent, "消息");
    assert.equal(body.querySelector("#calls").textContent, "没有最近通话。");
    assert.equal(body.querySelector("#url").getAttribute("placeholder"), "图片直链");
    assert.equal(body.querySelector("#preview").textContent, "Yes", "last message preview stays as written");
    assert.equal(body.querySelector("#bubble").textContent, "OK", "message bubble stays as written");
    h.cleanups.forEach(fn => fn());
    assert.equal(body.querySelector("#title").textContent, "Messages");
});
