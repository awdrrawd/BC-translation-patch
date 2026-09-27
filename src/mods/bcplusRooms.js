// Only BC+'s prefixed, local room-travel notices. Never translate player chat.
const patterns = [
    [/^Joined "(.+)"\.$/, 'Joined "{name}".', ["name"]],
    [/^Recreated "(.+)"\.$/, 'Recreated "{name}".', ["name"]],
    [/^You are already in "(.+)"\.$/, 'You are already in "{name}".', ["name"]],
    [/^No server response while heading to "(.+)"\.$/, 'No server response while heading to "{name}".', ["name"]],
    [/^Could not (enter|create) "(.+)" \((\w+)\)\.$/, null, []],
    [/^Cannot go to "(.+)" - (a rule does not allow you to enter that room)\.$/, 'Cannot go to "{name}" - {reason}.', ["name", "reason"]],
    [/^"(.+)" does not exist and (a rule forbids you from creating chat rooms)\.$/, '"{name}" does not exist and {reason}.', ["name", "reason"]],
];
const fixed = new Set(["Already on the way to a room.", "You cannot leave this room right now."]);
export function translateBcplusRoomNotice(html, dictionaries, lang) {
    const map = dictionaries[lang]?.bcplus;
    if (!map || typeof html !== "string") return undefined;
    const wrapper = /^(<p style='background-color:(?:#3b2e52|#e9e2f6);color:(?:#f2eefa|#2c2140);border-left:3px solid #8469b6;padding:2px 6px;margin-bottom:0.25em;margin-top:0'>BC\+: )([^<>]*)(<\/p>)$/.exec(html);
    if (!wrapper) return undefined;
    const text = wrapper[2];
    let translated = fixed.has(text) ? map[text] : undefined;
    for (const [pattern, template, names] of patterns) {
        const match = pattern.exec(text);
        if (!match) continue;
        const key = template || `Could not ${match[1]} "{name}" ({reason}).`;
        const values = template ? Object.fromEntries(names.map((name, i) => [name, match[i + 1]])) : { name: match[2], reason: match[3] };
        translated = map[key]?.replace(/\{(name|reason)\}/g, (_, name) =>
            name === "reason" ? map[values[name]] || values[name] : values[name]);
        break;
    }
    return translated ? wrapper[1] + translated + wrapper[3] : undefined;
}
