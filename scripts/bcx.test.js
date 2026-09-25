import test from "node:test";
import assert from "node:assert/strict";
import { setupBcxCanvas, translateBcxLog } from "../src/mods/bcxCanvas.js";
import { generateDict } from "./gen-dict.js";
import vm from "node:vm";
import { build } from "esbuild";
const GEN = generateDict();

test("BCX uses the game's lexical canvas context rather than the window's named HTML element", async () => {
    const bundle = await build({ entryPoints: ["src/mods/bcxCanvas.js"], bundle: true,
        write: false, format: "iife", globalName: "BcxAdapter" });
    const hooks = {}, drawn = [];
    const element = { tagName: "CANVAS" };
    const ctx = {
        font: "36px Arial", fillStyle: "black", textAlign: "left", textBaseline: "middle",
        save() {}, restore() {}, measureText(text) { return { width: text.length * 20 }; },
        fillText(text) { drawn.push(text); },
    };
    const sandbox = vm.createContext({ MainCanvas: element, context: ctx,
        CurrentScreen: "InformationSheet", BCX_Loaded: true, bcx: { inBcxSubscreen: () => true },
        sdk: { hookFunction(name, priority, hook) { hooks[name] = hook; } } });
    vm.runInContext("let MainCanvas = context;", sandbox);
    vm.runInContext(bundle.outputFiles[0].text, sandbox);
    vm.runInContext(`var observe = BcxAdapter.setupBcxCanvas(sdk,
        text => text === "Usage:" ? "用法：" : undefined, () => "TW");`, sandbox);
    hooks.InformationSheetRun([], () => vm.runInContext(`
        observe("DrawText", ['- Commands: Description of the command: "Eyes" -', 125, 125]);
        MainCanvas.measureText("Usage:"); MainCanvas.fillText("Usage:", 125, 470);
    `, sandbox));
    assert.deepEqual(drawn, ["用法："]);
    assert.deepEqual(element, { tagName: "CANVAS" });
    for (const value of [undefined, element, { measureText() {}, fillText() {} }]) {
        sandbox.context = value;
        vm.runInContext("MainCanvas = context;", sandbox);
        let calls = 0;
        assert.equal(hooks.InformationSheetRun([], () => { calls++; return "original"; }), "original");
        assert.equal(calls, 1);
    }
});

test("BCX command canvas translates wrapped paragraphs and preserves syntax", () => {
    globalThis.CurrentScreen = "InformationSheet";
    globalThis.BCX_Loaded = true;
    globalThis.bcx = { inBcxSubscreen: () => true };
    const drawn = [], hooks = {};
    const ctx = globalThis.MainCanvas = {
        font: "36px Arial", fillStyle: "black", textAlign: "left", textBaseline: "middle",
        save() {}, restore() {}, measureText(text) { return { width: text.length * 20 }; },
        fillText(...args) { drawn.push(args); },
    };
    const originalMeasure = ctx.measureText, originalDraw = ctx.fillText;
    let lang = "TW";
    const translate = text => GEN.modMenu[lang]?.[text] || GEN.modRegex[lang]?.reduce((value, entry) => {
        const regex = new RegExp(entry.p);
        return value || (regex.test(text) ? text.replace(regex, entry.r) : undefined);
    }, undefined);
    const observe = setupBcxCanvas({ hookFunction(name, priority, hook) { hooks[name] = hook; } }, translate, () => lang);
    const source = "This command forces Akaciya's eyes into the specified state, but they can still manually change it.";
    const run = () => {
        observe("DrawText", ['- Commands: Description of the command: "Eyes" -', 125, 125]);
        ctx.measureText(source);
        ctx.fillText(source.slice(0, source.indexOf(" but")), 125, 350);
        ctx.fillText(source.slice(source.indexOf(" but") + 1), 125, 396);
        ctx.measureText("Usage:");
        ctx.fillText("Usage:", 125, 442);
        ctx.fillText("!eyes <open | close | up | down>", 125, 488);
        ctx.fillText("unrelated", 900, 800);
    };
    // Split at a space, just as BCX's wrapping routine does.

    for (lang of ["CN", "TW"]) {
        drawn.length = 0;
        hooks.InformationSheetRun([], run);
        assert.ok(drawn.some(row => row[0].includes("Akaciya") && !row[0].includes("This command")));
        assert.ok(drawn.some(row => row[0] === "用法："));
        assert.ok(drawn.some(row => row[0] === "!eyes <open | close | up | down>"));
        assert.ok(drawn.some(row => row[0] === "unrelated"));
        assert.equal(ctx.measureText, originalMeasure);
        assert.equal(ctx.fillText, originalDraw);
    }
    assert.throws(() => hooks.InformationSheetRun([], () => { run(); throw Error("render failed"); }), /render failed/);
    assert.equal(ctx.measureText, originalMeasure);
    assert.equal(ctx.fillText, originalDraw);
    lang = null;
    drawn.length = 0;
    hooks.InformationSheetRun([], run);
    assert.ok(drawn.some(row => row[0].startsWith("This command")));
});

test("BCX log rendering preserves identities and notes and is scoped to log rows", () => {
    globalThis.CurrentScreen = "InformationSheet";
    globalThis.BCX_Loaded = true;
    globalThis.bcx = { inBcxSubscreen: () => true };
    const row = text => [text, 210, 324, 1020];
    assert.equal(translateBcxLog("DrawTextFit", row("Akaciya (207811) removed [unknown name] (16242) from being owner."), "TW"),
        "Akaciya (207811) 移除了[unknown name] (16242)的主人身分。");
    assert.equal(translateBcxLog("DrawTextFit", row("Leanan (16242) added herself as owner."), "TW"), "Leanan (16242) 將自己設為主人。");
    assert.equal(translateBcxLog("DrawTextFit", row("Praised by A (123) with note: Keep this English $&"), "TW"), "A (123) 給予稱讚，備註：Keep this English $&");
    assert.equal(translateBcxLog("DrawText", row("Leanan (16242) added herself as owner."), "TW"), undefined);
    globalThis.CurrentScreen = "ChatRoom";
    assert.equal(translateBcxLog("DrawTextFit", row("Leanan (16242) added herself as owner."), "TW"), undefined);
});

