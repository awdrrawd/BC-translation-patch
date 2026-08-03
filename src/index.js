import { setupInjection } from "./inject.js";
import { setupDiagnostics } from "./diagnostics.js";
import { activeLang } from "./lang.js";

// 由建置時的 esbuild define 注入
/* global __BCTP_VERSION__, __BCTP_NAME__, __BCTP_FULLNAME__, __BCTP_REPO__ */

(async () => {
    // 載入 Bondage Club Mod SDK（提供函式 hook 能力）
    try {
        await import("https://cdn.jsdelivr.net/npm/bondage-club-mod-sdk@1.2.0");
    } catch (e) {
        console.error("[BCTP] 載入 bcModSdk 失敗", e);
        return;
    }
    const sdk = /** @type {any} */ (globalThis).bcModSdk;
    if (!sdk) {
        console.error("[BCTP] 找不到 bcModSdk");
        return;
    }

    const mod = sdk.registerMod({
        name: __BCTP_NAME__,
        fullName: __BCTP_FULLNAME__,
        version: __BCTP_VERSION__,
        repository: __BCTP_REPO__,
    });

    const { count } = setupInjection(mod);
    if (/** @type {any} */ (globalThis).BCTP_DEBUG) setupDiagnostics(mod);

    /** @type {any} */ (globalThis).BCTP = {
        version: __BCTP_VERSION__,
        lang: activeLang,
        pathCount: count,
    };

    console.log(
        `[BCTP] ${__BCTP_FULLNAME__} v${__BCTP_VERSION__} 已載入：注入 ${count} 個翻譯路徑` +
        `（目前語言：${activeLang() ?? "非CN/TW，未啟用"}）`
    );
})();
