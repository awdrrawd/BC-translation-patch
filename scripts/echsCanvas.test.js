import test from "node:test";
import assert from "node:assert/strict";
import { generateDict } from "./gen-dict.js";
import { translateModText } from "../src/mods/modSurfaces.js";
import vm from "node:vm";
import { createEchsCanvasText, isEchsScreen, setupEchsCanvas, getMainCanvas } from "../src/mods/echsCanvas.js";

const dictionaries = generateDict().surfaces;

/** A canvas whose text is 10px per character (CJK 20px) and which records what reaches fillText. */
function fakeContext() {
    class Context {
        constructor() { this.font = "36px Arial"; this.fillStyle = "Black"; this.textAlign = "left"; this.textBaseline = "middle"; this.drawn = []; }
        save() {}
        restore() {}
        measureText(text) { return { width: [...text].reduce((sum, c) => sum + (/[\u3400-\u9fff，。]/.test(c) ? 20 : 10), 0) }; }
        fillText(text, x, y) { this.drawn.push({ text, x, y }); }
    }
    return new Context();
}

/** What ECHS's panel.ts does: wrapToWidth over the CURRENT font, then one fillText per line. */
function drawWrapped(ctx, text, x, yCentre, maxWidth, pitch = 40) {
    const lines = [];
    let line = "";
    for (const word of text.split(/\s+/).filter(Boolean)) {
        const trial = line ? `${line} ${word}` : word;
        if (!line || ctx.measureText(trial).width <= maxWidth) line = trial;
        else { lines.push(line); line = word; }
    }
    if (line) lines.push(line);
    const first = yCentre - ((lines.length - 1) * pitch) / 2;
    lines.forEach((entry, i) => ctx.fillText(entry, x, first + i * pitch));
    return lines;
}

/** ECHS's drawLeftTextFit: shrink while too wide (measured), then fill once. */
function drawFitted(ctx, text, x, y, maxWidth) {
    let out = text;
    if (ctx.measureText(out).width > maxWidth) {
        while (out.length > 1 && ctx.measureText(`${out}…`).width > maxWidth) out = out.slice(0, -1);
        out = `${out}…`;
    }
    ctx.fillText(out, x, y);
}

const make = (map, enabled = () => true) => {
    const ctx = fakeContext();
    const layer = createEchsCanvasText({ dictionary: () => map, enabled });
    const uninstall = layer.install(ctx);
    return { ctx, uninstall };
};

test("single-line labels drawn straight to fillText are translated", () => {
    const cn = dictionaries.CN.echs, tw = dictionaries.TW.echs;
    for (const [map, expected] of [[cn, "启用催眠"], [tw, "啟用催眠"]]) {
        const { ctx } = make(map);
        ctx.fillText("Hypnosis Enabled", 100, 50);
        ctx.fillText("Movement Restriction", 100, 100);
        assert.equal(ctx.drawn[0].text, expected);
        assert.deepEqual([ctx.drawn[0].x, ctx.drawn[0].y], [100, 50]);
        assert.notEqual(ctx.drawn[1].text, "Movement Restriction");
    }
});

test("fitting is measured on the translated width, so long blurbs are not truncated in English", () => {
    const cn = dictionaries.CN.echs;
    const blurb = "What others may do to you. All off by default. Triggers are persistent and outlive the session.";
    const { ctx } = make(cn);
    // 600px fits the Chinese (about 40 characters at 20px = 800px?) only if measured as Chinese; English is 940px.
    drawFitted(ctx, blurb, 0, 0, 1000);
    assert.equal(ctx.drawn[0].text, translateModText(blurb, cn));
    assert.ok(!ctx.drawn[0].text.endsWith("…"));
});

test("text outside the ECHS screen, unknown text and CJK text are left alone", () => {
    const cn = dictionaries.CN.echs;
    let on = false;
    const { ctx } = make(cn, () => on);
    ctx.fillText("Hypnosis Enabled", 0, 0);
    assert.equal(ctx.drawn[0].text, "Hypnosis Enabled");
    assert.equal(ctx.measureText("Hypnosis Enabled").width, 160);
    on = true;
    ctx.fillText("Something the add-on never says", 0, 0);
    ctx.fillText("ECHS 催眠", 0, 0);
    assert.deepEqual(ctx.drawn.slice(1).map(d => d.text), ["Something the add-on never says", "ECHS 催眠"]);
    assert.equal(ctx.measureText("Hypnosis Enabled").width, 80);
});

