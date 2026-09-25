// One source/last record per node AND property; external edits become the new source.
const originals = new WeakMap();
export function updateDisplay(node, property, read, write, translate) {
    let records = originals.get(node);
    if (!records) { records = new Map(); originals.set(node, records); }
    const current = read();
    let record = records.get(property);
    if (!record || current !== record.last) record = { source: current, last: current };
    const next = translate(record.source);
    if (next !== current) write(next);
    record.last = next;
    records.set(property, record);
}

export function translateValue(node, property, translate) {
    updateDisplay(node, property, () => node[property], value => { node[property] = value; }, source => {
        if (typeof source !== "string") return source;
        const key = source.trim();
        const translated = key && translate(key);
        return translated ? source.replace(key, () => translated) : source;
    });
}
