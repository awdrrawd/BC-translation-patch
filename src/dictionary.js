// Keep these objects stable: translation hooks hold references to each table.
import { DICTIONARY_KEYS } from "./schema.js";
const dictionary = Object.fromEntries(DICTIONARY_KEYS.map(key => [key, {}]));
export default dictionary;
export let dictionaryRevision = 0;

const pending = new Map();
const loaded = new Set();
export const hasDictionary = language => loaded.has(language);

/** A separate download budget, including the response body, for the large dictionary. */
export function loadDictionary(url, { language, fetchImpl = globalThis.fetch, timeoutMs = 180000 } = {}) {
    const id = language || url;
    if (loaded.has(id)) return Promise.resolve(dictionary);
    if (pending.has(id)) return pending.get(id);
    const request = (async () => {
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
            if (language && (Object.keys(data.paths).some(path => !path.endsWith(`_${language}.txt`)) ||
                DICTIONARY_KEYS.filter(key => key !== "paths").some(key =>
                    Object.keys(data[key]).length !== 1 || !data[key][language] || typeof data[key][language] !== "object"))) {
                throw new Error(`Invalid translation dictionary language: ${language}`);
            }
            for (const key of Object.keys(dictionary)) Object.assign(dictionary[key], data[key]);
            dictionaryRevision++;
            loaded.add(id);
            return dictionary;
        } catch (error) {
            if (controller.signal.aborted) throw new Error(`Translation download timed out after ${timeoutMs}ms`);
            throw error;
        } finally {
            clearTimeout(timer);
        }
    })().finally(() => { pending.delete(id); });
    pending.set(id, request);
    return request;
}
