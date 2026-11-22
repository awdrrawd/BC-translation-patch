# CHANGELOG

本專案的更新紀錄。README 只描述目前的設計與維護方式，歷次修改內容記在這裡。

## 2026-11 GGC 補譯（二）：環形選單與手機日期

**問題**：角色身上的 GGC 環形選單（`GAMES`、`MISC`、`OTHERS`…）與手機鎖定畫面的日期仍是英文。環形選單會先把標籤轉成全大寫，再逐字畫在弧線上，畫布層只看得到單一字母；日期由 `Intl.DateTimeFormat("en-GB")` 產生（例如 `Sunday 22 November`），字庫沒有對應鍵。

**修正**：

- `src/mods/galia.js` 新增 `setupGaliaRadialMenu`：在 `window.ClubGamingInstance.radialDialogMenu` 的 `drawArcText` / `drawCenterText` 畫字前替換整個標籤（含中央 `CLOSE` / `BACK`）。查 `galia` 字庫時不分大小寫，不需另加大寫鍵；`1D6` / `2D6` / `GGC` 維持原樣。GGC 自我更新會換新的選單物件，每 0.5 秒重新接上，卸載時還原。
- `ui.json` 以 7 個星期 × 12 個月列舉鎖定畫面日期，顯示為「11月22日 星期日」。時鐘為數字，不需翻譯。
- 修正 `Others` 被銀行權限組合覆寫成「他人」，改回「其他」；銀行權限組合（`Info - Self - Others` 等）一併使用「其他」。
- `dialog.json` 先補入 `Stand` / `Kneel` / `On all fours` / `Steal` / `Look at phone`。

**測試**：`scripts/galia.test.js` 新增全年日期翻譯（CN/TW）、環形選單標籤替換、選單物件更換後重新接上與卸載還原。

**限制**：站位選單（`Choose a position or pose.` 與九個站位選項）與互動動作名稱（`Place yourself at...`、`Step away from the group` 等）是 GGC 改寫 BC 對話框按鈕的 label 與狀態列，接線需確認 BC 原始碼中的元素結構，尚未處理。

## 2026-11 Galia's Gambling Club（GGC）補譯

**範圍**：GGC v0.4.122（`club-gaming.js`，作者未公開原始碼）。從打包檔逐段抽出約 1,040 條玩家可見字串（排除 ModSDK、內建西洋棋函式庫、主控台日誌、CSS 與內部鍵值），整理成三份字庫，共約 1,170 筆（含為代名詞、所有格與組合句列舉的句型）。

**新增**：

- `src/mods/galia.js`：GGC 自有 canvas 文字層、聊天室 `MainCanvas` 文字（對決、物品文字、骰子）、聊天記錄通知 observer、偏好設定頁判斷。
- `translations/mods/galia/ui.json`、`room.json`、`dialog.json`，由 `scripts/gen-dict.js` 產生 `galia`、`galiaRoom`、`galiaDialog` 三個 surface。
- `modDom.js` 新增 GGC 手機通話／簡訊視窗、環形選單提示、群聊分頁、固定輸入框與聊天輸入框提示的 adapter，以及 GGC 動作按鈕的 `galiaDialog` adapter；adapter 改以 `enabled` 判斷所屬插件是否載入。
- `echsCanvas.js` 的文字層加上 `strokeText`（描邊標題）與 `skip`（房間角色名不翻）。
- `mods/index.js`：偏好設定頁接入 `DrawText` 系列 hook；`ChatRoomMessage` 的 `Beep` 與 `GGC_Action` 動作訊息、`ChatRoomSendLocal` 提示接入 GGC 字庫；道具對話框的站位／內衣選單併入既有 dialog-inventory 管線。
- 測試：`scripts/galia.test.js`。

**不翻譯**：GGC 套用的製作道具名稱與描述、奴隸契約道具內容、除錯預覽與指令、暫存 canvas 上的 `TIC TAC TOE` 標題字、玩家自訂的催眠面罩文字、玩家寫的簡訊與群聊名稱。

**限制**：未新增任何 BC 函式掛鉤；`MainCanvas` 文字只在聊天室畫面、GGC 已載入時查 `galiaRoom` 字庫。GGC 動作按鈕依元素 id 含 `GGCSkirmish` / `GGCSteal` / `GGCGivePhone` 判斷，尚未在實際遊戲內確認 BC 的按鈕 id 格式。尚未在實際連線遊戲內驗證畫面。

