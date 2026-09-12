// Rebuild descriptions by stable asset IDs, never by reverse-translating Chinese.
export function applyAssetDescriptions(g, paths, lang) {
    if (!["CN", "TW", "EN"].includes(lang)) return;
    const groups = g.AssetGroup || [];
    const assets = g.Asset || [];
    for (const family of new Set(groups.map(group => group.Family))) {
        if (!paths[`Assets/${family}/${family}_CN.txt`] &&
            !paths[`Assets/${family}/${family}_TW.txt`]) continue;
        const csv = g.CommonCSVCache?.[`Assets/${family}/${family}.csv`];
        const flat = paths[`Assets/${family}/${family}_${lang}.txt`];
        if (!Array.isArray(csv) || !csv.length || (lang !== "EN" && !flat)) continue;
        const translations = new Map();
        for (let i = 0; i < (flat?.length || 0); i += 2) {
            if (!translations.has(flat[i])) translations.set(flat[i], flat[i + 1]);
        }
        const english = new Map(csv.filter(row => row.length === 3)
            .map(row => [`${row[0]}:${row[1]}`, row[2].trim()]));
        const set = (object, key) => {
            const source = english.get(key);
            // Custom assets absent from the official CSV retain their own descriptions.
            if (source !== undefined) object.Description = translations.get(source) || source;
        };
        for (const group of groups) if (group.Family === family) set(group, `${group.Name}:`);
        for (const asset of assets) if (asset.Group?.Family === family) {
            set(asset, `${asset.DynamicGroupName ?? asset.Group.Name}:${asset.Name}`);
        }
    }
}

/** Cheap readiness signature: rebuild only after a language/data/cache change. */
export function watchReadiness(g, getCaches, refresh, addCleanup) {
    let previous = [];
    const tick = () => {
        const caches = getCaches();
        const families = [...new Set((g.AssetGroup || []).map(group => group.Family))];
        const current = [g.TranslationLanguage, g.Asset, g.Asset?.length, g.AssetGroup,
            g.AssetGroup?.length, ...families.flatMap(f => {
                const csv = g.CommonCSVCache?.[`Assets/${f}/${f}.csv`];
                return [f, csv, csv?.length];
            }), ...Array.from(caches?.values?.() || [])];
        if (current.length === previous.length && current.every((value, i) => value === previous[i])) return;
        refresh();
        previous = current;
    };
    const timer = setInterval(tick, 250);
    addCleanup(() => clearInterval(timer));
    tick();
}
