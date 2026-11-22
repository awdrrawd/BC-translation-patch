import { createIdleBatchProcessor } from "./idleBatch.js";
import { updateDisplay } from "./displayText.js";
import { translateModText } from "./modSurfaces.js";

// Code and anything the player edits never has its text replaced (attributes such as placeholder still can be).
const NEVER = "script, style, code, pre";
const EDITABLE = "textarea, input, [contenteditable]:not([contenteditable='false'])";
const ATTRIBUTES = ["title", "placeholder", "aria-label"];

/** True while the BC mod SDK lists a mod under this registered name. */
export function isModLoaded(name, env = globalThis) {
    try {
        return !!env.bcModSdk?.getModsInfo?.().some(info => info.name === name);
    } catch { return false; }
}

/** Name the BC mod SDK registers ECHS under. */
export const isEchsLoaded = (env = globalThis) => isModLoaded("ECHS", env);
/** Galia's Gambling Club registers as "ClubGaming". */
export const isGaliaLoaded = (env = globalThis) => isModLoaded("ClubGaming", env);

// GALIA's phone texts and the names of its group chats are what players wrote; they keep their wording.
const GALIA_PLAYER_TEXT = [
    '[aria-label="Text message"]',
    '[aria-label="Phone messages"] button > div > div + div', // last message shown under each conversation
    '[data-ggc-chat-id]:not([data-ggc-chat-id="__club__"])',   // group chat tabs are named by players
].join(", ");

/**
 * Each adapter names the dictionary scope it uses and the DOM roots it owns.
 * Roots are only ever mod-owned containers, never the chat log or arbitrary game DOM.
 */
export const MOD_DOM_ADAPTERS = [
    {
        scope: "echs",
        enabled: isEchsLoaded,
        roots: document => [
            document.getElementById("echs-popup"),
            document.getElementById("echs-popup-launcher"),
            ...document.querySelectorAll("select[id^='HypnosisAddon']"),
        ].filter(Boolean),
        // Chat-box chat log and the player's own text must stay as typed.
        skip: "#TextAreaChatLog, #InputChat",
    },
    {
        scope: "littlish",
        // zois-core builds its subscreens straight into the page, so the whole body is the root,
        // but only while a Littlish Club subscreen is open.
        roots: (document, env) => env.LITTLISH_CLUB?.inModSubscreen?.() ? [document.body] : [],
        skip: "#TextAreaChatLog, #chat-room-div, #InputChat, #ChatRoomChatLog",
    },
    {
        // Galia's Gambling Club: the phone's call and message windows, the radial menu tooltip, the group
        // chat tabs, its fixed inputs (bank amount/ID, chat name) and the chat box placeholder it sets.
        // Everything else it shows is canvas (galia.js) or chat notices (galia.js).
        scope: "galia",
        enabled: isGaliaLoaded,
        roots: document => [
            document.getElementById("clubgaming-phone-calls"),
            document.getElementById("clubgaming-radial-menu-tooltip"),
            document.getElementById("clubgaming-group-chat-tabs"),
            document.getElementById("InputChat"),
            ...document.querySelectorAll('body > div[aria-label="Phone messages"], body > input[style*="z-index: 100003"]'),
        ].filter(Boolean),
        skip: GALIA_PLAYER_TEXT,
    },
    {
        // Labels GALIA gives its activities in BC's own activity dialog (Skirmish, Steal, Give Item).
        scope: "galiaDialog",
        enabled: isGaliaLoaded,
        roots: document => [...document.querySelectorAll('[id*="GGCSkirmish"], [id*="GGCSteal"], [id*="GGCGivePhone"]')],
    },
];

function translateText(text, adapter, dictionaries, lang) {
    return translateModText(text, dictionaries[lang]?.[adapter.scope]);
}

function update(node, property, read, write, adapter, dictionaries, lang) {
    updateDisplay(node, property, read, write, source => {
        if (source === null || source === undefined) return source;
        return translateText(source, adapter, dictionaries, lang) ?? source;
    });
}

