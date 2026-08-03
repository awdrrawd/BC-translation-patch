import GEN from "./generated/dict.json";

/**
 * 路徑 -> 攤平翻譯陣列 [en0, zh0, en1, zh1, ...]
 * 鍵為官方風格的完整路徑，例如 "Screens/Room/Cell/Text_Cell_TW.txt"
 * @type {Record<string, string[]>}
 */
export const PATHS = /** @type {any} */ (GEN).paths || {};
