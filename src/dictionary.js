// Keep these objects stable: translation hooks hold references to each table.
const dictionary = Object.fromEntries([
    "paths", "surfaces", "activity", "modRegex", "bcxHelp", "crafting", "base", "modMenu",
].map(key => [key, {}]));
export default dictionary;

let pending;
let loaded = false;

/** A separate download budget, including the response body, for the large dictionary. */
export function loadDictionary(url, { fetchImpl = globalThis.fetch, timeoutMs = 180000 } = {}) {
    if (loaded) return Promise.resolve(dictionary);
    if (pending) return pending;
    pending = (async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetchImpl(url, { signal: controller.signal });
            if (!response.ok) throw new Error(`Translation download HTTP ${response.status}`);
            const data = await response.json();
            // Validate before publishing any data, so failed downloads can safely retry.
            for (const key of Object.keys(dictionary)) {
                if (!data?.[key] || typeof data[key] !== "object" || Array.isArray(data[key])) {
                    throw new Error(`Invalid translation dictionary: ${key}`);
                }
            }
            if (!Object.keys(data.paths).length || Object.values(data.paths).some(values =>
                !Array.isArray(values) || values.length % 2 || values.some(value => typeof value !== "string"))) {
                throw new Error("Invalid translation dictionary: paths");
            }
            for (const key of Object.keys(dictionary)) Object.assign(dictionary[key], data[key]);
            loaded = true;
            return dictionary;
        } catch (error) {
            if (controller.signal.aborted) throw new Error(`Translation download timed out after ${timeoutMs}ms`);
            throw error;
        } finally {
            clearTimeout(timer);
        }
    })().finally(() => { pending = undefined; });
    return pending;
}
