import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { generateDict } from "./gen-dict.js";

const OpenCC = createRequire(import.meta.url)("opencc-js");
const toTraditional = OpenCC.Converter({ from: "cn", to: "tw" });
const toSimplified = OpenCC.Converter({ from: "tw", to: "cn" });
const han = char => /[一-鿿]/.test(char);
const dict = generateDict();

// A flattened .txt table is [en, zh, en, zh, ...]; some official files even carry Chinese in the "en" slot.
const translations = flat => flat.filter((_, i) => i % 2 === 1);

function* strings(value, where = "") {
    if (typeof value === "string") yield [where, value];
    else if (Array.isArray(value)) for (const [i, v] of value.entries()) yield* strings(v, `${where}[${i}]`);
    else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) yield* strings(v, `${where}/${k}`);
}

// Characters that are also valid Traditional Chinese, so seeing them in TW is not an error by itself.
const AMBIGUOUS = new Set([..."斗伙游准丑干征台采霉划"]);
// 里/后 are valid only inside these names/words; otherwise OpenCC missed 裡/後.
const ALLOWED_CONTEXT = [/西西里/, /伊里奇/, /庫布里克/, /安德里亞/, /皇后/, /王后/];

test("TW output contains no leftover Simplified characters", () => {
    const problems = [];
    for (const [table, data] of Object.entries(dict)) {
        if (!data?.TW && table !== "paths") continue;
        const source = table === "paths"
            ? Object.fromEntries(Object.entries(dict.paths).filter(([p]) => p.endsWith("_TW.txt")).map(([p, flat]) => [p, translations(flat)]))
            : data.TW;
        for (const [where, text] of strings(source)) {
            if (/[぀-ヿ]/.test(text)) continue; // Japanese lines are left as-is
            if (!/[一-鿿]/.test(text)) continue;
            if (table !== "paths" && /(^|\/)(p|f)$/.test(where) && !/[一-鿿]/.test(text)) continue;
            let stripped = text;
            for (const allowed of ALLOWED_CONTEXT) stripped = stripped.replace(new RegExp(allowed, "g"), "");
            const bad = [...stripped].filter(c => han(c) && !AMBIGUOUS.has(c) && toTraditional(c) !== c);
            if (bad.length) problems.push(`${table}${where}: ${[...new Set(bad)].join("")} in ${text.slice(0, 60)}`);
        }
    }
    assert.deepEqual(problems.slice(0, 20), []);
});

test("maintained CN tables contain no Traditional characters", () => {
    // base/paths mirror the official CN files, whose upstream typos are not ours to rewrite here.
    const problems = [];
    for (const table of ["activity", "modRegex", "bcxHelp", "crafting", "modMenu", "surfaces", "compat"]) {
        for (const [where, text] of strings(dict[table].CN)) {
            if (/[぀-ヿ]/.test(text)) continue;
            const bad = [...text].filter(c => han(c) && c !== "么" && toSimplified(c) !== c);
            if (bad.length) problems.push(`${table}${where}: ${[...new Set(bad)].join("")} in ${text.slice(0, 60)}`);
        }
    }
    assert.deepEqual(problems.slice(0, 20), []);
});

test("CN and TW tables expose identical keys and placeholders", () => {
    const tokens = text => (text.match(/%[A-Za-z_]+%|\$\d|\{[^}]*\}|PLAYER_NAME|SourceCharacter|DestinationCharacter\w*/g) || []).sort().join("|");
    for (const table of ["activity", "modRegex", "bcxHelp", "crafting", "base", "modMenu", "surfaces", "compat"]) {
        const cn = new Map(strings(dict[table].CN)), tw = new Map(strings(dict[table].TW));
        assert.deepEqual([...tw.keys()], [...cn.keys()], `${table}: key sets differ`);
        for (const [where, text] of cn) {
            if (/<[^>]+>/.test(text)) continue; // angle-bracket usage text is translated on purpose
            assert.equal(tokens(tw.get(where)), tokens(text), `${table}${where}: placeholders differ`);
        }
    }
});
