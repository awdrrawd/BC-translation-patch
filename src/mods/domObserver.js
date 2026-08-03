// dialog-inventory 的道具/動作是 DOM(ElementButton)，label = asset.Description，
// 官方雖有翻譯卻常沒套用上。這裡在按鈕出現時，用傳入的翻譯函式把 label 文字節點翻掉。

/** 只翻文字節點，保留按鈕內的圖片等結構。translate: (string) => string|undefined */
function translateTextNodes(root, translate) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const n of nodes) {
        // 跳過 <dfn>：BC 會用其 textContent 組查表 key（如製作屬性 Description<name>），翻了會壞
        if (n.parentElement && n.parentElement.closest("dfn")) continue;
        const key = n.data.trim();
        if (!key) continue;
        const t = translate(key);
        if (t) n.data = n.data.replace(key, t);
    }
}

/** @param {(s: string) => (string | undefined)} translate */
export function setupDomObserver(translate) {
    // 只翻道具名(dialog-inventory)與快捷鍵。動作選單改由 ActivityDictionaryText hook 處理，
    // 不再用寬鬆的 [id^="dialog-"]（會誤傷製作/詛咒等 BC 會讀回 textContent 的 UI）。
    const SEL = '[id^="dialog-inventory"], [id^="key-name-"], .keybind-name, .keybind-action';
    const match = (el) => el.matches?.(SEL);
    const handle = (node) => {
        if (!node || node.nodeType !== 1) return;
        const el = /** @type {Element} */ (node);
        const targets = [];
        if (match(el)) targets.push(el);
        el.querySelectorAll?.(SEL).forEach((b) => targets.push(b));
        for (const b of targets) translateTextNodes(b, translate);
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
