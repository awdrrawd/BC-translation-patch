// Keep this bootstrap free of static imports so duplicate detection runs first.
const g = /** @type {any} */ (globalThis);
g.Liko = g.Liko ?? {};

if (g.Liko.__Sys_VanillaTranslation__) {
    console.log('[BCTP] Already loaded, skipping duplicate init.');
} else {
    const namespace = g.Liko.__Sys_VanillaTranslation__ = {};
    import('./app.js').catch(error => {
        if (g.Liko.__Sys_VanillaTranslation__ === namespace && !namespace.version) {
            delete g.Liko.__Sys_VanillaTranslation__;
        }
        console.error('🐈‍⬛ [BCTP] Failed to load:', error);
    });
}
