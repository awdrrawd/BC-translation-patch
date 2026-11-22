// ECHS draws most of its settings screen with MainCanvas.fillText/measureText directly (its own
// drawLeftTextFit / drawLeftTextWrap / tip helpers), so those labels never pass through the
// DrawText family of hooks. This layer wraps the two canvas methods on MainCanvas, only while the
// ECHS screen is open, and translates from the same `echs` dictionary.
//
//  - Whole strings (rows, headings, blurbs fitted on one line) are translated in fillText and in
//    measureText, so the add-on's own "shrink to fit" works on the translated width.
//  - Text that ECHS word-wraps arrives one English line at a time. The first line is recognised as
//    the start of exactly one dictionary key; the English lines are swallowed as they follow and
//    the translation is drawn once, re-wrapped for the same column and centred on the same block.
//
// Strings ECHS draws that no dictionary key matches are left untouched.

import { translateModText } from "./modSurfaces.js";

const normalize = text => text.replace(/\s+/g, " ").trim();
const CJK = /[\u3400-\u9fff]/;
// Never start a line with these closing marks.
const CLOSING = new Set([..."，。、；：！？）】」』”’,.;:!?)]}%…"]);

/** Latin runs stay whole; everything else may break anywhere. */
function tokens(text) {
    return text.match(/[\x21-\x7E]+|\s|[\s\S]/gu) || [];
}

function wrapTranslated(text, width, measure) {
    const lines = [];
    let line = "";
    for (const token of tokens(text)) {
        if (!line && /^\s$/.test(token)) continue;
        const trial = line + token;
        if (!line || CLOSING.has(token) || measure(trial.trimEnd()) <= width) line = trial;
        else { lines.push(line.trimEnd()); line = /^\s$/.test(token) ? "" : token; }
    }
    if (line.trim()) lines.push(line.trimEnd());
    return lines.length ? lines : [""];
}

/**
 * @param {{ dictionary: () => Record<string,string>|undefined, enabled: () => boolean }} options
 * @returns {{ install(ctx: any): () => void }}
 */
