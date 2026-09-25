// BCX's private BCXDrawTextWrap bypasses the game's DrawText hooks.
// Capture only its command-description render, then translate before reflowing.
const normalize = text => text.trim().replace(/\s+/g, " ");
const inBcx = () => globalThis.CurrentScreen === "InformationSheet" &&
    globalThis.BCX_Loaded && globalThis.bcx?.inBcxSubscreen?.();

export function setupBcxCanvas(mod, translate, language) {
    let commandFrame = false;
    mod.hookFunction("InformationSheetRun", 1000, (args, next) => {
        commandFrame = false;
        // Game Drawing.js declares `let MainCanvas`: it is a global lexical
        // binding, not a window property. window.MainCanvas may instead be the
        // HTML element exposed by its id, which has no Canvas 2D methods.
        const ctx = typeof MainCanvas !== "undefined" ? MainCanvas : undefined;
        if (!language() || !inBcx() || !ctx ||
            !["measureText", "fillText", "save", "restore"].every(key => typeof ctx[key] === "function")) return next(args);
        const measure = ctx.measureText, draw = ctx.fillText;
        const ownMeasure = Object.getOwnPropertyDescriptor(ctx, "measureText");
        const ownDraw = Object.getOwnPropertyDescriptor(ctx, "fillText");
        const translations = new Map(), rows = [];
        ctx.measureText = function (text) {
            if (commandFrame && typeof text === "string" && !text.trim().startsWith("!")) {
                const translated = translate(text.trim());
                if (translated && translated !== text) translations.set(normalize(text), translated);
            }
            return measure.call(this, text);
        };
        ctx.fillText = function (text, x, y, ...rest) {
            if (commandFrame && x === 125 && typeof text === "string") {
                rows.push({ text, x, y, rest, font: this.font, fillStyle: this.fillStyle,
                    textAlign: this.textAlign, textBaseline: this.textBaseline });
                return;
            }
            return draw.call(this, text, x, y, ...rest);
        };
        let complete = false;
        try {
            const result = next(args);
            complete = true;
            return result;
        } finally {
            if (ownMeasure) Object.defineProperty(ctx, "measureText", ownMeasure); else delete ctx.measureText;
            if (ownDraw) Object.defineProperty(ctx, "fillText", ownDraw); else delete ctx.fillText;
            commandFrame = false;
            ctx.save();
            try {
                const output = [];
                let changed = false;
                for (let i = 0; i < rows.length; i++) {
                    let joined = "", replacement, end = i;
                    for (let j = i; j < rows.length; j++) {
                        joined = normalize(joined + " " + rows[j].text);
                        if (translations.has(joined)) { replacement = translations.get(joined); end = j; break; }
                    }
                    const row = rows[i];
                    if (!replacement) { output.push(row); continue; }
                    changed = true;
                    Object.assign(ctx, { font: row.font });
                    let line = "";
                    for (const char of replacement) {
                        if (line && measure.call(ctx, line + char).width > 1750) {
                            output.push({ ...row, text: line }); line = "";
                        }
                        line += char;
                    }
                    output.push({ ...row, text: line });
                    i = end;
                }
                const rendered = complete && changed ? output : rows;
                rendered.forEach((row, i) => {
                    Object.assign(ctx, { font: row.font, fillStyle: row.fillStyle,
                        textAlign: row.textAlign, textBaseline: row.textBaseline });
                    const y = complete && changed ? 470 - (rendered.length - 1) * 23 + i * 46 : row.y;
                    draw.call(ctx, row.text, row.x, y, ...row.rest);
                });
            } finally { ctx.restore(); }
        }
    });
    return (fn, args) => {
        if (fn === "DrawText" && /^- Commands: Description of the command: /.test(args[0]) && args[1] === 125 && args[2] === 125)
            commandFrame = true;
    };
}

export function translateBcxLog(fn, args, lang, translate = () => undefined) {
    if (!lang || !inBcx()) return undefined;
    const row = fn === "DrawTextFit" && args[1] === 210 && args[3] === 1020;
    const expanded = fn === "DrawTextWrap" && args[1] === -285 && args[3] === 990;
    if (!row && !expanded) return undefined;
    const text = args[0], tw = lang === "TW";
    let m = /^(.+ \(\d+\)) (added|removed) (herself|.+ \(\d+\)) (as|from being) (owner|mistress)\.$/.exec(text);
    if (m) {
        const target = m[3] === "herself" ? "自己" : m[3];
        const role = m[5] === "owner" ? "主人" : "女主人";
        return m[2] === "added" ? `${m[1]} ${tw ? "將" : "将"}${target}${tw ? "設為" : "设为"}${role}。` :
            `${m[1]} 移除了${target}的${role}身分。`;
    }
    m = /^(Praised|Scolded) by (.+ \(\d+\))(?: with note: ([\s\S]*))?$/.exec(text);
    if (m) return `${m[2]} ${m[1] === "Praised" ? (tw ? "給予稱讚" : "给予称赞") : (tw ? "給予責備" : "给予责备")}${m[3] === undefined ? "。" : (tw ? "，備註：" : "，备注：") + m[3]}`;
    m = /^(.+ \(\d+\)) attached a note: ([\s\S]*)$/.exec(text);
    if (m) return `${m[1]} ${tw ? "附加了備註" : "附加了备注"}：${m[2]}`;
    m = /^(.+) entered (private|public) room "([\s\S]*)"$/.exec(text);
    if (m) return `${m[1]} ${tw ? "進入" : "进入"}${m[2] === "private" ? "私人" : (tw ? "公開" : "公开")}${tw ? "房間" : "房间"}「${m[3]}」`;
    m = /^(.+ \(\d+\)) changed (log configuration|permission) "([^"]+)" from "([^"]+)" to "([^"]+)"$/.exec(text);
    if (m) return `${m[1]} ${tw ? "將" : "将"}${m[2] === "permission" ? (tw ? "權限" : "权限") : (tw ? "日誌設定" : "日志设置")}「${translate(m[3]) || m[3]}」${tw ? "從" : "从"}「${translate(m[4]) || m[4]}」${tw ? "改為" : "改为"}「${translate(m[5]) || m[5]}」`;
    m = /^(.+ \(\d+\)) changed (.+)'s '(.+)' command permission to (\w+)$/.exec(text);
    if (m) return `${m[1]} ${tw ? "將" : "将"}${m[2]}的「${translate(m[3]) || m[3]}」指令${tw ? "權限改為" : "权限改为"}${translate(m[4]) || m[4]}`;
    return undefined;
}
