import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { build } from "esbuild";
import { createScope, startOnce } from "../src/lifecycle.js";
import { createIdleBatchProcessor } from "../src/mods/idleBatch.js";
import { applyAssetDescriptions, watchReadiness } from "../src/assetDescriptions.js";
import { translateValue } from "../src/mods/domObserver.js";

function scheduler(idle) {
    let id = 0;
    const jobs = new Map();
    const add = fn => { jobs.set(++id, fn); return id; };
    const cancel = key => jobs.delete(key);
    return {
        jobs,
        env: { setTimeout: add, clearTimeout: cancel, requestAnimationFrame: add,
            cancelAnimationFrame: cancel,
            ...(idle ? { requestIdleCallback: add, cancelIdleCallback: cancel } : {}) },
        run(deadline) {
            const [key, fn] = jobs.entries().next().value;
            jobs.delete(key);
            fn(deadline);
        },
    };
}

for (const idle of [true, false]) test(`all 101 nodes finish in multiple batches (idle=${idle})`, () => {
    const clock = scheduler(idle), seen = [];
    const queue = createIdleBatchProcessor(item => seen.push(item), clock.env);
    for (let i = 0; i < 101; i++) { queue.push(i); queue.push(i); }
    let frames = 0;
    while (clock.jobs.size) {
        assert.ok(frames++ < 20, "queue must drain");
        clock.run({ didTimeout: false, timeRemaining: () => 10 });
    }
    assert.deepEqual(seen, Array.from({length:101}, (_,i)=>i));
    assert.ok(frames > 1);
    queue.push(102);
    queue.dispose();
    assert.equal(clock.jobs.size,0);
    queue.push(103);
    assert.equal(clock.jobs.size,0);
});

test("zero idle budget waits, then timeout makes bounded progress", () => {
    const clock = scheduler(true), seen = [];
    const queue = createIdleBatchProcessor(item=>seen.push(item),clock.env);
    for(let i=0;i<60;i++)queue.push(i);
    clock.run({didTimeout:false,timeRemaining:()=>0});
    assert.equal(seen.length,0);
    assert.equal(clock.jobs.size,1);
    clock.run({didTimeout:true,timeRemaining:()=>0});
    assert.equal(seen.length,24);
    while(clock.jobs.size)clock.run({didTimeout:true,timeRemaining:()=>0});
    assert.equal(seen.length,60);
});

test("concurrent initialization shares a promise; failure cleans up and can retry", async () => {
    const g={}, released=[];
    let resolve;
    const gate=new Promise(r=>resolve=r);
    const start=startOnce(g,async state=>{
        const scope=createScope();
        scope.add(()=>released.push("hook"));
        scope.add(()=>released.push("timer"));
        state.version="test";
        try { await gate; throw Error("partial init"); }
        catch(error){scope.dispose();scope.dispose();throw error;}
    });
    assert.equal(startOnce(g,()=>assert.fail("duplicate")),start);
    resolve();
    await assert.rejects(start,/partial init/);
    assert.deepEqual(released,["timer","hook"]);
    assert.equal(g.Liko.__Sys_VanillaTranslation__.status,"failed");
    const ready=await startOnce(g,async()=>({version:"test"}));
    assert.equal(ready.status,"ready");
    assert.equal(g.BCTP,ready);
    await startOnce(g,()=>assert.fail("ready must not reinitialize"));
});

