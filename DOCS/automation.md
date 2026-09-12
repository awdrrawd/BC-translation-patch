# 自動化與 GitHub 手動設定

本次實作第一批 CI／字庫品質閘門，以及 Dependabot。上游定期下載、未使用程式碼掃描、完整瀏覽器 E2E 與 dependency-review-action 尚未加入。無需 PAT、額外 secrets 或付費第三方服務；GitHub Actions 的可用額度仍依帳戶方案。

## 已寫好的行為

| 事件 | 自動執行 | 是否發布 |
| --- | --- | --- |
| 任意 PR | 安裝依賴、字庫檢查、22 項測試、建置、上傳品質報告 | 否 |
| main 推送 | 相同驗證；成功後上傳 dist，再部署 Pages | 是 |
| Actions 手動執行 | 相同驗證 | 僅選 main 時發布 |
| merge queue | 相同驗證 | 否 |
| 每週一台北時間 09:00 | Dependabot 檢查 npm 與 GitHub Actions 更新，必要時提出 PR | 不自動合併 |

Workflow：`.github/workflows/build.yml`。依賴更新：`.github/dependabot.yml`。一般驗證 job 只有 contents:read；Pages 權限只給部署 job，部署不 checkout／執行專案程式，只發布已驗證產物。PR 不使用 pull_request_target，也沒有發布權限。

同分支新執行會取消舊 CI。Pages 部署另有序列化群組。品質報告保留 14 天，可從 Actions 執行頁面的 Artifacts 下載 `translation-quality`；即使品質检查失敗仍嘗試上傳報告。

## 你需要手動設定

1. **提交並推送這次檔案**。目前只寫在本機，未替你 commit／push。Dependabot 與手動執行入口需要設定檔進入預設分支；本倉庫 workflow 的發布分支設為 main。
2. **啟用 Actions**：GitHub 倉庫 → Settings → Actions → General。若倉庫或組織有限制，允許本 workflow 使用的 GitHub 官方 `actions/*`。不需要將一般 workflow 的 token 改成全面讀寫，YAML 已按 job 指定權限。
3. **設定 Pages**：Settings → Pages → Build and deployment → Source 選 **GitHub Actions**。已是此設定就不必改。若 `github-pages` environment 設了必要審核人，發布會等待該審核；若有限制分支，需允許 main。
4. **保護 main（建議）**：先讓 workflow 成功跑一次，再到 Settings → Rules → Rulesets 建立啟用中的 main 分支規則；要求 PR 與通過 status checks。選擇 **Verify translations and build**，來源選 GitHub Actions。不要選 Deploy Pages，因為 PR 不執行部署。可再要求分支與 main 保持最新；單人維護不必設定自己無法完成的他人審核要求。
5. **確認 Dependabot PR**：設定合併至預設分支後，查看依賴更新 PR。更新不會自動合併；請確認 CI 與 OpenCC 翻譯結果後合併。若組織停用 Dependabot，需管理員啟用。

Pages Base URL 已沿用 package.json 的 `https://awdrrawd.github.io/BC-translation-patch/`。若日後 fork 或更名，要更新 bctp.repository／pagesBaseUrl，重新建置。DOCS 不在 dist 中，因此本次不會把架構文件一起發布到 Pages。

官方設定說明：

- [Pages 發布來源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Rulesets 必要狀態檢查](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [Dependabot 與 Actions](https://docs.github.com/en/code-security/tutorials/secure-your-dependencies/automate-dependabot-with-actions)

## 本機使用與檢查範圍

```sh
npm ci
npm run check
```

`check` 依序執行 TXT 品質檢查、所有測試與建置，任何步驟失敗就停止。`npm test` 會先透過 `pretest` 自動執行 `npm run gen`，確保全新 checkout 也有被 Git 忽略的 `src/generated/dict.json`，供 app 整合測試打包使用。`npm run check:translations` 可單獨產生 `reports/translation-quality.json`。gen/build 現在共用 runtimeDictionary serializer，修正先前 gen 只寫 paths 的問題。

TXT 檢查包含奇數未配對行、空鍵／空譯文、同檔重複 key，以及已列舉的機器 token／命名 placeholder 差異。既有 surface 測試檢查 LSCG 功能詞、表單 value、事件與箭頭保留。這不是所有指令語法或任意 placeholder 的完整驗證，也未檢查 JSON 原始文字中的重複鍵、跨檔作用域衝突或真實遊戲畫面。

## 既有問題基準：不是零缺陷宣告

首次檢查記錄 **1,679 筆既有檢查項目**：824 筆 token 差異、724 筆同檔重複 key、126 筆空配對、5 筆奇數尾行。它們是待審查項目，不代表每筆都是不同的實際遊戲錯誤；不少來自舊官方鏡像與單機內容，未在本次擅自改譯。

`scripts/translation-quality-baseline.json` 保存檔案、來源、譯文、類型與指紋。CI 允許完全相同的既有項目，但會阻擋新增或改動後的問題；重複增加相同錯誤也會失敗。報告仍列出全部項目。修好舊問題後不必立即更新基準也能通過。

若確定是必要例外，可在本機執行以下命令，**逐筆審查 baseline diff 後再提交**，不可為了讓 CI 變綠而整批接受新問題：

```sh
node scripts/validate-translations.js --write-baseline
```

此命令在 CI 環境禁止執行。baseline 是版本化的審查資料，修改它仍需由 PR 規則保護，不是不可繞過的安全機制。

## 驗證狀態

本機 `npm run check` 已通過：0 筆新增品質問題、22/22 測試通過、bundle 與 loader 建置成功。尚未在 GitHub runner 實際執行，也未觸發遠端部署；Pages 權限及組織政策需首次執行確認。
