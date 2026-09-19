import { injectTranslationCache, setupInjection } from "./inject.js";
import { reapply, setupReapply } from "./reapply.js";
import { setupMods, getMissing } from "./mods/index.js";
import { activeLang } from "./lang.js";
import { createScope } from "./lifecycle.js";
import { loadDictionary } from "./dictionary.js";

/* global __BCTP_VERSION__, __BCTP_NAME__, __BCTP_FULLNAME__, __BCTP_REPO__, __BCTP_DATA_URL__ */

async function waitForGame() {
    const required = ["TranslationAvailable", "TranslationAssetProcess", "DrawText",
        "DrawTextFit", "DrawTextWrap", "DynamicDrawText", "ActivityDictionaryText",
        "ChatRoomMessage", "ChatRoomSendLocal"];
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
    await loadDictionary(__BCTP_DATA_URL__);
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
        setupReapply(mod, scope.add);
        console.log(`🐈‍⬛ [BCTP] v${__BCTP_VERSION__} ready (${activeLang() ?? "inactive"})`);
        return {
            version: __BCTP_VERSION__, lang: activeLang, pathCount: count,
            reapply, missing: getMissing, loadTime: Date.now(),
        };
    } catch (error) {
        scope.dispose();
        throw error;
    }
}
