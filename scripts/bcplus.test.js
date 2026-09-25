import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parseHTML } from "linkedom";
import { generateDict } from "./gen-dict.js";
import { translateBcplusElement, translateBcplusText, setupBcplusObserver } from "../src/mods/bcplus.js";
import { tokens } from "./validate-translations.js";

const dictionaries = generateDict().surfaces;
function fixture() {
    const { window } = parseHTML("<html><body><button id='outside'>Rules</button><div id='BCPUIWindow'></div></body></html>");
    const root = window.document.getElementById("BCPUIWindow").attachShadow({ mode: "open" });
    root.innerHTML = `<style>.Rules { color: red }</style><button title="Save" aria-label="Close"><span>Rules</span></button>
        <input placeholder="Search rules..." value="Rules"><textarea>Rules</textarea>
        <div contenteditable="true"><span>Rules</span></div><code>/bcp help</code>
        <select><option>Save</option><option value="machine-id">Cancel</option></select>`;
    return { window, root };
}
const scan = (root, lang) => root.querySelectorAll("*").forEach(el => translateBcplusElement(el, dictionaries, lang));

test("BC+ CN/TW/English transitions retain input, options, CSS and event handlers", () => {
    const { window, root } = fixture();
    let clicks = 0;
    root.querySelector("button").addEventListener("click", () => clicks++);
    const original = root.innerHTML;
    const implicitValue = root.querySelector("option").value;
    for (const [lang, expected] of [["CN", "规则"], ["TW", "規則"]]) {
        scan(root, lang);
        assert.equal(root.querySelector("button span").textContent, expected);
        assert.equal(root.querySelector("input").value, "Rules");
        assert.equal(root.querySelector("textarea").value, "Rules");
        assert.equal(root.querySelector("[contenteditable] span").textContent, "Rules");
        assert.equal(root.querySelector("style").textContent, ".Rules { color: red }");
        const [implicit, explicit] = root.querySelectorAll("option");
        assert.equal(implicit.textContent, "Save");
        assert.equal(implicit.value, implicitValue);
        assert.equal(implicit.getAttribute("value"), null);
        assert.equal(explicit.value, "machine-id");
        assert.equal(explicit.getAttribute("label"), dictionaries[lang].bcplus.Cancel);
        root.querySelector("button").click();
    }
    scan(root, "EN");
    assert.equal(root.innerHTML, original);
    assert.equal(window.document.getElementById("outside").textContent, "Rules");
    assert.equal(clicks, 2);
});

test("BC+ rereads Vue-updated source and tracks attributes independently", () => {
    const { root } = fixture();
    scan(root, "CN");
    const button = root.querySelector("button"), span = button.querySelector("span");
    button.setAttribute("title", "Cancel");
    span.firstChild.data = "Curses";
    root.querySelector("option").textContent = "Cancel";
    scan(root, "TW");
    assert.equal(button.title, "取消");
    assert.equal(button.getAttribute("aria-label"), "關閉");
    assert.equal(span.textContent, "詛咒");
    assert.equal(root.querySelector("option").getAttribute("label"), "取消");
    scan(root, null);
    assert.equal(button.title, "Cancel");
    assert.equal(span.textContent, "Curses");
    assert.equal(root.querySelector("option").getAttribute("label"), null);
});

test("BC+ matches normalized display text and bounded dynamic counters", () => {
    assert.equal(translateBcplusText("  Main\n Menu  ", dictionaries, "TW"), "  主選單  ");
    assert.equal(translateBcplusText("3 selected...", dictionaries, "TW"), "已選擇 3 人…");
    assert.equal(translateBcplusText("Tandem with BCX v1.2.3", dictionaries, "CN"), "与 BCX v1.2.3 并行运行");
    assert.equal(translateBcplusText("User supplied $& text", dictionaries, "TW"), "User supplied $& text");
    assert.equal(translateBcplusText("Save", dictionaries, null), "Save");
    assert.equal(translateBcplusText("Force 'Allow safeword use'", dictionaries, "CN"), "强制“允许使用安全词”");
    const description = "Pins who is allowed to use items on the player. While enforced, the 'Item permission' setting is held at the configured value - changes snap back within seconds. With the restore option on, the value from before the rule took hold returns when the rule stops applying.";
    assert.ok(translateBcplusText(description, dictionaries, "TW").includes("物品許可權") || translateBcplusText(description, dictionaries, "TW").includes("物品權限"));
    assert.equal(translateBcplusText("Force 'Unknown user string'", dictionaries, "CN"), "Force 'Unknown user string'");
});