test("word-wrapped captions: English lines are swallowed and the translation is drawn once, centred", () => {
    const cn = dictionaries.CN.echs;
    const text = "A spiral in your pulse colour turns over the room while you are under, and flashes when a command lands. Only you see it.";
    const { ctx } = make(cn);
    const english = drawWrapped(ctx, text, 120, 500, 600, 40);
    assert.ok(english.length >= 3, "the English must really wrap for this test");
    assert.ok(ctx.drawn.length >= 1 && ctx.drawn.every(d => /[\u3400-\u9fff]/.test(d.text)), JSON.stringify(ctx.drawn));
    assert.equal(ctx.drawn.map(d => d.text).join(""), translateModText(text, cn));
    assert.ok(ctx.drawn.every(d => d.x === 120));
    const ys = ctx.drawn.map(d => d.y);
    assert.deepEqual(ys, [...ys].sort((a, b) => a - b));
    // Same block centre as the English lines had.
    const englishTop = 500 - ((english.length - 1) * 40) / 2, englishBottom = englishTop + (english.length - 1) * 40;
    assert.ok(Math.abs((ys[0] + ys.at(-1)) / 2 - (englishTop + englishBottom) / 2) < 1e-6);
    assert.ok(ys[0] >= englishTop && ys.at(-1) <= englishBottom);
    // No translated line is wider than the English column.
    assert.ok(ctx.drawn.every(d => ctx.measureText(d.text).width <= 600));
});

test("a wrapped caption whose continuation never arrives is still drawn, then later text is unaffected", async () => {
    const cn = dictionaries.CN.echs;
    const text = "A spiral in your pulse colour turns over the room while you are under, and flashes when a command lands. Only you see it.";
    const { ctx } = make(cn);
    const lines = text.split(" ");
    ctx.fillText(lines.slice(0, 8).join(" "), 10, 10); // only a first line
    ctx.fillText("Hypnosis Enabled", 10, 200); // something else follows in the same frame
    // The cut-short caption is drawn (as one or more translated lines) before the next label.
    assert.ok(ctx.drawn.length >= 2);
    assert.ok(ctx.drawn.slice(0, -1).every(d => /[\u3400-\u9fff]/.test(d.text) && !/[A-Za-z]{4}/.test(d.text)));
    assert.equal(ctx.drawn.at(-1).text, "启用催眠");
});

test("a wrapped caption cut short by a microtask boundary is flushed", async () => {
    const cn = dictionaries.CN.echs;
    const text = "A spiral in your pulse colour turns over the room while you are under, and flashes when a command lands. Only you see it.";
    const { ctx } = make(cn);
    ctx.fillText(text.split(" ").slice(0, 8).join(" "), 10, 10);
    assert.equal(ctx.drawn.length, 0);
    await Promise.resolve();
    assert.equal(ctx.drawn.length >= 1, true);
    assert.match(ctx.drawn[0].text, /[\u3400-\u9fff]/);
});

test("ambiguous first lines are not guessed", () => {
    const map = { "Click here to do the first thing now": "甲", "Click here to do the second thing now": "乙" };
    const { ctx } = make(map);
    ctx.fillText("Click here to do the", 0, 0);
    assert.equal(ctx.drawn[0].text, "Click here to do the");
});

test("uninstall restores the canvas and a patched canvas keeps working", () => {
    const cn = dictionaries.CN.echs;
    const { ctx, uninstall } = make(cn);
    assert.ok(Object.prototype.hasOwnProperty.call(ctx, "fillText"));
    uninstall();
    assert.ok(!Object.prototype.hasOwnProperty.call(ctx, "fillText"));
    assert.ok(!Object.prototype.hasOwnProperty.call(ctx, "measureText"));
    ctx.fillText("Hypnosis Enabled", 0, 0);
    assert.equal(ctx.drawn[0].text, "Hypnosis Enabled");
});

