# BC 補完翻譯 (CN / TW)

為 [Bondage Club](https://gitlab.com/BondageProjects/Bondage-College) 補上官方尚未翻譯的字串，支援**簡體中文 (CN)** 與**繁體中文 (TW)**。以外掛（userscript）方式疊在官方遊戲上，不需修改遊戲檔案。

- **CN 為單一維護來源**，**TW 由 [OpenCC](https://github.com/BYVoid/OpenCC)（`s2twp`）自動生成** + 詞彙/逐句覆寫。
- 翻譯**按原始檔路徑餵回遊戲自己的翻譯管線**（`TranslationCache` + `TranslationAvailable`），因此**作用域正確、不會有全域字典的英文撞名污染**，也不會覆蓋官方既有的手工翻譯。

---

## 設計原則

BC 的翻譯是**分檔、分作用域**的：每個畫面/資料檔各有自己的 `.txt`，同一個英文在不同檔可以翻成不同中文（例如 `Loose` 在製作屬性是「鬆」、在別處是「鬆弛」）。所以本外掛**不做全域字典**，而是把翻譯**依原始路徑塞回遊戲的 `TranslationCache`**，讓遊戲原生的 `TranslationString` 去分檔查用 —— 作用域天然正確。

只有**不走 CSV 管線的東西**（mod 自己畫的 canvas / DOM、動作字典、聊天訊息）才另外用 hook / observer 攔截翻譯。

---

## 架構總覽

### 建置期：資料 → `dict.json` → bundle

`npm run build` 會跑 [`scripts/gen-dict.js`](scripts/gen-dict.js) 把三個來源合併成 [`src/generated/dict.json`](src/generated)，再由 esbuild 打包成 `dist/bc-translation-patch.js`。

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
| `assetName` | 道具/部位名（Female3DCG 描述） | DOM observer |
| `crafting` | 製作屬性名（Text_Crafting 作用域） | dfn observer |
| `modMenu` | BCX/LSCG 選單字典 | DrawText hooks |
| `modRegex` | BCX 帶 `PLAYER_NAME` 的動態字串 regex | `mods/index.js`（限 InformationSheet） |
| `bcxHelp` | BCX 塞進 `textarea.value` 的長說明 | `bcxHelp.js` 輪詢 |

### 執行期：翻譯分層

[`src/index.js`](src/index.js) 載入後依序啟動下列各層（各層只翻自己負責的表面）：

1. **`TranslationCache` 注入** — [`inject.js`](src/inject.js)：把 `paths` 塞進 `TranslationCache`，並 hook `TranslationAvailable` 讓遊戲對我方路徑回報「可翻」。**這一層涵蓋所有走 CSV/txt 的字串**（畫面文字、道具描述、InformationSheet、Interface 等），是覆蓋面最大的一層。
2. **快取重建** — [`reapply.js`](src/reapply.js)：注入後**強制重建已建好的動作字典與螢幕文字快取**。BC 的 `TextCache` 第一次建置就記憶化、之後不自更新，若我們晚於遊戲注入（**Electron 尤其如此**），這步讓已烤成英文的快取重新吃到我們的翻譯，使結果與載入時序無關。
3. **canvas 選單文字** — `DrawText` / `DrawTextFit` / `DrawTextWrap` / `DynamicDrawText` hooks（[`mods/index.js`](src/mods/index.js)）：翻 mod 自己畫在畫布上的 BCX/LSCG 選單文字。
4. **動作字典與聊天動作** — `ActivityDictionaryText` hook 翻動作名；`ChatRoomMessage` hook 翻聊天室裡的動作/活動訊息模板（替換名字前），再交給遊戲 `CommonStringSubstitute` 填名字。
5. **DOM 選單** — [`domObserver.js`](src/mods/domObserver.js)：`MutationObserver` 翻 `dialog-inventory` 道具名、快捷鍵、製作屬性 `<dfn>`。**啟動時會補掃既有節點**（同樣為了 Electron 晚載入的情境）。
6. **BCX 特殊表面** — [`bcxHelp.js`](src/mods/bcxHelp.js) 輪詢替換 `textarea.value` 的說明；`chatObserver` 翻聊天記錄輸出的 HTML 說明。

> **語系開關**：`activeLang()`（[`lang.js`](src/lang.js)）非 `CN`/`TW` 時所有 hook 皆為 no-op，遊戲內切語言即時生效。

---

## 目錄結構

```
translations/
  cn/                官方 CN 鏡像（seed 生成，勿手改）
  cn-extra/          ★ 補官方缺口/覆寫（鏡像官方路徑）
  mods/              ★ BCX / LSCG 等 mod 字典 + bcx-help.json
  official-tw.json   官方已有 _TW.txt 的路徑清單（seed 生成，避免機翻蓋官方繁中）
  tw-terms.json      ★ TW 全域詞彙替換（"信息":"訊息"）
  tw-overrides.txt   ★ TW 個別字串覆寫（英文一行、繁中一行）
src/
  index.js           進入點：載入 bcModSdk、啟動各層
  inject.js          TranslationCache 注入 + TranslationAvailable hook
  reapply.js         注入後重建動作字典 / 螢幕文字快取（解時序）
  lang.js            語系判斷
  mods/
    index.js         DrawText/動作/聊天 hooks + 統一翻譯查表
    domObserver.js   dialog-inventory / 快捷鍵 / dfn 的 DOM 翻譯
    bcxHelp.js       BCX textarea 說明輪詢替換
    supplement.js    ★ 手寫零星補譯（ECHO 沒收錄的 mod 字串、代名詞…）
    bc/BCX, bc/LSCG  mod 字典查表層
    html/            聊天記錄 HTML 翻譯
scripts/
  seed-from-upstream.js  從官方原始碼種入 cn/ 與 official-tw.json
  gen-dict.js            合併三來源 → dict.json
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

日常維護只會動到上面標 ★ 的檔，改完 `npm run build` 測試、push 後由 GitHub Actions 自動部署。

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

mod 自己畫 canvas/DOM，不走官方 CSV，字典放 `translations/mods/`：

- **有明確英文原文的**：加到對應的 `translations/mods/bcx/*.txt` 或 `lscg/*.txt`（英文一行、中文一行）。
- **零星、或 ECHO 沒收錄的**：直接寫在 [`src/mods/supplement.js`](src/mods/supplement.js)（`menu` = canvas 文字、`activity` = 動作訊息模板、`html` = 聊天 HTML）。`supplement` 優先於字典，可用來覆寫。
- **BCX 匯出/匯入等長說明**（塞進 `textarea`）：加到 `translations/mods/bcx-help.json`（`"英文": "中文"`）。

### C. 繁中用語修正

TW 由 CN 機轉，出現不順的詞時：

- **全域詞彙**：改 [`translations/tw-terms.json`](translations/tw-terms.json)（例：`"信息":"訊息"`）— 對所有字串生效。
- **個別字串**：加到 [`translations/tw-overrides.txt`](translations/tw-overrides.txt)（英文一行、繁中一行）— 只覆寫該句，優先於機轉。

### D. 找出還沒翻的字串

- **官方缺口**：`npm run diff`（需官方原始碼）→ 產生 [`reports/missing-cn.md`](reports)。
- **執行期缺口**：遊戲內 console 執行 `BCTP.missing()` 匯出「畫面上出現、但翻不到的英文」清單，逐條補進 A/B。

### E. 官方更新後刷新

官方改版後重跑 `npm run seed`：會刷新 `translations/cn/` 與 `official-tw.json`。**未被 cn-extra 覆寫的檔會自動跟上官方**，你的 cn-extra 補充不受影響。

### F. 建置與部署

```bash
npm install
npm run seed     # 從官方原始碼種入 CN 翻譯（首次 / 官方改版後）
npm run build    # gen-dict + esbuild 打包 → dist/
npm run diff     # 列出官方尚未翻譯的字串 → reports/missing-cn.md
```

本機需要官方原始碼：用環境變數 `BC_UPSTREAM_DIR` 指向 `BondageClub` 目錄，或 clone 到 `.upstream/BondageClub`。（`build` / `gen` 只讀 `translations/`，不需要官方原始碼；只有 `seed` / `diff` 需要。）

push 到 `main` 後，GitHub Actions 會自動 `build` 並部署 `dist/` 到 Pages。首次啟用：repo **Settings → Pages → Source** 選 **GitHub Actions**，再手動跑一次 **Build & Deploy** workflow。

---

## 注意事項 / 疑難排解

- **載入時序**：瀏覽器（Tampermonkey）早於遊戲注入所以穩；Electron 晚載入，靠 `reapply.js` 的快取重建補正。若新增了會在啟動前就被烤進快取的畫面，記得該畫面的翻譯也依賴這步。
- **別手改 `translations/cn/`**：那是 seed 的產物，會被沖掉。所有手改放 `cn-extra/` 或 `mods/`。
- **`<dfn>` 陷阱**：BC 會讀製作屬性 `<dfn>` 的 `textContent` 去組查表 key，所以 dfn 是**延遲翻譯**（等 BC 讀完英文名再翻顯示），且用 `Text_Crafting` 作用域字典避免撞名。動 domObserver 時勿破壞這點。
- **保留變數**：翻譯含 `$value$`、`SourceCharacter`、`{Expression}`、`\n` 等一律原樣保留，否則遊戲填值會壞。
- **KinkyDungeon** 有自己的 i18n，`gen-dict.js` 整個排除，不要往裡補。

---

## 授權與致謝

翻譯內容衍生自 Bondage Club 官方原始碼（含其社群中文翻譯）；BCX / LSCG 動作字典移植自 [Echo 的动作拓展](https://github.com/SugarChain-Studio/echo-activity-ext)。本專案程式碼採 MIT。
