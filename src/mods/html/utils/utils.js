/**
 * @param {Node} node
 * @returns {node is HTMLElement}
 */
export function nodeIsHTML(node) {
    return node.nodeType === Node.ELEMENT_NODE;
}

/**
 * @param {Node} node
 * @returns {node is HTMLInputElement}
 */
export function nodeIsInput(node) {
    return node.nodeName === "INPUT";
}

/**
 * @param {Node} node
 * @returns {node is HTMLTextAreaElement}
 */
export function nodeIsTextArea(node) {
    return node.nodeName === "TEXTAREA";
}

/**
 * @param {Node} node
 * @returns {node is Text}
 */
export function nodeIsText(node) {
    return node.nodeType === Node.TEXT_NODE;
}

/**
 * 翻译节点内容
 * @param {Node} node
 * @param {TranslationFunction} func
 */
export function translateNode(node, func) {
    if (!["CN", "TW"].includes(TranslationLanguage)) return;

    if (nodeIsInput(node) || nodeIsTextArea(node)) {
        const originalText = node.placeholder;
        if (originalText) {
            const translated = func(originalText);
            if (translated) node.placeholder = translated;
        }
    } else if (nodeIsHTML(node)) {
        const originalText = node.innerHTML;
        if (originalText) {
            const translated = func(originalText);
            if (translated) node.innerHTML = translated;
        }
    } else if (nodeIsText(node)) {
        const originalText = node.textContent;
        if (originalText) {
            const translated = func(originalText);
            if (translated) node.textContent = translated;
        }
    }
}
