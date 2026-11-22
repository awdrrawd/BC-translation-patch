// Dictionary lookup shared by mods that draw their own UI (ECHS canvas/popup, Littlish Club DOM).
//
// Dictionary keys are English source strings. A key may contain placeholders:
//   {name}   any text (translated on its own when the dictionary knows it)
//   {#n}     a number such as 5 or 2.5
// The value reuses the same placeholder names. Exact keys always win over templates.

const NUMBER = "\\d+(?:\\.\\d+)?";
const PLACEHOLDER = /\{(#?)(\w+)\}/g;
const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const normalize = text => text.replace(/\s+/g, " ").trim();
// Marks drawn before a label (checkbox state, list bullets, disclosure arrows).
const PREFIX = /^([✓✔☑☐↺▸▾+−-]+\s+)(\S.*)$/s;
const MAX_CACHE = 512;

const compiled = new WeakMap();

function literalOf(source) {
    return source.split(PLACEHOLDER).filter((_, index) => index % 3 === 0)
        .reduce((best, part) => part.length > best.length ? part : best, "");
}
const fixedLength = source => source.split(PLACEHOLDER).filter((_, index) => index % 3 === 0).join("").length;

function compile(map) {
    let entry = compiled.get(map);
    if (entry) return entry;
    const exact = new Map();
    const rules = [];
    for (const [source, target] of Object.entries(map)) {
        const key = normalize(source);
        if (!/\{#?\w+\}/.test(source)) { exact.set(key, target); continue; }
        const names = [];
        let pattern = "", last = 0;
        for (const match of key.matchAll(PLACEHOLDER)) {
            pattern += escapeRegExp(key.slice(last, match.index)) + (match[1] ? `(${NUMBER})` : "(.+?)");
            names.push({ name: match[2], numeric: !!match[1] });
            last = match.index + match[0].length;
        }
        pattern += escapeRegExp(key.slice(last));
        rules.push({ regex: new RegExp(`^${pattern}$`, "s"), names, target, literal: literalOf(key), fixed: fixedLength(key) });
    }
    // The most specific (longest fixed text) template is tried first; equal runs fall back to the total fixed text,
    // so `"x" stops at: {tier}.` beats `"x" stops at: {value}`.
    rules.sort((a, b) => b.literal.length - a.literal.length || b.fixed - a.fixed);
    entry = { exact, rules, cache: new Map() };
    compiled.set(map, entry);
    return entry;
}

/** A captured fragment: exact entry, else "a; b; c" / "a, b" lists of exact entries, else untouched. */
function translateFragment(fragment, entry) {
    const direct = entry.exact.get(normalize(fragment));
    if (direct !== undefined) return direct;
    for (const separator of ["; ", ", "]) {
        if (!fragment.includes(separator)) continue;
        const parts = fragment.split(separator);
        if (parts.every(part => entry.exact.has(normalize(part)))) {
            return parts.map(part => entry.exact.get(normalize(part))).join(separator === "; " ? "；" : "、");
        }
    }
    return fragment;
}

function translateKey(key, entry, depth = 0) {
    const exact = entry.exact.get(key);
    if (exact !== undefined) return exact;
    for (const rule of entry.rules) {
        if (rule.literal && !key.includes(rule.literal)) continue;
        const match = rule.regex.exec(key);
        if (!match) continue;
        const values = {};
        rule.names.forEach(({ name, numeric }, index) => {
            values[name] = numeric ? match[index + 1] : translateFragment(match[index + 1], entry);
        });
        return rule.target.replace(PLACEHOLDER, (token, _hash, name) => values[name] ?? token);
    }
    const prefixed = depth < 2 && PREFIX.exec(key);
    if (prefixed) {
        const rest = translateKey(prefixed[2], entry, depth + 1);
        if (rest !== undefined) return prefixed[1] + rest;
    }
    return undefined;
}

/**
 * @param {string} text   displayed English text
 * @param {Record<string,string>|undefined} map  dictionary for one mod and language
 * @returns {string|undefined} translated text (surrounding whitespace kept), or undefined when unknown
 */
export function translateModText(text, map) {
    if (!map || typeof text !== "string") return undefined;
    const key = normalize(text);
    if (!key || !/[A-Za-z]/.test(key) || key.length > 1500) return undefined;
    const entry = compile(map);
    let result;
    if (entry.cache.has(key)) result = entry.cache.get(key);
    else {
        result = translateKey(key, entry);
        // Dynamic screens redraw identical labels every frame; remember misses too.
        if (entry.cache.size >= MAX_CACHE) entry.cache.delete(entry.cache.keys().next().value);
        entry.cache.set(key, result);
    }
    if (result === undefined) return undefined;
    return text.match(/^\s*/)[0] + result + text.match(/\s*$/)[0];
}
