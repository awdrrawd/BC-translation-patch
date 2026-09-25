import fs from "node:fs";
import path from "node:path";
import { generateDict } from "./gen-dict.js";
import { repoRoot } from "./lib/upstream.js";

// Static display strings only: never execute upstream code or modify command definitions.
const source = process.env.BCX_SRC || path.resolve(repoRoot, "../BCJS/bondage-club-extended-master/src");
const { modMenu } = generateDict();
const result = [];
for (const file of ["command_definitions.ts", "speech_commands.ts"]) {
    const body = fs.readFileSync(path.join(source, "commands", file), "utf8");
    for (const block of body.split(/\bregisterCommand\("/).slice(1)) {
        const id = block.slice(0, block.indexOf('"'));
        const header = block.split(/\bdefaultLimit:/)[0];
        const name = /\bname: "([^"]+)"/.exec(header)?.[1];
        const short = /\bshortDescription: "([^"]+)"/.exec(header)?.[1];
        const long = header.split("longDescription:")[1];
        if (!long) throw new Error("Unrecognized command definition: " + id);
        const text = [...long.matchAll(/`([^`]*)`/g)].map(m => m[1]).join("").replaceAll("\\n", "\n");
        if (!text || text.includes("${")) throw new Error("Unsupported dynamic description: " + id);
        const display = [name, short, ...text.split("\n")].filter(s => s && !s.startsWith("!"));
        result.push({ id, name, missing: display.filter(s => !modMenu.CN[s]) });
    }
}
fs.mkdirSync(path.join(repoRoot, "reports"), { recursive: true });
fs.writeFileSync(path.join(repoRoot, "reports/bcx-command-audit.json"), JSON.stringify({
    source, scope: "Display names, short descriptions, and description lines; excludes command syntax and runtime response messages",
    runtimeAdapter: "src/mods/bcxCanvas.js captures BCX command paragraphs before translating and reflowing Canvas text; regression coverage in scripts/bcx.test.js",
    commands: result,
}, null, 2) + "\n");
console.log(`BCX commands: ${result.length}; missing display entries: ${result.reduce((n,r) => n+r.missing.length,0)}`);
console.log("Dictionary coverage only; this does not verify rendering or command responses.");
