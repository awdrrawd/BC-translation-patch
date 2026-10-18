// R133 TextCache translates CSV identifiers; maintained dictionaries use English.
// Keep this conversion scoped to each CSV, never the global mod dictionaries.
export function textKeyRows(rows, textFile = false) {
    const content = rows.filter(row => row.some(value => value.trim()));
    if (!content.length || !content.every(row => row.length >= 2 &&
        (textFile || row.slice(2).every(value => !value.trim())))) return null;
    // TextCache uses the first two columns and the last occurrence of a key.
    return [...new Map(content.map(([key, english]) => [key, english]))];
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