/** Translate one element's own displayed text. Never touches values the player typed. */
export function translateModElement(element, adapter, dictionaries, lang) {
    if (element.closest(NEVER) || (adapter.skip && element.closest(adapter.skip))) return;

    for (const attribute of ATTRIBUTES) {
        update(element, attribute, () => element.getAttribute(attribute), value => {
            if (value === null) element.removeAttribute(attribute);
            else element.setAttribute(attribute, value);
        }, adapter, dictionaries, lang);
    }

    if (element.tagName === "OPTION") {
        // The option's machine value may come from its text; only the label is replaced.
        updateDisplay(element, "option", () => element.getAttribute("label"), next => {
            if (next === null) element.removeAttribute("label");
            else element.setAttribute("label", next);
        }, original => {
            const source = original ?? element.textContent;
            const translated = translateText(source, adapter, dictionaries, lang);
            return translated === undefined || translated === source ? original : translated;
        });
        return;
    }
    if (element.tagName === "SELECT" || element.closest(EDITABLE)) return;

    // Rich text such as "<b>Creator:</b> name" is split across nodes, so match the whole markup of
    // elements that mix their own text with child elements.
    if (element.firstElementChild && [...element.childNodes].some(node => node.nodeType === 3 && node.data.trim())) {
        let matched = false;
        updateDisplay(element, "innerHTML", () => element.innerHTML, value => { element.innerHTML = value; }, source => {
            const translated = translateText(source, adapter, dictionaries, lang);
            matched = translated !== undefined;
            return matched ? translated : source;
        });
        if (matched) return;
    }
    for (const node of element.childNodes) {
        if (node.nodeType === 3) update(node, "data", () => node.data, value => { node.data = value; }, adapter, dictionaries, lang);
    }
}

export function setupModDomObserver(dictionaries, getLang, addCleanup, env = globalThis) {
    const document = env.document;
    const roots = new Map(); // root element -> { observer, adapter }
    let disposed = false;

    const adapterOf = element => {
        for (const [root, { adapter }] of roots) if (root === element || root.contains(element)) return adapter;
    };
    const processor = createIdleBatchProcessor(element => {
        const adapter = element.isConnected && adapterOf(element);
        if (adapter) translateModElement(element, adapter, dictionaries, getLang());
    }, env);
    const collect = node => {
        if (node?.nodeType === 3) { if (node.parentElement) processor.push(node.parentElement); return; }
        if (node?.nodeType === 1) processor.push(node);
        node?.querySelectorAll?.("*").forEach(element => processor.push(element));
    };
    const watch = (root, adapter) => {
        const observer = new env.MutationObserver(records => {
            for (const record of records) {
                if (record.type === "childList") {
                    if (record.target.nodeType === 1) processor.push(record.target);
                    record.addedNodes.forEach(collect);
                } else if (record.type === "attributes") processor.push(record.target);
                else collect(record.target);
            }
        });
        observer.observe(root, { subtree: true, childList: true, characterData: true,
            attributes: true, attributeFilter: [...ATTRIBUTES, "label"] });
        roots.set(root, { observer, adapter });
        collect(root);
    };
    const discover = () => {
        if (disposed || document.hidden || !getLang()) return;
        const wanted = new Map();
        for (const adapter of MOD_DOM_ADAPTERS) {
            if (!dictionaries[getLang()]?.[adapter.scope]) continue;
            if (adapter.enabled && !adapter.enabled(env)) continue;
            for (const root of adapter.roots(document, env)) wanted.set(root, adapter);
        }
        for (const [root, { observer }] of roots) {
            if (!wanted.has(root)) { observer.disconnect(); roots.delete(root); }
        }
        for (const [root, adapter] of wanted) if (!roots.has(root)) watch(root, adapter);
    };
    const refresh = () => { discover(); roots.forEach((_, root) => collect(root)); };

    // Look only for the few mod-owned roots; never scan the game's chat DOM.
    const timer = env.setInterval(discover, 500);
    document.addEventListener("bctp-language-change", refresh);
    addCleanup(() => {
        disposed = true;
        env.clearInterval(timer);
        const restore = [...roots.entries()];
        roots.forEach(({ observer }) => observer.disconnect());
        processor.dispose();
        document.removeEventListener("bctp-language-change", refresh);
        for (const [root, { adapter }] of restore) {
            root.querySelectorAll("*").forEach(element => translateModElement(element, adapter, dictionaries, null));
        }
        roots.clear();
    });
    discover();
}
