import { loadDictionary, hasDictionary } from "./dictionary.js";

// Language changes reuse the existing readiness watcher; no additional polling.
export function createLanguageLoader(urls, getLanguage, state, apply,
    { load = loadDictionary, has = hasDictionary } = {}) {
    let disposed = false;
    const requests = new Map();
    function ensure() {
        const language = getLanguage();
        if (!language || !urls[language]) {
            state.loadingLanguage = null;
            state.languageError = null;
            return Promise.resolve();
        }
        if (has(language)) {
            state.loadingLanguage = null;
            state.languageError = null;
            return Promise.resolve();
        }
        state.loadingLanguage = language;
        state.languageError = null;
        if (requests.has(language)) return requests.get(language);
        const request = load(urls[language], { language }).then(() => {
            if (disposed || getLanguage() !== language) return;
            state.loadingLanguage = null;
            state.languageError = null;
            apply();
        }).catch(error => {
            if (!disposed && getLanguage() === language) {
                state.loadingLanguage = null;
                state.languageError = error;
            }
            throw error;
        }).finally(() => requests.delete(language));
        requests.set(language, request);
        return request;
    }
    return { ensure, dispose() { disposed = true; } };
}
