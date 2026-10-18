# R133 翻譯查表變更

核對來源：2026-10-18 抓取的鏡像 commit `0d4c1cf69ef8eed7acf301f51f831b3c34c1f6f4`，上游 commit `226381ce84c2`；`Scripts/Game.js` 宣告版本為 R133。

R133 `Scripts/Text.js` 的 `TextCache.buildTranslations()` 改為
`TranslationString(line[0], translations)`，用 CSV 第一欄識別鍵查表。
例如 InformationSheet 的 `MemberNumber,Member Number:` 現在查 `MemberNumber`。
原有字庫僅含英文 `Member Number:`，因此舊缺漏檢查可能顯示完整，實際卻無法翻譯。
`TranslationString` 本身仍使用扁平陣列；對話及資產描述仍有以英文查表的流程。

`translations/text-keys.json` 保存逐檔 CSV 識別鍵與英文的對照。
生成時先套用既有 cn-extra、OpenCC 與繁中覆寫，再加入識別鍵；識別鍵優先，未衝突的英文查表項保留。
別名僅加入各檔案的 `paths`，不混入 mod 通用字典。
InformationSheet 的稱號也會讀取 Title 作用域，已補入三個缺漏稱號。

更新上游時執行：

```sh
npm run upstream:fetch
npm run upstream:keys
npm run diff
npm run diff -- --tw
```

`upstream:keys` 更新需要提交的資料快照；一般建置不下載上游。
需要刷新官方 CN 時再執行 `npm run seed`；它將識別鍵格式正規化回英文維護格式。
`diff` 現在檢查實際產生的 CN/TW 字庫，未覆寫的檔案則讀上游官方翻譯，對有對照表的檔案檢查識別鍵。
此檢查以 R133 查表規則為基準。

首次檢查尚有 CN/TW 各 115 筆缺譯，補入三個稱號後各 112 筆。
主要在 ActivityDictionary、聊天對話、FriendList，以及部分 Interface、Preference、Crafting 等字串。
它們是另外的字庫缺口，未在此次相容性修正中全面翻譯。

驗證涵蓋 InformationSheet 的簡繁中識別鍵查表、英文項保留、跨檔作用域與缺漏檢查。
尚未在實際連線遊戲中驗證畫面。

## ChatRoom 選單與 Appearance

`chat-room-menu-*` 的提示由 `ChatRoomMenuButtonVisualState()` 從 ChatRoom 的 `Menu*` 鍵取得，並由遊戲同步到 DOM；不需要額外攔截 DOM。
ChatRoom CSV 的空白列及 Appearance 的尾端空欄曾讓整份對照表被跳過。
匯入器現在忽略空白列，Text CSV 取前兩欄，重複鍵採最後一列，與 TextCache 一致。
回歸測試檢查 22 個選單提示及 31 個 Appearance 識別鍵的 CN/TW 輸出。

R133 也將資產文字搬到 `Assets/`。建置保留舊路徑並新增 Female3DCG、AssetStrings、LayerNames、ColorGroups 的新路徑字庫；識別鍵依新檔案作用域產生。
資產名稱重建及晚載入偵測支援新舊 CSV 路徑，涵蓋 Appearance 的物品與部位名稱、簡繁中切換及英文還原。自訂資產名稱保持原樣。
