import test from "node:test";
import assert from "node:assert/strict";
import { generateDict } from "./gen-dict.js";
import { translateSurface, translateCraftShare, SURFACES } from "../src/mods/surfaces.js";

const dictionaries = generateDict().surfaces;
const element = (text, tagName="SPAN") => ({tagName, childNodes:[{nodeType:3,data:text}]});
test("layering display labels translate while identifiers and numeric values remain untouched",()=>{
    const node=element("ArmMask","LEGEND");
    node.dataset={layeringGroup:"ArmMask"};
    translateSurface(node,"layering",dictionaries,"TW");
    assert.equal(node.childNodes[0].data,"手臂遮罩");
    assert.equal(node.dataset.layeringGroup,"ArmMask");
    for (const [source,expected] of [["Layer","圖層"],["Move","移動"],["Resize","縮放"],["Rotate","旋轉"]]) {
        const tab=element(source,"BUTTON");tab.id="layering-tab-"+source;
        translateSurface(tab,"layering",dictionaries,"TW");
        assert.equal(tab.childNodes[0].data,expected);
        assert.equal(tab.id,"layering-tab-"+source);
    }
});
test("search placeholder and share option label change without changing input values",()=>{
    const input={tagName:"INPUT",placeholder:"Filter items",value:"AV端子"};
    translateSurface(input,"search",dictionaries,"TW");
    assert.equal(input.placeholder,"搜尋道具");
    assert.equal(input.value,"AV端子");
    translateSurface(input,"search",dictionaries,"EN");
    assert.equal(input.placeholder,"Filter items");
    const option={tagName:"OPTION",label:"Share",value:"LSCGShare",selected:true};
    translateSurface(option,"craft",dictionaries,"CN");
    assert.equal(option.label,"分享");
    assert.equal(option.value,"LSCGShare");
    assert.equal(option.selected,true);
});
test("LSCG explanations translate on replacement; all functional vocabulary stays English",()=>{
    const labels=["Chaotic","Evolving","Slow","Quick","Tamperproof","Electrifying","Self-Tightening",
        "Subduing","Cursed","Magic","Net Gun","Soulbinding","Sedative","Aphrodisiac","Mind control","Antidote","_none_"];
    for(const label of labels){
        const node=element(label);
        translateSurface(node,"lscg",dictionaries,"TW");
        assert.equal(node.childNodes[0].data,label);
    }
    const descriptions=Object.keys(dictionaries.CN.lscg).filter(s=>s!=="LSCG Effects");
    assert.equal(descriptions.length,17);
    const tooltip=element(descriptions[0]);
    for(const source of descriptions){
        tooltip.childNodes[0].data=source;
        translateSurface(tooltip,"lscg",dictionaries,"TW");
        assert.equal(tooltip.childNodes[0].data,dictionaries.TW.lscg[source]);
    }
    assert.equal(SURFACES.find(([,scope])=>scope==="lscg")[0],
        "#lscg-effect-main-title, #lscg-effect-tooltip, #crafting-lscg-effects-menu-label > span");
});
test("share translation preserves user names, craft name, description and literal replacement characters",()=>{
    assert.equal(translateCraftShare("(LikoBot holds up her AV端子 to the room)","TW"),
        "(LikoBot 向房間裡的大家展示了自己的 AV端子)");
    const text="A$& holds up their AV$1 to the room: magic cursed <b>custom</b>\nSecond line";
    assert.equal(translateCraftShare(text,"CN"),
        "A$& 向房间里的大家展示了自己的 AV$1: magic cursed <b>custom</b>\nSecond line");
    assert.equal(translateCraftShare(text,"EN"),undefined);
    assert.equal(translateCraftShare("ordinary chat","TW"),undefined);
});

import { roomAdminText, isRoomTemplateName, translateRoomTemplateName } from "../src/mods/roomAdmin.js";
test("BCX room admin labels support CN/TW only on the room settings screen",()=>{
    assert.equal(roomAdminText("Create a theme room",dictionaries,"TW","ChatAdmin"),"建立主題房間");
    assert.equal(roomAdminText("    Save",dictionaries,"CN","ChatAdmin"),"    保存");
    assert.equal(roomAdminText("Load",dictionaries,"TW","ChatAdmin"),"載入");
    assert.equal(roomAdminText("Load",dictionaries,"TW","ChatRoom"),undefined);
    assert.equal(roomAdminText("Load",dictionaries,"EN","ChatAdmin"),undefined);
    assert.equal(roomAdminText("My own room description",dictionaries,"CN","ChatAdmin"),undefined);
    for(const [en,cn] of Object.entries(dictionaries.CN.roomAdmin)){
        assert.ok(cn);
        assert.ok(dictionaries.TW.roomAdmin[en]);
    }
});
test("room template names bypass menu translation, including names identical to buttons",()=>{
    for(const x of [294,749,1204,1659]){
        const args=["Load",x,734,325,"Black","Gray"];
        assert.ok(isRoomTemplateName("DrawTextFit",args,"ChatAdmin"));
        assert.equal(translateRoomTemplateName("DrawTextFit",args,dictionaries,"TW","ChatAdmin"),undefined);
        args[0]="- empty template slot -";
        assert.equal(translateRoomTemplateName("DrawTextFit",args,dictionaries,"CN","ChatAdmin"),"- 空模板栏位 -");
    }
});