## 2026-09 字庫補齊

以本機 `../BCJS/Bondage-College-master/BondageClub` 的 **R131** 原始碼為基準，新增 **1,419 筆**補充字庫資料：

- 道具設定與動作訊息 668 筆、染色圖層 478 筆、染色群組 75 筆、道具名稱 41 筆。
- 背景 35 筆，其餘連線／共用介面 105 筆，包括衣櫃、外觀變換、重新著色、牽繩斷開原因及線上遊戲訊息。
- 另沿用官方 CN 補入 17 筆官方 TW 缺譯，涵蓋重新登入、房間管理及幸運輪盤。

其中 42 筆是保留原文的角色／品牌名稱或圖層代碼，不作音譯。簡中新增來源經 OpenCC 及既有覆寫規則輸出繁中。

驗證結果：43 個 CSV 的 CN 缺口為 0；TW 僅剩角色對話中 2 句 Kinky Dungeon 啟動提示，依本次範圍暫不翻譯。未新增單機劇情翻譯。這是上述本機版本的 CSV 覆蓋檢查，不代表未來版本或未經 CSV 的硬編碼字串也已全部翻譯。

`npm test` 檢查字庫與執行期行為：CSV 欄位解析、預設範圍、翻譯標記、簡繁中輸出、初始化失敗清理與重試、DOM 多批排程、資產晚到及語言切換；`npm run build` 重建發布 bundle。尚未進行實際連線遊戲的畫面驗證。

## 2026-11 ECHS 設定頁補譯

**問題**：ECHS 設定頁只有左側分頁標題有翻，右側的設定值（`Hypnosis Enabled`、`Movement Restriction`…）、分組標題與說明列都維持英文，雖然這些字串早已在 `translations/mods/echs/ui.json`。原因是 ECHS 的 `drawLeftTextFit` / `drawLeftTextWrap` / 提示框直接呼叫 `MainCanvas.fillText`，完全繞過 `DrawText` 系列 hook；分頁走 `DrawButton`→`DrawTextFit` 所以有翻。

**修正**（新增 [`src/mods/echsCanvas.js`](src/mods/echsCanvas.js)，由 `mods/index.js` 啟動）：

- 只在 `Preferences` 畫面且目前開啟的是 ECHS 自己的擴充設定（`PreferenceExtensionsCurrent` 等於 `PreferenceExtensionsSettings.HypnosisAddon`）、或 `InformationSheet`（ECHS 遙控面板）時，才包住 `MainCanvas.fillText` 與 `measureText`；其他畫面完全不碰。ECHS 未載入、語言非 CN/TW、離開畫面時都不翻譯，外掛卸載會還原。
- **整句文字**：`fillText` 與 `measureText` 一起查同一份 `echs` 字庫。連 `measureText` 都翻，ECHS 的「縮字到放得下」就會以中文寬度計算，不會再把英文截成 `…`。
- **自動換行的文字**（下拉設定的說明、提示框、設定精靈說明）：ECHS 是一行英文一行英文送來。第一行若剛好是「唯一一個字庫鍵」的開頭，就吞掉後續英文行，改以同一欄寬重新換行畫出譯文，並置中在原本那塊文字的垂直範圍。有歧義的開頭不猜；若後續行沒有接上，已有的譯文也會補畫出來，不會整段消失。
- 順手修正 `modSurfaces.js` 樣板平手時的選擇：固定文字總長較長者優先（`"Sink deeper" stops at: {tier}.` 現在贏過 `…: {value}`，精靈摘要的層級名稱因此會被翻到）。

**字庫補譯**（`translations/mods/echs/ui.json` 新增 43 筆，繁中由建置生成）：

| 類別 | 內容 |
|------|------|
| 設定頁按鈕與欄位 | `Setup`、`Exit`、`Holding`、`Prev`、`Next`、`Cancel`、`Apply`、`Find:`、`Experience`、`Trust`、`value`、`detail`、`Toy mode is for:` |
| 統計分頁每列 | `{#n} interactions · just now / never / {#b}m·h·d ago`、`never`、`just now` |
| 設定精靈摘要 | `When someone tries: …` 四種組合 |
| Extreme 極限鎖定 | 唯讀橫幅與拒絕訊息（含日期）、確認前四段警告、到期續約提示與兩顆按鈕、續約／解除／套用的回報句 |

