import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildBody, plan, summarize } from "./bc-compat-issue.js";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const drift = (overrides = {}) => ({
    gameVersion: "R134",
    changed: [{ name: "ChatRoomSync", file: "Screens/Online/ChatRoom/ChatRoom.js", was: "AAAA0000", now: "BBBB1111" }],
    missing: [],
    added: [],
    stale: [],
    ...overrides,
});
const clean = { gameVersion: "R134", changed: [], missing: [], added: [], stale: [] };

test("the summary counts every kind of difference and ignores their order", () => {
    const a = summarize(drift({ missing: ["B", "A"], added: ["Z"], stale: ["Y"] }));
    const b = summarize(drift({ missing: ["A", "B"], added: ["Z"], stale: ["Y"] }));
    assert.equal(a.problems, 5);
    assert.equal(a.sig, b.sig);
    assert.deepEqual(a.missing, ["A", "B"]);
});

test("the signature follows the differences, not the BC version", () => {
    assert.equal(summarize(drift()).sig, summarize(drift({ gameVersion: "R135" })).sig);
    assert.notEqual(summarize(drift()).sig, summarize(drift({ missing: ["ServerSend"] })).sig);
    assert.equal(summarize(clean).problems, 0);
});

test("drift with no open issue creates one", () => {
    assert.deepEqual(plan(summarize(drift()), []), { action: "create" });
});

test("the same drift as last time does not notify again", () => {
    const summary = summarize(drift());
    const open = [{ number: 7, body: buildBody({ project: "BCTP", report: drift(), summary }) }];
    assert.deepEqual(plan(summary, open), { action: "unchanged" });
});

test("different drift updates the open issue", () => {
    const before = summarize(drift());
    const open = [{ number: 7, body: buildBody({ project: "BCTP", report: drift(), summary: before }) }];
    const after = summarize(drift({ missing: ["ServerSend"] }));
    assert.deepEqual(plan(after, open), { action: "update", number: 7 });
});

test("an issue without a signature (written by the old workflow) is updated once", () => {
    assert.deepEqual(plan(summarize(drift()), [{ number: 3, body: "舊版內文" }]), {
        action: "update",
        number: 3,
    });
});

test("no drift closes every open issue and otherwise does nothing", () => {
    const none = summarize(clean);
    assert.deepEqual(
        plan(none, [
            { number: 7, body: "" },
            { number: 9, body: "" },
        ]),
        { action: "close", numbers: [7, 9] },
    );
    assert.deepEqual(plan(none, []), { action: "none" });
});

test("the issue body carries the signature, the lists and the update command", () => {
    const report = drift({ missing: ["ServerSend"] });
    const body = buildBody({
        project: "BCTP",
        report,
        summary: summarize(report),
        detail: "full report",
    });
    assert.match(body, /bc-compat-sig:[0-9a-f]{12}/);
    assert.ok(body.includes("`ServerSend`"));
    assert.ok(body.includes("ChatRoomSync"));
    assert.ok(body.includes("--update"));
    assert.ok(body.includes("full report"));
});

test("the weekly workflow hands the result to the issue script", () => {
    const workflow = fs.readFileSync(path.join(projectRoot, ".github/workflows/bc-compat.yml"), "utf8");
    assert.ok(workflow.includes("scripts/bc-compat-issue.js"));
    assert.ok(workflow.includes("--json"));
});