test("BC+ Light theme and Light intensity have separate display meanings", () => {
    const { root } = fixture();
    root.innerHTML = "<select><option>Dark</option><option>Light</option></select><select><option>Heavy</option><option>Light</option></select>";
    scan(root, "TW");
    const options = root.querySelectorAll("option");
    assert.equal(options[1].getAttribute("label"), "淺色");
    assert.equal(options[3].getAttribute("label"), "輕度");
    scan(root, null);
    assert.equal(options[1].getAttribute("label"), null);
});

test("BC+ observer handles late shadow roots, Vue updates, reopen and cleanup", async () => {
    const { window, root } = fixture();
    let lang = "CN", poll;
    const work = new Map(); let id = 0;
    const cleanups = [];
    const env = {
        document: window.document, MutationObserver: window.MutationObserver,
        setInterval(fn) { poll = fn; return 1; }, clearInterval() { poll = null; },
        requestIdleCallback(fn) { work.set(++id, fn); return id; }, cancelIdleCallback(key) { work.delete(key); },
    };
    const flush = async () => {
        for (let i = 0; i < 10; i++) {
            await Promise.resolve();
            for (const [key, fn] of [...work]) { work.delete(key); fn({ didTimeout: true }); }
        }
        assert.equal(work.size, 0, "observer must settle, not loop on its translations");
    };
    const host = window.document.getElementById("BCPUIWindow");
    host.remove();
    setupBcplusObserver(dictionaries, () => lang, fn => cleanups.push(fn), env);
    window.document.body.appendChild(host); poll(); await flush();
    assert.equal(root.querySelector("button span").textContent, "规则");
    root.querySelector("button span").textContent = "Curses"; await flush();
    assert.equal(root.querySelector("button span").textContent, "诅咒");
    lang = "TW";
    window.document.dispatchEvent(new window.Event("bctp-language-change")); await flush();
    assert.equal(root.querySelector("button span").textContent, "詛咒");
    host.remove(); poll();
    const replacement = window.document.createElement("div"); replacement.id = "BCPUIWindow";
    window.document.body.appendChild(replacement); poll();
    const newRoot = replacement.attachShadow({ mode: "open" }); newRoot.innerHTML = "<button>Save</button>";
    poll(); await flush();
    assert.equal(newRoot.querySelector("button").textContent, dictionaries.TW.bcplus.Save);
    cleanups.forEach(fn => fn());
    assert.equal(newRoot.querySelector("button").textContent, "Save");
    assert.equal(poll, null);
    assert.equal(work.size, 0);
});

