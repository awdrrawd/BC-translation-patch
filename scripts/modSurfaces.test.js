import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parseHTML } from "linkedom";
import { generateDict } from "./gen-dict.js";
import { translateModText } from "../src/mods/modSurfaces.js";
import { setupModDomObserver, isEchsLoaded } from "../src/mods/modDom.js";

const generated = generateDict();
const dictionaries = generated.surfaces;
const read = mod => JSON.parse(fs.readFileSync(new URL(`../translations/mods/${mod}/ui.json`, import.meta.url), "utf8"));
const placeholders = text => [...text.matchAll(/\{#?\w+\}/g)].map(match => match[0]).sort();

test("ECHS and Littlish dictionaries have unique keys, matching placeholders and a TW rendering", () => {
    for (const mod of ["echs", "littlish"]) {
        const file = fs.readFileSync(new URL(`../translations/mods/${mod}/ui.json`, import.meta.url), "utf8");
        const keys = [...file.matchAll(/^  ("(?:[^"\\]|\\.)*"):/gm)].map(match => JSON.parse(match[1]));
        assert.equal(new Set(keys).size, keys.length, `${mod}: duplicate JSON keys`);
        for (const [source, target] of Object.entries(read(mod))) {
            assert.ok(source.trim() && target.trim(), source);
            assert.deepEqual(placeholders(target), placeholders(source), `${mod}: ${source}`);
            assert.ok(dictionaries.TW[mod][source], `${mod}: no TW for ${source}`);
            assert.notEqual(dictionaries.CN[mod][source], source, `${mod}: untranslated ${source}`);
        }
    }
});

test("mod text lookup: exact, numeric templates, captured labels, list captures and drawn prefixes", () => {
    const cn = dictionaries.CN.echs, tw = dictionaries.TW.echs;
    assert.equal(translateModText("Hypnosis Enabled", cn), "启用催眠");
    assert.equal(translateModText("Hypnosis Enabled", tw), "啟用催眠");
    assert.equal(translateModText("  Hypnosis Enabled  ", cn), "  启用催眠  ");
    assert.equal(translateModText("Attempts before they must wait: 5", cn), "需要等待前的尝试次数：5");
    assert.equal(translateModText("Induction time: 2.5 seconds", cn), "引导时间：2.5 秒");
    // A number placeholder must not swallow text.
    assert.equal(translateModText("Induction time: many seconds", cn), undefined);
    // Captured values are translated when the dictionary knows them.
    assert.equal(translateModText("Toy mode: On", cn), "玩具模式：开");
    assert.equal(translateModText("Pulse colour: Pink", tw), "脈動顏色：粉色");
    assert.equal(translateModText("Allowed: poses and being held still; the clothing illusion.", cn), "已允许：姿势和保持静止；衣物幻象。");
    // Checkbox / disclosure marks stay in front of the label.
    assert.equal(translateModText("✓  Always ask me first", cn), "✓ 总是先询问我");
    assert.equal(translateModText("+  Body & pose", cn), "+ 身体与姿势");
    // The most specific template wins and unknown text is left alone.
    assert.equal(translateModText("Click Reset again within 5 seconds to erase all trust, experience and settings.", cn)?.startsWith("请在 5 秒内"), true);
    assert.equal(translateModText("Something the add-on never says", cn), undefined);
    assert.equal(translateModText("Hypnosis Enabled", undefined), undefined);
});

test("ECHS phrases that are typed into chat stay English so the add-on keeps recognising them", () => {
    const keys = new Set(Object.keys(read("echs")));
    for (const phrase of ["sink deeper", "wake up", "kiss me", "touch yourself", "you cannot touch yourself", "come back to me", "walk with me"]) {
        assert.ok(!keys.has(phrase), `${phrase} must not be translated`);
    }
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
        ...extra,
    };
    const flush = async () => {
        for (let i = 0; i < 10; i++) {
            await Promise.resolve();
            for (const [key, fn] of [...work]) { work.delete(key); fn({ didTimeout: true }); }
        }
        assert.equal(work.size, 0, "observer must settle, not loop on its translations");
    };
    return { window, env, flush, cleanups, setLang: value => { lang = value; }, getLang: () => lang, poll: () => poll() };
}

test("Littlish Club DOM translates only while its subscreen is open and leaves typed text and chat alone", async () => {
    let open = false;
    const h = harness({ LITTLISH_CLUB: { inModSubscreen: () => open } });
    const body = h.window.document.body;
    body.innerHTML = `<div id="TextAreaChatLog"><div>Rules</div></div>
        <div id="screen"><button>Save Changes</button><span>Rules</span>
        <input placeholder="Search rule" value="Save Changes"><textarea>Save Changes</textarea>
        <p id="rich"><b>Creator:</b> Zoi</p><p id="title">Notes &gt; #3</p>
        <div id="rule">Rules &gt; Force title</div></div>`;
    setupModDomObserver(dictionaries, h.getLang, fn => h.cleanups.push(fn), h.env);
    await h.flush();
    assert.equal(body.querySelector("#screen button").textContent, "Save Changes", "closed subscreen: untouched");
    open = true; h.poll(); await h.flush();
    assert.equal(body.querySelector("#screen button").textContent, "保存更改");
    assert.equal(body.querySelector("#screen span").textContent, "规则");
    assert.equal(body.querySelector("input").getAttribute("placeholder"), "搜索规则");
    assert.equal(body.querySelector("input").value, "Save Changes");
    assert.equal(body.querySelector("textarea").textContent, "Save Changes");
    assert.equal(body.querySelector("#TextAreaChatLog div").textContent, "Rules");
    assert.equal(body.querySelector("#rich").innerHTML, "<b>作者：</b>Zoi");
    assert.equal(body.querySelector("#title").textContent, "便签 > #3");
    assert.equal(body.querySelector("#rule").textContent, "规则 > 强制头衔");
    // BC code rewrites text after the screen is built (textContent = ...).
    body.querySelector("#screen button").textContent = "Add note"; await h.flush();
    assert.equal(body.querySelector("#screen button").textContent, "添加便签");
    h.setLang("TW");
    h.window.document.dispatchEvent(new h.window.Event("bctp-language-change")); await h.flush();
    assert.equal(body.querySelector("#screen button").textContent, "新增便籤");
    h.cleanups.forEach(fn => fn());
    assert.equal(body.querySelector("#screen button").textContent, "Add note");
    assert.equal(body.querySelector("#rich").innerHTML, "<b>Creator:</b> Zoi");
});

test("ECHS popup is translated, but only for the real ECHS add-on and without touching the chat box", async () => {
    const h = harness({ bcModSdk: { getModsInfo: () => [{ name: "SomethingElse" }] } });
    const body = h.window.document.body;
    body.innerHTML = `<div id="echs-popup"><button title="Close (the spiral button opens it again)">x</button>
        <button class="echs-pop-say" title="Ends any trance and releases every effect, at once. Always works.">Safeword — stop everything</button>
        <span>Nobody is under you right now.</span><span>Speaking to Rei. Click a line to type it with their name. ↺ gives something back.</span></div>
        <select id="HypnosisAddonScreenEffect"><option>Grey fade</option><option value="blank">Blank</option></select>
        <input id="InputChat" placeholder="Nobody is under you right now.">`;
    setupModDomObserver(dictionaries, h.getLang, fn => h.cleanups.push(fn), h.env);
    await h.flush();
    assert.equal(isEchsLoaded(h.env), false);
    assert.equal(body.querySelector("#echs-popup span").textContent, "Nobody is under you right now.");
    h.env.bcModSdk.getModsInfo = () => [{ name: "ECHS" }];
    h.poll(); await h.flush();
    const spans = body.querySelectorAll("#echs-popup span");
    assert.equal(spans[0].textContent, "目前没有人被你催眠。");
    assert.equal(spans[1].textContent, "正在对 Rei 说话。点击一行即可连同其名字一起输入。↺ 表示解除某项效果。");
    assert.equal(body.querySelector("#echs-popup button").getAttribute("title"), "关闭（可通过螺旋按钮再次打开）");
    assert.equal(body.querySelector(".echs-pop-say").textContent, "安全词——停止一切");
    const options = body.querySelectorAll("option");
    assert.equal(options[0].getAttribute("label"), "灰色渐隐");
    assert.equal(options[0].textContent, "Grey fade", "option text (and so its value) is untouched");
    assert.equal(options[1].getAttribute("value"), "blank");
    assert.equal(body.querySelector("#InputChat").getAttribute("placeholder"), "Nobody is under you right now.");
    h.cleanups.forEach(fn => fn());
    assert.equal(spans[0].textContent, "Nobody is under you right now.");
    assert.equal(options[0].getAttribute("label"), null);
});

test("ECHS popup descriptions and chip rows are translated; the /echs command line stays as typed", async () => {
    const h = harness({ bcModSdk: { getModsInfo: () => [{ name: "ECHS" }] } });
    const body = h.window.document.body;
    body.innerHTML = `<div id="echs-popup">` +
        `<button class="echs-pop-item"><div class="echs-pop-cmd">/echs agree</div><div class="echs-pop-desc">Accept a hypnosis attempt — cooperative, improves their roll. Under: stop resisting</div></button>` +
        `<div class="echs-pop-entry"><div class="echs-pop-desc">by Rei (#12345), 45/65 — reaches Entranced  ** HOLDING YOU NOW **</div>` +
        `<div class="echs-pop-buttons"><button class="echs-pop-chip" title="/echs triggers 1">details</button><button class="echs-pop-chip">forget</button></div></div>` +
        `<div class="echs-pop-desc">full strength, works once · you cannot move</div>` +
        `<div class="echs-pop-desc">Rei turned off Cannot Move</div>` +
        `<div class="echs-pop-buttons"><button class="echs-pop-chip">Wake</button><button class="echs-pop-chip">make grant</button></div></div>`;
    setupModDomObserver(dictionaries, h.getLang, fn => h.cleanups.push(fn), h.env);
    await h.flush();
    const cn = dictionaries.CN.echs;
    assert.equal(body.querySelector(".echs-pop-cmd").textContent, "/echs agree", "the command line is what COMMANDER needs");
    const descs = body.querySelectorAll(".echs-pop-desc");
    assert.ok(/[\u3400-\u9fff]/.test(descs[0].textContent), descs[0].textContent);
    assert.ok(descs[1].textContent.includes("Rei") && descs[1].textContent.includes(translateModText("Entranced", cn)), descs[1].textContent);
    assert.ok(/[\u3400-\u9fff]/.test(descs[2].textContent) && descs[2].textContent.endsWith("you cannot move"), "what a trigger does stays as spoken");
    assert.ok(descs[3].textContent.includes("Rei") && descs[3].textContent.includes(translateModText("Cannot Move", cn)), descs[3].textContent);
    const chips = [...body.querySelectorAll(".echs-pop-chip")];
    assert.deepEqual(chips.map(chip => chip.textContent), ["详情", "忘记", "醒来", "改为 grant"]);
    assert.equal(chips[0].getAttribute("title"), "/echs triggers 1");
    h.cleanups.forEach(fn => fn());
    assert.equal(chips[0].textContent, "details");
    assert.equal(descs[3].textContent, "Rei turned off Cannot Move");
});
