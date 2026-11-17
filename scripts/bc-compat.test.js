import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { collectHookedFunctions, compare, crc32, fingerprint, hashSource, loadBcFunctions } from "./check-bc-compat.js";

// Ported from AEE's scripts/test-bc-compat.mjs. It checks the drift detector itself (no BC source needed),
// plus two guards that tie the committed baseline to the hooks BCTP really installs.
const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const script = fileURLToPath(new URL("./check-bc-compat.js", import.meta.url));

function withWorkspace(run) {
    const root = path.resolve(os.tmpdir());
    const workspace = fs.mkdtempSync(path.join(root, "bctp-bc-hooks-"));
    const write = (file, text) => {
        const target = path.join(workspace, file);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, text);
    };
    try {
        return run(workspace, write);
    } finally {
        assert.equal(path.dirname(workspace), root);
        fs.rmSync(workspace, { recursive: true, force: true });
    }
}

test("the CRC matches the standard check value and normalises CRLF", () => {
    assert.equal(crc32("123456789"), "CBF43926");
    assert.equal(hashSource("a\r\nb"), hashSource("a\nb"));
});

test("hook discovery flags runtime-built names and reports locations", () =>
    withWorkspace((workspace, write) => {
        write("src/a.js", "sdk.hookFunction('Alpha', 1, hook);\nsdk?.callOriginal(\"Beta\", args);\n");
        write("src/nested/b.js", "sdk.hookFunction(`Alpha`, 2, hook);\nconst n = 'X'; sdk.hookFunction(n, 1, hook);\n");
        const hooked = collectHookedFunctions(path.join(workspace, "src"), workspace);
        assert.deepEqual([...hooked.names.keys()].sort(), ["Alpha", "Beta"]);
        assert.deepEqual(hooked.names.get("Alpha").locations, ["src/a.js:1", "src/nested/b.js:1"]);
        assert.deepEqual(hooked.dynamic, ["src/nested/b.js:2"]);
    }));

test("a loop over a literal list hooks every name in it and is not reported as runtime-built", () =>
    withWorkspace((workspace, write) => {
        write(
            "src/loop.js",
            "for (const fn of ['One', \"Two\"]) {\n  mod.hookFunction(fn, 10, (args, next) => next(args));\n}\nconst other = 'X'; mod.hookFunction(other, 1, hook);\n",
        );
        const hooked = collectHookedFunctions(path.join(workspace, "src"), workspace);
        assert.deepEqual([...hooked.names.keys()].sort(), ["One", "Two"]);
        assert.deepEqual(hooked.names.get("Two").locations, ["src/loop.js:1"]);
        assert.deepEqual(hooked.dynamic, ["src/loop.js:4"]);
    }));

test("only top-level BC functions are indexed, in both the mirror and the upstream layout", () =>
    withWorkspace((workspace, write) => {
        const alpha = "function Alpha(a) {\n  return a + 1;\n}";
        write("bc/Scripts/Game.js", 'var GameVersion = "R999";\n');
        write(
            "bc/Scripts/A.js",
            `${alpha}\nasync function Beta() { return 2; }\nvar Gamma = function () { return 3; };\nvar Delta = (x) => x;\nconst Hidden = () => 0;\nfunction Outer() { function Inner() {} }\n`,
        );
        write("bc/Screens/Room/B.js", "function Epsilon() {}\n");
        write("bc/Screens/Room/Broken.js", "function (((\n");
        const bc = loadBcFunctions(path.join(workspace, "bc"));
        assert.equal(bc.gameVersion, "R999");
        assert.deepEqual([...bc.functions.keys()].sort(), ["Alpha", "Beta", "Delta", "Epsilon", "Gamma", "Outer"]);
        assert.equal(bc.functions.get("Alpha").hash, hashSource(alpha));
        assert.equal(bc.functions.get("Epsilon").file, "Screens/Room/B.js");
        assert.equal(bc.parseErrors.length, 1);
        assert.match(bc.parseErrors[0], /Broken\.js/);
        write("upstream/BondageClub/Scripts/Game.js", 'var GameVersion = "R1";\n');
        write("upstream/BondageClub/Scripts/A.js", alpha);
        assert.equal(loadBcFunctions(path.join(workspace, "upstream")).functions.get("Alpha").hash, hashSource(alpha));
    }));

