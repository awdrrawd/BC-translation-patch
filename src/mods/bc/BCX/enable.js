/**
 * 判断是否启用BCX
 * @returns {boolean}
 */
export function BCXenabled() {
    return !!globalThis["BCX_Loaded"];
}