test("LSCG quick access preserves toggle arrows, click handlers and state while translating labels",()=>{
    const click=()=>{};
    const button=element("▼ Key Necklace","BUTTON");
    button.onclick=click;
    button.value="NecklaceKey";
    button.dataset={typed:"0"};
    translateSurface(button,"quickAccess",dictionaries,"TW");
    assert.equal(button.childNodes[0].data,"▼ 鑰匙項鍊");
    button.childNodes[0].data="▶ Key Necklace";
    translateSurface(button,"quickAccess",dictionaries,"TW");
    assert.equal(button.childNodes[0].data,"▶ 鑰匙項鍊");
    translateSurface(button,"quickAccess",dictionaries,"EN");
    assert.equal(button.childNodes[0].data,"▶ Key Necklace");
    assert.equal(button.onclick,click);
    assert.equal(button.value,"NecklaceKey");
    assert.deepEqual(button.dataset,{typed:"0"});
    for(const [en,zh] of [["Tuck In","藏入衣內"],["Pull Out","拉出衣外"]]){
        button.childNodes[0].data=en;
        translateSurface(button,"quickAccess",dictionaries,"TW");
        assert.equal(button.childNodes[0].data,zh);
    }
    button.childNodes[0].data="▼ Custom mod item";
    translateSurface(button,"quickAccess",dictionaries,"TW");
    assert.equal(button.childNodes[0].data,"▼ Custom mod item");
    assert.equal(SURFACES.find(([,scope])=>scope==="quickAccess")[0],"#lscg-quick-access > button");
});


 test("LSCG necklace actions support CN/TW, self and other names, without broad matching", async()=>{
    const {translateNecklaceAction:t}=await import("../src/mods/necklaceActions.js");
    assert.equal(t("莉柯莉絲 tucks 火龙果's key necklace under her clothing. ","TW"),"莉柯莉絲 將火龙果的鑰匙項鍊藏入衣服內。 ");
    assert.equal(t("(Alice pulls Bob's key necklace out.)","CN"),"(Alice 将Bob的钥匙项链拉出衣服外。)");
    assert.equal(t("Alice tucks his own lock necklace under his clothing.","TW"),"Alice 將自己的鎖頭項鍊藏入衣服內。");
    assert.equal(t("Alice pulls O'Neil's lock necklace out.","TW"),"Alice 將O'Neil的鎖頭項鍊拉出衣服外。");
    assert.equal(t("Alice pulls Bob's key necklace out.","EN"),undefined);
    assert.equal(t("I said Alice pulls Bob's key necklace out. Really?","TW"),undefined);
 });


test("LSCG substituted messages cover every added template and blank departure targets", async()=>{
 const {translateLscgMessage:t}=await import("../src/mods/lscgMessages.js");
 const all=generateDict().surfaces;
 for(const lang of ["CN","TW"]) {
  const dict=all[lang].lscgMessages;
  for(const source of Object.keys(dict)) {
   const input=source.replace(/%NAME%/g,()=>"Gaia$&").replace(/%OPP_NAME_POSSESSIVE%/g,"O'Neil's").replace(/%OPP_NAME%/g,"火龙果").replace(/%OPP_POSSESSIVE%/g,"her").replace(/%OPP_INTENSIVE%/g,"her");
   const result=t(input,dict,lang);
   assert.ok(result?.includes("Gaia$&"),source);
   assert.ok(!/%[A-Z_]+%/.test(result),source);
  }
 }
 assert.equal(t("Gaia leads  out of the room by the hand.",all.TW.lscgMessages),"Gaia 拉著對方的手離開了房間。");
 assert.equal(t("Gaia leads  out of the room by the hand.",all.CN.lscgMessages,"CN"),"Gaia 拉着对方的手离开了房间。");
 assert.equal(t("Gaia leads Bob out of the room by the hand. extra",all.TW.lscgMessages),undefined);
 assert.equal(t("Gaia leads Bob out of the room by the hand.",all.TW.lscgMessages,"EN"),undefined);
});
