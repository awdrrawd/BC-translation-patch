import { activeLang } from "../lang.js";
import GEN from "../generated/dict.json";

// dialog-inventory 的道具/動作是 DOM(ElementButton)，label = asset.Description，
// 官方雖有翻譯卻常沒套用上。這裡在按鈕出現時，用完整字典把 label 文字節點翻掉。
const A = /** @type {any} */ (GEN).assetName || { CN: {}, TW: {} };
const V = /** @type {any} */ (GEN).activity || { CN: {}, TW: {} };
const MERGED = { CN: { ...A.CN, ...V.CN }, TW: { ...A.TW, ...V.TW } };

/** 只翻文字節點，保留按鈕內的圖片等結構 */
function translateTextNodes(root, dict) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const n of nodes) {
        const t = dict[n.data.trim()];
        if (t) n.data = t;
    }
}

function handle(node) {
    if (!node || node.nodeType !== 1) return;
    const lang = activeLang();
    if (!lang) return;
    const dict = MERGED[lang];
    const el = /** @type {Element} */ (node);

    const buttons = [];
    if (el.id && el.id.startsWith("dialog-inventory")) buttons.push(el);
    el.querySelectorAll?.('[id^="dialog-inventory"]').forEach((b) => buttons.push(b));
    for (const b of buttons) translateTextNodes(b, dict);
}

export function setupDomObserver() {
    const obs = new MutationObserver((muts) => {
        for (const m of muts) m.addedNodes.forEach(handle);
    });
    const start = () => {
        if (document.body) obs.observe(document.body, { childList: true, subtree: true });
        else requestAnimationFrame(start);
    };
    start();
}
