# BC+ 翻譯維護

BC+ 原始碼取自鏡像的 `bcplus` 分支。這次核對的版本記錄在
`translations/mods/bcplus/source.json`；實際下載版本另外記錄在被 Git 忽略的
`.upstream/bcplus-source.json`。更新快取不會自動改寫已審核版本或翻譯。

```sh
npm run upstream:bcplus
npm run extract:bcplus
npm run check
```

抽取器只讀取 TypeScript／Vue 原始碼，不執行上游程式。缺漏報告位於
`reports/bcplus-coverage.json`，附帶鏡像 commit 及來源檔案。
可用 `BCPLUS_SRC` 指定另一份 Git checkout 的 `src` 目錄。
報告是靜態字串候選比對，**不是遊戲畫面的翻譯覆蓋率**：動態組字、執行時資料、
Vue 表達式與部分函式產生的文字可能不在其中，候選也可能不是實際完整顯示的字串。
`dynamicCandidates` 另外列出 Vue 表達式與模板字串，不能把它們當成已翻譯。
靜態抽取包含指令名稱、Vue 條件分支、串接文字與契約共用標籤；
截圖回歸測試另以完整顯示句子檢查實際命中，避免只查到其中一段。

簡中來源為 `translations/mods/bcplus/ui.json`。建置時放入獨立的
`surfaces.CN.bcplus`，並經既有 OpenCC／繁中詞彙流程生成 `surfaces.TW.bcplus`。
BC+ 專用繁中覆寫在 `translations/mods/bcplus/tw.json`。
用語採用「轉換者」（Switch）及「設置」（General）。
不加入全域 mod 字典，避免「角色」「規則」等常見文字影響遊戲或其他模組。
新增字串時須保持英文原文；跨行空白會正規化為一個空格，變數標記須原樣保留。

`src/mods/bcplus.js` 每 500ms 查找 `#BCPUIWindow` 的 open shadow root，
找到後用 MutationObserver 處理該視窗，支援先開視窗再載入翻譯、後載入 BC+、
Vue 更新與視窗重開。工作分批執行；語言變更後依保存的英文重新翻譯，
切回其他語言或清理翻譯層時還原文字。

翻譯文字節點及 title／placeholder／aria-label，選項只修改 `label`。
不改 input／textarea 的值、option 的值、表單狀態、指令、事件、程式碼與樣式。
已支援部分已核對的動態計數、版本提示、強制設定規則標題及說明。
Light 在配色選單譯為「淺色」，在強度選單譯為「輕度」。

也支援 `src/gui/Modal.ts` 建立的標準確認／輸入框：以 body 直屬 overlay 的
固定定位、z-index、可聚焦卡片、BC+ 標題與按鈕結構共同辨識，再監聽該卡片。
不掃描其他模組或聊天中的文字；只翻按鈕外觀，不更改 Yes／Cancel 回傳值。
契約 textarea 的 placeholder 可翻譯，但使用者的條款及標題輸入值保持原文，
包含預設的 `New contract`；不因翻譯而改寫將被儲存或送出的契約內容。
房間模板的 BC+ 前綴本地通知另由 `bcplusRooms.js` 處理，僅匹配上游的通知包裝與已核對句型。
其他聊天指令回覆、聊天事件與 canvas 寵物提示尚未由此 adapter 接管。
其餘尚未命中的動態文字保持原文，不將英文缺漏冒充已完成翻譯。
上游搜尋仍依英文資料搜尋；本層只翻譯顯示，不改寫搜尋演算法。

自動測試以 DOM fixture 驗證 CN→TW→英文、延遲載入、重開、Vue 更新、清理、
輸入值與選项值保留、事件保留、字庫作用域及變數一致性。
這不取代在實際遊戲中對版面、搜尋與遠端管理流程的人工驗證。

## 2026-09-27：BC+ 0.13.0 房間模板

核對鏡像 `ffac5d650e230a61e963b46b2d83e2a13aaf3140`（上游 `bf122d2ae7cd`）。
補譯 Rooms 模組說明與啟用開關、儲存／更新／覆蓋／填入表單／前往按鈕、
條件式 title、空列表及儲存錯誤；動態摘要支援位置數、隱藏／鎖定／地圖與本地日期。
BC 建房畫面的 `BC+ room templates` 提示使用 ChatAdmin 限定字庫。

房間名稱維持原文，包括名稱恰為 `Go` 或 `Rooms` 的情況。
`/bcp room <name>` 指令與表單值不翻譯；前往房間的本地通知只翻介面句型，
保留名稱、HTML entities 及伺服器錯誤代碼。此層不翻譯玩家聊天，不代替使用者建立或前往房間。

新增 DOM fixture 與本地通知測試，驗證簡繁／英文切換、狀態更新、日期、名稱、
指令及按鈕事件保留。抽取器新增 Vue 綁定提示候選，但其餘模組仍有未翻候選，
不能將房間功能補譯視為整個 BC+ 完全覆蓋。未進行真實遊戲 E2E。