test("isEchsScreen is true only for ECHS's own Preferences screen or the information sheet", () => {
    const mine = { run() {} };
    assert.equal(isEchsScreen({ CurrentScreen: "Preference", PreferenceExtensionsCurrent: mine, PreferenceExtensionsSettings: { HypnosisAddon: mine } }), true);
    assert.equal(isEchsScreen({ CurrentScreen: "Preference", PreferenceExtensionsCurrent: { run() {} }, PreferenceExtensionsSettings: { HypnosisAddon: mine } }), false);
    assert.equal(isEchsScreen({ CurrentScreen: "Preference", PreferenceExtensionsCurrent: null, PreferenceExtensionsSettings: { HypnosisAddon: mine } }), false);
    assert.equal(isEchsScreen({ CurrentScreen: "ChatRoom" }), false);
    assert.equal(isEchsScreen({ CurrentScreen: "InformationSheet" }), true);
    assert.equal(isEchsScreen({}), false);
});

test("setupEchsCanvas waits for MainCanvas, follows the language, and cleans up", () => {
    const mine = { run() {} };
    let lang = "CN", poll, cleanup;
    const env = {
        CurrentScreen: "Preference", PreferenceExtensionsCurrent: mine, PreferenceExtensionsSettings: { HypnosisAddon: mine },
        setInterval(fn) { poll = fn; return 7; }, clearInterval(id) { assert.equal(id, 7); poll = null; },
    };
    setupEchsCanvas(() => dictionaries[lang]?.echs, () => true, fn => { cleanup = fn; }, env);
    env.MainCanvas = fakeContext();
    poll();
    env.MainCanvas.fillText("Hypnosis Enabled", 0, 0);
    lang = "TW";
    env.MainCanvas.fillText("Hypnosis Enabled", 0, 0);
    lang = null;
    env.MainCanvas.fillText("Hypnosis Enabled", 0, 0);
    assert.deepEqual(env.MainCanvas.drawn.map(d => d.text), ["启用催眠", "啟用催眠", "Hypnosis Enabled"]);
    cleanup();
    assert.equal(poll, null);
    assert.ok(!Object.prototype.hasOwnProperty.call(env.MainCanvas, "fillText"));
});

test("settings-screen buttons, stats rows, wizard summary and Extreme prompts are in the dictionary", () => {
    const cn = dictionaries.CN.echs, tw = dictionaries.TW.echs;
    for (const label of ["Setup", "Exit", "Holding", "Prev", "Next", "Cancel", "Apply", "Find:", "Experience", "Trust", "Toy mode is for:"]) {
        assert.ok(translateModText(label, cn), `CN ${label}`);
        assert.ok(translateModText(label, tw), `TW ${label}`);
    }
    assert.equal(translateModText("Setup", tw), "初始設定");
    assert.equal(translateModText("5.8 interactions · 3m ago", cn), "5.8 次互动 · 3 分钟前");
    assert.equal(translateModText("12.0 interactions · just now", cn), "12.0 次互动 · 刚刚");
    assert.equal(translateModText("2.5 interactions · 4d ago", tw), "2.5 次互動 · 4 天前");
    assert.equal(translateModText("Read-only: Extreme lock until Mon, Nov 23. /echs safeword always ends a trance.", cn)?.startsWith("只读：极限锁定持续到 Mon, Nov 23"), true);
    assert.equal(translateModText("Your 7-day Extreme trial has ended. How was your experience?", cn), "你的 7 天极限试用已结束。体验如何？");
    assert.equal(translateModText("Your 30-day Extreme lock has expired. Continue for another 30 days?", cn), "你的 30 天极限锁定已到期。要再继续 30 天吗？");
    assert.ok(translateModText("Extreme makes your settings read-only for 7 days, even switching hypnosis off. New triggers can still be planted, but nobody can remove one, not even its planter.", cn).includes("7 天"));
    assert.equal(translateModText("\"Sink deeper\" stops at: Deep.", cn), "「沉得更深」停在：深度。");
    assert.equal(translateModText("When someone tries: you are asked first; your owner and lovers put you straight under (toy mode).", cn)?.startsWith("有人尝试时"), true);
});

