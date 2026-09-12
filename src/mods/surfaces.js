import { createIdleBatchProcessor } from "./idleBatch.js";
import { translateValue } from "./domObserver.js";

// Only these display surfaces are writable. Never select effect labels or craft inputs.
export const SURFACES = [
    ["#lscg-quick-access > button", "quickAccess"],
    ["#layering .layering-tab-button, #layering legend, #layering .layering-pair-text", "layering"],
    ["#BCXSearch, [id*='BCX_Search'], [id*='BCX_Search'] .button-label, input[placeholder='Filter items'], input[placeholder='搜索道具'], input[placeholder='搜尋道具']", "search"],
    ["#crafting-slot-screen select[name='mode-select'] option[value='LSCGShare'], #crafting-slot-screen h1, #crafting-slot-screen [role='tooltip']", "craft"],
    ["#lscg-effect-main-title, #lscg-effect-tooltip, #crafting-lscg-effects-menu-label > span", "lscg"],
];
const selector = SURFACES.map(([s]) => s).join(", ");

export function translateSurface(element, scope, dictionaries, lang) {
    const lookup = text => {
        const map = dictionaries[lang]?.[scope];
        if (scope === "quickAccess") {
            const header = /^([▼▶]\s+)(.+)$/.exec(text);
            if (header) return map?.[header[2]] ? header[1] + map[header[2]] : undefined;
        }
        return map?.[text];
    };
    if (element.tagName === "INPUT") {
        translateValue(element, "placeholder", lookup);
        return; // Never touch the user's search text.
    }
    if (element.tagName === "OPTION") {
        translateValue(element, "label", lookup);
        return; // LSCGShare remains the option's machine value.
    }
    for (const node of element.childNodes) {
        if (node.nodeType === 3) translateValue(node, "data", lookup);
    }
}

export function setupSurfaceObserver(dictionaries, getLang, addCleanup) {
    let disposed = false, frame;
    const processor = createIdleBatchProcessor(element => {
        if (!element.isConnected) return;
        for (const [rule, scope] of SURFACES) {
            if (element.matches(rule)) translateSurface(element, scope, dictionaries, getLang());
        }
    });
    addCleanup(() => { disposed = true; processor.dispose(); cancelAnimationFrame(frame); });
    const collect = node => {
        const element = node?.nodeType === 1 ? node : node?.parentElement;
        if (!element) return;
        if (element.matches(selector)) processor.push(element);
        const parent = element.closest(selector);
        if (parent) processor.push(parent);
        element.querySelectorAll(selector).forEach(el => processor.push(el));
    };
    const observer = new MutationObserver(records => {
        for (const record of records) {
            collect(record.target);
            record.addedNodes?.forEach(collect);
        }
    });
    addCleanup(() => observer.disconnect());
    const start = () => {
        if (disposed) return;
        if (!document.body) { frame = requestAnimationFrame(start); return; }
        observer.observe(document.body, {
            childList: true, subtree: true, characterData: true,
            attributes: true, attributeFilter: ["placeholder", "label"],
        });
        collect(document.body);
    };
    const refresh = () => { if (document.body) collect(document.body); };
    document.addEventListener("bctp-language-change", refresh);
    addCleanup(() => document.removeEventListener("bctp-language-change", refresh));
    start();
}

/** Local incoming Action/Beep display only; craft name/description stay verbatim. */
export function translateCraftShare(text, lang) {
    if (!["CN", "TW"].includes(lang)) return undefined;
    const enclosed = text.startsWith("(") && text.endsWith(")");
    const raw = enclosed ? text.slice(1, -1) : text;
    const match = /^(.+?) holds up (?:her|his|their|its) (.+?) to the room(?:: ([\s\S]*))?$/.exec(raw);
    if (!match) return undefined;
    const result = match[1] + (lang === "TW" ? " 向房間裡的大家展示了自己的 " : " 向房间里的大家展示了自己的 ") +
        match[2] + (match[3] === undefined ? "" : ": " + match[3]);
    return enclosed ? "(" + result + ")" : result;
}
