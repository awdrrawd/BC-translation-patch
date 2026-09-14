// Only called for incoming Action/Beep. Captured names never pass through OpenCC.
const compiled = new WeakMap();
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const tokenPattern = /%[A-Z_]+%/g;
export function translateLscgMessage(text, dictionary, lang = "TW") {
    if (!["CN", "TW"].includes(lang) || !dictionary) return undefined;
    let rules = compiled.get(dictionary);
    if (!rules) {
        rules = Object.entries(dictionary).map(([source, target]) => {
            const tokens = [];
            let cursor = 0, pattern = "^";
            for (const match of source.matchAll(tokenPattern)) {
                pattern += escape(source.slice(cursor, match.index));
                tokens.push(match[0]);
                pattern += match[0] === "%OPP_POSSESSIVE%" ? "(her|his|their|its)"
                    : match[0] === "%OPP_INTENSIVE%" ? "(her|him|them|it|herself|himself|themselves|itself)"
                    : match[0] === "%OPP_NAME_POSSESSIVE%" ? "(.+?'s|her own|his own|their own|its own)"
                    : match[0] === "%NAME%" ? "(.+?)" : "(.*?)";
                cursor = match.index + match[0].length;
            }
            return { regex: new RegExp(pattern + escape(source.slice(cursor)) + "$"), tokens, target };
        });
        compiled.set(dictionary, rules);
    }
    const trimmed = text.trim(), enclosed = trimmed.startsWith("(") && trimmed.endsWith(")");
    const raw = enclosed ? trimmed.slice(1, -1) : trimmed;
    for (const rule of rules) {
        const match = rule.regex.exec(raw);
        if (!match) continue;
        const values = Object.fromEntries(rule.tokens.map((token, i) => {
            let value = match[i + 1];
            if (token === "%OPP_NAME_POSSESSIVE%") value = value.endsWith("'s") ? value.slice(0, -2) : "自己";
            if (token === "%OPP_INTENSIVE%") value = /self|selves/.test(value) ? "自己" : "對方";
            if (token === "%OPP_NAME%" && !value) value = "對方";
            // Use the dictionary's script for generic pronouns only.
            if (value === "對方" && lang === "CN") value = "对方";
            return [token, value];
        }));
        const result = rule.target.replace(tokenPattern, token => values[token] ?? token);
        return text.slice(0, text.indexOf(trimmed)) + (enclosed ? `(${result})` : result) + text.slice(text.indexOf(trimmed) + trimmed.length);
    }
    return undefined;
}
