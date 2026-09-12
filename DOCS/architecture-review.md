# BC Translation Patch 架構檢視

檢視日期：2026-09-12。範圍：本機工作樹的 src、scripts、translations 結構、建置與發布設定；包含尚未提交的 BCX 指令補譯。互動導覽見 [architecture.html](architecture.html)。本次只新增文件，不修改執行期程式或刪除資料。

## 整體判斷

架構已有可維護的基礎，但尚不能視為全面健壯。原生翻譯以路徑隔離、資產依穩定 ID 還原、初始化失敗回收與重試、DOM 分批排程、LSCG 顯示與功能詞彙分離，都是應保留的設計。主要弱點是新舊翻譯來源並存、部分語言切換無法還原、產物 schema 不一致，以及相容性高度依賴上游 DOM／canvas 細節。

以下「確認」指可以由程式碼或本次命令重現；「風險」表示路徑存在，但未在實際遊戲證實發生。沒有把未被 npm scripts 列出的維護腳本直接當成死碼。

## 資料與執行流程

1. 維護端：seed 從本機上游更新 cn 鏡像；cn-extra 存補譯，mods 存模組文字，ui/surfaces.json 存限定畫面的標籤。
2. generateDict 合併資料，OpenCC 與詞彙覆寫產生 TW；輸出 paths 與多個執行期查表字典。
3. build 產生 dict.json，以 esbuild 打包 IIFE，產生使用者腳本載入器；Pages 目前只部署 dist。
4. index → startOnce → app.init：先注入快取，再載入 SDK、等待遊戲函式、註冊 hooks／observers。
5. 原生文字走 TranslationCache；資產與 TextCache 由 reapply 修復；模組 canvas／訊息走 setupMods；DOM 走 inventory、dfn、surfaces、chat 四條 observer 路徑。

## 已確認問題與改善優先序

| ID | 優先序 | 發現／證據 | 影響與建議 |
| --- | --- | --- | --- |
| A01 | 高 | scripts/gen-dict.js 的 CLI 只寫 `{ paths }`；scripts/build.js 寫完整字典。 | `npm run gen` 後，dict.json 缺少 modMenu、surfaces 等資料；直接打包或開發使用它會失去功能。正常 `npm run build` 會重新補全。統一 serializer 與 schema，測試兩個入口的結構一致。 |
| A02 | 高 | src/mods/supplement.js、bc/BCX、bc/LSCG 與 html/BCX.js 的舊字典直接回傳簡體；外層只判斷 CN/TW 是否啟用。 | TW 查不到新字典而走 fallback 時仍顯示簡體。將舊字典納入同一 CN→TW 建置管線；regex replacement 也需要處理。不要直接移除 fallback。 |
| A03 | 高 | .github/workflows/build.yml 安裝後直接 build、deploy，未執行 npm test。 | 測試失敗仍可能發布。先加測試閘門，再加 schema／格式驗證；不需每次發布下載上游。 |
| A04 | 中 | src/mods/bcxHelp.js 每秒直接改 textarea.value，只查英文 key；未保存來源。 | 同一 textarea 已變中文後，CN→TW 或切回英文不會再匹配。限定 BCX 說明欄位並保存 source/last；外部修改後必須放棄舊來源，避免覆蓋匯入碼。 |
| A05 | 中 | scripts/extract-bcx.js 只讀 translations/mods/bcx.txt；該路徑本次確認不存在。extract-mods.js 只扣舊字典與 supplement。 | 維護報告會重複列出已補的文字。統一讀 generateDict 的有效字典，並將候選擷取與缺漏判定分開。extract-lscg 本來就是候選擷取，不應宣稱其結果是缺漏。 |
| A06 | 中 | src/mods/index.js 的 missing Set 無上限，所有未命中的 canvas 英文都加入。 | 動態名稱、數值或時間文字可持續累積；並非每筆都是翻譯缺口。增加容量、清除介面與畫面來源；以 opt-in 診斷模式採樣。 |
| A07 | 中 | scripts/gen-dict.js 的 BASE 扁平合併採首筆勝出。find-collisions 本次在 cn 短字串中找到 526 個多譯義 key。 | 不等於 526 個畫面錯譯，但證實全域查表不能表示作用域。inventory 改用資產／動作字典優先，其餘按 surface 查表；保留路徑式注入。 |
| A08 | 中 | scripts/lib/parseTxt.js 奇數尾行會略過，空行可能改變配對；gen-dict.js 同名 mod key 後寫覆蓋。 | 維護者可能不知資料遺失或覆蓋。新增帶檔名／行號的嚴格驗證及衝突報告，合法覆寫使用明確規則。此項是容錯缺口，不代表現有檔案已損壞。 |

## 死碼、未消費資料與合理重複

