// LSCG item-use.ts sends already-substituted Action/Beep messages.
// Translate only the four necklace templates, never arbitrary chat or outgoing data.
export function translateNecklaceAction(text, lang) {
    if (!["CN", "TW"].includes(lang)) return undefined;
    const trimmed = text.trim();
    const enclosed = trimmed.startsWith("(") && trimmed.endsWith(")");
    const raw = enclosed ? trimmed.slice(1, -1) : trimmed;
    const tuck = /^(.+?) tucks (.+?'s|his own|her own|their own|its own) (key|lock) necklace under (?:her|his|their|its) clothing\.$/.exec(raw);
    const pull = /^(.+?) pulls (.+?'s|his own|her own|their own|its own) (key|lock) necklace out\.$/.exec(raw);
    const match = tuck || pull;
    if (!match) return undefined;
    const owner = match[2].endsWith("'s") ? match[2].slice(0, -2) + "的" : "自己的";
    const item = lang === "TW" ? (match[3] === "key" ? "鑰匙項鍊" : "鎖頭項鍊") : (match[3] === "key" ? "钥匙项链" : "锁头项链");
    const result = tuck
        ? `${match[1]} 將${owner}${item}藏入衣服內。`
        : `${match[1]} 將${owner}${item}拉出衣服外。`;
    const translated = lang === "CN" ? result.replace(" 將", " 将").replace("衣服內", "衣服内") : result;
    return text.slice(0, text.indexOf(trimmed)) + (enclosed ? `(${translated})` : translated) + text.slice(text.indexOf(trimmed) + trimmed.length);
}
