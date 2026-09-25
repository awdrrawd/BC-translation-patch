// Keep diagnostics bounded without changing BCTP.missing()'s array API.
export function createMissingCollector(limit = 500) {
    const entries = new Set();
    return {
        add(text) { if (entries.size < limit) entries.add(text); },
        list: () => [...entries].sort(),
        clear: () => entries.clear(),
    };
}
