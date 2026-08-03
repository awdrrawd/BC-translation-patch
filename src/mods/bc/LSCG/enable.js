/**
 * 判断是否启用LSCG
 * @returns {boolean}
 */
export function LSCGenabled() {
    return !!(/** @type {any}*/ (Player).LSCG);
}
