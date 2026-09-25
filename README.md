# BC 補完翻譯 (CN / TW)

為 [Bondage Club](https://gitlab.com/BondageProjects/Bondage-College) 補上官方尚未翻譯的字串，支援**簡體中文 (CN)** 與**繁體中文 (TW)**。以外掛（userscript）方式疊在官方遊戲上，不需修改遊戲檔案。

- **CN 為單一維護來源**，**TW 由 [OpenCC](https://github.com/BYVoid/OpenCC)（`s2twp`）自動生成** + 詞彙/逐句覆寫。
- 翻譯**按原始檔路徑餵回遊戲自己的翻譯管線**（`TranslationCache` + `TranslationAvailable`），因此原生文字保留檔案作用域；補譯與指定資產資料會依生成規則覆寫。

---

## 設計原則

BC 的翻譯是**分檔、分作用域**的：每個畫面/資料檔各有自己的 `.txt`，同一個英文在不同檔可以翻成不同中文（例如 `Loose` 的譯法依製作屬性或其他畫面而異）。原生文字會把翻譯**依原始路徑塞回遊戲的 `TranslationCache`**，讓遊戲原生的 `TranslationString` 去分檔查用 —— 作用域天然正確。

只有**不走 CSV 管線的東西**（mod 自己畫的 canvas / DOM、動作字典、聊天訊息）才另外用 hook / observer 攔截翻譯。

---

## 架構總覽

詳細流程與限制見 [架構檢視](DOCS/architecture-review.md) 和 [互動架構導覽](DOCS/architecture.html)。

### 建置期：資料 → 獨立 JSON 字庫 + 輕量 bundle

`npm run build` 會跑 [`scripts/gen-dict.js`](scripts/gen-dict.js) 把翻譯來源合併成 [`src/generated/dict.json`](src/generated)，輸出 `dist/translations-<CN|TW>-<hash>.json`，再由 esbuild 打包不含字庫的 `dist/bc-translation-patch.js`。

翻譯來源（依優先序，後者覆寫前者）：

| 來源 | 內容 | 誰維護 |
|------|------|--------|
| `translations/cn/**` | 官方 CN 鏡像，`npm run seed` 從官方原始碼生成 | **勿手改**（會被 seed 沖掉） |
| `translations/cn-extra/**` | 你的補充/覆寫，路徑鏡像官方 | ✍️ 手改這裡 |
| `translations/mods/**` | BCX / LSCG 等 mod 的字典（不在官方 CSV 內） | ✍️ 手改這裡 |

合併規則（每個路徑）：`merged = 官方 cn 基底 + cn-extra 疊加`（同英文覆寫、新英文追加）。之後：

- **CN**：只在「有 cn-extra 補充」或「官方根本沒有此檔」時輸出覆寫；否則交給官方（永不過期）。
- **TW**：官方沒有 `_TW.txt`、或你有補充、或屬於強制完整覆蓋的資料檔時輸出，值由 merged 逐行 `OpenCC(s2twp)` 轉換，再套 `tw-terms.json` / `tw-overrides.txt`。

`dict.json` 的欄位與用途：

| 欄位 | 用途 | 執行期消費者 |
|------|------|--------------|
| `paths` | 路徑 → 攤平陣列 `[en,zh,...]`，塞進 `TranslationCache` | `inject.js` |
| `base` | 全部 CSV 字典攤平（≤50 字），DOM 選單通用翻譯 | `mods/index.js` |
| `activity` | 動作字典 英文→中文 | `ActivityDictionaryText` hook |
| `surfaces` | 限定畫面／BC+ 字庫 | surface 和 BC+ adapter |
| `compat` | 資料化的相容字典與補充項，CN/TW 共用生成流程 | `mods/lookup.js` |
| `crafting` | 製作屬性名（Text_Crafting 作用域） | dfn observer |
| `modMenu` | BCX/LSCG 選單字典 | DrawText hooks |
| `modRegex` | BCX 帶 `PLAYER_NAME` 的動態字串 regex | `mods/lookup.js`（限 InformationSheet） |
| `bcxHelp` | BCX 塞進 `textarea.value` 的長說明 | `bcxHelp.js` 輪詢 |

### 執行期：翻譯分層

[`src/index.js`](src/index.js) 載入後依序啟動下列各層（各層只翻自己負責的表面）：

1. **`TranslationCache` 注入** — [`inject.js`](src/inject.js)：把 `paths` 塞進 `TranslationCache`，並 hook `TranslationAvailable` 讓遊戲對我方路徑回報「可翻」。**這一層涵蓋所有走 CSV/txt 的字串**（畫面文字、道具描述、InformationSheet、Interface 等），是覆蓋面最大的一層。
2. **資產與快取重建** — [`reapply.js`](src/reapply.js)：依遊戲保留的英文 CSV，以資產 ID 重建名稱，避免對已翻譯文字反查。監聽官方資產翻譯完成，並每 250 ms 檢查語言、資產與文字快取是否改變；只有變動時才重建，涵蓋 Electron 晚載入、資產晚到與簡繁中切換。
3. **canvas 選單文字** — `DrawText` / `DrawTextFit` / `DrawTextWrap` / `DynamicDrawText` hooks（[`mods/index.js`](src/mods/index.js)）：翻 mod 自己畫在畫布上的 BCX/LSCG 選單文字。
4. **動作字典與聊天動作** — `ActivityDictionaryText` hook 翻動作名；`ChatRoomMessage` hook 翻聊天室裡的動作/活動訊息模板（替換名字前），再交給遊戲 `CommonStringSubstitute` 填名字。
5. **DOM 選單** — [`domObserver.js`](src/mods/domObserver.js)：`MutationObserver` 翻 `dialog-inventory` 道具名、快捷鍵、製作屬性 `<dfn>`。**啟動時會補掃既有節點**（同樣為了 Electron 晚載入的情境）。
6. **BCX 特殊表面** — [`bcxHelp.js`](src/mods/bcxHelp.js) 輪詢替換 `textarea.value` 的說明；`chatObserver` 翻聊天記錄輸出的 HTML 說明。

載入分為兩階段：原本網址的 `bc-translation-patch.js` 先建立 `BCTP` 狀態，再依遊戲目前語言，於背景下載 `translations-CN-<內容雜湊>.json` 或 `translations-TW-<內容雜湊>.json`。非 CN/TW 不下載字庫；首次切換至另一語言才下載另一份，同一頁面切回時重用記憶體快取。大型字庫不再包含於入口 JS，因此下載不受 PCM 主程式載入的 30 秒限制；不需修改 PCM 或插件網址。JSON 使用建置時的絕對 Pages 網址，支援 PCM 的內嵌執行與快取重放。

載入狀態由 `src/lifecycle.js` 管理：`BCTP.status` 為 `loading → ready / failed`，`BCTP.phase` 為 `starting → downloading → initializing → ready`，失敗時保留出錯階段與 `BCTP.error`。PCM 顯示已載入表示入口已執行；`BCTP.status === "ready"` 才代表翻譯已就緒。字庫下載（含回應本文）有獨立的 180 秒逾時。下載失敗時遊戲繼續使用原翻譯，可執行 `BCTP.retry().catch(console.error)` 或重新執行載入器重試。同時重複載入共用初始化 Promise，成功下載的字庫在本次頁面中沿用。

初始所選語言的字庫完成後才注入快取、初始化翻譯 hooks，並重建既有畫面及資產名稱。非中文也會初始化接口，以便日後切換語言。執行期間切換語言時，`BCTP.loadingLanguage` 表示正在下載的語言；失敗保存在 `BCTP.languageError`，可呼叫 `BCTP.retryLanguage().catch(console.error)` 重試。較晚完成的旧語言請求只保留資料快取，不重畫目前語言。`app.init()` 會等待遊戲函式就緒（最多 30 秒），並沿用已存在的 SDK。若中途失敗，已建立的 hook、observer、計時器與待處理 DOM 工作會清除；已注入的字庫仍保留。

發布時必須一併提供入口 JS 與 `dist/translations-*.json`；現有 Pages 工作流程會發布整個 `dist`。字庫檔名含內容雜湊以避免新舊資料混用，舊字庫也需保留，讓 PCM 快取的舊入口仍可下載相應資料。

查表結果與未命中結果各使用有界快取（menu/activity 各最多 512 筆），在語言、畫面、模組啟用狀態或字庫改變時失效。BCX 指令詳情快取上一幀的翻譯排版；內容、樣式、語言或 context 改變才重新計算。背景頁面跳過 readiness、BC+ 視窗偵測、聊天容器偵測與 BCX 說明輪詢中的工作，並未宣稱遊戲本身停止繪圖。

DOM 分批翻譯會持續排程到佇列清空，去除同一批重複節點，每批最多 24 個；閒置回呼逾時也會處理有限數量，避免忙碌時永遠不翻譯。已處理節點保留修改前文字，切換語言時可從來源重譯或還原。

> **語系開關**：`activeLang()`（[`lang.js`](src/lang.js)）非 `CN`/`TW` 時所有 hook 皆為 no-op，遊戲內切語言即時生效。

---

## 目錄結構

```
translations/
  cn/                官方 CN 鏡像（seed 生成，勿手改）
  cn-extra/          ★ 補官方缺口/覆寫（鏡像官方路徑）
  mods/              ★ BCX / LSCG 等 mod 字典 + bcx-help.json
  compat.json       舊 ECHO 相容資料與 supplement（建置時產生 CN/TW）
  official-tw.json   官方已有 _TW.txt 的路徑清單（seed 生成，避免機翻蓋官方繁中）
  tw-terms.json      ★ TW 全域詞彙替換（"信息":"訊息"）
  tw-overrides.txt   ★ TW 個別字串覆寫（英文一行、繁中一行）
src/
  index.js           輕量進入點：建立狀態並背景啟動
  dictionary.js      各語言字庫下載、驗證、逾時與快取
  languageLoader.js  語言切換、延遲載入與過時回應防護
  inject.js          TranslationCache 注入 + TranslationAvailable hook
  reapply.js         注入後重建動作字典 / 螢幕文字快取（解時序）
  lang.js            語系判斷
  mods/
    index.js         DrawText/動作/聊天 hooks 註冊
    lookup.js        統一查表優先序與相容規則
    displayText.js   共用原文保存與語言還原
    bcxCanvas.js     BCX 指令詳情與日誌
    bcplus.js        BC+ 視窗／確認框 adapter
    domObserver.js   dialog-inventory / 快捷鍵 / dfn 的 DOM 翻譯
    bcxHelp.js       BCX textarea 說明輪詢替換
    html/            聊天記錄 HTML 翻譯
scripts/
  seed-from-upstream.js  從官方原始碼種入 cn/ 與 official-tw.json
  gen-dict.js            合併翻譯來源 → dict.json
  build.js               gen-dict + esbuild 打包 + 產生載入器
  diff-upstream.js       列出官方有英文、我方還沒翻的字串
```

★ = 平常維護會動到的檔。

---

## 安裝（給玩家）

> 部署後，檔案會在 `https://awdrrawd.github.io/BC-translation-patch/` 下。

**方式 A：Tampermonkey 載入器**
安裝 [Tampermonkey](https://www.tampermonkey.net/) 後，開啟 [`bc-translation-patch-Loader.user.js`](https://awdrrawd.github.io/BC-translation-patch/bc-translation-patch-Loader.user.js) 安裝即可（會自動更新）。

**方式 B：主控台 / FUSAM 貼上**
```javascript
(function () {
  const n = document.createElement('script');
  n.src = 'https://awdrrawd.github.io/BC-translation-patch/bc-translation-patch.js?t=' + Date.now();
  n.onload = function () { n.remove(); };
  document.head.appendChild(n);
})();
```

安裝後把遊戲語言切到**中文**或**繁體中文**即生效。載入成功時 console 會顯示 `[BCTP] ... 已載入`。

> **Electron-BC 玩家**：本外掛在 Electron 載入時機較晚，靠上面第 2 層「快取重建」補正；若仍見到零星英文，切一次語言再切回來即可強制遊戲重建快取。

---

## 維護指南

日常維護只會動到上面標 ★ 的檔，改完執行 `npm run check` 驗證、push 後由 GitHub Actions 自動部署。

### A. 補官方缺口翻譯（最常見）

> **重要**：`translations/cn/` 是官方鏡像，由 `npm run seed` 覆蓋生成，**不要手改**。你的補充/覆寫一律放 `translations/cn-extra/`。

1. 在 `translations/cn-extra/` 下**用相同的官方路徑**建立 `.txt`（例：`Screens/Character/Creation/Text_Creation.txt`），格式為**英文一行、中文一行**，`###` 開頭為註解。
2. 只需寫「要補或要蓋」的行；建置時會疊到官方 `cn/` 之上（同英文覆寫、新英文追加）。
3. 含變數的字串（`$value$`、`{Expression}`、`\n` 等）**請原樣保留變數**。

例（`translations/cn-extra/Screens/Interface.txt`）：
```
$value$ year(s)
$value$ 年
$value$ month(s)
$value$ 个月
```

### B. 補 BCX / LSCG 等 mod 翻譯

**BC+ 主視窗翻譯**已接入獨立 Shadow DOM 翻譯層，簡中來源為
`translations/mods/bcplus/ui.json`，繁中由建置流程生成。
執行 `npm run upstream:bcplus` 從鏡像取得原始碼，再用 `npm run extract:bcplus`
產生候選缺漏報告。此字庫不混入 BCX／LSCG 的全域字典。
支援範圍、版本與測試限制見 [BC+ 翻譯維護](docs/bcplus-translation.md)。

mod 自己畫 canvas/DOM，不走官方 CSV，字典放 `translations/mods/`：

- **有明確英文原文的**：加到對應的 `translations/mods/bcx/*.txt` 或 `lscg/*.txt`（英文一行、中文一行）。
- **零星補譯**：優先放對應 `translations/mods` 字典；既有 ECHO 相容資料與優先覆寫位於 [`translations/compat.json`](translations/compat.json)，由同一建置流程產生 CN/TW。
- **BCX 匯出/匯入等長說明**（塞進 `textarea`）：加到 `translations/mods/bcx-help.json`（`"英文": "中文"`）。

### C. 繁中用語修正

TW 由 CN 機轉，出現不順的詞時：

- **全域詞彙**：改 [`translations/tw-terms.json`](translations/tw-terms.json)（例：`"信息":"訊息"`）— 對所有字串生效。
- **個別字串**：加到 [`translations/tw-overrides.txt`](translations/tw-overrides.txt)（英文一行、繁中一行）— 只覆寫該句，優先於機轉。

### D. 找出還沒翻的字串

- **官方缺口**：`npm run diff`（需官方原始碼）→ 產生 `reports/missing-cn.md` 與 JSON。預設檢查連線、角色、道具、背景、製作及共用介面；依檔案作用域比對，不再跨檔去重。道具名稱讀取 CSV 第三欄，對話讀取選項及回應兩欄。
- **繁中缺口**：`npm run diff -- --tw` → 產生 `reports/missing-tw.md` 與 JSON，檢查實際產出的 TW 字典；未覆寫的檔案則檢查上游官方 TW。
- **包含單機範圍**：`npm run diff -- --all`（仍排除 KinkyDungeon 目錄）。只產生報告，不會自動翻譯。
- **執行期缺口**：遊戲內 console 執行 `BCTP.missing()` 匯出「畫面上出現、但翻不到的英文」清單，逐條補進 A/B。最多保留 500 筆，`BCTP.clearMissing()` 清除後可重新收集。

### 2026-09 字庫補齊

以本機 `../BCJS/Bondage-College-master/BondageClub` 的 **R131** 原始碼為基準，新增 **1,419 筆**補充字庫資料：

- 道具設定與動作訊息 668 筆、染色圖層 478 筆、染色群組 75 筆、道具名稱 41 筆。
- 背景 35 筆，其餘連線／共用介面 105 筆，包括衣櫃、外觀變換、重新著色、牽繩斷開原因及線上遊戲訊息。
- 另沿用官方 CN 補入 17 筆官方 TW 缺譯，涵蓋重新登入、房間管理及幸運輪盤。

其中 42 筆是保留原文的角色／品牌名稱或圖層代碼，不作音譯。簡中新增來源經 OpenCC 及既有覆寫規則輸出繁中。

驗證結果：43 個 CSV 的 CN 缺口為 0；TW 僅剩角色對話中 2 句 Kinky Dungeon 啟動提示，依本次範圍暫不翻譯。未新增單機劇情翻譯。這是上述本機版本的 CSV 覆蓋檢查，不代表未來版本或未經 CSV 的硬編碼字串也已全部翻譯。

`npm test` 檢查字庫與執行期行為：CSV 欄位解析、預設範圍、翻譯標記、簡繁中輸出、初始化失敗清理與重試、DOM 多批排程、資產晚到及語言切換；`npm run build` 重建發布 bundle。尚未進行實際連線遊戲的畫面驗證。

### E. 官方更新後刷新

在 GitHub 倉庫開啟 **Actions → Fetch upstream texts → Run workflow** 即可抓取，不必在本機執行。預設會抓取 GitHub 鏡像 `bondageclub` 分支的文本，比對目前簡中／繁中缺漏，並在執行摘要顯示來源 commit 與缺漏數量。

- 下載執行結果的 **upstream-texts-and-reports** artifact，取得原始 CSV／TXT、來源記錄及簡繁中缺漏報告。
- 勾選 **refresh_cn**，會另外產生 **refreshed-official-translations** artifact，包含更新後的 `translations/cn/` 及 `official-tw.json`。
- 勾選 **all_texts** 可比對全部文本；預設只比對連線及共用介面。

此 Action 僅抓取與產生下載檔，不直接提交翻譯或部署網站。工作流程檔需先推送到預設分支，才會顯示 **Run workflow** 按鈕。

以下指令是本機維護的替代方式，也是 Action 使用的相同步驟：

官方改版後先執行 `npm run upstream:fetch`，從 [GitHub 鏡像的 bondageclub 分支](https://github.com/awdrrawd/Bondage-College-Mirror/tree/bondageclub) 更新文本。需要 Git 與網路連線；採用淺層、稀疏抓取，只取 CSV、TXT 和翻譯辨識用的 `Translation.js`，不下載圖片與音訊。來源與 commit 記錄在 `.upstream/source.json`，不會隨插件發布，也不會執行抓回的程式碼。

抓取不會修改現有翻譯。先用 `npm run diff` 檢查缺漏，再視需要執行 `npm run seed`，刷新 `translations/cn/` 與 `official-tw.json`。**未被 cn-extra 覆寫的檔會自動跟上官方**，你的 cn-extra 補充不受影響。這是手動維護指令，遊戲載入與一般建置不會連線抓取上游。

### F. 建置與部署

```bash
npm install
npm run upstream:fetch # 從 GitHub 鏡像抓取／更新文本
npm run seed     # 從官方原始碼種入 CN 翻譯（首次 / 官方改版後）
npm run build    # gen-dict + esbuild 打包 → dist/
npm run diff     # 列出官方尚未翻譯的字串 → reports/missing-cn.md
```

`seed` / `diff` 優先使用環境變數 `BC_UPSTREAM_DIR`，其次使用 `upstream:fetch` 的 checkout。也可自行從 [GitGud 官方倉庫](https://gitgud.io/BondageProjects/Bondage-College) 取得原始碼，再將 `BC_UPSTREAM_DIR` 指向其中含 `Scripts/Translation.js` 的 `BondageClub` 目錄。既有 `.upstream/BondageClub` 與本機舊目錄仍可使用。`build` / `gen` 只讀 `translations/`，不需要上游原始碼。

push 到 `main` 後，GitHub Actions 會自動 `build` 並部署 `dist/` 到 Pages。首次啟用：repo **Settings → Pages → Source** 選 **GitHub Actions**，再手動跑一次 **Build & Deploy** workflow。

---

## 注意事項 / 疑難排解

- **載入時序**：字庫在背景下載，瀏覽器與 Electron 都可能晚於遊戲完成翻譯，靠 `reapply.js` 的快取重建補正。若新增了會在啟動前就被烤進快取的畫面，記得該畫面的翻譯也依賴這步。
- **別手改 `translations/cn/`**：那是 seed 的產物，會被沖掉。所有手改放 `cn-extra/` 或 `mods/`。
- **`<dfn>` 陷阱**：BC 會讀製作屬性 `<dfn>` 的 `textContent` 去組查表 key，所以 dfn 是**延遲翻譯**（等 BC 讀完英文名再翻顯示），且用 `Text_Crafting` 作用域字典避免撞名。動 domObserver 時勿破壞這點。
- **保留變數**：翻譯含 `$value$`、`SourceCharacter`、`{Expression}`、`\n` 等一律原樣保留，否則遊戲填值會壞。
- **KinkyDungeon** 有自己的 i18n，`gen-dict.js` 整個排除，不要往裡補。

---

## 授權與致謝

翻譯內容衍生自 Bondage Club 官方原始碼（含其社群中文翻譯）；BCX / LSCG 動作字典移植自 [Echo 的动作拓展](https://github.com/SugarChain-Studio/echo-activity-ext)。本專案程式碼採 MIT。

### DOM 補譯：分層、搜尋、製作分享與 LSCG

`translations/ui/surfaces.json` 存放不經 CSV 的介面文字，依用途分為 layering、search、craft、lscg，繁中於建置時產生。`src/mods/surfaces.js` 僅處理指定節點的顯示文字、搜尋提示及分享選項的 label；不修改分層 ID／data 屬性、數值、搜尋輸入或製作描述。

LSCG 保留 Chaotic、Evolving、Magic 等效果名稱、詛咒選项與所有功能關鍵字，只翻標題及 17 條說明。Quick 的英文說明誤寫「與 Quick 不相容」，譯文依上游 condition 判斷修正為「與 Slow 不相容」。

製作分享只在收到 Action/Beep 的 msg 時翻譯固定句型。人物名、道具名、使用者描述保持原樣，並複製訊息物件後交給本機顯示，不改動傳送或分享資料。一般 Chat 訊息不受此規則影響。

測試涵蓋分層識別值、搜尋輸入、LSCGShare 選項值、英文效果名稱保留，以及分享文字與原始訊息不被改寫。尚未在實際連線遊戲中驗證。

BCX 房间設定的「更多」與主題房間頁面使用獨立的 roomAdmin 字典，只在 ChatAdmin 畫面翻譯繪製文字（含按鈕與提示）。目前四個範本名稱的繪製位置會略過通用查表，只翻譯 BCX 固定的空白／未命名／自動套用提示，保留自訂名稱。房間分類、限制標籤的儲存值、介紹、歡迎詞與範本資料不變。

### BCX 指令字典檢查

執行 `node scripts/audit-bcx-commands.js`，以 `BCX_SRC` 或本機 BCX 原始碼比對指令名稱、簡述與長說明各行，輸出 `reports/bcx-command-audit.json`。目前本機 17 個指令的這些字典項目無缺漏；指令語法與動態執行回覆不在此統計內。BCX 詳細說明使用內部 `BCXDrawTextWrap` 直接呼叫 canvas，仍未接入現有文字 hook，因此字典完整不代表詳細頁已顯示中文。
# 自動化設定

PR 會執行字庫品質檢查、測試與建置；main 驗證成功後才部署 Pages。每週由 Dependabot 提出依賴更新 PR。本機可執行 `npm run check`。

GitHub 必要設定、既有問題基準與檢查範圍見 [DOCS/automation.md](DOCS/automation.md)。
