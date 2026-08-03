// dialog-inventory 的道具/動作是 DOM(ElementButton)，label = asset.Description，
// 官方雖有翻譯卻常沒套用上。這裡在按鈕出現時，用傳入的翻譯函式把 label 文字節點翻掉。

/** 只翻文字節點，保留按鈕內的圖片等結構。translate: (string) => string|undefined */
function translateTextNodes(root, translate) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const n of nodes) {
        const key = n.data.trim();
        if (!key) continue;
        const t = translate(key);
        if (t) n.data = n.data.replace(key, t);
    }
}

/** @param {(s: string) => (string | undefined)} translate */
export function setupDomObserver(translate) {
    const handle = (node) => {
        if (!node || node.nodeType !== 1) return;
        const el = /** @type {Element} */ (node);
        const buttons = [];
        if (el.id && el.id.startsWith("dialog-inventory")) buttons.push(el);
        el.querySelectorAll?.('[id^="dialog-inventory"]').forEach((b) => buttons.push(b));
        for (const b of buttons) translateTextNodes(b, translate);
    };
    const obs = new MutationObserver((muts) => {
        for (const m of muts) m.addedNodes.forEach(handle);
    });
    const start = () => {
        if (document.body) obs.observe(document.body, { childList: true, subtree: true });
        else requestAnimationFrame(start);
    };
    start();
}