export function createEchsCanvasText({ dictionary, enabled }) {
    let indexed = null; // { map, keys: [normalised exact key], }
    const firstLines = new Map();

    const keysOf = map => {
        if (indexed?.map === map) return indexed.keys;
        firstLines.clear();
        indexed = { map, keys: Object.keys(map).filter(key => !/\{#?\w+\}/.test(key)).map(normalize).filter(key => key.includes(" ")) };
        return indexed.keys;
    };

    /** The single dictionary key whose first wrapped line is `fragment`, or null. */
    const keyStartingWith = (fragment, map) => {
        const keys = keysOf(map);
        if (firstLines.has(fragment)) return firstLines.get(fragment);
        const found = keys.filter(key => key.length > fragment.length && key.startsWith(`${fragment} `));
        const result = found.length === 1 ? found[0] : null;
        if (firstLines.size > 512) firstLines.clear();
        firstLines.set(fragment, result);
        return result;
    };

    function install(ctx) {
        const fill = ctx.fillText, measure = ctx.measureText;
        const rawFill = (...args) => fill.apply(ctx, args);
        const rawMeasure = text => measure.call(ctx, text).width;
        let pending = null;

        const draw = () => {
            const job = pending;
            pending = null;
            if (!job) return;
            const lines = wrapTranslated(job.text, job.width, rawMeasure);
            const pitch = job.count > 1 ? (job.lastY - job.y) / (job.count - 1) : Math.round(job.size * 1.2);
            const first = (job.y + job.lastY) / 2 - ((lines.length - 1) * pitch) / 2;
            ctx.save();
            ctx.font = job.style.font; ctx.fillStyle = job.style.fillStyle;
            ctx.textAlign = job.style.textAlign; ctx.textBaseline = job.style.textBaseline;
            lines.forEach((line, i) => rawFill(line, job.x, first + i * pitch));
            ctx.restore();
        };

        ctx.measureText = function (text, ...rest) {
            if (typeof text === "string" && enabled() && !CJK.test(text)) {
                const t = translateModText(text, dictionary());
                if (t !== undefined) text = t;
            }
            return measure.call(this, text, ...rest);
        };

        ctx.fillText = function (text, x, y, ...rest) {
            if (typeof text !== "string" || !enabled()) { draw(); return fill.call(this, text, x, y, ...rest); }
            const map = dictionary();
            const fragment = normalize(text);
            if (pending) {
                const left = pending.key.slice(pending.consumed).trimStart();
                if (fragment && x === pending.x && y > pending.lastY && left.startsWith(fragment)) {
                    pending.consumed = pending.key.length - left.length + fragment.length;
                    pending.lastY = y;
                    pending.count++;
                    if (pending.consumed >= pending.key.length) draw();
                    return;
                }
                draw(); // The continuation never came: show what we have, then draw this normally.
            }
            if (!map || CJK.test(text) || !/[A-Za-z]{2}/.test(fragment)) return fill.call(this, text, x, y, ...rest);
            const whole = translateModText(text, map);
            if (whole !== undefined) return fill.call(this, whole, x, y, ...rest);
            const key = fragment.includes(" ") ? keyStartingWith(fragment, map) : null;
            const translated = key && translateModText(key, map);
            if (!translated) return fill.call(this, text, x, y, ...rest);
            // The English column ended between this line's width and the width with the next word.
            const next = key.slice(fragment.length).trimStart().split(" ")[0];
            const narrow = rawMeasure(fragment), wide = rawMeasure(`${fragment} ${next}`);
            pending = {
                key, text: translated, consumed: fragment.length, x, y, lastY: y, count: 1,
                width: (narrow + wide) / 2, size: Number(/(\d+(?:\.\d+)?)px/.exec(ctx.font)?.[1]) || 36,
                style: { font: ctx.font, fillStyle: ctx.fillStyle, textAlign: ctx.textAlign, textBaseline: ctx.textBaseline },
            };
            // A frame draws its wrapped lines in one synchronous run; this only fires if one is cut short.
            queueMicrotask(draw);
        };

        return () => {
            draw();
            if (ctx.fillText !== fill && Object.prototype.hasOwnProperty.call(ctx, "fillText")) delete ctx.fillText;
            if (ctx.measureText !== measure && Object.prototype.hasOwnProperty.call(ctx, "measureText")) delete ctx.measureText;
        };
    }

    return { install };
}

/**
 * BC declares these with `let` (Drawing.js: `let MainCanvas`, Extensions.js: `let PreferenceExtensionsCurrent`,
 * Preference.js: `let PreferenceExtensionsSettings`). A top-level `let` is a global *lexical* binding, NOT a
 * property of window, so `globalThis.MainCanvas` is undefined (or, for MainCanvas, the <canvas id="MainCanvas">
 * element, which has no 2D methods) and `globalThis.PreferenceExtensionsCurrent` is always undefined.
 * A bare identifier does see them, so read through `typeof`, which never throws when the name is missing.
 * `env` is consulted first so tests (and any build that does expose them on window) keep working.
 */
const lexical = {
    mainCanvas: () => typeof MainCanvas !== "undefined" ? MainCanvas : undefined,
    current: () => typeof PreferenceExtensionsCurrent !== "undefined" ? PreferenceExtensionsCurrent : undefined,
    settings: () => typeof PreferenceExtensionsSettings !== "undefined" ? PreferenceExtensionsSettings : undefined,
};
const is2d = ctx => !!ctx && typeof ctx.fillText === "function" && typeof ctx.measureText === "function";

/** The game's 2D context. Last resort: the canvas element hands back the very same context object. */
export function getMainCanvas(env = globalThis) {
    for (const candidate of [env.MainCanvas, lexical.mainCanvas()]) if (is2d(candidate)) return candidate;
    try {
        const ctx = env.document?.getElementById?.("MainCanvas")?.getContext?.("2d");
        if (is2d(ctx)) return ctx;
    } catch { /* no canvas yet */ }
    return undefined;
}

/** True only while ECHS's own Preference > Extensions screen (or an Information Sheet panel) is up. */
export function isEchsScreen(env = globalThis) {
    const screen = env.CurrentScreen;
    if (screen === "InformationSheet") return true;
    // BC's screen name is "Preference" (Preference.js: CommonSetScreen("Character", "Preference")).
    if (screen !== "Preference") return false;
    const current = env.PreferenceExtensionsCurrent ?? lexical.current();
    const settings = env.PreferenceExtensionsSettings ?? lexical.settings();
    return !!current && current === settings?.HypnosisAddon;
}

/**
 * Patch MainCanvas as soon as the game has created it, and again if the game ever replaces it.
 * @param {() => Record<string,string>|undefined} dictionary  echs dictionary for the active language
 * @param {() => boolean} echsLoaded
 */
export function setupEchsCanvas(dictionary, echsLoaded, addCleanup, env = globalThis) {
    const layer = createEchsCanvasText({ dictionary, enabled: () => !!dictionary() && echsLoaded() && isEchsScreen(env) });
    let patched = null, uninstall = null;
    const attach = () => {
        const ctx = getMainCanvas(env);
        if (!ctx || ctx === patched) return;
        uninstall?.();
        patched = ctx;
        uninstall = layer.install(ctx);
    };
    const timer = env.setInterval(attach, 500);
    addCleanup(() => { env.clearInterval(timer); uninstall?.(); patched = uninstall = null; });
    attach();
}