test("namespaced targets and `<Name>Hook` extended-item functions are fingerprinted", () =>
    withWorkspace((workspace, write) => {
        write("bc/Scripts/Game.js", 'var GameVersion = "R998";\n');
        write(
            "bc/Scripts/Ns.js",
            "class Panel { static create() { return 1; } build() { return 2; } }\nvar Util = { run: function () { return 3; }, quick() { return 4; }, value: 5 };\nfunction ExtendedHook() { return 6; }\n",
        );
        const bc = loadBcFunctions(path.join(workspace, "bc"));
        assert.deepEqual([...bc.functions.keys()].sort(), ["ExtendedHook", "Panel.build", "Panel.create", "Util.quick", "Util.run"]);
        const hooked = {
            names: new Map(["Panel.create", "Util.run", "Extended", "Util.value", "Nope"].map((n) => [n, { locations: [] }])),
        };
        const print = fingerprint(hooked, bc);
        assert.deepEqual(Object.keys(print.functions).sort(), ["Extended", "Panel.create", "Util.run"]);
        assert.equal(print.functions.Extended.via, "Hook");
        assert.deepEqual(print.missing.sort(), ["Nope", "Util.value"]);
    }));

test("drift is classified as changed, added, stale or missing", () => {
    const current = { functions: { Alpha: { hash: "AAAAAAAA" }, Beta: { hash: "BBBBBBBB" } }, missing: [] };
    assert.equal(compare({ functions: current.functions }, current).drift, false);
    const drifted = compare(
        { functions: { Alpha: { hash: "00000000" }, Beta: { hash: "BBBBBBBB" }, Old: { hash: "11111111" } } },
        { functions: { ...current.functions, New: { hash: "22222222", file: "x" } }, missing: ["Gone"] },
    );
    assert.deepEqual(
        drifted.changed.map((item) => item.name),
        ["Alpha"],
    );
    assert.deepEqual([drifted.added, drifted.stale, drifted.missing], [["New"], ["Old"], ["Gone"]]);
    assert.equal(drifted.drift, true);
});

test("the CLI exits 0 in sync, 1 on drift and 2 on bad usage", () =>
    withWorkspace((workspace, write) => {
        const real = collectHookedFunctions(path.join(projectRoot, "src"), projectRoot);
        assert.ok(real.names.size >= 5, "BCTP hooks BC functions");
        const names = [...real.names.keys()];
        const body = (name, value = name) => `function ${name}() { return '${value}'; }\n`;
        write("fixture/Scripts/Game.js", 'var GameVersion = "R-test";\n');
        write("fixture/Scripts/All.js", names.map((name) => body(name)).join(""));
        const run = (...args) => {
            const env = { ...process.env };
            delete env.BC_DIR;
            return spawnSync(process.execPath, [script, ...args], { encoding: "utf8", env, cwd: workspace });
        };
        const baseline = path.join(workspace, "baseline.json");
        const fixture = path.join(workspace, "fixture");
        assert.equal(run("--nonsense").status, 2, "unknown arguments are rejected");
        assert.equal(run("--bc-dir", fixture, "--baseline", baseline).status, 2, "a missing baseline is a usage error");
        assert.equal(run("--bc-dir", fixture, "--baseline", baseline, "--update").status, 0);
        assert.equal(JSON.parse(fs.readFileSync(baseline, "utf8")).gameVersion, "R-test");
        assert.equal(run("--bc-dir", fixture, "--baseline", baseline).status, 0, "unchanged source is in sync");
        const [victim] = names;
        write("fixture/Scripts/All.js", names.map((name) => body(name, name === victim ? "changed" : name)).join(""));
        const report = path.join(workspace, "report.md");
        assert.equal(run("--bc-dir", fixture, "--baseline", baseline, "--report", report).status, 1, "a changed body is drift");
        assert.match(fs.readFileSync(report, "utf8"), new RegExp(`- ${victim} \\(Scripts/All\\.js\\)`));
        write(
            "fixture/Scripts/All.js",
            names
                .filter((name) => name !== victim)
                .map((name) => body(name))
                .join(""),
        );
        assert.equal(run("--bc-dir", fixture, "--baseline", baseline).status, 1, "a removed BC function is drift");
    }));

test("the committed baseline covers exactly the functions BCTP hooks", () => {
    const hooked = collectHookedFunctions(path.join(projectRoot, "src"), projectRoot);
    assert.deepEqual(hooked.dynamic, [], "hook names must be string literals so the drift check can see them");
    const baseline = JSON.parse(fs.readFileSync(path.join(projectRoot, "scripts/bc-compat-baseline.json"), "utf8"));
    assert.deepEqual(Object.keys(baseline.functions).sort(), [...hooked.names.keys()].sort());
    for (const entry of Object.values(baseline.functions)) assert.match(entry.hash, /^[0-9A-F]{8}$/);
});

test("the weekly workflow and npm script run the same check", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"));
    assert.equal(pkg.scripts["check:bc"], "node scripts/check-bc-compat.js");
    assert.ok(pkg.devDependencies.acorn, "acorn is declared, otherwise `npm ci` in CI cannot run the check");
    const workflow = fs.readFileSync(path.join(projectRoot, ".github/workflows/bc-compat.yml"), "utf8");
    assert.ok(workflow.includes("scripts/check-bc-compat.js"));
    assert.ok(workflow.includes("schedule:"));
});
