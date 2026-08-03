/** 本外掛支援的語言（對齊遊戲的 TranslationLanguage） */
export const SUPPORTED = ["CN", "TW"];

/** 目前遊戲語言；非本外掛支援時回傳 null */
export function activeLang() {
    const l = /** @type {any} */ (globalThis).TranslationLanguage;
    return SUPPORTED.includes(l) ? l : null;
}