// Regression: BC declares `let MainCanvas` / `let PreferenceExtensionsCurrent` / `let PreferenceExtensionsSettings`.
// Those are global LEXICAL bindings: reachable as bare identifiers, never as globalThis properties. The older tests
// above put them on a fake `env`, which hid that the real game never reached the canvas layer.
vm.runInThisContext("let MainCanvas, PreferenceExtensionsCurrent, PreferenceExtensionsSettings = {};");

test("the let-declared BC globals are really invisible on globalThis (the premise of this regression)", () => {
    assert.equal("MainCanvas" in globalThis, false);
    assert.equal("PreferenceExtensionsCurrent" in globalThis, false);
});

test("isEchsScreen and the canvas patch work with real `let` globals, even when window.MainCanvas is the <canvas> element", () => {
    const mine = { run() {} };
    const ctx = fakeContext();
    globalThis.__echsTest = { mine, ctx };
    vm.runInThisContext("MainCanvas = __echsTest.ctx; PreferenceExtensionsSettings = { HypnosisAddon: __echsTest.mine }; PreferenceExtensionsCurrent = __echsTest.mine;");
    try {
        // window.MainCanvas is the element with the same id: no fillText, so it must be ignored.
        const env = { CurrentScreen: "Preference", MainCanvas: { tagName: "CANVAS" }, setInterval(fn) { env.poll = fn; return 1; }, clearInterval() {} };
        assert.equal(getMainCanvas(env), ctx);
        assert.equal(isEchsScreen(env), true);
        let cleanup;
        setupEchsCanvas(() => dictionaries.CN.echs, () => true, fn => { cleanup = fn; }, env);
        ctx.fillText("Not noticing clothing changes", 0, 0);
        ctx.fillText("[Drifting]", 0, 0);
        assert.deepEqual(ctx.drawn.map(d => d.text), ["察觉不到衣物变化", "[漂浮]"]);
        // Leaving the screen (BC sets Current back to null) stops translation.
        vm.runInThisContext("PreferenceExtensionsCurrent = null;");
        assert.equal(isEchsScreen(env), false);
        ctx.fillText("Not noticing clothing changes", 0, 0);
        assert.equal(ctx.drawn.at(-1).text, "Not noticing clothing changes");
        cleanup();
    } finally {
        vm.runInThisContext("MainCanvas = undefined; PreferenceExtensionsCurrent = undefined; PreferenceExtensionsSettings = {};");
        delete globalThis.__echsTest;
    }
});

test("getMainCanvas falls back to the canvas element's own context", () => {
    const ctx = fakeContext();
    const env = { document: { getElementById: id => id === "MainCanvas" ? { getContext: type => type === "2d" ? ctx : null } : null } };
    assert.equal(getMainCanvas(env), ctx);
    assert.equal(getMainCanvas({}), undefined);
});

test("Depth tab strings drawn through fillText: bracketed tiers, rows, blurb and fitted width", () => {
    for (const [lang, tier] of [["CN", "[漂浮]"], ["TW", "[漂浮]"]]) {
        const map = dictionaries[lang].echs;
        const { ctx } = make(map);
        ctx.fillText("[Drifting]", 0, 0);
        ctx.fillText("[Yielding]", 0, 0);
        ctx.fillText("Cannot reach the wardrobe", 0, 0);
        ctx.fillText("How deep you must be before each thing can reach you. The checkbox still has to be on.", 0, 0);
        assert.equal(ctx.drawn[0].text, tier);
        assert.ok(ctx.drawn.every(d => /[\u3400-\u9fff]/.test(d.text)), JSON.stringify(ctx.drawn));
    }
});

test("the real BC screen name is \"Preference\"; the plural never matches", () => {
    const mine = { run() {} };
    const settings = { HypnosisAddon: mine };
    assert.equal(isEchsScreen({ CurrentScreen: "Preference", PreferenceExtensionsCurrent: mine, PreferenceExtensionsSettings: settings }), true);
    assert.equal(isEchsScreen({ CurrentScreen: "Preferences", PreferenceExtensionsCurrent: mine, PreferenceExtensionsSettings: settings }), false);
});
