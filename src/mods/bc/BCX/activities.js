import { BCXenabled } from "./enable";

const regexTranslations = [
    { regex: /(.+) spoke openly in a room\./, replacement: "$1尝试在房间说话." },
    {
        regex: /The curse on (.+)\'s (.+) wakes up and the item reappears\./,
        replacement: "在$1的$2上的诅咒苏醒,该物品再次出现.",
    },
    {
        regex: /tried to use a remote control on (.+) own body\, which was forbidden\./,
        replacement: "$1试图对自己的身体使用遥控器,而这是被禁止的.",
    },
    {
        regex: /(.+) almost forgot to use a mandatory word while talking\./,
        replacement: "$1在交谈时忘了使用一个必说词汇.",
    },
    {
        regex: /(.+) tried to use the antiblind command\./,
        replacement: "$1尝试使用反盲指令.",
    },
    {
        regex: /(.+) 牵着她的手走出房间\./,
        replacement: "$1尝试使用反盲指令.",
    },
    {
        regex: /A magical shield on (.+) repelled the suspiciously magical changes attempted by (.+)! \[WCE Anti\-Cheat\]/,
        replacement: "$1 身上出现了一道神奇的护盾, 挡下了 $2 试图施展的可疑魔法! [WCE 反作弊系统]",
    },
    {
        regex: /(.+) received a summon: \"(.+)\"\./,
        replacement: '$1接到了一个招唤: "$2".',
    },
    {
        regex: /The demand for (.+) 's presence is now enforced\./,
        replacement: "$1 现在必须要过去了.",
    },
    {
        regex: /The curse on (.+)'s (.+) wakes up, not allowing the item to be replaced by another item\./,
        replacement: "$1 身上 $2 的诅咒苏醒了, 禁止该物品被其他物品替换.",
    },
    {
        regex: /(.+) did not use a mandatory word while talking\./,
        replacement: "$1 在说话时未使用规定的词汇.",
    },
    {
        regex: /(.+) tried to use OOC in a message while gagged\./,
        replacement: "$1 被封口时还试图使用 OOC 消息.",
    },
    {
        regex: /The curses on (.+)'s body become dormant and several items fall off (.+) body\./,
        replacement: "$1 身上的诅咒陷入休眠状态, 几件物品从她身上脱落.",
    },
    {
        regex: /The curse on (.+)'s becomes dormant and the (.+) falls off her body\./,
        replacement: "$1 身上的诅咒陷入休眠状态, $2 物品从她身上脱落.",
    },
    {
        regex: /The curse on (.+)'s (.+) wakes up and the item reappears\./,
        replacement: "$1身上的诅咒被唤醒, $2 重新出现.",
    },
    {
        regex: /(.+) broke a rule to only speak using specific sound patterns\./,
        replacement: "$1违反了只使用特定句子说话的规定.",
    },
];

/**
 * 翻译动作文本
 * @param {string} key
 * @returns {string | undefined} 如果翻译成功则返回翻译后的文本，否则返回undefined
 */
export function translateActivityText(key) {
    if (!BCXenabled()) return undefined;
    for (const { regex, replacement } of regexTranslations) {
        if (regex.test(key)) {
            return key.replace(regex, replacement);
        }
    }
    return undefined;
}
