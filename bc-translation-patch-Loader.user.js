// ==UserScript==
// @name         BC 補完翻譯 (CN/TW)
// @name:zh-TW   BC 補完翻譯 (CN/TW)
// @namespace    https://github.com/awdrrawd/BC-translation-patch
// @version      0.1.0
// @description  Bondage Club 補完翻譯（簡中/繁中），補上官方尚未翻譯的字串
// @author       awdrrawd
// @match        https://bondageprojects.elementfx.com/*
// @match        https://www.bondageprojects.elementfx.com/*
// @match        https://bondage-europe.com/*
// @match        https://www.bondage-europe.com/*
// @run-at       document-end
// @grant        none
// @downloadURL  https://awdrrawd.github.io/BC-translation-patch/bc-translation-patch-Loader.user.js
// @updateURL    https://awdrrawd.github.io/BC-translation-patch/bc-translation-patch-Loader.user.js
// ==/UserScript==

(function () {
    "use strict";
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "https://awdrrawd.github.io/BC-translation-patch/bc-translation-patch.js" + "?t=" + Date.now();
    s.onload = function () { s.remove(); };
    document.head.appendChild(s);
})();
