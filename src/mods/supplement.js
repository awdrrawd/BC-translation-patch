// 補上 ECHO 沒翻的 BCX / LSCG 字串。直接在這裡加：英文原文 → 中文。
// 這裡的翻譯優先於 ECHO 的字典（可覆寫）。目前為简体（與 ECHO 一致）。
export const supplement = {
    // 畫布(canvas)上任何翻不到的英文（官方缺口 或 BCX/LSCG）。用 BCTP.missing() 匯出缺口清單來補。
    menu: {
        "Lick Forehead": "舔额头",
        "High Five!": "击掌！",
        "Farewell on leave": "离开时告别",
        // 代名詞（JS 動態繪製，不在 CSV）
        "None": "无",
        "They/Them": "他（非二元）",
        "It/It": "它",
    },
    // 動作訊息（模板，替換名字前；保留 SourceCharacter/PronounPossessive 等 token）
    activity: {
        "High Five!": "击掌！",
        "SourceCharacter holds PronounPossessive hand in the air, slapping it with the other.":
            "SourceCharacter 把手举在空中，用另一只手拍了上去。",
    },
    // 聊天記錄中的 HTML 說明
    html: {
        // "English html": "中文",
    },
};