function assets() {
    const group={Family:"Female3DCG",Name:"Hat",Description:"already translated"};
    return {TranslationLanguage:"CN",AssetGroup:[group],Asset:[
        {Group:group,Name:"New",DynamicGroupName:"Hat",Description:"already translated"},
        {Group:group,Name:"Custom",Description:"Custom mod name"},
    ],CommonCSVCache:{}};
}
const paths={
    "Assets/Female3DCG/Female3DCG_CN.txt":["Hats","帽子","New hat","新帽子"],
    "Assets/Female3DCG/Female3DCG_TW.txt":["Hats","帽飾","New hat","新帽飾"],
};
test("late raw CSV restores source by ID, switches CN/TW/EN and leaves custom assets alone",()=>{
    const g=assets();
    applyAssetDescriptions(g,paths,"CN");
    assert.equal(g.Asset[0].Description,"already translated");
    g.CommonCSVCache["Assets/Female3DCG/Female3DCG.csv"]=[["Hat","","Hats"],["Hat","New","New hat"]];
    for(const [lang,expected] of [["CN","新帽子"],["TW","新帽飾"],["TW","新帽飾"],["EN","New hat"]]){
        applyAssetDescriptions(g,paths,lang);
        assert.equal(g.Asset[0].Description,expected);
        assert.equal(g.Asset[1].Description,"Custom mod name");
    }
    applyAssetDescriptions(g,paths,"DE");
    assert.equal(g.Asset[0].Description,"New hat");
});

test("readiness refreshes only on data, language or text-cache changes",t=>{
    let tick,stopped=false,count=0;
    t.mock.method(globalThis,"setInterval",fn=>{tick=fn;return 1;});
    t.mock.method(globalThis,"clearInterval",()=>{stopped=true;});
    const g=assets(), caches=new Map(), scope=createScope();
    watchReadiness(g,()=>caches,()=>count++,scope.add);
    assert.equal(count,1);
    tick();assert.equal(count,1);
    g.CommonCSVCache["Assets/Female3DCG/Female3DCG.csv"]=[];
    tick();assert.equal(count,2);
    g.CommonCSVCache["Assets/Female3DCG/Female3DCG.csv"].push(["Hat","New","New hat"]);
    tick();assert.equal(count,3);
    g.TranslationLanguage="TW";tick();assert.equal(count,4);
    caches.set("new",{});tick();assert.equal(count,5);
    tick();assert.equal(count,5);
    scope.dispose();assert.ok(stopped);
});

test("existing DOM text switches language from saved source and accepts external edits",()=>{
    const node={data:"  Hat  "};
    translateValue(node,"data",()=> "帽子");assert.equal(node.data,"  帽子  ");
    translateValue(node,"data",()=> "帽飾");assert.equal(node.data,"  帽飾  ");
    translateValue(node,"data",()=> undefined);assert.equal(node.data,"  Hat  ");
    node.data="New";
    translateValue(node,"data",key=>key==="New"?"新":"wrong");
    assert.equal(node.data,"新");
});