這些字串由 ECHS 原始碼（`menu.ts`、`wizard.ts`、`panel.ts`、`extreme.ts`、`trust.ts`）逐一抽出，與字庫比對後補上缺值；聊天旁白與指令回覆本次不處理。

**測試**：新增 `scripts/echsCanvas.test.js`（11 項）——整句翻譯與 TW、以翻譯後寬度縮字、畫面限定與 CJK／未知文字不動、自動換行吞行與置中、換行中斷補畫、歧義不猜、卸載還原、畫面判斷、延後出現的 `MainCanvas` 與語言切換，以及新增字庫項。`npm run check` 全數通過（105 項測試）。

**限制**：尚未在實際連線遊戲內驗證畫面；多行說明是以英文欄寬估計中文換行寬度，版面可能與 ECHS 原生略有差異。

## 2026-11 ECHS 補譯（二）：Trance Defaults 子項目、私人旁白與說明頁

**問題**：恍惚默認分頁中縮排在「無法移動」底下的子項目 `...and no one else can move you either`（ECHS v1.12.0 新增，`tranceNoOneMoves`）仍顯示英文。原因單純：字庫 `translations/mods/echs/ui.json` 沒有這個鍵；繪製路徑（`fillText` / `measureText`）與其他列相同，不需要改程式。

**同批補上的遺漏**（由 ECHS 原始碼 `menu.ts`、`popup.ts`、`help.ts`、`follow.ts`、`keyholder.ts`、`recovery.ts`、`voice.ts` 逐一抽出並與字庫比對，新增 158 筆；繁中由建置生成）：

| 類別 | 內容 |
|------|------|
| 深度分頁 | 重設與「唤起可觸及」提示（含 `{name}` 樣板）、不彈窗回應的三種說明句 |
| ECHS 彈窗 | `Asked {who}'s ECHS …` 狀態列、觸發詞列表的 `word hidden` / `a compulsion`、`missed: …`、`Typed. Finish it (…)` |
| 私人旁白 | 只有自己看得到的 `[...]` 提示（`tellPlayer`，經 `ChatRoomSendLocal`）：恢復、追隨、持鑰人、被迫動作等 |
| 說明頁 | 分頁名與說明、各段標題、不含口說用語的純說明段落 |

**不翻譯（刻意保留英文）**：

- **觸發詞與口說用語**：ECHS 以聊天內容比對，包含彈窗「Say / Suggestions」所輸入的每句話（`sink deeper`、`wake up`、`kiss me`、`your trigger word is …`、`remember trigger`、`forget every trigger I gave you` 等）以及玩家自訂的觸發詞本身。
- **`/echs` 指令**與其參數。
- **含口說用語的說明段落**：說明頁中夾有引號範例的段落整段不收錄；標題或說明句裡帶有口說用語者，譯文內以原文逐字保留（例如 `“remove everything I planted”`）。
- 聊天室中送給別人的旁白（`tellRoom` 表情）與其他玩家的聊天訊息：本插件的 `ChatRoomMessage` 掛鉤只改 `Action` / `Activity` 動作模板，不碰一般聊天，這次也沒有放寬。

**測試**：`scripts/echsCanvas.test.js` 新增 6 項（共 120 項，`npm run check` 全數通過）——子項目翻譯（CN/TW、`fillText` + `measureText`）、**口說用語／指令／觸發詞一律不翻譯**（含 `Missy, ` 前綴，且字庫鍵不得等於口說用語）、樣板的名字與數字、私人旁白、說明頁整段吞行翻譯與引號範例原樣、TW 逐筆生成。

**限制**：說明頁為手動斷行，且部分段落夾有動態值（`getMaxAttempts()` 等）或口說範例，因此只翻能整段對應的純說明；其餘維持英文。`flavor.ts` 的氛圍句庫（隨機旁白）與 `session.ts` 的嘗試結果提示（開頭是動態英文氛圍句）本次未處理。尚未在實際連線遊戲內驗證畫面。
