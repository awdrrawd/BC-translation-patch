import { translateNode } from "./utils.js";

class ChatTranslator {
    translationFuncs = new Set();
    observer = null;
    timer = null;

    translate(text) {
        for (const fn of this.translationFuncs) {
            const translated = fn(text);
            if (translated) return translated;
        }
    }

    start() {
        this.observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach(node => translateNode(node, text => this.translate(text)));
                }
            }
        });
        let previous = null;
        this.timer = setInterval(() => {
            if (document.hidden) return;
            const current = document.getElementById("TextAreaChatLog");
            if (current === previous) return;
            this.observer.disconnect();
            if (current) this.observer.observe(current, { childList: true, subtree: true });
            previous = current;
        }, 500);
    }

    registerTranslationFunc(fn) {
        this.translationFuncs.add(fn);
        try {
            if (!this.observer) this.start();
        } catch (error) {
            this.translationFuncs.delete(fn);
            this.stop();
            throw error;
        }
        return () => {
            this.translationFuncs.delete(fn);
            if (!this.translationFuncs.size) this.stop();
        };
    }

    stop() {
        this.observer?.disconnect();
        clearInterval(this.timer);
        this.observer = this.timer = null;
    }
}

// Importing this module must not start observers or timers before initialization.
export const ChatHistoryTranslator = new ChatTranslator();
