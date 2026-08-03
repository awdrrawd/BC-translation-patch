// 補上 ECHO 沒翻的 BCX / LSCG 字串。直接在這裡加：英文原文 → 中文。
// 這裡的翻譯優先於 ECHO 的字典（可覆寫）。目前為简体（與 ECHO 一致）。
export const supplement = {
    // 畫布(canvas)上任何翻不到的英文（官方缺口 或 BCX/LSCG）。用 BCTP.missing() 匯出缺口清單來補。
    menu: {
        "Lick Forehead": "舔额头",
        "High Five!": "击掌！",
        "Farewell on leave": "离开时告别",
    },
    // 動作訊息
    activity: {
        // "English activity text": "中文",
    },
    // 聊天記錄中的 HTML 說明
    html: {
        // "English html": "中文",
    },
};
