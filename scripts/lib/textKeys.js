// R133 TextCache translates CSV identifiers; maintained dictionaries use English.
// Keep this conversion scoped to each CSV, never the global mod dictionaries.
export function withTextKeys(pairs, rows = []) {
    const translations = new Map(pairs);
    const keyed = rows.flatMap(([key, english]) => {
        const value = translations.get(english.trim());
        return value ? [[key, value]] : [];
    });
    const keys = new Set(keyed.map(([key]) => key));
    return [...keyed, ...pairs.filter(([key]) => !keys.has(key))];
}
