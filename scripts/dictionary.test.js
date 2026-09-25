import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { build } from "esbuild";
import { startOnce } from "../src/lifecycle.js";

const fixture = () => ({ paths: { "Test_CN.txt": ["Hello", "你好"] },
    surfaces: {}, activity: {}, modRegex: {}, bcxHelp: {}, crafting: {}, base: {}, modMenu: {}, compat: {} });
let sequence = 0;
const fresh = () => import(`../src/dictionary.js?test=${sequence++}`);

test("dictionary deduplicates downloads, validates atomically, and retries failures", async () => {
    const { default: data, loadDictionary } = await fresh();
    const paths = data.paths;
    let release, requests = 0;
    const options = { fetchImpl: () => { requests++; return new Promise(resolve => { release = resolve; }); } };
    const first = loadDictionary("test", options);
    assert.equal(loadDictionary("test", options), first);
    release({ ok: false, status: 503 });
    await assert.rejects(first, /503/);
    await assert.rejects(loadDictionary("test", {
        fetchImpl: async () => ({ ok: true, json: async () => ({ ...fixture(), base: null }) }),
    }), /Invalid translation dictionary/);
    assert.deepEqual(data.paths, {});
    const retry = loadDictionary("test", options);
    release({ ok: true, json: async () => fixture() });
    await retry;
    assert.equal(data.paths, paths);
    assert.deepEqual(paths, fixture().paths);
    await loadDictionary("test", { fetchImpl: () => assert.fail("already downloaded") });
    assert.equal(requests, 2);
});

test("download timeout also aborts a stalled response body and permits retry", async () => {
    const { loadDictionary } = await fresh();
    await assert.rejects(loadDictionary("test", { timeoutMs: 10, fetchImpl: async (_, { signal }) => ({
        ok: true, json: () => new Promise((_, reject) => {
            signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
        }),
    }) }), /timed out/);
    await loadDictionary("test", { fetchImpl: async () => ({ ok: true, json: async () => fixture() }) });
});

test("public retry keeps failed state visible and concurrent retries initialize once", async () => {
    const g = {};
    let attempts = 0;
    await assert.rejects(startOnce(g, async () => {
        if (++attempts === 1) throw new Error("offline");
        return { pathCount: 1 };
    }), /offline/);
    assert.equal(g.BCTP.status, "failed");
    const retry = g.BCTP.retry();
    assert.equal(g.BCTP.retry(), retry);
    await retry;
    assert.equal(g.BCTP.status, "ready");
    assert.equal(attempts, 2);
});

test("real entry returns before dictionary download and stays loading beyond PCM's 30 seconds", async () => {
    const output = await build({ entryPoints: ["src/index.js"], bundle: true, write: false,
        format: "iife", minify: true, metafile: true, define: {
            __BCTP_VERSION__: '"test"', __BCTP_NAME__: '"TestMod"', __BCTP_FULLNAME__: '"Test"',
            __BCTP_REPO__: '"https://example.invalid"', __BCTP_DATA_URLS__: JSON.stringify({CN:"https://example.invalid/CN.json",TW:"https://example.invalid/TW.json"}),
        } });
    assert.ok(!Object.keys(output.metafile.inputs).some(file => file.endsWith("dict.json")));
    assert.ok(output.outputFiles[0].contents.length < 500000, "entry must remain small");
    let rejectDownload, signal;
    const timers = new Map();
    const ctx = { TranslationLanguage: "TW", console: { error() {} }, AbortController,
        setTimeout: (fn, delay) => { timers.set(fn, delay); return fn; },
        clearTimeout: fn => timers.delete(fn),
        fetch: (_, options) => { signal = options.signal; return new Promise((_, reject) => { rejectDownload = reject; }); },
    };
    vm.createContext(ctx);
    vm.runInContext(output.outputFiles[0].text, ctx);
    assert.equal(ctx.BCTP.status, "loading");
    // Flush startup microtasks without fulfilling the data request.
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(ctx.BCTP.phase, "downloading");
    for (const [fn, delay] of timers) if (delay <= 60000) fn();
    assert.equal(signal.aborted, false);
    assert.equal(ctx.BCTP.status, "loading");
    rejectDownload(new Error("offline"));
    await assert.rejects(ctx.BCTP.promise, /offline/);
    assert.equal(ctx.BCTP.status, "failed");
    assert.equal(timers.size, 0);
});
