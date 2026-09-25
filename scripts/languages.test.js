import test from "node:test";
import assert from "node:assert/strict";
import { generateDict, runtimeDictionary } from "./gen-dict.js";
import { createLanguageLoader } from "../src/languageLoader.js";
import dictionary, { loadDictionary } from "../src/dictionary.js";
import { setupInjection } from "../src/inject.js";
import { DICTIONARY_KEYS } from "../src/schema.js";

const fixture = language => Object.fromEntries(DICTIONARY_KEYS.map(key => [key,
    key === "paths" ? { [`Test_${language}.txt`]: ["Hello", language] } : { [language]: key === "modRegex" ? [] : {} }]));

test("language artifacts contain only requested paths/tables and recombine without data loss", () => {
    const full = runtimeDictionary(generateDict());
    const cn = runtimeDictionary(full, "CN"), tw = runtimeDictionary(full, "TW");
    for (const [language, data] of [["CN", cn], ["TW", tw]]) {
        assert.ok(Object.keys(data.paths).every(path => path.endsWith(`_${language}.txt`)));
        for (const key of DICTIONARY_KEYS.filter(key => key !== "paths")) assert.deepEqual(Object.keys(data[key]), [language]);
        assert.ok(JSON.stringify(data).length < JSON.stringify(full).length);
    }
    for (const key of DICTIONARY_KEYS) assert.deepEqual({ ...cn[key], ...tw[key] }, full[key]);
});

test("language switching downloads lazily, shares requests and ignores stale completion", async () => {
    let language = null, applies = 0;
    const releases = {}, calls = [], loaded = new Set(), state = {};
    const loader = createLanguageLoader({ CN: "cn", TW: "tw" }, () => language, state, () => applies++, {
        has: lang => loaded.has(lang), load: (url, { language: lang }) => {
            calls.push(url);
            return new Promise((resolve, reject) => { releases[lang] = { resolve: () => { loaded.add(lang); resolve(); }, reject }; });
        },
    });
    await loader.ensure(); assert.deepEqual(calls, []);
    language = "TW"; const tw = loader.ensure(); assert.equal(loader.ensure(), tw);
    language = "CN"; const cn = loader.ensure();
    releases.TW.resolve(); await tw; assert.equal(applies, 0); assert.equal(state.loadingLanguage, "CN");
    releases.CN.reject(Error("offline")); await assert.rejects(cn, /offline/);
    assert.equal(state.languageError.message, "offline");
    const retry = loader.ensure(); releases.CN.resolve(); await retry;
    assert.equal(applies, 1); assert.equal(state.languageError, null);
    language = "TW"; await loader.ensure(); assert.deepEqual(calls, ["tw", "cn", "cn"]);
    language = null; await loader.ensure(); assert.equal(state.loadingLanguage, null);
});

test("disposed language coordinator never applies an in-flight response", async () => {
    let resolve, applies = 0;
    const loader = createLanguageLoader({ TW: "tw" }, () => "TW", {}, () => applies++, {
        has: () => false, load: () => new Promise(done => { resolve = done; }),
    });
    const request = loader.ensure(); loader.dispose(); resolve(); await request;
    assert.equal(applies, 0);
});

test("loader rejects wrong-language payload atomically and updates TranslationAvailable for late language", async () => {
    let hook;
    setupInjection({ hookFunction(name, priority, fn) { hook = fn; } });
    const available = name => hook([name], () => false);
    assert.equal(available("Test_TW.txt"), false);
    const fetchData = lang => async () => ({ ok: true, json: async () => fixture(lang) });
    await assert.rejects(loadDictionary("tw", { language: "TW", fetchImpl: fetchData("CN") }), /language/);
    assert.deepEqual(dictionary.paths, {});
    await loadDictionary("tw", { language: "TW", fetchImpl: fetchData("TW") });
    assert.equal(available("test_tw.TXT"), true);
    assert.equal(available("Test_CN.txt"), false);
    await loadDictionary("cn", { language: "CN", fetchImpl: fetchData("CN") });
    assert.equal(available("Test_CN.txt"), true);
    assert.equal(available("Test_TW.txt"), true);
    await loadDictionary("tw", { language: "TW", fetchImpl: () => assert.fail("cached language must not download") });
});
