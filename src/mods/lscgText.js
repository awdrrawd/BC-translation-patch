// Small, LSCG-only adapters for strings whose source includes live values or
// multiple lines. Exact dictionary entries always win; the fallbacks below only
// translate known labels/status fragments and preserve user-generated values.
const PREFIXES = [
    ["Remote access: wearer's global default", "远程访问：佩戴者的全局默认设置"],
    ["Remote access: Everyone, no exceptions", "远程访问：所有人（无例外）"],
    ["Remote access: Everyone, except blacklist", "远程访问：所有人（黑名单除外）"],
    ["Remote access: Friends, whitelist, lovers and owner", "远程访问：好友、白名单、恋人和主人"],
    ["Remote access: Owner, lovers, whitelist and dominants", "远程访问：主人、恋人、白名单和支配者"],
    ["Remote access: Owner, lovers and whitelist", "远程访问：主人、恋人和白名单"],
    ["Remote access: Owner and lovers", "远程访问：主人与恋人"],
    ["Remote access: Owner only", "远程访问：仅限主人"],
    ["Save item set:\nMax allowed Outfit storage size exceeded (", "保存物品套装：\n超出允许的服装存储上限（"],
    ["Save item set:\n", "保存物品套装：\n"],
    ["Parse outfit code:\n", "解析服装代码：\n"],
    ["↳ wait ", "↳ 等待 "],
    ["Default: wait ", "默认：等待 "],
    ["None of this spell's effects would affect ", "此法术的任何效果都无法影响 "],
    ["This spell has more than your limit of ", "此法术的效果数量超过了你的限制"],
    ["What the spell does to its target, one after another in this order. Up to ", "法术对目标依次施加效果，按此顺序执行。最多 "],
    ["hidden — set by ", "已隐藏 — 设置者："],
    ["Added by extension: ", "由扩展程序添加："],
    ["Outfit settings: ", "服装设置："],
    ["Polymorph settings: ", "变形设置："],
    ["Remote access: ", "远程访问："],
    ["Installed by: ", "植入者："],
    ["Damage settings: ", "伤害设置："],
    ["Dissolves: ", "溶解："],
    ["Web settings: ", "蛛网设置："],
    ["Slime settings: ", "黏液设置："],
    ["Conjured Ropes settings: ", "召唤绳索设置："],
    ["Command settings: ", "命令设置："],
    ["Wearing outfit: ", "正在穿戴服装："],
    ["Grasps: ", "抓取："],
    ["Says: ", "说："],
    ["Cast ", "施放 "],
];

const SUFFIXES = [
    [" (blocked)", "（已屏蔽）"],
    [" (unsupported)", "（客户端不支持）"],
    [" (locked)", "（已锁定）"],
    [" (custom)", "（自定义）"],
    [" · from how you answered", " · 根据你的回答"],
    [" has blocked this effect.", " 已阻止此效果。"],
    ["'s client doesn't have this effect.", "的客户端没有此效果。"],
    [", while hypnotized, hypnotizer only", "，处于催眠状态时，仅限催眠者"],
    [", hypnotizer only", "，仅限催眠者"],
    [" KB)", " KB）"],
    [" effects. Remove some before adding others.", " 个效果。请先删除一些，再添加其他效果。"],
    [" — details", " — 详细信息"],
    [", while hypnotized", "，处于催眠状态时"],
    [" (not a valid roll, so no number is rolled)", "（不是有效的骰子检定，因此不会掷出数字）"],
    ["; no number is rolled)", "；不会掷出数字）"],
];

/**
 * Translate LSCG DOM text without changing dynamic names, IDs, or entered values.
 * `lookup` is the normal BCTP exact/base/mod lookup; this function adds only
 * line-, prefix-, and suffix-aware behaviour used by LSCG's DOM settings.
 * @param {string} source
 * @param {(key: string) => string | undefined} lookup Normal BCTP lookup, including composite labels.
 * @param {(key: string) => string | undefined} exactLookup Exact dictionary lookup without composite fallbacks.
 * @returns {string | undefined}
 */
export function translateLscgText(source, lookup, exactLookup = lookup) {
    if (typeof source !== "string" || !source) return undefined;

    const exact = exactLookup(source);
    if (exact !== undefined && exact !== source) return exact;

    const trimmed = source.trim();
    if (trimmed && trimmed !== source) {
        const translated = exactLookup(trimmed);
        if (translated !== undefined && translated !== trimmed) {
            const start = source.indexOf(trimmed);
            return source.slice(0, start) + translated + source.slice(start + trimmed.length);
        }
    }

    // The longer, fixed prefixes must precede generic labels such as "Remote access:".
    for (const [from, to] of PREFIXES) {
        if (!source.startsWith(from)) continue;
        const tail = source.slice(from.length);
        const translatedTail = tail ? lookup(tail) : undefined;
        return to + (translatedTail ?? tail);
    }

    for (const [from, to] of SUFFIXES) {
        if (!source.endsWith(from)) continue;
        const head = source.slice(0, -from.length);
        const translatedHead = head ? lookup(head) : undefined;
        return (translatedHead ?? head) + to;
    }

    // Some LSCG notices/tooltips are a title line followed by a separate message.
    if (source.includes("\n")) {
        const lines = source.split("\n");
        const translated = lines.map(line => translateLscgText(line, lookup, exactLookup) ?? line);
        if (translated.some((line, i) => line !== lines[i])) return translated.join("\n");
    }

    const composite = lookup(source);
    return composite !== undefined && composite !== source ? composite : undefined;
}
