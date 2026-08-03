# BC 補完翻譯 (CN / TW)

為 [Bondage Club](https://gitlab.com/BondageProjects/Bondage-College) 補上官方尚未翻譯的字串，支援**簡體中文 (CN)** 與**繁體中文 (TW)**。以外掛（userscript）方式疊在官方遊戲上，不需修改遊戲檔案。

- **CN 為單一維護來源**，**TW 由 [OpenCC](https://github.com/BYVoid/OpenCC)（`s2twp`）自動生成** + 詞彙/逐句覆寫。
- 翻譯**按原始檔路徑餵回遊戲自己的翻譯管線**（`TranslationCache` + `TranslationAvailable`），
  因此**作用域正確、不會有全域字典的英文撞名污染**，也不會覆蓋官方既有的手工翻譯。

## 運作原理

1. 翻譯內容以官方 `.txt` 格式存放於 [`translations/cn/`](translations/cn)，路徑鏡像官方（例如 `Screens/Room/Cell/Text_Cell.txt`）。
2. 建置時 [`scripts/gen-dict.js`](scripts/gen-dict.js)：
   - **CN**：只輸出「官方沒有、或你補充過」的檔案，作為覆寫。
   - **TW**：只在「官方沒有該 `_TW.txt`」時輸出（不蓋官方繁中），內容由 CN 逐行 OpenCC 轉換。
   - 產物是遊戲 `TranslationParseTXT` 的攤平陣列，塞進 `TranslationCache[路徑]`。
3. 執行時 [`src/inject.js`](src/inject.js) 注入快取並 hook `TranslationAvailable`，其餘交給遊戲原生的 `TranslationString` 分檔查用。

## 安裝（給玩家）

> 部署後，檔案會在 `https://awdrrawd.github.io/BC-translation-patch/` 下。

**方式 A：Tampermonkey 載入器**
安裝 [Tampermonkey](https://www.tampermonkey.net/) 後，開啟 [`bc-translation-patch.user.js`](https://awdrrawd.github.io/BC-translation-patch/bc-translation-patch.user.js) 安裝即可（會自動更新）。

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

## 開發

```bash
npm install
npm run seed     # 從官方原始碼種入 CN 翻譯到 translations/cn/（首次）
npm run build    # 產生 dist/ 的 bundle 與載入器
npm run diff     # 對比官方英文，列出尚未翻譯的字串 -> reports/missing-cn.md
```

本機需要官方原始碼；用環境變數 `BC_UPSTREAM_DIR` 指向 `BondageClub` 目錄，或 clone 到 `.upstream/BondageClub`。

## 如何補翻譯

1. 找到（或新增）`translations/cn/` 下對應的 `.txt`，格式為**英文一行、中文一行**，`###` 開頭為註解。
   - 補漏行時**保留官方既有行**、只往下加（我方檔需為官方超集才會正確覆寫）。
2. 需要修正繁中用語時：
   - 全域詞彙：改 [`translations/tw-terms.json`](translations/tw-terms.json)（例：`"信息":"訊息"`）。
   - 個別字串：加到 [`translations/tw-overrides.txt`](translations/tw-overrides.txt)（英文一行、繁中一行）。
3. `npm run build` 後測試，push 由 GitHub Actions 自動建置並部署到 Pages。

### 找出官方新增、還沒翻的內容

- 每週的 **Upstream Diff** Action 會自動開 issue 附上缺口清單；也可手動 `npm run diff`。
- 遊戲內：在 console 設 `BCTP_DEBUG = true` 再重載，畫布上出現的英文字串會記到 console，`BCTP_drawnEN()` 可匯出。

## 首次啟用 GitHub Pages

到 repo **Settings → Pages → Build and deployment → Source** 選 **GitHub Actions**，然後手動跑一次 **Build & Deploy** workflow。

## 授權與致謝

翻譯內容衍生自 Bondage Club 官方原始碼（含其社群中文翻譯）。本專案程式碼採 MIT。
