import { createIdleBatchProcessor } from "./idleBatch.js";
import { updateDisplay } from "./displayText.js";

const skip = "script, style, code, pre, [contenteditable]:not([contenteditable='false'])";
const normalize = text => text.replace(/\s+/g, " ").trim();
const patterns = [
    [/^(\d+) selected\.\.\.$/, "{count} selected...", ["count"]],
    [/^Tandem with BCX v([\w.?+-]+)$/, "Tandem with BCX v{version}", ["version"]],
    [/^([\w.+-]+) is the latest version$/, "{version} is the latest version", ["version"]],
    [/^Rules in this contract \((\d+)\)$/, "Rules in this contract ({count})", ["count"]],
    [/^Rules \((\d+)\)$/, "Rules ({count})", ["count"]],
    [/^(\d+) rules$/, "{count} rules", ["count"]],
    [/^(\d+) min$/, "{count} min", ["count"]],
    [/^(\d+) h$/, "{count} h", ["count"]],
    [/^(\d+) d$/, "{count} d", ["count"]],
    [/^(\d+) h (\d+) min$/, "{hours} h {minutes} min", ["hours", "minutes"]],
    [/^(\d+) d (\d+) h$/, "{days} d {hours} h", ["days", "hours"]],
    [/^Contracts you authored on (.+)$/, "Contracts you authored on {name}", ["name"]],
    [/^OFFER: "(.*)" from (.+)$/, "OFFER: \"{title}\" from {name}", ["title", "name"]],
    [/^Signed (.+)$/, "Signed {date}", ["date"]],
    [/^you are already bound by (\d+) contracts$/, "you are already bound by {count} contracts", ["count"]],
    [/^it contains a rule this BC\+ version does not know \((.+)\)$/, "it contains a rule this BC+ version does not know ({id})", ["id"]],
    [/^the rule "(.+)" is already bound by another contract$/, "the rule \"{rule}\" is already bound by another contract", ["rule"]],
];

export function translateBcplusText(text, dictionaries, lang) {
    const map = dictionaries[lang]?.bcplus;
    const key = normalize(text);
    if (!map || !key) return text;
    let translated = Object.hasOwn(map, key) ? map[key] : undefined;
    const render = (template, values) => map[template]?.replace(/\{(\w+)\}/g, (token, name) => values[name] ?? token);
    const module = /^(Rules|Curses|Punishments|Contracts|Commands|Relationships|Pet|Statistics|Log) module enabled$/.exec(key);
    if (!translated && module) translated = render("{module} module enabled", { module: map[module[1]] || module[1] });
    const sort = /^Sort: (Category|Custom)$/.exec(key);
    if (!translated && sort) translated = render("Sort: {mode}", { mode: map[sort[1]] || sort[1] });
    const argument = /^(.*) \(uses the argument field\)$/.exec(key);
    if (!translated && argument && Object.hasOwn(map, argument[1])) translated = map[argument[1]] + " " + map["(uses the argument field)"];
    const heading = /^(Draft|Contract) - (.+)$/.exec(key);
    if (!translated && heading) translated = render(`${heading[1]} - {title}`, { title: heading[2] === "New contract" ? map["New contract"] : heading[2] });
    const left = /^((?:\d+ (?:min|h|d))(?: \d+ (?:min|h))?) left$/.exec(key);
    if (!translated && left) translated = render("{duration} left", { duration: translateBcplusText(left[1], dictionaries, lang) });
    const duration = /^Duration: (.+)$/.exec(key);
    if (!translated && duration) translated = (map["Duration:"] || "Duration:") + " " + translateBcplusText(duration[1], dictionaries, lang);
    const cannotSign = /^Cannot sign: (.+)\.$/.exec(key);
    if (!translated && cannotSign) translated = render("Cannot sign: {reason}.", { reason: translateBcplusText(cannotSign[1], dictionaries, lang) });
    const policy = /^- (Either side may end it|Only the author may end it early)$/.exec(key);
    if (!translated && policy) translated = "- " + map[policy[1]];
    const ruleCount = /^(\d+) rules - (.+)$/.exec(key);
    if (!translated && ruleCount) translated = render("{count} rules", { count: ruleCount[1] }) + " - " +
        ruleCount[2].split(" - ").map(part => translateBcplusText(part, dictionaries, lang)).join(" - ");
    const summary = /^(Enforced|Not enforced|Logged only) - (.+)$/.exec(key);
    if (!translated && summary) {
        const [conditions, ...settings] = summary[2].split(" - ");
        translated = map[summary[1]] + " - " + conditions.split(" · ").map(part => map[part] || part).join(" · ") +
            (settings.length ? " - " + settings.join(" - ") : "");
    }
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
    updateDisplay(node, property, read, write, source => source === null ? null : translateBcplusText(source, dictionaries, lang));
}

