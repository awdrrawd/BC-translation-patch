// 解析 Bondage Club 的 .txt 翻譯檔。
// 格式：連續兩行為一組（英文原文、譯文），以 ### 開頭的行為註解。
// 行為對齊遊戲的 TranslationParseTXT / TranslationString：
//   - 移除 ### 註解行
//   - 每行 trim
//   - 依序配對 (arr[0]=英文, arr[1]=譯文, arr[2]=英文, ...)

/**
 * @param {string} content
 * @returns {[string, string][]} 英文→譯文 的配對陣列
 */
export function parseTxtPairs(content) {
    const rows = content
        .replace(/\r\n/g, "\n")
        .split("\n")
        .filter((line) => line.indexOf("###") !== 0)
        .map((line) => line.trim());

    // 去除尾端可能因 split 產生的空行，避免打亂配對
    while (rows.length && rows[rows.length - 1] === "") rows.pop();

    /** @type {[string, string][]} */
    const pairs = [];
    for (let i = 0; i + 1 < rows.length; i += 2) {
        const en = rows[i];
        const zh = rows[i + 1];
        if (en) pairs.push([en, zh]);
    }
    return pairs;
}
