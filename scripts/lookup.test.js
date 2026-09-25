import assert from "node:assert/strict";
import test from "node:test";
import { generateDict } from "./gen-dict.js";
import { createLookup } from "../src/mods/lookup.js";
import { translateValue } from "../src/mods/displayText.js";
import { createMissingCollector } from "../src/mods/missing.js";
import { setupBcxHelp } from "../src/mods/bcxHelp.js";
import dictionary from "../src/dictionary.js";

const generated = generateDict();

test("lookup preserves compatibility scope and priority, with CN/TW and inactive languages", () => {
    let lang = "CN";
    const env = { CurrentScreen: "InformationSheet", BCX_Loaded: true, Player: { LSCG: true } };
    const lookup = createLookup(generated, () => lang, env);
    assert.equal(lookup.menu("None"), "无");
    lang = "TW";
    assert.equal(lookup.menu("None"), "無");
    assert.equal(lookup.menu("- Miscellaneous: Configuration for Alice -"), "- 雜項: Alice 的配置 -");
    assert.equal(lookup.activity("Alice spoke openly in a room."), "Alice嘗試在房間說話.");
    env.BCX_Loaded = false;
    assert.equal(lookup.menu("- Miscellaneous: Configuration for Alice -"), undefined);
    assert.equal(lookup.activity("Alice spoke openly in a room."), undefined);
    lang = null;
    for (const fn of Object.values(lookup)) assert.equal(fn("None"), undefined);
});

test("compatibility migration preserves regex patterns, flags and replacement references in TW", () => {
    for (const id of ["BCX", "LSCG"]) for (const scope of ["menu", "activities"]) {
        const cn = generated.compat.CN[id][scope], tw = generated.compat.TW[id][scope];
        assert.deepEqual(Object.keys(tw.text), Object.keys(cn.text));
        assert.equal(tw.regex.length, cn.regex.length);
        cn.regex.forEach((rule, i) => {
            assert.equal(tw.regex[i].p, rule.p);
            assert.equal(tw.regex[i].f, rule.f);
            assert.deepEqual(tw.regex[i].r.match(/\$\d+/g), rule.r.match(/\$\d+/g));
            assert.doesNotThrow(() => new RegExp(rule.p, rule.f));
        });
    }
    assert.ok(!("activityRegex" in generated));
    assert.ok(!("assetName" in generated));
});

test("shared display state isolates properties, preserves literal replacement text and adopts external edits", () => {
    const node = { title: " A ", placeholder: "B" };
    translateValue(node, "title", () => "$& $1");
    translateValue(node, "placeholder", () => "乙");
    assert.equal(node.title, " $& $1 ");
    translateValue(node, "title", () => undefined);
    assert.equal(node.title, " A ");
    assert.equal(node.placeholder, "乙");
    node.placeholder = "user edit";
    translateValue(node, "placeholder", () => undefined);
    assert.equal(node.placeholder, "user edit");
});

test("BCX textarea help switches CN/TW/EN without overwriting export codes or user edits", () => {
    const source = "Known help";
    Object.assign(dictionary.bcxHelp, { CN: { [source]: "说明" }, TW: { [source]: "說明" } });
    const text = { value: source, isConnected: true }, code = { value: "BCX:abc", isConnected: true }, cleanups = [];
    const saved = { document: globalThis.document, setInterval: globalThis.setInterval,
        clearInterval: globalThis.clearInterval, TranslationLanguage: globalThis.TranslationLanguage,
        BCX_Loaded: globalThis.BCX_Loaded, CurrentScreen: globalThis.CurrentScreen };
    let tick, cleared = false, scans = 0;
    Object.assign(globalThis, { BCX_Loaded: true, CurrentScreen: "InformationSheet", document: { querySelectorAll: () => { scans++; return [text, code]; } },
        setInterval: fn => { tick = fn; return 123; }, clearInterval: id => { cleared = id === 123; } });
    try {
        setupBcxHelp(fn => cleanups.push(fn));
        for (const [lang, expected] of [["CN", "说明"], ["TW", "說明"], ["EN", source]]) {
            globalThis.TranslationLanguage = lang; tick(); assert.equal(text.value, expected);
            assert.equal(code.value, "BCX:abc");
        }
        globalThis.TranslationLanguage = "TW"; tick(); text.value = "my import code"; tick();
        globalThis.TranslationLanguage = "EN"; tick(); assert.equal(text.value, "my import code");
        const before = scans;
        globalThis.CurrentScreen = "ChatRoom"; tick(); assert.equal(scans, before);
        globalThis.CurrentScreen = "InformationSheet";
        globalThis.document.hidden = true; tick(); assert.equal(scans, before);
        cleanups.forEach(fn => fn()); assert.ok(cleared);
    } finally { Object.assign(globalThis, saved); }
});

test("lookup memoizes misses and hits, invalidates on data/context change and bounds retention", () => {
    let attempts = 0, language = "CN";
    const map = new Proxy({}, { get() { attempts++; return undefined; } });
    const data = { base: {}, crafting: {}, activity: {}, surfaces: {}, compat: {}, modRegex: {}, modMenu: { CN: map } };
    const env = { CurrentScreen: "ChatRoom" };
    const lookup = createLookup(data, () => language, env);
    lookup.menu("unknown"); const first = attempts;
    for (let i = 0; i < 1000; i++) lookup.menu("unknown");
    assert.equal(attempts, first);
    env.CurrentScreen = "InformationSheet"; lookup.menu("unknown"); assert.ok(attempts > first);
    data.modMenu.CN = { unknown: "已載入" }; assert.equal(lookup.menu("unknown"), "已載入");
    data.modMenu.CN = map;
    for (let i = 0; i < 520; i++) lookup.menu(`name ${i}`);
    const after = attempts; lookup.menu("name 0"); assert.ok(attempts > after);
    language = null; assert.equal(lookup.menu("unknown"), undefined);
});

test("missing diagnostic collection has a fixed bound and can be cleared", () => {
    const collector = createMissingCollector(2);
    for (const text of ["B", "B", "A", "C"]) collector.add(text);
    assert.deepEqual(collector.list(), ["A", "B"]);
    collector.clear(); collector.add("C"); assert.deepEqual(collector.list(), ["C"]);
});
