// dialog-inventory 的道具/動作是 DOM(ElementButton)，label = asset.Description，
// 官方雖有翻譯卻常沒套用上。這裡在按鈕出現時，用傳入的翻譯函式把 label 文字節點翻掉。
//
// ------------------------------------------------------------------------------------
// 效能修補說明（相對原版的改動）：
// 原版在 MutationObserver 的回呼裡「同步」對每一個新增節點呼叫 translateTextNodes()
// （內含 document.createTreeWalker 掃全部文字節點）。當道具選單一次重建大量按鈕格子
// （例如某個部位有 100+ 種可用/自製道具）時，MutationObserver 會在同一個微任務裡收到
// 全部新增節點，逐一同步翻譯，這段工作發生在瀏覽器「繪製下一幀」之前，會直接卡住畫面，
// 而且範圍越大（該角色該部位道具越多）卡越久，導致「特定角色/特定部位才明顯卡頓」。
//
// 修補作法：MutationObserver 回呼裡只做「收集要翻譯的候選節點」這種便宜的比對(querySelectorAll)，
// 真正昂貴的 TreeWalker 逐字翻譯，改成排到瀏覽器閒置時間（requestIdleCallback，不支援時退回
// rAF+setTimeout）才執行，並且用時間切片(time-slicing)分批處理，避免單次處理量太大時
// 又整批卡在同一個 idle callback 裡。使用者會先看到英文/未翻譯的格子快速跳出來，
// 幾十毫秒內文字才轉成中文——肉眼幾乎無感，但不再卡住畫面繪製。
// ------------------------------------------------------------------------------------

/** 只翻文字節點，保留按鈕內的圖片等結構。translate: (string) => string|undefined */
function translateTextNodes(root, translate) {
    if (!root.isConnected) return; // 節點在排隊等待翻譯期間可能已被移除（例如使用者又切了一次部位）
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const n of nodes) {
        // 跳過 <dfn>：BC 會用其 textContent 組查表 key（如製作屬性 Description<n>），翻了會壞
        if (n.parentElement && n.parentElement.closest("dfn")) continue;
        const key = n.data.trim();
        if (!key) continue;
        const t = translate(key);
        if (t) n.data = n.data.replace(key, t);
    }
}

/** @param {(s: string) => (string | undefined)} translate */
// <dfn> = 製作屬性名。BC 會先讀其 textContent 組 Description<n> key 並附上描述，
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
        if (!document.body) return requestAnimationFrame(start);
        obs.observe(document.body, { childList: true, subtree: true });
        // 補掃：我們可能晚於既有 dfn 出現（Electron 載入較晚），observer 只收未來的 addedNodes。
        const existing = document.body.querySelectorAll("dfn");
        if (existing.length) handleDfns([...existing]);
    };
    start();
}

// 時間切片排程器：把一批節點的翻譯工作分散到多個閒置時段執行，
// 避免道具格子一次很多時，單一個 idle callback 又整批卡住主執行緒。
function createIdleBatchProcessor(processOne) {
    const queue = [];
    let scheduled = false;

    function pump(deadline) {
        // 沒有 requestIdleCallback 的環境（例如 Safari）：deadline 是 undefined，
        // 每批固定處理一小段就讓出主執行緒，行為上退化但仍不會整批同步卡住。
        const hasDeadline = !!deadline && typeof deadline.timeRemaining === "function";
        let n = 0;
        while (queue.length && (hasDeadline ? deadline.timeRemaining() > 1 : n < 24)) {
            processOne(queue.shift());
            n++;
        }
        if (queue.length) {
            schedule(); // 還有剩，排下一段
        } else {
            scheduled = false;
        }
    }

    function schedule() {
        if (scheduled) return;
        scheduled = true;
        if (typeof requestIdleCallback === "function") {
            requestIdleCallback(pump, { timeout: 200 });
        } else {
            requestAnimationFrame(() => setTimeout(pump, 0));
        }
    }

    return {
        push(item) {
            queue.push(item);
            schedule();
        },
    };
}

export function setupDomObserver(translate, translateDfn) {
    setupDfnObserver(translateDfn || translate);

    // 只翻道具名(dialog-inventory)與快捷鍵。動作選單改由 ActivityDictionaryText hook 處理，
    // 不再用寬鬆的 [id^="dialog-"]（會誤傷製作/詛咒等 BC 會讀回 textContent 的 UI）。
    const SEL = '[id^="dialog-inventory"], [id^="key-name-"], .keybind-name, .keybind-action';
    const match = (el) => el.matches?.(SEL);

    const processor = createIdleBatchProcessor((el) => translateTextNodes(el, translate));

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
    const start = () => {
        if (!document.body) return requestAnimationFrame(start);
        obs.observe(document.body, { childList: true, subtree: true });
        // 補掃既有節點：observer 只收未來 addedNodes，晚載入時已開的 dialog-inventory/快捷鍵會被漏掉。
        handle(document.body);
    };
    start();
}