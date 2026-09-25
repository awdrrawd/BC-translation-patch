import { injectTranslationCache, setupInjection } from "./inject.js";
import { reapply, setupReapply } from "./reapply.js";
import { setupMods, getMissing, clearMissing } from "./mods/index.js";
import { activeLang } from "./lang.js";
import { createScope } from "./lifecycle.js";
import { createLanguageLoader } from "./languageLoader.js";

/* global __BCTP_VERSION__, __BCTP_NAME__, __BCTP_FULLNAME__, __BCTP_REPO__, __BCTP_DATA_URLS__ */

async function waitForGame() {
    const required = ["TranslationAvailable", "TranslationAssetProcess", "DrawText",
        "DrawTextFit", "DrawTextWrap", "DynamicDrawText", "ActivityDictionaryText",
        "ChatRoomMessage", "ChatRoomSendLocal", "InformationSheetRun"];
    const until = Date.now() + 30000;
    while (!required.every(name => typeof globalThis[name] === "function")) {
        if (Date.now() >= until) throw new Error("Game functions were not ready within 30 seconds");
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}

export async function init(namespace) {
    const g = globalThis;
    const scope = createScope();
    namespace.version = __BCTP_VERSION__;
    namespace.phase = "downloading";
    let initialized = false;
    const languages = createLanguageLoader(__BCTP_DATA_URLS__, activeLang, namespace, () => {
        if (!initialized) return;
        reapply();
        namespace.pathCount = injectTranslationCache().count;
        document.dispatchEvent(new Event("bctp-language-change"));
    });
    scope.add(languages.dispose);
    namespace.retryLanguage = languages.ensure;
    try {
        let requested;
        do {
            requested = activeLang();
            try { await languages.ensure(); }
            catch (error) { if (requested === activeLang()) throw error; }
        } while (requested !== activeLang());
    } catch (error) { scope.dispose(); throw error; }
    namespace.phase = "initializing";
    // Cache injection remains useful even if SDK initialization fails.
    const { count } = injectTranslationCache();
    try {
        if (!g.bcModSdk) await import("https://cdn.jsdelivr.net/npm/bondage-club-mod-sdk@1.2.0");
        if (!g.bcModSdk) throw new Error("bcModSdk was not available after loading");
        await waitForGame();
        const mod = g.bcModSdk.registerMod({
            name: __BCTP_NAME__, fullName: __BCTP_FULLNAME__,
            version: __BCTP_VERSION__, repository: __BCTP_REPO__,
        });
        scope.add(() => mod.unload());
        setupInjection(mod);
        setupMods(mod, scope.add);
        initialized = true;
        setupReapply(mod, scope.add, () => languages.ensure().catch(error => console.debug("[BCTP] Language download failed", error)));
        console.log(`🐈‍⬛ [BCTP] v${__BCTP_VERSION__} ready (${activeLang() ?? "inactive"})`);
        return {
            version: __BCTP_VERSION__, lang: activeLang, pathCount: count,
            reapply, missing: getMissing, clearMissing, loadTime: Date.now(),
        };
    } catch (error) {
        scope.dispose();
        throw error;
    }
}
