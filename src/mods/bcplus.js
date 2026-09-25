import { createIdleBatchProcessor } from "./idleBatch.js";

const skip = "script, style, textarea, code, pre, [contenteditable]:not([contenteditable='false'])";
const normalize = text => text.replace(/\s+/g, " ").trim();
const originals = new WeakMap();
const patterns = [
    [/^(\d+) selected\.\.\.$/, "{count} selected...", ["count"]],
    [/^Tandem with BCX v([\w.?+-]+)$/, "Tandem with BCX v{version}", ["version"]],
    [/^([\w.+-]+) is the latest version$/, "{version} is the latest version", ["version"]],
];

export function translateBcplusText(text, dictionaries, lang) {
    const map = dictionaries[lang]?.bcplus;
    const key = normalize(text);
    if (!map || !key) return text;
    let translated = Object.hasOwn(map, key) ? map[key] : undefined;
    if (!translated) for (const [pattern, template, names] of patterns) {
        const match = pattern.exec(key);
        if (!match || !Object.hasOwn(map, template)) continue;
        translated = map[template].replace(/\{(\w+)\}/g, (token, name) => {
            const index = names.indexOf(name);
            return index < 0 ? token : match[index + 1];
        });
        break;
    }
    const forcedName = /^Force '(.+)'$/.exec(key);
    if (!translated && forcedName && Object.hasOwn(map, forcedName[1])) {
        translated = map["Force '{setting}'"]?.replace("{setting}", () => map[forcedName[1]]);
    }
    const forcedDescription = /^(.+) While enforced, the '(.+)' setting is held at the configured value - changes snap back within seconds\. With the restore option on, the value from before the rule took hold returns when the rule stops applying\.$/.exec(key);
    if (!translated && forcedDescription && map["Forced setting explanation: {setting}"] && Object.hasOwn(map, forcedDescription[1]) && Object.hasOwn(map, forcedDescription[2])) {
        translated = map[forcedDescription[1]] + " " + map["Forced setting explanation: {setting}"].replace("{setting}", () => map[forcedDescription[2]]);
    }
    return translated ? text.match(/^\s*/)[0] + translated + text.match(/\s*$/)[0] : text;
}

function update(node, property, read, write, dictionaries, lang) {
    let records = originals.get(node);
    if (!records) { records = new Map(); originals.set(node, records); }
    const current = read();
    let record = records.get(property);
    if (!record || current !== record.last) record = { source: current, last: current };
    const next = record.source === null ? null : translateBcplusText(record.source, dictionaries, lang);
    if (next !== current) write(next);
    record.last = next;
    records.set(property, record);
}

/** Only call on elements inside the verified BC+ shadow root. */
export function translateBcplusElement(element, dictionaries, lang) {
    if (element.closest(skip)) return;
    for (const attr of ["title", "placeholder", "aria-label"]) {
        update(element, attr, () => element.getAttribute(attr), value => {
            if (value === null) element.removeAttribute(attr);
            else element.setAttribute(attr, value);
        }, dictionaries, lang);
    }
    if (element.tagName === "OPTION") {
        // An option without value= derives its machine value from textContent.
        // Translate label= only, and remove our label again when restoring.
        let records = originals.get(element);
        const current = element.getAttribute("label");
        let record = records.get("option");
        if (!record || current !== record.last) record = { source: current, last: current };
        const source = record.source ?? element.textContent;
        const isTheme = normalize(source) === "Light" && [...element.parentElement.querySelectorAll("option")].some(option => option.textContent === "Dark");
        const translated = isTheme && dictionaries[lang]?.bcplus["Light theme"] || translateBcplusText(source, dictionaries, lang);
        const next = translated === source ? record.source : translated;
        if (current !== next) {
            if (next === null) element.removeAttribute("label");
            else element.setAttribute("label", next);
        }
        record.last = next;
        records.set("option", record);
        return;
    }
    if (element.tagName === "INPUT") return;
    for (const node of element.childNodes) {
        if (node.nodeType === 3) update(node, "data", () => node.data, value => { node.data = value; }, dictionaries, lang);
    }
}

export function setupBcplusObserver(dictionaries, getLang, addCleanup, env = globalThis) {
    const document = env.document;
    let root, observer, disposed = false;
    const processor = createIdleBatchProcessor(element => {
        if (element.isConnected && element.getRootNode() === root) translateBcplusElement(element, dictionaries, getLang());
    }, env);
    const collect = node => {
        if (node?.nodeType === 3) { if (node.parentElement) processor.push(node.parentElement); return; }
        if (node?.nodeType === 1) processor.push(node);
        node?.querySelectorAll?.("*").forEach(element => processor.push(element));
    };
    const discover = () => {
        if (disposed) return;
        const next = document.getElementById("BCPUIWindow")?.shadowRoot;
        if (next === root) return;
        observer?.disconnect();
        root = next;
        if (!root) return;
        observer = new env.MutationObserver(records => {
            for (const record of records) {
                if (record.type === "childList") {
                    // Includes OPTION text replacement: refresh its label too.
                    if (record.target.nodeType === 1) processor.push(record.target);
                    record.addedNodes.forEach(collect);
                } else collect(record.target);
            }
        });
        observer.observe(root, { subtree: true, childList: true, characterData: true,
            attributes: true, attributeFilter: ["title", "placeholder", "aria-label", "label"] });
        collect(root);
    };
    const refresh = () => { discover(); if (root) collect(root); };
    // Poll just the host: supports late load, late attachShadow and window reopening
    // without observing the entire game's chat DOM or patching attachShadow.
    const timer = env.setInterval(discover, 500);
    document.addEventListener("bctp-language-change", refresh);
    addCleanup(() => {
        disposed = true;
        env.clearInterval(timer);
        observer?.disconnect();
        processor.dispose();
        document.removeEventListener("bctp-language-change", refresh);
        root?.querySelectorAll("*").forEach(element => translateBcplusElement(element, dictionaries, null));
        root = undefined;
    });
    discover();
}