test("real app rolls back hooks and observers after partial setup, then initializes once",async()=>{
    const output=await build({
        entryPoints:["src/app.js"],bundle:true,write:false,format:"iife",globalName:"App",
        define:{__BCTP_VERSION__:'"test"',__BCTP_NAME__:'"TestMod"',__BCTP_FULLNAME__:'"Test"',
            __BCTP_REPO__:'"https://example.invalid"'},
    });
    const timers=new Set(),observers=new Set(),listeners=new Set(),hooks=new Map();
    let fail=true,registered=false,unloads=0,registrations=0;
    const ctx={
        console, Event,
        setInterval:fn=>{timers.add(fn);return fn;},clearInterval:fn=>timers.delete(fn),
        setTimeout:fn=>{timers.add(fn);return fn;},clearTimeout:fn=>timers.delete(fn),
        requestAnimationFrame:fn=>{timers.add(fn);return fn;},cancelAnimationFrame:fn=>timers.delete(fn),
        MutationObserver:class {
            constructor(){observers.add(this);}
            observe(){}
            disconnect(){observers.delete(this);}
        },
        document:{body:null,querySelectorAll:()=>[],getElementById:()=>null,
            addEventListener:(name,fn)=>listeners.add(fn),
            removeEventListener:(name,fn)=>listeners.delete(fn),dispatchEvent(){}},
        TranslationLanguage:"TW",TranslationCache:{},CommonCSVCache:{},Asset:[],AssetGroup:[],
        bcModSdk:{registerMod(){
            assert.ok(!registered);registered=true;registrations++;
            return {hookFunction(name,priority,fn){
                if(fail && name==="TranslationAssetProcess")throw Error("hook setup failed");
                hooks.set(name,fn);
            },unload(){registered=false;unloads++;hooks.clear();}};
        }},
    };
    for(const name of ["TranslationAvailable","TranslationAssetProcess","DrawText","DrawTextFit",
        "DrawTextWrap","DynamicDrawText","ActivityDictionaryText","ChatRoomMessage","ChatRoomSendLocal"])
        ctx[name]=()=>{};
    vm.createContext(ctx);
    vm.runInContext(output.outputFiles[0].text,ctx);
    assert.equal(timers.size,0,"import must not start timers");
    assert.equal(observers.size,0,"import must not start observers");
    await assert.rejects(startOnce(ctx,state=>ctx.App.init(state)),/hook setup failed/);
    assert.equal(unloads,1);
    assert.equal(timers.size,0);
    assert.equal(observers.size,0);
    assert.equal(listeners.size,0);
    assert.equal(hooks.size,0);
    assert.ok(Object.keys(ctx.TranslationCache).length>0,"dictionary survives SDK failure");
    fail=false;
    await startOnce(ctx,state=>ctx.App.init(state));
    assert.equal(ctx.BCTP.status,"ready");
    assert.equal(registrations,2);
    const count=timers.size;
    await startOnce(ctx,()=>assert.fail("duplicate"));
    assert.equal(timers.size,count);
    ctx.CurrentScreen="ChatAdmin";
    assert.equal(hooks.get("DrawText")(["Back",169,95],args=>args[0]),"返回");
    assert.equal(hooks.get("DrawTextFit")(["    Save",449,868,146],args=>args[0]),"    儲存");
    assert.equal(hooks.get("DrawTextFit")(["Load",294,734,325],args=>args[0]),"Load");
    assert.equal(hooks.get("DrawTextFit")(["- empty template slot -",294,734,325],args=>args[0]),"- 空模板欄位 -");
    ctx.CurrentScreen="ChatRoom";
    const original={Type:"Action",Content:"Beep",Dictionary:[{Tag:"msg",Text:"LikoBot holds up her AV端子 to the room"}]};
    const incoming=hooks.get("ChatRoomMessage")([original],args=>args[0]);
    assert.equal(incoming.Dictionary[0].Text,"LikoBot 向房間裡的大家展示了自己的 AV端子");
    assert.equal(original.Dictionary[0].Text,"LikoBot holds up her AV端子 to the room");
    const chat={...original,Type:"Chat"};
    assert.equal(hooks.get("ChatRoomMessage")([chat],args=>args[0]),chat);

    // Simulate a late official response corrupting an already translated description.
    const family="Female3DCG";
    const group={Family:family,Name:"ItemHead"};
    ctx.AssetGroup=[group];
    ctx.Asset=[{Group:group,DynamicGroupName:"ItemHead",Name:"CybertechHeadset",Description:"old"}];
    ctx.CommonCSVCache["Assets/Female3DCG/Female3DCG.csv"]=[
        ["ItemHead","","Head"],["ItemHead","CybertechHeadset","Cybertech Headset"],
    ];
    const translation=ctx.TranslationCache["Assets/Female3DCG/Female3DCG_TW.txt"];
    const expected=translation[translation.indexOf("Cybertech Headset")+1];
    const result=hooks.get("TranslationAssetProcess")([],()=>{
        ctx.Asset[0].Description="corrupted by old response";
        return "original result";
    });
    assert.equal(result,"original result");
    assert.equal(ctx.Asset[0].Description,expected);
    ctx.TranslationLanguage="EN";
    ctx.BCTP.reapply();
    assert.equal(ctx.Asset[0].Description,"Cybertech Headset");
});
