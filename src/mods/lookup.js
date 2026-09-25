// Lookup policy lives here; rendering adapters only supply text and scope.
export function createLookup(dictionary, getLanguage, env = globalThis) {
    let context = [];
    const results = { menu: new Map(), activity: new Map() };
    const memo = (scope, translate) => key => {
        const lang = getLanguage();
        const current = [lang, env.CurrentScreen, !!env.BCX_Loaded, !!env.Player?.LSCG,
            dictionary.modMenu[lang], dictionary.compat[lang], dictionary.surfaces[lang], dictionary.activity[lang], dictionary.modRegex[lang]];
        if (current.some((value, i) => value !== context[i])) {
            Object.values(results).forEach(map => map.clear()); context = current;
        }
        const map = results[scope];
        if (map.has(key)) return map.get(key);
        const value = translate(key);
        if (map.size >= 512) map.delete(map.keys().next().value);
        map.set(key, value); // Cache misses too: dynamic screens repeatedly draw identical labels.
        return value;
    };
    const cache = new WeakMap();
    const rules = entries => {
        if (!entries) return [];
        if (!cache.has(entries)) cache.set(entries, entries.map(entry => ({ ...entry, regex: new RegExp(entry.p, entry.f) })));
        return cache.get(entries);
    };
    const legacy = (scope, key, lang) => {
        for (const id of ["BCX", "LSCG"]) {
            if (id === "BCX" ? !env.BCX_Loaded || (scope === "menu" && env.CurrentScreen !== "InformationSheet") : !env.Player?.LSCG) continue;
            const data = dictionary.compat[lang]?.[id]?.[scope];
            if (data?.text[key]) return data.text[key];
            for (const { regex, r } of rules(data?.regex)) {
                const match = regex.exec(key);
                if (!match) continue;
                // The original LSCG activity rules replace the whole message and translate pronoun captures.
                if (id === "LSCG" && scope === "activities") {
                    const pronouns = { herself: "她自己", hers: "她的", she: "她", her: "她" };
                    return r.replace(/\$(\d+)/g, (_, index) => pronouns[match[index]] ?? match[index]);
                }
                return key.replace(regex, r);
            }
        }
    };
    function exactMenu(key, lang) {
        const surface = dictionary.surfaces[lang];
        const explicit = surface?.search?.[key] || surface?.craft?.[key] ||
            (key === "LSCG Effects" ? surface?.lscg?.[key] : undefined);
        const exact = explicit || dictionary.compat[lang]?.supplement.menu[key] ||
            dictionary.modMenu[lang]?.[key] || legacy("menu", key, lang);
        if (exact) return exact;
        if (env.CurrentScreen === "InformationSheet") for (const { regex, r } of rules(dictionary.modRegex[lang])) {
            if (regex.test(key)) return key.replace(regex, r);
        }
    }
    function menu(key) {
        const lang = getLanguage();
        if (!lang) return undefined;
        const direct = exactMenu(key, lang);
        if (direct) return direct;
        const combo = /^(.+?) \((.+)\)$/.exec(key);
        if (combo) {
            const a = exactMenu(combo[1], lang), b = exactMenu(combo[2], lang);
            if (a || b) return `${a || combo[1]}（${b || combo[2]}）`;
        }
        const pair = /^(.+?)([:：]\s*)(.+)$/.exec(key);
        if (pair) {
            const a = exactMenu(pair[1], lang), b = exactMenu(pair[3], lang);
            if (a || b) return `${a || pair[1]}${pair[2]}${b || pair[3]}`;
        }
    }
    function activity(key) {
        const lang = getLanguage();
        if (!lang) return undefined;
        const extra = dictionary.compat[lang]?.supplement;
        return extra?.activity[key] || dictionary.activity[lang]?.[key] || dictionary.modMenu[lang]?.[key] ||
            legacy("activities", key, lang) || extra?.menu[key];
    }
    const cachedMenu = memo("menu", menu), cachedActivity = memo("activity", activity);
    const any = key => dictionary.base[getLanguage()]?.[key] || cachedMenu(key) || cachedActivity(key);
    const crafting = key => dictionary.crafting[getLanguage()]?.[key] || any(key);
    const html = key => {
        const data = dictionary.compat[getLanguage()];
        return data?.supplement.html[key] || data?.html[key];
    };
    return { menu: cachedMenu, activity: cachedActivity, any, crafting, html };
}
