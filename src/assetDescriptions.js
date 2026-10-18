// Rebuild descriptions by stable asset IDs, never by reverse-translating Chinese.
export function applyAssetDescriptions(g, paths, lang) {
    if (!["CN", "TW", "EN"].includes(lang)) return;
    const groups = g.AssetGroup || [];
    const assets = g.Asset || [];
    for (const family of new Set(groups.map(group => group.Family))) {
        const bases = [`Assets/${family}`, `Assets/${family}/${family}`];
        if (!bases.some(base => paths[`${base}_CN.txt`] || paths[`${base}_TW.txt`])) continue;
        const csv = bases.map(base => g.CommonCSVCache?.[`${base}.csv`]).find(Array.isArray);
        const flat = bases.map(base => paths[`${base}_${lang}.txt`]).find(Array.isArray);
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
    let groups, groupCount, families = [];
    const tick = () => {
        if (g.document?.hidden) return;
        const caches = getCaches();
        if (groups !== g.AssetGroup || groupCount !== g.AssetGroup?.length) {
            groups = g.AssetGroup;
            groupCount = groups?.length;
            families = [...new Set((groups || []).map(group => group.Family))];
        }
        const current = [g.TranslationLanguage, g.Asset, g.Asset?.length, g.AssetGroup,
            g.AssetGroup?.length, ...families.flatMap(f => {
                return [f, ...[`Assets/${f}.csv`, `Assets/${f}/${f}.csv`].flatMap(path => {
                    const csv = g.CommonCSVCache?.[path];
                    return [csv, csv?.length];
                })];
            }), ...Array.from(caches?.values?.() || [])];
        if (current.length === previous.length && current.every((value, i) => value === previous[i])) return;
        refresh();
        previous = current;
    };
    const timer = setInterval(tick, 250);
    addCleanup(() => clearInterval(timer));
    tick();
}
