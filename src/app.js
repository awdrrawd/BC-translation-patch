import { injectTranslationCache, setupInjection } from "./inject.js";
import { reapply } from "./reapply.js";
import { setupMods, getMissing } from "./mods/index.js";
import { activeLang } from "./lang.js";

// 由建置時的 esbuild define 注入
/* global __BCTP_VERSION__, __BCTP_NAME__, __BCTP_FULLNAME__, __BCTP_REPO__ */

(async () => {
    const g = /** @type {any} */ (globalThis);
    const namespace = g.Liko.__Sys_VanillaTranslation__;
    Object.assign(namespace, { version: __BCTP_VERSION__, loading: true });

    // 先同步注入 TranslationCache，務必搶在 TranslationAsset()（資產載入時就地翻譯道具/服裝描述）
    // 之前完成 —— 這步不需 bcModSdk，不能等在下面的 CDN await 後面（那會輸掉時序競態）。
    const { count } = injectTranslationCache();

    // 載入 Bondage Club Mod SDK（提供函式 hook 能力）
    try {
        await import("https://cdn.jsdelivr.net/npm/bondage-club-mod-sdk@1.2.0");
    } catch (e) {
        console.error("🐈‍⬛ [BCTP] 載入 bcModSdk 失敗", e);
        if (g.Liko.__Sys_VanillaTranslation__ === namespace) delete g.Liko.__Sys_VanillaTranslation__;
        return;
    }
    const sdk = g.bcModSdk;
    if (!sdk) {
        console.error("🐈‍⬛ [BCTP] 找不到 bcModSdk");
        if (g.Liko.__Sys_VanillaTranslation__ === namespace) delete g.Liko.__Sys_VanillaTranslation__;
        return;
    }

    const mod = sdk.registerMod({
        name: __BCTP_NAME__,
        fullName: __BCTP_FULLNAME__,
        version: __BCTP_VERSION__,
        repository: __BCTP_REPO__,
    });

    // 語系：非 CN/TW 時所有 hook 皆為 no-op（activeLang 回 null），切換語言即時生效
    setupInjection(mod);
    setupMods(mod);
    reapply();

    const api = {
        version: __BCTP_VERSION__,
        lang: activeLang,
        pathCount: count,
        reapply,
        missing: getMissing, // 匯出畫面上翻不到的英文
        loadTime: Date.now(),
    };
    Object.assign(namespace, api, { loading: false });
    g.BCTP = api; // 相容別名

    console.log(
        `🐈‍⬛ [BCTP] ✅ v${__BCTP_VERSION__} loaded...（now：${activeLang() ?? "非CN/TW，未啟用"}）`
    );
})();
