import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { build } from "esbuild";
import { parseHTML } from "linkedom";
import { walk } from "./lib/fsutil.js";

test("every runtime source belongs to the entry import graph", async () => {
    const output = await build({ entryPoints: ["src/index.js"], bundle: true, write: false, metafile: true });
    const inputs = new Set(Object.keys(output.metafile.inputs).map(file => path.resolve(file)));
    for (const file of walk("src", file => file.endsWith(".js"))) assert.ok(inputs.has(path.resolve(file)), `unreachable runtime source: ${file}`);
});

test("architecture navigation renders, switches features and links to existing files", () => {
    const html = fs.readFileSync("DOCS/architecture.html", "utf8");
    const { document } = parseHTML(html);
    const script = document.querySelector("script").textContent;
    const context = vm.createContext({ document });
    vm.runInContext(script, context);
    assert.ok(document.getElementById("title").textContent);
    const features = vm.runInContext("features", context);
    for (const feature of features) {
        for (const file of feature.branches.flatMap(branch => branch[2])) assert.ok(fs.existsSync(file), `stale architecture link: ${file}`);
        context.feature = feature;
        vm.runInContext("choose(feature)", context);
        assert.equal(document.getElementById("title").textContent, feature.name);
        assert.ok(document.querySelectorAll(".node").length > 1);
    }
    vm.runInContext('renderList("BC+")', context);
    assert.ok(document.querySelectorAll(".feature-btn").length < features.length);
});
