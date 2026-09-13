import assert from "node:assert/strict";
import test from "node:test";
import { inspectText, fingerprint } from "./validate-translations.js";
import { generateDict, runtimeDictionary } from "./gen-dict.js";

test("quality rejects broken pairs, duplicate keys and missing machine tokens", () => {
    const issues = inspectText("### comment\nPLAYER_NAME waits\n等待\nSame\n相同\nSame\n同樣\nUnpaired", "sample.txt");
    assert.deepEqual(issues.map(x => x.code).sort(), ["duplicate-key", "token-mismatch", "unpaired-line"]);
    assert.equal(issues.find(x => x.code === "token-mismatch").line, 2);
    assert.deepEqual(inspectText("PLAYER_NAME waits\r\nPLAYER_NAME 等待\r\n", "ok.txt"), []);
});
test("quality exceptions are specific to file, source and translation", () => {
    const issue = { file: "a", code: "token-mismatch", source: "PLAYER_NAME", target: "人", line: 1 };
    assert.equal(fingerprint(issue), fingerprint({ ...issue, line: 3 }));
    assert.notEqual(fingerprint(issue), fingerprint({ ...issue, target: "另一人" }));
});
test("runtime schema retains every consumer dictionary and omits build metadata", () => {
    const dict = runtimeDictionary(generateDict());
    assert.deepEqual(Object.keys(dict).sort(), ["surfaces", "paths", "activity", "modRegex", "bcxHelp", "crafting", "base", "modMenu"].sort());
    for (const [key, value] of Object.entries(dict)) {
        if (key === "paths") assert.ok(Object.keys(value).length);
        else for (const lang of ["CN", "TW"]) assert.ok(Object.keys(value[lang]).length, `${key}.${lang}`);
    }
});