/** Only call on elements inside a verified BC+ window or standalone modal. */
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
        updateDisplay(element, "option", () => element.getAttribute("label"), next => {
            if (next === null) element.removeAttribute("label");
            else element.setAttribute("label", next);
        }, original => {
            const source = original ?? element.textContent;
            const isTheme = normalize(source) === "Light" && [...element.parentElement.querySelectorAll("option")].some(option => option.textContent === "Dark");
            const translated = isTheme && dictionaries[lang]?.bcplus["Light theme"] || translateBcplusText(source, dictionaries, lang);
            return translated === source ? original : translated;
        });
        return;
    }
    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA" || element.closest("textarea")) return;
    for (const node of element.childNodes) {
        if (node.nodeType === 3) update(node, "data", () => node.data, value => { node.data = value; }, dictionaries, lang);
    }
}

export function setupBcplusObserver(dictionaries, getLang, addCleanup, env = globalThis) {
    const document = env.document;
    const roots = new Map();
    let disposed = false;
    const processor = createIdleBatchProcessor(element => {
        if (element.isConnected && [...roots.keys()].some(root => root.contains(element))) translateBcplusElement(element, dictionaries, getLang());
    }, env);
    const collect = node => {
        if (node?.nodeType === 3) { if (node.parentElement) processor.push(node.parentElement); return; }
        if (node?.nodeType === 1) processor.push(node);
        node?.querySelectorAll?.("*").forEach(element => processor.push(element));
    };
    const discover = () => {
        if (disposed || document.hidden) return;
        const next = new Set();
        const shadow = document.getElementById("BCPUIWindow")?.shadowRoot;
        if (shadow) next.add(shadow);
        // Modal.ts has no IDs. Match its direct body overlay, focusable card,
        // product heading and buttons together; never scan arbitrary chat text.
        for (const overlay of document.body?.children || []) {
            const card = overlay.firstElementChild;
            if (overlay.tagName === "DIV" && overlay.style.position === "fixed" && overlay.style.zIndex === "100000" &&
                card?.getAttribute("tabindex") === "-1" && card.firstElementChild?.textContent === "BC+" && card.querySelector("button")) next.add(card);
        }
        for (const [root, observer] of roots) if (!next.has(root)) { observer.disconnect(); roots.delete(root); }
        for (const root of next) {
            if (roots.has(root)) continue;
            const observer = new env.MutationObserver(records => {
                for (const record of records) {
                    if (record.type === "childList") {
                        // Includes OPTION text replacement: refresh its label too.
                        if (record.target.nodeType === 1) processor.push(record.target);
                        record.addedNodes.forEach(collect);
                    } else if (record.type === "attributes") processor.push(record.target);
                    else collect(record.target);
                }
            });
            observer.observe(root, { subtree: true, childList: true, characterData: true,
                attributes: true, attributeFilter: ["title", "placeholder", "aria-label", "label"] });
            collect(root);
            roots.set(root, observer);
        }
    };
    const refresh = () => { discover(); roots.forEach((_, root) => collect(root)); };
    // Inspect the host and direct body overlays, never the entire game's chat DOM.
    const timer = env.setInterval(discover, 500);
    document.addEventListener("bctp-language-change", refresh);
    addCleanup(() => {
        disposed = true;
        env.clearInterval(timer);
        roots.forEach(observer => observer.disconnect());
        processor.dispose();
        document.removeEventListener("bctp-language-change", refresh);
        roots.forEach((_, root) => root.querySelectorAll("*").forEach(element => translateBcplusElement(element, dictionaries, null)));
        roots.clear();
    });
    discover();
}
