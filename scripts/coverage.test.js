import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { parseCsv, missingStrings, isOnlineCsv } from "./diff-upstream.js";
import { parseTxtPairs } from "./lib/parseTxt.js";
import { walk } from "./lib/fsutil.js";
import { generateDict } from "./gen-dict.js";

test("CSV handles quoted commas, escaped quotes, CRLF and multiline fields", () => {
 assert.deepEqual(parseCsv('key,"Hello, ""world"""\r\nnext,"line 1\r\nline 2"\r\n'), [
  ["key", 'Hello, "world"'], ["next", "line 1\nline 2"],
 ]);
});
test("coverage reads asset descriptions and both dialog display columns", () => {
 assert.deepEqual(missingStrings("Assets/Female3DCG/Female3DCG", [["Hat","InternalName","New hat"]], new Map()), ["New hat"]);
 assert.deepEqual(missingStrings("Screens/Online/ChatRoom/Dialog_Online", [["0","1","Option","Result","Function()"]], new Map()), ["Option","Result"]);
 assert.deepEqual(missingStrings("Screens/Interface", [["A","Same"],["B","Same"],["C","Empty"]], new Map([["Empty",""]])), ["Same","Empty"]);
 assert.deepEqual(missingStrings("Screens/Interface", [["A","Same"]], new Map([["Same","相同"]])), []);
});
test("default scope includes online shared assets, excludes story and minigames", () => {
 for (const file of ["Assets/Female3DCG/AssetStrings.csv", "Backgrounds/Backgrounds.csv", "Screens/Character/Wardrobe/Text_Wardrobe.csv", "Screens/Online/Game/OnlineGameDictionary.csv", "Screens/Room/Crafting/Text_Crafting.csv"]) assert.ok(isOnlineCsv(file), file);
 for (const file of ["Screens/Room/Private/Text_Private.csv", "Screens/Cutscene/Intro/Text_Intro.csv", "Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon.csv"]) assert.ok(!isOnlineCsv(file), file);
});

test("decorative image markup is not prose, but labels and accessible images remain in coverage", () => {
 const icon = "<img src='Icons/FocusEnabledWarning.png' aria-hidden='true'>";
 assert.deepEqual(missingStrings("Screens/Online/ChatRoom/Text_ChatRoom", [
  ["Icon", icon], ["Label", icon + " Warning"], ["Accessible", '<img alt="Warning" src="warning.png">'],
 ], new Map()), [icon + " Warning", '<img alt="Warning" src="warning.png">']);
});

test("online supplements reach CN/TW paths and preserve queue and character placeholders", () => {
 const { paths } = generateDict();
 for (const lang of ["CN", "TW"]) {
  const translated = (base, source) => {
   const flat = paths[`${base}_${lang}.txt`];
   const index = flat?.findIndex((value, i) => i % 2 === 0 && value === source) ?? -1;
   assert.ok(index >= 0, `${base}: ${source}`);
   return flat[index + 1];
  };
  assert.match(translated("Screens/Character/Relog/Text_Relog", "Waiting in queue in position: QUEUE_POS"), /QUEUE_POS/);
  assert.equal(translated("Screens/Online/ChatRoom/Text_ChatRoom", "Back"), "返回");
  assert.match(translated("Screens/Character/Player/Dialog_Player", "(Boot Kinky Dungeon)"), /地城/);
  const source = "SourceCharacter shackles DestinationCharacter wrists behind TargetPronounPossessive back.";
  const target = translated("Assets/Female3DCG/AssetStrings", source);
  for (const token of ["SourceCharacter", "DestinationCharacter", "TargetPronounPossessive"]) assert.ok(target.includes(token));
 }
});
test("new translations preserve substitution tokens and reach both language bundles", () => {
 const { paths } = generateDict();
 const root = path.resolve("translations/cn-extra");
 const marker = /^### 2026-09：[^\n]*\n/m;
 const tokens = s => (s.match(/\{[^{}]+\}|\$[^$\s]+\$|\b(?:SourceCharacter|DestinationCharacterName|DestinationCharacter|TargetCharacter|(?:Source|Target)?Pronoun(?:Possessive|Subject|Object|Self)|ActivityAsset|ActivityGroup|FocusAssetGroup|AssetName|SourceName|SourceNumber|TargetName|TargetNumber|OptionOdds|ActionOdds|ActionRNG|ItemDesc|TIMEREMAINING|QUEUE_POS)\b|\\n/g) || []).sort();
 let count = 0;
 for (const file of walk(root, f=>f.endsWith(".txt"))) {
  const body = fs.readFileSync(file, "utf8").replace(/\r\n/g,"\n");
  const match = marker.exec(body);
  if (!match) continue;
  const part = body.slice(match.index+match[0].length);
  const lines = part.trimEnd().split("\n").filter(s=>!s.startsWith("###"));
  assert.equal(lines.length % 2, 0, file);
  const pairs = parseTxtPairs(part);
  assert.equal(new Set(pairs.map(([en])=>en)).size, pairs.length, "duplicate keys: " + file);
  const base = path.relative(root,file).split(path.sep).join("/").replace(/\.txt$/,"");
  for (const [en,zh] of pairs) {
   assert.ok(zh, en);
   assert.deepEqual(tokens(zh),tokens(en), en);
   for (const lang of ["CN","TW"]) {
    const flat = paths[base+"_"+lang+".txt"];
    assert.ok(flat, base+" "+lang);
    const index = flat.findIndex((s,i)=>i%2===0 && s===en);
    assert.ok(index>=0 && flat[index+1], base+": "+en);
   }
   count++;
  }
 }
 assert.equal(count,1500);
});
