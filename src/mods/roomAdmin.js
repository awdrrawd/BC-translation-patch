// BCX currently draws its four template names directly with these coordinates.
// Fail closed for this display row: only the three BCX-generated placeholders translate.
const placeholders = new Set([
    "- template without room name -", "- empty template slot -", "- auto-applied default -",
]);
export function isRoomTemplateName(fn, args, screen) {
    return screen === "ChatAdmin" && fn === "DrawTextFit" &&
        args[2] === 734 && args[3] === 325 &&
        [294, 749, 1204, 1659].includes(args[1]);
}
export function roomAdminText(key, dictionaries, lang, screen) {
    if (screen !== "ChatAdmin" || typeof key !== "string") return undefined;
    const trimmed = key.trim();
    const value = dictionaries[lang]?.roomAdmin?.[trimmed];
    return value ? key.slice(0,key.indexOf(trimmed)) + value + key.slice(key.indexOf(trimmed)+trimmed.length) : undefined;
}
export function translateRoomTemplateName(fn, args, dictionaries, lang, screen) {
    if (!isRoomTemplateName(fn,args,screen)) return undefined;
    return placeholders.has(args[0]) ? roomAdminText(args[0],dictionaries,lang,screen) : undefined;
}
