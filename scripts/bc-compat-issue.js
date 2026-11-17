#!/usr/bin/env node
// Keeps one `bc-compat` tracking issue in step with the result of check-bc-compat.js --json:
//   - drift and no open issue:        create it.
//   - drift that differs from before: update the body and comment (a comment is what notifies people).
//   - drift identical to before:      do nothing, so nobody is pinged twice for the same thing.
//   - no drift and an open issue:     comment and close it.
// It only notifies and never fails the workflow. Needs the gh CLI, GH_TOKEN (issues: write) and GH_REPO.
//
//   node scripts/bc-compat-issue.js <project name> <report.json> [report.md]
import fs from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const SIGNATURE = /bc-compat-sig:([0-9a-f]+)/;

/** Sorted, human-readable lists of what differs, plus a signature of exactly that (not of the BC version or run). */
export function summarize(report) {
    const missing = [...(report.missing ?? [])].sort();
    const changed = (report.changed ?? []).map((item) => `${item.name} (${item.file}) ${item.was} -> ${item.now}`).sort();
    const added = [...(report.added ?? [])].sort();
    const stale = [...(report.stale ?? [])].sort();
    const problems = missing.length + changed.length + added.length + stale.length;
    const sig = createHash("sha1")
        .update(JSON.stringify([missing, changed, added, stale]))
        .digest("hex")
        .slice(0, 12);
    return { missing, changed, added, stale, problems, sig };
}

/** What to do given the summary and the currently open `bc-compat` issues ({ number, body }). */
export function plan(summary, openIssues) {
    const [existing] = openIssues;
    if (summary.problems) {
        if (!existing) return { action: "create" };
        if (SIGNATURE.exec(existing.body ?? "")?.[1] === summary.sig) return { action: "unchanged" };
        return { action: "update", number: existing.number };
    }
    if (openIssues.length) return { action: "close", numbers: openIssues.map((issue) => issue.number) };
    return { action: "none" };
}

export function buildBody({ project, report, summary, detail = "", runUrl = "" }) {
    const list = (items) => items.map((item) => `- \`${item}\``).join("\n");
    const section = (title, items) => (items.length ? `\n### ${title}\n${list(items)}\n` : "");
    const full = detail ? `\n<details><summary>完整報告</summary>\n\n\`\`\`text\n${detail}\n\`\`\`\n\n</details>\n` : "";
    return `<!-- bc-compat-sig:${summary.sig} -->
每週檢查發現 ${project} 掛鉤的 Bondage Club 函式與基準不同（BC 版本 **${report.gameVersion ?? "unknown"}**，共 ${summary.problems} 項）。
${section("找不到被掛鉤的函式（掛鉤會安裝失敗）", summary.missing)}${section("BC 函式內容自基準後有變動（請檢視掛鉤行為）", summary.changed)}${section("已掛鉤但基準尚未收錄", summary.added)}${section(`基準有、${project} 已不再掛鉤`, summary.stale)}
請對照 BC 原始碼確認掛鉤行為，必要時調整程式；確認後在本機執行下列指令更新基準並提交：

\`\`\`sh
node scripts/check-bc-compat.js --bc-dir <BC 原始碼資料夾> --update
\`\`\`
${full}
> 此議題由每週檢查自動維護：差異內容改變時更新內文並留言，差異全部消失後自動關閉。${runUrl ? `\n> 最近一次執行：${runUrl}` : ""}`;
}

function main(argv) {
    const [project, jsonPath, mdPath] = argv;
    if (!project || !jsonPath) {
        console.error("用法：node scripts/bc-compat-issue.js <專案名稱> <report.json> [report.md]");
        return 2;
    }
    const gh = (...args) => execFileSync("gh", args, { encoding: "utf8" });
    const report = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const summary = summarize(report);
    const version = report.gameVersion ?? "unknown";
    const runUrl = process.env.GITHUB_RUN_ID
        ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
        : "";
    const detail = mdPath && fs.existsSync(mdPath) ? fs.readFileSync(mdPath, "utf8").trim().slice(0, 40000) : "";
    const bodyFile = `${process.env.RUNNER_TEMP ?? "."}/bc-compat-body.md`;

    try {
        gh(
            "label",
            "create",
            "bc-compat",
            "--color",
            "BFD4F2",
            "--description",
            `Bondage Club functions hooked by ${project} changed or disappeared`,
            "--force",
        );
    } catch {
        // The label already exists or cannot be created; the issue commands below still work without it being new.
    }
    const open = JSON.parse(gh("issue", "list", "--label", "bc-compat", "--state", "open", "--json", "number,body", "--limit", "20"));
    const step = plan(summary, open);

    if (step.action === "create" || step.action === "update") {
        fs.writeFileSync(bodyFile, buildBody({ project, report, summary, detail, runUrl }));
    }
    if (step.action === "create") {
        gh("issue", "create", "--title", "BC 函式掛鉤與基準不同", "--label", "bc-compat", "--body-file", bodyFile);
        console.log(`已建立 issue（${summary.problems} 項差異）`);
    } else if (step.action === "update") {
        gh("issue", "edit", String(step.number), "--body-file", bodyFile);
        gh(
            "issue",
            "comment",
            String(step.number),
            "--body",
            `檢查結果有變動（BC 版本 ${version}，目前 ${summary.problems} 項差異），內文已更新。`,
        );
        console.log(`已更新 issue #${step.number}`);
    } else if (step.action === "close") {
        for (const number of step.numbers) {
            gh("issue", "comment", String(number), "--body", `BC 版本 ${version} 已與基準一致，自動關閉。`);
            gh("issue", "close", String(number));
            console.log(`差異已消失，已關閉 issue #${number}`);
        }
    } else if (step.action === "unchanged") {
        console.log("差異與上次相同，不重複通知。");
    } else {
        console.log("無差異，沒有需要處理的 issue。");
    }
    return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main(process.argv.slice(2));
