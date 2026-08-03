import { activeLang } from "./lang.js";

// 診斷工具（僅在 globalThis.BCTP_DEBUG 為真時啟用）：
// 記錄畫布上實際被畫出、且仍是英文的字串，方便找出「官方硬編碼、不在任何 CSV」的漏網之魚。
// 只記錄、不改動畫面。
const TEXT_FNS = ["DrawText", "DrawTextFit", "DrawTextWrap", "DynamicDrawText"];

/** @param {any} mod */
export function setupDiagnostics(mod) {
    const seen = new Set();
    const record = (s) => {
        if (!activeLang() || typeof s !== "string") return;
        const k = s.trim();
        if (!k || !/[A-Za-z]/.test(k)) return; // 已是中文/純符號的略過
        if (seen.has(k)) return;
        seen.add(k);
        console.debug("[BCTP drawn-EN]", k);
    };
    for (const name of TEXT_FNS) {
        mod.hookFunction(name, 0, (args, next) => {
            record(args[0]);
            return next(args);
        });
    }
    /** @type {any} */ (globalThis).BCTP_drawnEN = () => [...seen].sort();
}
