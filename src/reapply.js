import { activeLang } from "./lang.js";
import { PATHS } from "./data.js";

/* global TextAllScreenCache */

// 安全補譯資產/群組描述。
// 為何需要：整包 5.7MB 以 document-end 動態 <script> 載入，通常晚於遊戲的 AssetLoadDescription
// → TranslationAsset()（開機時就地翻譯 A.Description）。晚到就吃不到我們注入的 cn-extra 超集，
// 官方沒收錄的新增服裝描述（如 Long Qipao）便停在英文。BC 不會再重譯，故在此補一次。
// 為何安全：BC 的 TranslationString 用 findIndex 在攤平陣列 [en0,zh0,en1,zh1,...] 反查，對「已是
// 中文」的字串會命中奇數索引(值)並回傳下一個英文 → 腐化。這裡只在命中「偶數索引(英文鍵)」時才翻，
// 已翻的中文（奇數索引或查不到）一律跳過，冪等且不腐化。只掃 <Family>/<Family>_<lang>.txt 描述檔，
// 作用域與官方一致，不引入全域字典撞名。
const HAS_CJK = /[一-鿿]/;
function reapplyAssetDescriptions(lang) {
    const g = /** @type {any} */ (globalThis);
    if (!Array.isArray(g.Asset) || !g.Asset.length) return;
    for (const [path, T] of Object.entries(PATHS)) {
        const m = path.match(/^Assets\/([^/]+)\/\1_(CN|TW)\.txt$/);
        if (!m || m[2] !== lang || !Array.isArray(T)) continue;
        const Family = m[1];
        // 僅在 BC 已對本家族完成官方翻譯後才補（偵測：本家族已有中文描述）。否則 BC 的
        // TranslationAsset 尚未跑，貿然把描述轉中文會讓它稍後的 findIndex 二次反查腐化。
        const famAssets = g.Asset.filter((a) => a.Group && a.Group.Family === Family);
        if (!famAssets.some((a) => HAS_CJK.test(a.Description || ""))) continue;
        const tr = (S) => {
            if (!S || !S.trim()) return S;
            const i = T.indexOf(S.trim());
            return i >= 0 && i % 2 === 0 ? T[i + 1] : S;
        };
        for (const grp of g.AssetGroup || []) if (grp.Family === Family) grp.Description = tr(grp.Description);
        for (const a of famAssets) a.Description = tr(a.Description);
    }
}

// 動作字典與道具描述是在遊戲啟動時就烤進快取的，那時我們還沒注入。
// 注入後強制重跑一次，讓它們吃到我們的翻譯（繞過時序問題）。
export function reapply() {
    const lang = activeLang();
    if (!lang) return;
    const g = /** @type {any} */ (globalThis);

    // 補譯資產描述（服裝/部位名）——見上方函式說明。晚載入時官方沒收錄的新增字停在英文，補這一次。
    try {
        reapplyAssetDescriptions(lang);
    } catch (e) {
        console.debug("🐈‍⬛ [BCTP] 資產描述補譯失敗", e);
    }

    // 重建動作字典（TextCache）。buildCache 從英文 CSV 重跑，冪等安全。
    try {
        const c = g.ActivityDictionaryLoad?.();
        c?.buildCache?.();
    } catch (e) {
        console.debug("🐈‍⬛ [BCTP] 動作字典重建失敗", e);
    }

    // 螢幕文字快取（Interface / InformationSheet 等）在第一次建置時就記憶化，之後只在語言
    // 切換時才自更新（Text.js getOptional）。瀏覽器上我們早於遊戲注入所以沒事；Electron 載入
    // 較晚（page-loaded 才注入腳本），常在我們注入前就把英文/官方文字烤進 cache，導致 year(s)、
    // On trial by 等維持英文。這裡強制重建所有已載入的螢幕快取，讓它們吃到注入的 TranslationCache，
    // 使結果與載入時序無關。buildCache 從 CSV 快取重跑翻譯，冪等安全。
    try {
        if (typeof TextAllScreenCache !== "undefined") {
            TextAllScreenCache.forEach((c) => c?.buildCache?.());
        }
    } catch (e) {
        console.debug("🐈‍⬛ [BCTP] 螢幕文字快取重建失敗", e);
    }
}
