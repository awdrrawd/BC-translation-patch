import { translateNode } from "./utils";

class _ChatHistoryTranslator {
    /** @type {(TranslationFunction) [] } */
    translationFuncs = [];

    translate(text) {
        for (const func of this.translationFuncs) {
            const translated = func(text);
            if (translated) return translated;
        }
        return undefined;
    }

    constructor() {
        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => translateNode(node, (text) => this.translate(text))); // 翻译新添加的节点
                }
            }
        });

        let oldChatLog = null;

        setInterval(() => {
            const chatLog = document.getElementById("TextAreaChatLog");
            if (chatLog && chatLog !== oldChatLog) {
                if (oldChatLog) {
                    this.observer.disconnect(); // 断开旧的观察器
                }
                this.observer.observe(chatLog, { childList: true, subtree: true });
                oldChatLog = chatLog; // 更新旧的聊天记录元素
            }
        }, 500); // 每隔 500 毫秒检查一次
    }

    /** @param {TranslationFunction} func */
    registerTranslationFunc(func) {
        this.translationFuncs.push(func);
    }
}

export const ChatHistoryTranslator = new _ChatHistoryTranslator();