| 項目 | 判定 | 處理建議 |
| --- | --- | --- |
| src/mods/index.js 的 ASSET 常數 | 確認宣告後未再引用。 | 可移除宣告；但是否改用 assetName 解決 A07，應先決定。 |
| generateDict 的 activityRegex／buildRegex／TOKENS | 確認產生並輸出，但 src 沒有 activityRegex 消費端；現行聊天翻譯走模板 hook。 | 可一起停止生成、序列化；保留 modRegex，後者確實供 PLAYER_NAME 比對使用。 |
| generateDict 的 assetName | 目前只有上述未使用 ASSET 讀取，未參與實際查表。 | 選擇接到 inventory 專用查表，或移除生成；不要僅刪常數而留下資料。 |
| 舊 BCX/LSCG menu 與 activities | 有被 units fallback 呼叫，並非死碼。 | 與 translations/mods 有多來源維護成本；先遷移並比較命中結果，再刪重複條目。 |
| enable.js、pronouns.js、html/utils 的型別判斷函式 | 已追蹤到實際呼叫，並非死碼。 | 保留；不要以「未在入口直接 import」判斷。 |
| DOM 與 canvas 的翻譯路徑 | 不同渲染介面需要不同 adapter，不能直接合併。 | 共用語言／查表／來源保存機制，但保留各自選取範圍。 |

generateDict 本次量測：activityRegex 737 筆 CN 規則，CN+TW JSON 為 126,203 bytes；assetName 1,856 個 CN key，CN+TW 為 118,642 bytes。合計 244,845 bytes 是生成資料的 UTF-8 JSON 大小，**不是已證明的最終 bundle／壓縮傳輸節省量**。BASE 為 17,387 個 CN key、1,847,276 bytes；paths 217 個路徑、3,460,641 bytes。未做 heap 或遊戲效能量測。

## 需要實測的健壯性風險

- **DOM 重掃成本**：surfaces observer 對每筆 mutation 的 target 查詢整個子樹，之後才進 Set 去重。同一大容器的多筆 mutation 仍會重複選取；inventory 每批限制 24 個根節點，但單根的 TreeWalker 沒有時間上限。先量測大型衣櫃、連續切換部位，再將候選根節點收集也批次化。
- **讀回文字的 UI**：dfn 以固定 300ms 延遲假設上游已用英文組好 key，且目前掃全頁 dfn。應改為明確製作畫面範圍及可驗證的完成時機，測試重開 tooltip 和重建屬性。
- **原地變更漏偵測**：watchReadiness 比較參照與長度，不能偵測相同陣列內等長替換或 CSV 儲存格原地更新。正常載入已覆蓋，外掛熱更新需驗證；必要時加明確事件／版本，不建議每 250ms 深比較全部資料。
- **聊天歷史與語言切換**：chat observer 每 500ms 才接上新容器，沒有補掃既有歷史或來源還原。可能漏掉容器出現到接上的訊息；既有 HTML 翻譯也不會 CN/TW 重套。需明確決定是否支援歷史回譯。
- **成功後卸載**：scope.dispose 僅用於初始化失敗；成功 API 沒有 stop/unload。這不等於一般遊玩必然洩漏，但不支援安全熱換版本。若提供卸載，需同時定義快取／已改 DOM 是否還原，不能只停止 timers。
- **上游畫面耦合**：roomAdmin 以固定座標識別模板名稱；surfaces 依 DOM ID；BCX 詳細指令使用自有 BCXDrawTextWrap，繞過現有全域 hook。上游變更後需 adapter fixture 與實際顯示測試，字典存在不代表畫面有翻譯。
- **ECHO 共存**：多個模組攔截同一畫布與訊息函式，可能受順序影響。本次未測兩種載入順序，不建議直接接管 ECHO。保留功能詞彙與輸入值是相容性底線。

## 建議演進架構

維持「維護端產生資料、玩家端只查表」；不要引入不必要的框架或在遊戲中跑 OpenCC。

1. **第一批：一致性與發布保障**。統一 gen/build schema、CI 加測試、修正舊抽取器的字庫路徑、移除確定無消費端的 activityRegex。
2. **第二批：翻譯來源整合**。舊字典與 supplement 遷到可生成 CN/TW 的資料層；定義 `lookup(scope, language, text)` 的優先序及來源資訊，處理同文異義。
3. **第三批：adapter 與生命週期**。BC 原生、BCX canvas、LSCG DOM、聊天顯示各有 adapter；統一 cleanup、來源保存與語言事件，補語言切換／UI 重建測試。
4. **第四批：可觀測性與相容性**。有界 missing 報告記錄 scope 和版本；維護端記錄上游 commit；測試 ECHO 載入順序和新版本 DOM fixture。全面接管翻譯留作使用者選項。

## 本次驗證與界線

- `npm test`：19/19 通過，包含 token 保留、初始化失敗回收與重試、資產 CN/TW/EN 還原、idle 分批，以及指定 surface 的值／事件保留。
- 靜態追蹤 src imports／exports 與 activityRegex、assetName、ASSET 引用；generateDict 直接量測資料大小；執行 find-collisions。
- 測試使用 Node 與模擬遊戲環境，**不是瀏覽器端完整 E2E**。未驗證真實遊戲、遠端最新原始碼、ECHO 同時安裝或長時間效能。
- 本文件的建議尚未套用；19 項通過只代表現有測試範圍，不能消除上述未覆蓋問題。
