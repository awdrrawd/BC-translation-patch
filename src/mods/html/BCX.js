const translation = {
    "BCX commands are organized into categories<br>To view help texts for all commands in a category, use '.help &lt;category&gt;' (e.g. '.help utility')<br><br>List of categories:<br>utility<br>cheats<br>modules<br>commands":
        "BCX命令分为多个类别<br>要查看类别中所有命令的帮助文本，请使用'.help &lt;category&gt;'（例如'.help utility'）<br><br>类别列表：<br>utility<br>cheats<br>modules<br>commands",
};

/** @type {TranslationFunction} */
export function BCXHelp(src) {
    if (translation[src]) return translation[src];
    return undefined;
}
