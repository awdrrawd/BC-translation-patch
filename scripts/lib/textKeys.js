// R133 TextCache translates CSV identifiers; maintained dictionaries use English.
// Keep this conversion scoped to each CSV, never the global mod dictionaries.
export function textKeyRows(rows, textFile = false) {
    if (!rows.length || !rows.every(row => row.length >= 2 && (textFile || row.slice(2).every(value => !value.trim())))) return null;
    // TextCache.cacheLines assigns rows in order: the last duplicate wins.
    return [...new Map(rows.map(([key, english]) => [key, english]))];
}

export function withTextKeys(pairs, rows = []) {
    const translations = new Map(pairs);
    const keyed = rows.flatMap(([key, english]) => {
        const value = translations.get(english.trim());
        return value ? [[key, value]] : [];
    });
    const keys = new Set(keyed.map(([key]) => key));
    return [...keyed, ...pairs.filter(([key]) => !keys.has(key))];
}
