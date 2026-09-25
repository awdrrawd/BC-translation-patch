import { PATHS } from "./data.js";
import { injectTranslationCache } from "./inject.js";
import { applyAssetDescriptions, watchReadiness } from "./assetDescriptions.js";

/* global TextAllScreenCache */
const caches = () => typeof TextAllScreenCache === "undefined" ? undefined : TextAllScreenCache;

export function reapply() {
    const lang = globalThis.TranslationLanguage;
    if (!["CN", "TW", "EN"].includes(lang)) return;
    injectTranslationCache();
    applyAssetDescriptions(globalThis, PATHS, lang);
    const all = new Set(caches()?.values?.() || []);
    if (lang !== "EN") {
        const activity = globalThis.ActivityDictionaryLoad?.();
        if (activity) all.add(activity);
    }
    // Each cache starts from its original CSV, not its previous translated values.
    for (const cache of all) {
        try { cache?.buildCache?.(); }
        catch (error) { console.debug("[BCTP] Cache rebuild failed", error); }
    }
}

export function setupReapply(mod, addCleanup, languageChanged = () => {}) {
    // Also repair a late official translation response which was already in flight.
    mod.hookFunction("TranslationAssetProcess", 10, (args, next) => {
        const result = next(args);
        if (["CN", "TW"].includes(globalThis.TranslationLanguage)) {
            injectTranslationCache();
            applyAssetDescriptions(globalThis, PATHS, globalThis.TranslationLanguage);
        }
        return result;
    });
    let lastLanguage;
    watchReadiness(globalThis, caches, () => {
        reapply();
        if (lastLanguage !== globalThis.TranslationLanguage) {
            // Restore other languages through the game's own CSV-based loader.
            if (["CN", "TW"].includes(lastLanguage) &&
                !["CN", "TW", "EN"].includes(globalThis.TranslationLanguage)) {
                const families = new Set((globalThis.AssetGroup || []).map(group => group.Family));
                for (const family of families) {
                    globalThis.AssetLoadDescription?.(family)?.catch(error =>
                        console.debug("[BCTP] Language reload failed", error));
                }
            }
            lastLanguage = globalThis.TranslationLanguage;
            languageChanged();
            document.dispatchEvent(new Event("bctp-language-change"));
        }
    }, addCleanup);
}
