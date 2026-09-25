import { createIdleBatchProcessor } from "./idleBatch.js";

import { translateValue } from "./displayText.js";

// Inventory text is processed in idle batches; dfn waits until BC has read its lookup key.
/** 只翻文字節點，保留按鈕內的圖片等結構。translate: (string) => string|undefined */
function translateTextNodes(root, translate) {
    if (!root.isConnected) return; // 節點在排隊等待翻譯期間可能已被移除（例如使用者又切了一次部位）
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const n of nodes) {
        // 跳過 <dfn>：BC 會用其 textContent 組查表 key（如製作屬性 Description<n>），翻了會壞
        if (n.parentElement && n.parentElement.closest("dfn")) continue;
        translateValue(n, "data", translate);
    }
}

/** @param {(s: string) => (string | undefined)} translate */
// <dfn> = 製作屬性名。BC 會先讀其 textContent 組 Description<n> key 並附上描述，
// 所以延遲翻譯：等 BC 讀完英文名之後，再把顯示的名字翻成中文（key 已用英文組好，不受影響）。
function setupDfnObserver(translate, addCleanup) {
    let disposed = false, frame;
    const timers = new Set();
    addCleanup(() => {
        disposed = true;
        cancelAnimationFrame(frame);
        for (const timer of timers) clearTimeout(timer);
    });
    const handleDfns = (dfns) => {
        const timer = setTimeout(() => {
            timers.delete(timer);
            if (disposed) return;
            for (const d of dfns) {
                if (!d.isConnected) continue;
                translateValue(d, "textContent", translate);
            }
        }, 300);
        timers.add(timer);
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
    addCleanup(() => obs.disconnect());
    const start = () => {
        if (disposed) return;
        if (!document.body) { frame = requestAnimationFrame(start); return; }
        obs.observe(document.body, { childList: true, subtree: true });
        // 補掃：我們可能晚於既有 dfn 出現（Electron 載入較晚），observer 只收未來的 addedNodes。
        const existing = document.body.querySelectorAll("dfn");
        if (existing.length) handleDfns([...existing]);
    };
    const refresh = () => {
        if (document.body) handleDfns([...document.body.querySelectorAll("dfn")]);
    };
    document.addEventListener("bctp-language-change", refresh);
    addCleanup(() => document.removeEventListener("bctp-language-change", refresh));
    start();
}

// 時間切片排程器：把一批節點的翻譯工作分散到多個閒置時段執行，
// 避免道具格子一次很多時，單一個 idle callback 又整批卡住主執行緒。
export function setupDomObserver(translate, translateDfn, addCleanup) {
    setupDfnObserver(translateDfn || translate, addCleanup);
    let disposed = false, frame;
    addCleanup(() => { disposed = true; cancelAnimationFrame(frame); });

    // 只翻道具名(dialog-inventory)與快捷鍵。動作選單改由 ActivityDictionaryText hook 處理，
    // 不再用寬鬆的 [id^="dialog-"]（會誤傷製作/詛咒等 BC 會讀回 textContent 的 UI）。
    const SEL = '[id^="dialog-inventory"], [id^="key-name-"], .keybind-name, .keybind-action';
    const match = (el) => el.matches?.(SEL);

    const processor = createIdleBatchProcessor((el) => translateTextNodes(el, translate));
    addCleanup(() => processor.dispose());

    const handle = (node) => {
        if (!node || node.nodeType !== 1) return;
        const el = /** @type {Element} */ (node);
        // 這裡只做便宜的比對/收集，真正的 TreeWalker 翻譯工作交給 processor 延後分批處理，
        // 讓道具選單重繪能先完成繪製，不被翻譯工作卡在同一個畫面更新裡。
        if (match(el)) processor.push(el);
        el.querySelectorAll?.(SEL).forEach((b) => processor.push(b));
    };
    const obs = new MutationObserver((muts) => {
        for (const m of muts) m.addedNodes.forEach(handle);
    });
    addCleanup(() => obs.disconnect());
    const start = () => {
        if (disposed) return;
        if (!document.body) { frame = requestAnimationFrame(start); return; }
        obs.observe(document.body, { childList: true, subtree: true });
        // 補掃既有節點：observer 只收未來 addedNodes，晚載入時已開的 dialog-inventory/快捷鍵會被漏掉。
        handle(document.body);
    };
    const refresh = () => { if (document.body) handle(document.body); };
    document.addEventListener("bctp-language-change", refresh);
    addCleanup(() => document.removeEventListener("bctp-language-change", refresh));
    start();
}