test("BC+ dictionary stays scoped and preserves placeholders", () => {
    const text = fs.readFileSync(new URL("../translations/mods/bcplus/ui.json", import.meta.url), "utf8");
    const raw = JSON.parse(text);
    const keys = [...text.matchAll(/^  ("(?:[^"\\]|\\.)*"):/gm)].map(match => JSON.parse(match[1]));
    assert.equal(new Set(keys).size, keys.length, "duplicate JSON keys must not be silently overwritten");
    const full = generateDict();
    for (const [source, target] of Object.entries(raw)) {
        assert.ok(source.trim() && target.trim());
        assert.deepEqual(tokens(source), tokens(target), source);
        assert.ok(full.surfaces.TW.bcplus[source]);
    }
    assert.equal(full.modMenu.CN["BC+ window theme"], undefined);
    assert.equal(full.surfaces.CN.bcplus["BC+ window theme"], "BC+ 窗口主题");
});

test("reported BC+ screenshot strings translate as rendered compositions in CN and TW", () => {
    const texts = [
        "Sort: Category", "Sort: Custom", "Rules in this contract (0)", "Rules (12)",
        "until released", "Only the author may end it early", "Either side may end it", "Delete draft",
        "Confirm delete", "Sign the contract", "Click again to SIGN", "End the contract",
        "Kneel", "Stand up", "Close eyes", "Open eyes", "Set emoticon", "Forced say", "Go to room", "Write lines",
        "Pick", "Your Lover", "Your BC Owner", "In this room", "3 rules - 1 h 30 min left - Either side may end it",
        "Enforced - signer's global conditions", "Logged only - Always in effect",
        ...["Rules", "Curses", "Punishments", "Contracts", "Commands", "Relationships", "Pet", "Statistics", "Log"].map(name => `${name} module enabled`),
        ...[
            "Shows an emoticon over the player's head (e.g. Afk, Sleep, Hearts, Confusion, Coffee).",
            "The player says the given sentence in chat.",
            "Sends the player to the named room: they leave their current room and join it. If the room is full or does not exist, they end up in the room search.",
            'Assigns lines the player must type in chat, e.g. "10 I will behave" for ten repetitions (max 50). Progress is tracked, completion is announced in the room, and the task survives reloads. "stop" cancels it.',
        ].map(text => `${text} (uses the argument field)`),
    ];
    for (const lang of ["CN", "TW"]) for (const text of texts) {
        const result = translateBcplusText(text, dictionaries, lang);
        assert.notEqual(result, text, `${lang}: ${text}`);
        assert.ok(!result.includes("undefined"));
        assert.ok(!result.includes("(uses the argument field)"));
    }
    assert.equal(translateBcplusText("General", dictionaries, "TW"), "設置");
    assert.equal(translateBcplusText("Switch", dictionaries, "TW"), "轉換者");
    assert.equal(translateBcplusText("General", dictionaries, "CN"), "设置");
    assert.equal(translateBcplusText("Switch", dictionaries, "CN"), "转换者");
    assert.equal(translateBcplusText("Draft - Alice $& 自訂標題", dictionaries, "TW"), "草稿 - Alice $& 自訂標題");
    assert.equal(translateBcplusText("Contract - My Rules", dictionaries, "CN"), "契约 - My Rules");
});

test("contract textarea placeholder translates while editable title, terms and machine duration stay unchanged", () => {
    const { root } = fixture();
    root.innerHTML = `<input value="New contract"><textarea placeholder="Free-text terms, shown to the signer on the review screen">My own terms $&</textarea>
        <select><option value="0">until released</option><option value="90">1 h 30 min</option></select>`;
    for (const lang of ["CN", "TW", "EN"]) {
        scan(root, lang);
        const textarea = root.querySelector("textarea");
        assert.equal(textarea.value, "My own terms $&");
        assert.equal(root.querySelector("input").value, "New contract");
        assert.equal(root.querySelector("option").value, "0");
        assert.equal(textarea.getAttribute("placeholder"), dictionaries[lang]?.bcplus["Free-text terms, shown to the signer on the review screen"] || "Free-text terms, shown to the signer on the review screen");
    }
});

test("standalone preset confirmation is discovered without a BC+ window and preserves Yes action", async () => {
    const { window } = parseHTML("<html><body></body></html>");
    let poll, lang = "CN", accepted;
    const tasks = new Map(); let id = 0;
    const cleanups = [];
    const env = { document: window.document, MutationObserver: window.MutationObserver,
        setInterval(fn) { poll = fn; }, clearInterval() { poll = undefined; },
        requestIdleCallback(fn) { tasks.set(++id, fn); return id; }, cancelIdleCallback(key) { tasks.delete(key); } };
    const flush = async () => {
        for (let i = 0; i < 10; i++) {
            await Promise.resolve();
            for (const [key, fn] of [...tasks]) { tasks.delete(key); fn({ didTimeout: true }); }
        }
        assert.equal(tasks.size, 0);
    };
    setupBcplusObserver(dictionaries, () => lang, fn => cleanups.push(fn), env);
    const overlay = window.document.createElement("div");
    overlay.style.position = "fixed"; overlay.style.zIndex = "100000";
    overlay.innerHTML = '<div tabindex="-1"><div>BC+</div><div id="message"></div><button>Yes</button><button>Cancel</button></div>';
    const text = 'Set your preset to Switch?\nThis configures your permissions to match and locks the preset - only a factory reset clears it.';
    overlay.querySelector("#message").textContent = text;
    overlay.querySelector("button").addEventListener("click", () => { accepted = "Yes"; });
    window.document.body.appendChild(overlay);
    const unrelated = overlay.cloneNode(true);
    unrelated.firstElementChild.firstElementChild.textContent = "Another mod";
    window.document.body.appendChild(unrelated);
    poll(); await flush();
    assert.ok(overlay.querySelector("#message").textContent.includes("转换者"));
    assert.equal(overlay.querySelector("button").textContent, "是");
    overlay.querySelector("button").click(); assert.equal(accepted, "Yes");
    assert.equal(unrelated.querySelector("button").textContent, "Yes");
    lang = "TW"; window.document.dispatchEvent(new window.Event("bctp-language-change")); await flush();
    assert.ok(overlay.querySelector("#message").textContent.includes("轉換者"));
    lang = "EN"; window.document.dispatchEvent(new window.Event("bctp-language-change")); await flush();
    assert.equal(overlay.querySelector("#message").textContent, text);
    assert.equal(overlay.querySelector("button").textContent, "Yes");
    cleanups.forEach(fn => fn());
    assert.equal(poll, undefined);
});
