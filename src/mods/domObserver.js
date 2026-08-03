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
// <dfn> = 製作屬性名。BC 會先讀其 textContent 組 Description<name> key 並附上描述，
// 所以延遲翻譯：等 BC 讀完英文名之後，再把顯示的名字翻成中文（key 已用英文組好，不受影響）。
function setupDfnObserver(translate) {
    const handleDfns = (dfns) => {
        setTimeout(() => {
            for (const d of dfns) {
                const key = (d.textContent || "").trim();
                if (!key) continue;
                const t = translate(key);
                if (t) d.textContent = t;
            }
        }, 300);
    };
    const obs = new MutationObserver((muts) => {
        for (const m of muts) {
            m.addedNodes.forEach((node) => {
                if (!node || node.nodeType !== 1) return;
                const el = /** @type {Element} */ (node);
                const dfns = [];
                if (el.tagName === "DFN") dfns.push(el);
                el.querySelectorAll?.("dfn").forEach((d) => dfns.push(d));
                if (dfns.length) handleDfns(dfns);
            });
        }
    });
    const start = () => {
        if (document.body) obs.observe(document.body, { childList: true, subtree: true });
        else requestAnimationFrame(start);
    };
    start();
}

export function setupDomObserver(translate, translateDfn) {
    setupDfnObserver(translateDfn || translate);

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
