import { translatePronouns } from "../pronouns";
import { LSCGenabled } from "./enable";

const translation = {
    "Bap": "拍打",
    "SourceCharacter baps TargetCharacter.": "SourceCharacter 拍了 TargetCharacter 一下.",
    "Headbutt": "头槌",
    "SourceCharacter headbutts TargetCharacter.": "SourceCharacter 用头撞了 TargetCharacter.",
    "Nuzzle": "用鼻子轻蹭",
    "SourceCharacter nuzzles against the side of TargetCharacter's head.":
        "SourceCharacter 用鼻子轻蹭 TargetCharacter 头部的一侧.",
    "SourceCharacter nuzzles into TargetCharacter's neck.": "SourceCharacter 把鼻子轻蹭进 TargetCharacter 的脖颈.",
    "SourceCharacter nuzzles into TargetCharacter's arms.": "SourceCharacter 把鼻子轻蹭进 TargetCharacter 的胳膊.",
    "SourceCharacter nuzzles underneath TargetCharacter's hand.": "SourceCharacter 在 TargetCharacter 的手下轻蹭.",
    "SourceCharacter nuzzles into TargetCharacter's breasts.": "SourceCharacter 把鼻子轻蹭到 TargetCharacter 的胸部.",
    "SourceCharacter nuzzles snugly into TargetCharacter.": "SourceCharacter 舒适地用鼻子贴着 TargetCharacter.",
    "SourceCharacter nuzzles against TargetCharacter's thigh.": "SourceCharacter 用鼻子轻蹭 TargetCharacter 的大腿.",
    "SourceCharacter nuzzles along TargetCharacter's leg.": "SourceCharacter 沿着 TargetCharacter 的腿轻蹭.",
    "SourceCharacter nuzzles under TargetCharacter's feet.": "SourceCharacter 在 TargetCharacter 的脚下轻蹭.",
    "Hug": "拥抱",
    "SourceCharacter wraps PronounPossessive arms around TargetCharacter in a big warm hug.":
        "SourceCharacter张开双臂,给了TargetCharacter一个大大的温暖拥抱,将PronounPossessive的手臂也环绕其中.",
    "Tackle": "扑倒",
    "SourceCharacter full body tackles TargetCharacter!": "SourceCharacter 整个身体扑倒了 TargetCharacter!",
    "Flop": "瘫倒",
    "SourceCharacter flops on top of TargetCharacter.": "SourceCharacter 瘫倒在 TargetCharacter 身上.",
    "Kiss Eyes": "亲吻眼睛",
    "SourceCharacter gently kisses over TargetCharacter's eyes.": "SourceCharacter 轻柔地亲吻 TargetCharacter 的眼睛.",
    "Rub Pussy": "摩擦私处",
    "SourceCharacter grinds PronounPossessive pussy against TargetCharacter's penis.":
        "SourceCharacter用PronounPossessive的私处摩擦着TargetCharacter的阴茎.",
    "Slap Face": "扇脸",
    "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's face.":
        "SourceCharacter 用PronounPossessive的ActivityAsset 抽打在 TargetCharacter 的脸上.",
    "Slap Mouth": "扇嘴巴",
    "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's mouth.":
        "SourceCharacter 用PronounPossessive的ActivityAsset 抽打在 TargetCharacter 的嘴巴上.",
    "Slap against Pussy": "扇打私处",
    "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's pussy.":
        "SourceCharacter 用PronounPossessive的 ActivityAsset 抽打在 TargetCharacter 的私处上.",
    "Slap Breast": "扇打乳房",
    "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's breast.":
        "SourceCharacter 用PronounPossessive的 ActivityAsset 抽打在 TargetCharacter 的乳房上.",
    "Slap Thigh": "扇打大腿",
    "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's thigh.":
        "SourceCharacter 用PronounPossessive的 ActivityAsset 抽打在 TargetCharacter 的大腿上.",
    "Slap Calf": "扇打小腿",
    "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's calf.":
        "SourceCharacter 用PronounPossessive的 ActivityAsset 抽打在 TargetCharacter 的小腿上.",
    "Slap Feet": "扇打脚",
    "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's feet.":
        "SourceCharacter 用PronounPossessive的 ActivityAsset 抽打在 TargetCharacter 的脚上.",
    "Slap Butt": "扇打屁股",
    "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's butt.":
        "SourceCharacter 用PronounPossessive的 ActivityAsset 抽打在 TargetCharacter 的屁股上.",
    "Slap Neck": "扇打脖子",
    "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's neck.":
        "SourceCharacter 用PronounPossessive的 ActivityAsset 抽打在 TargetCharacter 的脖子上.",
    "Slap Arms": "扇打手臂",
    "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's arm.":
        "SourceCharacter 用PronounPossessive的 ActivityAsset 抽打在 TargetCharacter 的手臂上.",
    "Slap Hand": "扇打手",
    "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's hand.":
        "SourceCharacter 用PronounPossessive的 ActivityAsset 抽打在 TargetCharacter 的手上.",
    "Slap Penis": "扇打阴茎",
    "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's penis.":
        "SourceCharacter 用PronounPossessive的 ActivityAsset 抽打在 TargetCharacter 的阴茎上.",
    "Nibble Tail": "轻咬尾巴",
    "SourceCharacter nibbles on TargetCharacter's tail.": "SourceCharacter 轻咬 TargetCharacter 的尾巴.",
    "SourceCharacter nibbles on PronounPossessive own tail.": "SourceCharacter 轻咬自己的尾巴.",
    "Nibble Halo": "咬光环",
    "SourceCharacter nibbles on TargetCharacter's halo.": "SourceCharacter 咬 TargetCharacter 的光环.",
    "Nibble Wing": "轻咬翅膀",
    "SourceCharacter nibbles on TargetCharacter's wing.": "SourceCharacter 轻咬 TargetCharacter 的翅膀.",
    "SourceCharacter nibbles on PronounPossessive own wing.": "SourceCharacter 轻咬自己的翅膀.",
    "Grind with Pussy": "用阴部磨擦",
    "SourceCharacter grinds PronounPossessive pussy against TargetCharacter's.":
        "SourceCharacter 用阴部磨擦着 TargetCharacter 的阴部.",
    "Ride with Pussy": "用阴部骑乘",
    "SourceCharacter fucks TargetCharacter's penis with PronounPossessive pussy, grinding up and down.":
        "SourceCharacter 用阴部骑乘在 TargetCharacter 的阴茎, 上下磨擦.",
    "Sit on Face": "坐在脸上",
    "SourceCharacter grinds PronounPossessive pussy against TargetCharacter's face.":
        "SourceCharacter 用阴部磨擦着 TargetCharacter 的脸.",
    "Grind with Ass": "用臀部磨擦",
    "SourceCharacter grinds PronounPossessive ass against TargetCharacter's vulva.":
        "SourceCharacter 用臀部磨擦着 TargetCharacter 的阴道.",
    "Ride with Ass": "用臀部骑乘",
    "SourceCharacter fucks TargetCharacter's penis with PronounPossessive ass.":
        "SourceCharacter 用臀部骑乘在 TargetCharacter 的阴茎.",
    "Suck": "吮吸",
    "SourceCharacter wraps PronounPossessive lips around TargetCharacter's ActivityAsset and sucks.":
        "SourceCharacter 用嘴唇包裹住 TargetCharacter 的 ActivityAsset 并吮吸.",
    "Deepthroat": "深喉",
    "SourceCharacter takes TargetCharacter's ActivityAsset deep down PronounPossessive throat.":
        "SourceCharacter 将 TargetCharacter 的 ActivityAsset 深深地吞入 PronounPossessive 的喉咙.",
    "SourceCharacter wraps PronounPossessive lips around PronounPossessive own ActivityAsset and sucks.":
        "SourceCharacter 用嘴唇包裹住自己的 ActivityAsset 并吮吸.",
    "SourceCharacter takes PronounPossessive own ActivityAsset deep down PronounPossessive throat.":
        "SourceCharacter 将自己的ActivityAsset 深深地吞入PronounPossessive的喉咙.",
    "Eat": "咬一口",
    "SourceCharacter takes a big bite out of TargetCharacter's ActivityAsset.":
        "SourceCharacter 咬了 TargetCharacter 的 ActivityAsset 一大口.",
    "SourceCharacter takes a big bite out of PronounPossessive own ActivityAsset.":
        "SourceCharacter 咬了自己的 ActivityAsset 一大口.",
    "Grab Tongue": "抓舌头",
    "SourceCharacter reaches in and grabs hold of TargetCharacter's tongue with PronounPossessive fingers.":
        "SourceCharacter 伸手抓住 TargetCharacter 的舌头.",
    "Release Tongue": "松开舌头",
    "SourceCharacter lets go of TargetCharacter's tongue.": "SourceCharacter 松开了 TargetCharacter 的舌头.",
    "Hold Hands": "牵手",
    "SourceCharacter takes TargetCharacter's hand.": "SourceCharacter 牵住 TargetCharacter 的手.",
    "Release Hand": "放开手",
    "SourceCharacter lets go of TargetCharacter's hand.": "SourceCharacter 松开了 TargetCharacter 的手.",
    "Pinch Butt": "捏屁股",
    "SourceCharacter pinches TargetCharacter's butt.": "SourceCharacter捏住TargetCharacter的屁股.",
    "SourceCharacter pinches PronounPossessive own butt.": "SourceCharacter 捏住自己的屁股.",
    "Pinch Cheek": "捏脸颊",
    "SourceCharacter pinches TargetCharacter's cheek.": "SourceCharacter捏住TargetCharacter的脸颊.",
    "SourceCharacter pinches PronounPossessive own cheek.": "SourceCharacter 捏住了自己的脸颊.",
    "Release Ear": "松开耳朵",
    "SourceCharacter releases TargetCharacter's ear.": "SourceCharacter 松开了 TargetCharacter 的耳朵.",
    "Grab Horn": "抓住角",
    "SourceCharacter grabs TargetCharacter's horn.": "SourceCharacter抓住TargetCharacter的角.",
    "Release Arm": "松开手臂",
    "SourceCharacter releases TargetCharacter's arm.": "SourceCharacter 松开了 TargetCharacter 的手臂.",
    "Release Horn": "松开角",
    "SourceCharacter releases TargetCharacter's horn.": "SourceCharacter 松开了 TargetCharacter的角.",
    "Release Neck": "松开脖子",
    "SourceCharacter releases TargetCharacter's neck.": "SourceCharacter 松开了 TargetCharacter 的脖子.",
    "Release Mouth": "松开嘴巴",
    "SourceCharacter releases TargetCharacter's mouth.": "SourceCharacter 松开了 TargetCharacter 的嘴巴.",
    "Stuff with Foot": "用脚进行填塞",
    "SourceCharacter shoves PronounPossessive foot into TargetCharacter's mouth, grabbing their tongue with PronounPossessive toes.":
        "SourceCharacter 把自己的脚塞进 TargetCharacter 的嘴里, 并用脚趾夹住 TargetCharacter 的舌头.",
    "Remove Foot": "移开脚",
    "SourceCharacter removes PronounPossessive foot from TargetCharacter's mouth.":
        "SourceCharacter 从 TargetCharacter 的嘴里抽出自己的脚.",
    "Tug": "拽",
    "SourceCharacter tugs on TargetCharacter's crotch rope.": "SourceCharacter 拉扯着 TargetCharacter 胯下的绳子.",
    "SourceCharacter tugs lewdly on PronounPossessive own crotch rope.":
        "SourceCharacter 淫荡地拉扯着自己的胯下的绳子.",
    "Flick Ear": "轻弹耳朵",
    "SourceCharacter flicks TargetCharacter's ear.": "SourceCharacter 轻轻弹了 TargetCharacter 的耳朵.",
    "SourceCharacter flicks PronounPossessive own ear.": "SourceCharacter 轻轻弹了自己的耳朵.",
    "Flick Nose": "轻弹鼻子",
    "SourceCharacter flicks TargetCharacter's nose.": "SourceCharacter 轻轻弹了 TargetCharacter 的鼻子.",
    "SourceCharacter flicks PronounPossessive own nose.": "SourceCharacter 轻轻弹了自己的鼻子.",
    "Flick Nipple": "轻弹乳头",
    "SourceCharacter flicks TargetCharacter's nipple.": "SourceCharacter 轻轻弹了 TargetCharacter 的乳头.",
    "SourceCharacter flicks PronounPossessive own nipple.": "SourceCharacter 轻轻弹了自己的乳头.",
    "Flick Butt": "轻弹屁股",
    "SourceCharacter flicks TargetCharacter's butt.": "SourceCharacter 轻轻弹了 TargetCharacter的屁股.",
    "SourceCharacter flicks PronounPossessive own butt.": "SourceCharacter 轻轻弹了自己的屁股.",
    "Flick Foot": "轻弹脚底",
    "SourceCharacter flicks the bottom of TargetCharacter's feet.": "SourceCharacter 轻轻弹了 TargetCharacter的脚底.",
    "SourceCharacter flicks the bottom of PronounPossessive feet.": "SourceCharacter 轻轻弹了自己的脚底.",
    "Flick Forehead": "轻弹额头",
    "SourceCharacter flicks TargetCharacter's forehead.": "SourceCharacter 轻轻弹了 TargetCharacter的额头.",
    "SourceCharacter flicks PronounPossessive own forehead.": "SourceCharacter 轻轻弹了自己的额头.",
    "Flick Neck": "轻弹脖子",
    "SourceCharacter flicks TargetCharacter's neck.": "SourceCharacter 轻轻弹了 TargetCharacter的脖子.",
    "SourceCharacter flicks PronounPossessive own neck.": "SourceCharacter 轻轻弹了自己的脖子.",
    "Flick Thigh": "轻弹大腿",
    "SourceCharacter flicks TargetCharacter's thigh.": "SourceCharacter 轻轻弹了 TargetCharacter的大腿.",
    "SourceCharacter flicks PronounPossessive own thigh.": "SourceCharacter 轻轻弹了自己的大腿.",
    "Flick Leg": "轻弹腿",
    "SourceCharacter flicks TargetCharacter's leg.": "SourceCharacter 轻轻弹了 TargetCharacter的腿.",
    "SourceCharacter flicks PronounPossessive own leg.": "SourceCharacter 轻轻弹了自己的腿.",
    "Flick Clitoris": "轻弹阴蒂",
    "SourceCharacter flicks TargetCharacter's clitoris.": "SourceCharacter 轻轻弹了 TargetCharacter的阴蒂.",
    "SourceCharacter flicks PronounPossessive own clitoris.": "SourceCharacter 轻轻弹了自己的阴蒂.",
    "Flick Balls": "轻弹睾丸",
    "SourceCharacter flicks TargetCharacter's balls.": "SourceCharacter 轻轻弹了 TargetCharacter的睾丸.",
    "SourceCharacter flicks PronounPossessive own balls.": "SourceCharacter 轻轻弹了自己的睾丸.",
    "Flick Pussy": "轻弹阴部",
    "SourceCharacter flicks TargetCharacter's pussy.": "SourceCharacter 轻轻弹了 TargetCharacter的阴部.",
    "SourceCharacter flicks PronounPossessive own pussy.": "SourceCharacter 轻轻弹了自己的阴部.",
    "Flick Penis": "轻弹阴茎",
    "SourceCharacter flicks TargetCharacter's penis.": "SourceCharacter 轻轻弹了 TargetCharacter的阴茎.",
    "SourceCharacter flicks PronounPossessive own penis.": "SourceCharacter 轻轻弹了自己的阴茎.",
    "Chomp on Arm": "咬住手臂",
    "SourceCharacter chomps down on TargetCharacter's arm and doesn't let go.":
        "SourceCharacter 用力咬住 TargetCharacter 的手臂且不松口.",
    "Chomp on Leg": "咬住腿",
    "SourceCharacter chomps down on TargetCharacter's leg and doesn't let go.":
        "SourceCharacter 用力咬住 TargetCharacter 的腿且不松口.",
    "Chomp on Butt": "咬住屁股",
    "SourceCharacter chomps down on TargetCharacter's butt and doesn't let go.":
        "SourceCharacter 用力咬住 TargetCharacter 的屁股且不松口.",
    "Chomp on Neck": "咬住脖子",
    "SourceCharacter chomps down on TargetCharacter's neck and doesn't let go.":
        "SourceCharacter 用力咬住 TargetCharacter 的脖子且不松口.",
    "Release Chomp": "松开咬住",
    "SourceCharacter releases PronounPossessive chomp on TargetCharacter.":
        "SourceCharacter 松开对 TargetCharacter 的咬.",
    "Quaff": "畅饮",
    "SourceCharacter presses PronounPossessive ActivityAsset up against TargetCharacter's lips.":
        "SourceCharacter 将自己的 ActivityAsset 紧压在 TargetCharacter 的嘴唇上.",
    "SourceCharacter quaffs the ActivityAsset in one gulp.": "SourceCharacter 一口气将 ActivityAsset 一饮而尽.",
    "Tighten Collar": "收紧项圈",
    "Loosen Collar": "放松项圈",
    "Collar Stats": "项圈状态",
    "Shoot Netgun": "射击网枪",
    "SourceCharacter takes aim at TargetCharacter with PronounPossessive net gun.":
        "SourceCharacter 用自己的网枪瞄准 TargetCharacter.",
    "SourceCharacter turns PronounPossessive net gun on PronounSelf.": "SourceCharacter 将自己的网枪对准自己.",
    "Pour into Funnel": "倒入漏斗",
    "SourceCharacter pours PronounPossessive ActivityAsset into TargetCharacter's funnel.":
        "SourceCharacter 将自己的 ActivityAsset 倒入 TargetCharacter 的漏斗中.",
    "SourceCharacter pours PronounPossessive ActivityAsset into PronounPossessive own funnel.":
        "SourceCharacter 将自己的 ActivityAsset 倒入自己的漏斗中.",
    "Gag Mouth": "堵住嘴巴",
    "SourceCharacter gags TargetCharacter with PronounPossessive ActivityAsset.":
        "SourceCharacter 用自己的 ActivityAsset 堵住了 TargetCharacter 的嘴.",
    "SourceCharacter gags PronounSelf with PronounPossessive own ActivityAsset.":
        "SourceCharacter 用自己的 ActivityAsset 堵住了自己的嘴.",
    "Place around Neck": "放在脖子上",
    "SourceCharacter places PronounPossessive ActivityAsset around TargetCharacter's neck.":
        "SourceCharacter 把自己的 ActivityAsset 放在 TargetCharacter 的脖子周围.",
    "SourceCharacter places PronounPossessive ActivityAsset around PronounPossessive own neck.":
        "SourceCharacter 把自己的 ActivityAsset 放在自己的脖子周围.",
    "Take Gag": "取下口球",
    "SourceCharacter removes TargetCharacter's ActivityAsset.":
        "SourceCharacter 移除了 TargetCharacter 的 ActivityAsset.",
    "SourceCharacter pulls the ActivityAsset from PronounPossessive mouth.":
        "SourceCharacter从PronounPossessive的嘴里取下了ActivityAsset.",
    "SourceCharacter takes TargetCharacter's ActivityAsset from around TargetPronounPossessive neck.":
        "SourceCharacter从TargetPronounPossessive的脖子上取下了TargetCharacter的ActivityAsset.",
    "SourceCharacter takes PronounPossessive own ActivityAsset from around PronounPossessive neck.":
        "SourceCharacter从PronounPossessive的脖子上取下了PronounPossessive自己的ActivityAsset.",
    "Move to Mouth": "移至嘴边",
    "SourceCharacter moves TargetCharacter's ActivityAsset up to PronounPossessive mouth.":
        "SourceCharacter将TargetCharacter的ActivityAsset移到了PronounPossessive的嘴边.",
    "SourceCharacter moves PronounPossessive own ActivityAsset up to PronounPossessive mouth.":
        "SourceCharacter将PronounPossessive自己的ActivityAsset移到了PronounPossessive的嘴边.",
    "Wear around Neck": "挂在脖子上",
    "SourceCharacter removes TargetCharacter's ActivityAsset, letting it hang around their neck.":
        "SourceCharacter取下了TargetCharacter的ActivityAsset,让它挂在了他们的脖子上.",
    "SourceCharacter removes the ActivityAsset from Pro…h and lets it hang around PronounPossessive neck.":
        "SourceCharacter取下了PronounPossessive的ActivityAsset,并让它挂在了PronounPossessive的脖子上.",
    "Tie Up": "捆绑",
    "SourceCharacter swiftly wraps PronounPossessive rope around TargetCharacter's feet, binding TargetPronounPossessive tightly.":
        "SourceCharacter 迅速地用自己的绳子把 TargetCharacter 的脚缠绕起来, 紧紧地绑住了 TargetPronounPossessive.",
    "SourceCharacter wraps PronounPossessive rope around PronounPossessive feet tightly.":
        "SourceCharacter 紧紧地用自己的绳子把自己的脚缠绕起来.",
    "SourceCharacter swiftly wraps PronounPossessive rope around TargetCharacter's legs, binding TargetPronounPossessive tightly.":
        "SourceCharacter 迅速地用自己的绳子把 TargetCharacter 的腿缠绕起来, 紧紧地绑住了 TargetPronounPossessive.",
    "SourceCharacter wraps PronounPossessive rope around PronounPossessive legs tightly.":
        "SourceCharacter 紧紧地用自己的绳子把自己的腿缠绕起来.",
    "SourceCharacter swiftly wraps PronounPossessive rope around TargetCharacter's pelvis, binding TargetPronounPossessive tightly.":
        "SourceCharacter 迅速地用自己的绳子把 TargetCharacter 的骨盆缠绕起来, 紧紧地绑住了 TargetPronounPossessive.",
    "SourceCharacter wraps PronounPossessive rope around PronounPossessive pelvis tightly.":
        "SourceCharacter 紧紧地用自己的绳子把自己的骨盆缠绕起来.",
    "SourceCharacter swiftly wraps PronounPossessive rope around TargetCharacter's arms, binding TargetPronounPossessive tightly.":
        "SourceCharacter 迅速地用自己的绳子把 TargetCharacter 的胳膊缠绕起来, 紧紧地绑住了 TargetPronounPossessive.",
    "SourceCharacter wraps PronounPossessive rope around PronounPossessive arms tightly.":
        "SourceCharacter 紧紧地用自己的绳子把自己的胳膊缠绕起来.",
    "SourceCharacter swiftly wraps PronounPossessive rope around TargetCharacter's eyes, binding TargetPronounPossessive tightly.":
        "SourceCharacter 迅速地用自己的绳子把 TargetCharacter 的眼睛缠绕起来, 紧紧地绑住了 TargetPronounPossessive.",
    "SourceCharacter wraps PronounPossessive rope around PronounPossessive eyes tightly.":
        "SourceCharacter 紧紧地用自己的绳子把自己的眼睛缠绕起来.",
    "SourceCharacter swiftly wraps PronounPossessive rope around TargetCharacter's neck, binding TargetPronounPossessive tightly.":
        "SourceCharacter 迅速地用自己的绳子把 TargetCharacter 的脖子缠绕起来, 紧紧地绑住了 TargetPronounPossessive.",
    "SourceCharacter wraps PronounPossessive rope around PronounPossessive neck tightly.":
        "SourceCharacter 紧紧地用自己的绳子把自己的脖子缠绕起来.",
    "SourceCharacter swiftly wraps PronounPossessive rope around TargetCharacter's breasts, binding TargetPronounPossessive tightly.":
        "SourceCharacter 迅速地用自己的绳子把 TargetCharacter 的胸部缠绕起来, 紧紧地绑住了 TargetPronounPossessive.",
    "SourceCharacter wraps PronounPossessive rope around PronounPossessive breasts tightly.":
        "SourceCharacter 紧紧地用自己的绳子把自己的胸部缠绕起来.",
    "SourceCharacter swiftly wraps PronounPossessive rope around TargetCharacter's waist, binding TargetPronounPossessive tightly.":
        "SourceCharacter 迅速地用自己的绳子把 TargetCharacter 的腰部缠绕起来, 紧紧地绑住了 TargetPronounPossessive.",
    "SourceCharacter wraps PronounPossessive rope around PronounPossessive waist tightly.":
        "SourceCharacter 紧紧地用自己的绳子把自己的腰部缠绕起来.",
    "SourceCharacter swiftly wraps PronounPossessive rope around TargetCharacter's toes, binding TargetPronounPossessive tightly.":
        "SourceCharacter 迅速地用自己的绳子把 TargetCharacter 的脚趾缠绕起来, 紧紧地绑住了 TargetPronounPossessive.",
    "SourceCharacter wraps PronounPossessive rope around PronounPossessive toes tightly.":
        "SourceCharacter 紧紧地用自己的绳子把自己的脚趾缠绕起来.",
    "Steal": "抢夺",
    "SourceCharacter grabs at TargetCharacters hands, trying to steal TargetPronounPossessive item.":
        "SourceCharacter 抓住了 TargetCharacters 的手, 试图抢夺TargetPronounPossessive的物品.",
    "Give Item": "交出物品",
    "SourceCharacter grabs at TargetCharacters hands, trying to steal TargetPronounPossessive item!":
        "SourceCharacter 一把抓住 TargetCharacters 的手, 企图抢夺TargetPronounPossessive的物品!",
    "Shark Bite": "鲨鱼咬",
    "SourceCharacter's ActivityAsset bites TargetCharacter's arm.":
        "SourceCharacter 的 ActivityAsset 咬住了 TargetCharacter 的手臂.",
    "SourceCharacter's ActivityAsset bites TargetCharacter's foot.":
        "SourceCharacter 的 ActivityAsset 咬住了 TargetCharacter 的脚.",
    "SourceCharacter's ActivityAsset bites TargetCharacter's breast.":
        "SourceCharacter 的 ActivityAsset 咬住了 TargetCharacter 的乳房.",
    "SourceCharacter's ActivityAsset bites TargetCharacter's butt.":
        "SourceCharacter 的 ActivityAsset 咬住了 TargetCharacter 的臀部.",
    "SourceCharacter's ActivityAsset bites TargetCharacter's ear.":
        "SourceCharacter 的 ActivityAsset 咬住了 TargetCharacter 的耳朵.",
    "SourceCharacter's ActivityAsset bites TargetCharacter's leg.":
        "SourceCharacter 的 ActivityAsset 咬住了 TargetCharacter 的腿.",
    "SourceCharacter's ActivityAsset bites TargetCharacter on the hand.":
        "SourceCharacter 的 ActivityAsset 咬住了 TargetCharacter 的手.",
    "SourceCharacter's ActivityAsset bites TargetCharacter in the thigh.":
        "SourceCharacter 的 ActivityAsset 咬住了 TargetCharacter 的大腿.",
    "SourceCharacter's ActivityAsset bites TargetCharacter on the neck.":
        "SourceCharacter 的 ActivityAsset 咬住了 TargetCharacter 的脖子.",
    "SourceCharacter's ActivityAsset bites TargetCharacter's nipple.":
        "SourceCharacter 的 ActivityAsset 咬住了 TargetCharacter 的乳头.",
    "SourceCharacter's ActivityAsset chomps on TargetCharacter.":
        "SourceCharacter 的 ActivityAsset 狠狠地咬住了 TargetCharacter.",
    "Boop": "轻戳",
    "SourceCharacter boops TargetCharacter's nose with PronounPossessive ActivityAsset.":
        "SourceCharacter 用自己的 ActivityAsset 轻戳了 TargetCharacter 的鼻子.",
    "Squeeze": "紧紧地拥抱",
    "SourceCharacter hugs PronounPossessive ActivityAsset tightly.":
        "SourceCharacter 紧紧地拥抱着自己的 ActivityAsset.",
    "Take Photo": "拍照",
    "SourceCharacter snaps a photo of TargetCharacter.": "SourceCharacter 给 TargetCharacter 拍了张照片.",
    "SourceCharacter takes a selfie.": "SourceCharacter 自拍了一张.",
    "Wag Tail": "摇晃尾巴",
    "SourceCharacter wags PronounPossessive tail.": "SourceCharacter 摇晃着自己的尾巴.",
    "SourceCharacter wraps TargetCharacter in a therapeutic self-hug.":
        "SourceCharacter 用一个具有治疗作用的自我拥抱裹住了 TargetCharacter .",
    "SourceCharacter releases PronounPossessive own neck.": "SourceCharacter 松开了自己的脖子.",
    "Clamp Hand over Eyes": "用手捂住眼睛.",
    "SourceCharacter clamps her hand over TargetCharacter's eyes.":
        "SourceCharacter 把她的手捂在 TargetCharacter 的眼睛上.",
    "SourceCharacter clamps her hand over PronounPossessive own eyes.": "SourceCharacter 把她的手捂在自己的眼睛上.",
    "SourceCharacter releases PronounPossessive own mouth.": "SourceCharacter 放开了自己的嘴.",
    "Release Eyes": "放开眼睛",
    "SourceCharacter removes their hand from TargetCharacter's eyes.":
        "SourceCharacter 将手从 TargetCharacter 的眼睛上移开.",
    "SourceCharacter pulls their hand away from PronounPossessive eyes.": "SourceCharacter 将手从自己的眼睛旁抽走.",
    "SourceCharacter shoves PronounPossessive foot into…rabbing their tongue with PronounPossessive toes.":
        "SourceCharacter 将脚塞入……用脚趾抓挠自己的舌头.",
    "Grab Tail": "抓住尾巴",
    "SourceCharacter grabs TargetCharacter's tail.": "SourceCharacter 抓住了 TargetCharacter 的尾巴.",
    "Release Tail": "放开尾巴",
    "SourceCharacter releases TargetCharacter's tail.": "SourceCharacter 放开了 TargetCharacter 的尾巴.",
};

const regexTranslations = [
    {
        regex: /(.+) moans uncontrollably as (.+)'s drug takes effect\./,
        replacement: "随着$2的药物生效，$1不由自主地呻吟起来。",
    },
    {
        regex: /(.+) quivers as (.+) body is flooded with (.+)'s aphrodisiac\./,
        replacement: "当$3的催情剂充斥$2的身体时，$1止不住地颤抖。",
    },
    {
        regex: /(.+)'s eyes roll back as a wave of pleasure washes over (.+) body\./,
        replacement: "当一阵强烈的快感席卷$2的身体时，$1的双眼不由自主地向上翻起。",
    },
    {
        regex: /(.+) sighs as a cool relaxing calm glides through (.+) body, fighting to keep (.+) eyes open\./,
        replacement: "当一阵清凉、放松的平静感流过$2的身体时，$1叹了口气，努力保持$3的眼睛睁开。",
    },
    {
        regex: /(.+)'s muscles relax as (.+)'s sedative courses through (.+) body/,
        replacement: "随着$2的镇静剂在$3体内流动，$1的肌肉逐渐放松下来。",
    },
    {
        regex: /(.+) fights to stay conscious against the relentless weight of (.+)'s drug\./,
        replacement: "$1努力保持清醒，抵抗着$2的药物带来的持续压迫感。",
    },
    {
        regex: /(.+)'s eyes droop as (.+) fights to stay conscious against the cool, welcoming weight of (.+)'s drug\./,
        replacement: "$1的眼皮渐渐垂下，$2在$3清凉舒缓的药效下竭力保持清醒。",
    },
    {
        regex: /(.+) moans thankfully as (.+)'s medicine heals (.+)\./,
        replacement: "在$2的药物治愈$3时，$1发出感激的呻吟声。",
    },
    {
        regex: /(.+)'s body glows slightly as (.+)'s cure washes warmly over (.+)\./,
        replacement: "随着$2的治疗能量温暖地流遍$3，$1的身体泛起微光。",
    },

    {
        regex: /(.+)'s drug rushes warmly through (.+)'s body, curing what ails (.+)\./,
        replacement: "$1 的药物温暖地在 $2 的身体里涌动,治愈了困扰 $3 的病症.",
    },

    {
        regex: /(.+) gulps and swallows (.+)'s drink, a cool relaxing feeling starting to spread through (.+) body\./,
        replacement: "$1 大口吞咽着 $2 的饮料,一种清凉放松的感觉开始在 $3 的身体里扩散开来.",
    },
    {
        regex: /(.+) sighs as a cool relaxing calm glides down (.+) throat, fighting to keep (.+) eyes open\./,
        replacement: "当一阵清凉、放松、平静的感觉滑下 $2 的喉咙时,$1 叹了口气,努力保持 $3 的眼睛睁开.",
    },
    {
        regex: /(.+)'s muscles relax as (.+)'s sedative pours down (.+) throat and starts to take effect\./,
        replacement: "当$2的镇静剂顺着$3的喉咙灌入并开始生效时,$1的肌肉放松下来.",
    },
    {
        regex: /(.+)'s eyes droop as (.+) fights to stay conscious against the cool, welcoming weight of (.+)'s drug\./,
        replacement: "当$1努力抵抗着$3的药物那清凉、诱人的沉重感以保持清醒时,$2的眼睛耷拉下来.",
    },
    {
        regex: /(.+) whimpers and struggles to keep control of (.+) mind\./,
        replacement: "$1呜咽着,努力控制住$2的意识.",
    },
    {
        regex: /(.+) gasps weakly as (.+)'s drug slowly erases (.+) free will\./,
        replacement: "当$2的药物慢慢抹去$3的自由意志时,$1虚弱地倒抽一口气.",
    },
    {
        regex: /(.+)'s eyes struggle to focus as (.+)'s drug makes (.+) more suggestible\./,
        replacement: "当$2的药物让$3变得更容易受暗示时,$1的眼睛努力想要聚焦.",
    },
    {
        regex: /(.+) starts to drift dreamily as they swallow (.+)'s drink\./,
        replacement: "当他们吞下$2的饮料时,$1开始如梦般地恍惚起来.",
    },
    {
        regex: /(.+) gasps weakly and starts to lose focus as (.+)'s drug warms (.+) comfortably\./,
        replacement: "当$2的药物让$3舒适地沉浸其中时,$1虚弱地喘息着并开始失去焦点.",
    },
    {
        regex: /(.+)'s eyes flutter and defocus as (.+)'s drink slides warmly down (.+) throat\./,
        replacement: "当$2的饮料温暖地顺着$3的喉咙滑下时,$1的眼睛眨动且视线模糊.",
    },
    {
        regex: /(.+) gulps thankfully as (.+)'s medicine slowly heals (.+)\./,
        replacement: "$1满怀感激地大口吞咽,因为$2的药物正在慢慢治愈$3.",
    },
    {
        regex: /(.+)'s body glows slightly as (.+)'s cure glides warmly through (.+)\./,
        replacement: "当$2的治愈能量温暖地在$3体内流淌时,$1的身体微微发光.",
    },
    {
        regex: /(.+)'s antidote slowly washes through (.+)'s body, curing what ails (.+)\./,
        replacement: "$1的解药缓慢地在$2的身体中流淌,治愈了困扰$3的病症.",
    },
    {
        regex: /(.+)'s body goes limp as (.+) mind empties and (.+) awaits a command\./,
        replacement: "当$2的思维变得空白,$1的身体变得绵软无力,等待着命令.",
    },
    {
        regex: /(.+)'s eyes roll back as a wave of pleasure emanates from (.+) belly\./,
        replacement: "当一阵愉悦感从$2的腹部散发出来时,$1的眼睛向后翻转.",
    },
    {
        regex: /(.+)'s eyes move dreamily under (.+) closed eyelids\.\.\./,
        replacement: "在$1紧闭的眼皮底下,$2的眼睛如梦般地移动着……",
    },
    {
        regex: /(.+)'s mask whirs and shudders as it reloads its own supply and continues emitting\./,
        replacement: "$1的面具发出呼呼声并颤抖着,因为它正在重新装载自身供应并继续释放.",
    },
    {
        regex: /(.+)'s mask hums menacingly as it holds its supply in reserve\./,
        replacement: "$1的面罩发出充满威胁的嗡嗡声,同时储备着能量.",
    },
    {
        regex: /(.+)'s mask clicks and turns itself back on\./,
        replacement: "$1的面罩发出咔嚓声,然后重新运作了.",
    },
    {
        regex: /(.+) reloads (.+)'s mask and turns it back on, pumping gas back into (.+) lungs\./,
        replacement: "$1重新装载了$2的面罩并将其打开,把气体重新泵入$3的肺部.",
    },
    {
        regex: /(.+) switches on (.+)'s mask, filling (.+) lungs\./,
        replacement: "$1打开了$2的面罩,使气体充满$3的肺部.",
    },
    {
        regex: /(.+) switches off (.+)'s mask, halting the flow of gas\./,
        replacement: "$1关掉了$2的面罩,阻断了气体的流动.",
    },
    {
        regex: /(.+)'s eyes widen as (.+) mask activates, slowly filling (.+) lungs with its drug\./,
        replacement: "$1的眼睛睁大,随着$2的面罩启动,慢慢地用其药物充满$3的肺部.",
    },
    {
        regex: /(.+) takes a deep breath of cool, clean air as (.+) mask is removed\./,
        replacement: "当$2的面罩被取下时,$1深吸了一口凉爽、清新的空气.",
    },
    {
        regex: /(.+)'s mask hisses quietly as it runs out of its supply of gas\./,
        replacement: "$1的面罩在气体供应耗尽时安静地发出嘶嘶声.",
    },
    {
        regex: /(.+) groans helplessly as (.+) headset manipulates (.+) mind\./,
        replacement: "$1无助地呻吟,因为$2的耳机在操纵着$3的思想.",
    },
    {
        regex: /(.+) struggles to keep (.+) focus through the overwhelming influence of (.+) headset\./,
        replacement: "$1努力在$3耳机那压倒性的影响下保持$2的专注.",
    },
    {
        regex: /(.+) whimpers as (.+) headset erases (.+) own mind relentlessly\./,
        replacement: "$1抽泣着,因为$2的耳机在毫不留情地抹去$3自己的思想.",
    },
    {
        regex: /(.+)'s muscles relax limply as (.+) takes a deep breath through (.+) mask\./,
        replacement: "当$2通过$3的面罩深吸一口气时,$1的肌肉绵软地松弛下来.",
    },
    {
        regex: /(.+)'s eyes flutter weakly as (.+) inhales\./,
        replacement: "当$2吸气时,$1的眼睛无力地眨动.",
    },
    {
        regex: /(.+) struggles to keep (.+) drooping eyes open as (.+) mask continues to emit its sedative gas\./,
        replacement: "$1努力让$2下垂的眼睛睁开,而$3的面罩持续释放着镇静气体.",
    },
    {
        regex: /(.+) groans helplessly as (.+) mask sends another dose into (.+) lungs\./,
        replacement: "$1无助地呻吟,因为$2的面罩又向$3的肺部输送了一剂药物.",
    },
    {
        regex: /(.+) struggles to keep (.+) focus through the suggestible haze caused by (.+) mask\./,
        replacement: "$1努力在$3的面罩所导致的易受暗示的迷雾中保持$2的专注力.",
    },
    {
        regex: /(.+) whimpers as (.+) mask's drug pushes (.+) further out of (.+) own mind\./,
        replacement: "当$2面罩的药物将$3进一步推出$4自己的思维时,$1抽泣起来.",
    },
    {
        regex: /(.+)'s spine tingles as (.+) takes a deep breath through (.+) mask\./,
        replacement: "当$2通过$3面罩深吸一口气时,$1的脊椎感到一阵刺痛.",
    },
    { regex: /(.+) lets out a muffled moan as (.+) inhales\./, replacement: "当$2吸气时,$1发出一声低沉的呻吟." },
    {
        regex: /(.+)'s sensitive areas burn hot as (.+) breathes through (.+) mask\./,
        replacement: "当$2通过$3面罩呼吸时,$1的敏感区域灼热起来.",
    },
    {
        regex: /(.+) sighs with relief as (.+) takes a deep gulp of healing mist\./,
        replacement: "当$2深吸一口治疗雾气时,$1宽慰地叹了口气.",
    },
    {
        regex: /(.+) feels a tingle across (.+) skin as (.+) mask heals them\./,
        replacement: "当$2的面罩为$1治疗时,$1感觉自己的皮肤一阵刺痛.",
    },
    {
        regex: /(.+) lets out a quiet moan as (.+) mask releases a healing mist into (.+) lungs\./,
        replacement: "当$2的面罩向$3的肺部释放治疗雾气时,$1轻轻呻吟.",
    },
    { regex: /(.+)'s whimpers, (.+) tongue held tightly\./, replacement: "$1呜咽着,$2的舌头被紧紧地含着." },
    { regex: /(.+) strains, trying to pull (.+) tongue free\./, replacement: "$1使劲,试图把$2的舌头拉出来." },
    { regex: /(.+) starts to drool, (.+) tongue held fast\./, replacement: "$1开始流口水,$2的舌头被紧紧固定住." },
    { regex: /(.+) wiggles (.+) nose\./, replacement: "$1晃动着$2的鼻子." },
    { regex: /(.+) wiggles (.+) nose with a small frown\./, replacement: "$1微微皱着眉,晃动了一下$2的鼻子." },
    { regex: /(.+) sneezes in surprise\./, replacement: "$1惊讶地打了个喷嚏." },
    { regex: /(.+) looks crosseyed at (.+) nose\./, replacement: "$1斜着眼看向$2的鼻子." },
    { regex: /(.+) wiggles (.+) nose with a squeak\./, replacement: "$1伴随着吱吱声扭动着$2的鼻子." },
    { regex: /(.+) meeps\!/, replacement: "$1发出了吱吱声!" },
    { regex: /(.+) swats at (.+)'s hand\./, replacement: "$1拍打了$2的手." },
    {
        regex: /(.+) covers (.+) nose protectively, squinting at (.+)\./,
        replacement: "$1保护性地捂住$2的鼻子,眯着眼看向$3.",
    },
    { regex: /(.+) snatches (.+)'s booping finger\./, replacement: "$1一把抓住$2正在轻戳的手指." },
    { regex: /(.+)'s nose overloads and shuts down\./, replacement: "$1的鼻子超负荷运转然后停止了." },
    { regex: /(.+) struggles in (.+) bindings, huffing\./, replacement: "$1在$2的捆绑中挣扎,大口喘气." },
    { regex: /(.+) frowns and squirms in (.+) bindings\./, replacement: "$1皱着眉在$2的捆绑中扭动." },
    { regex: /(.+) whimpers in (.+) bondage\./, replacement: "$1在$2的束缚中呜咽." },
    { regex: /(.+) groans helplessly\./, replacement: "$1无奈地呻吟." },
    { regex: /(.+) whines and wiggles in (.+) bondage\./, replacement: "$1在$2的束缚中呜呜叫并扭动." },
    { regex: /(.+)'s mouth moves silently\./, replacement: "$1的嘴默默地动着." },
    { regex: /(.+)'s mouth moves without a sound\./, replacement: "$1的嘴动了但没有声音." },
    { regex: /(.+)'s whimpers inaudibly, unable to breathe\./, replacement: "$1无声地呜咽着,无法呼吸." },
    { regex: /(.+) groans and convulses\./, replacement: "$1痛苦地呻吟并痉挛." },
    { regex: /(.+) shudders as (.+) lungs burn\./, replacement: "$1因肺部灼热而颤抖,$2想要吸入空气." },
    { regex: /(.+) gasps and gulps for air\./, replacement: "$1大口喘息并拼命吸气." },
    {
        regex: /(.+)'s lungs expand hungrily as (.+) gasps in air\./,
        replacement: "$1的肺部在$2喘息着吸气时饥渴地扩张着.",
    },
    { regex: /(.+) gasps for air with a whimper\./, replacement: "$1伴着一声呜咽艰难地喘气吸气." },
    {
        regex: /(.+) coughs as (.+) collar pushes against (.+) throat\./,
        replacement: "当$2的项圈紧压$3的喉咙时,$1咳嗽起来.",
    },
    {
        regex: /(.+) gulps as (.+) feels the tight collar around (.+) neck\./,
        replacement: "$1在$2感觉到脖子上的紧项圈时,$3咽了咽口水.",
    },
    {
        regex: /(.+) shifts nervously in (.+) tight collar\./,
        replacement: "$1在$2的紧项圈里紧张地扭动.",
    },
    {
        regex: /(.+) trembles, very conscious of the tight collar around (.+) neck\./,
        replacement: "$1颤抖着,十分清楚地感受到$2脖子上的紧项圈.",
    },
    {
        regex: /(.+) huffs uncomfortably in (.+) tight collar\./,
        replacement: "$1在$2的紧项圈里不舒服地喘着气.",
    },
    {
        regex: /(.+) whimpers pleadingly as (.+) struggles to take a full breath\./,
        replacement: "每当$2艰难地想要进行一次完整的呼吸时,$1都会可怜巴巴地呜咽着.",
    },
    { regex: /(.+) chokes against (.+) collar, moaning softly\./, replacement: "$1被$2的项圈紧紧勒住,发出轻声呻吟." },
    {
        regex: /(.+)'s eyes flutter weakly as (.+) collar presses into (.+) neck\./,
        replacement: "当$2的项圈紧压在$3的脖子上时,$1的眼睛虚弱地眨动着.",
    },
    {
        regex: /(.+) tries to focus on breathing, each inhale an effort in (.+) collar\./,
        replacement: "$1试图专注于呼吸,然而在$2的项圈中每次吸气都很费力.",
    },
    {
        regex: /(.+)'s eyes flutter weakly as (.+) collar presses into (.+) neck\./,
        replacement: "当$2的项圈紧压在$3的脖子上时,$1的眼睛虚弱地眨动着.",
    },
    {
        regex: /(.+) tries to focus on breathing, each inhale an effort in (.+) collar\./,
        replacement: "$1试图专注于呼吸,然而在$2的项圈中每次吸气都很费力.",
    },
    {
        regex: /(.+)'s eyes have trouble focusing, as (.+) chokes and gets lightheaded\./,
        replacement: "$1的眼睛难以聚焦,因为$2窒息并感到头晕.",
    },
    {
        regex: /(.+)'s eyes flutter as (.+) fights to keep control of (.+) senses\.\.\./,
        replacement: "当$2努力保持对$3感官的控制时,$1的眼睛会眨动……",
    },
    { regex: /(.+) whimpers and struggles to stay awake\.\.\./, replacement: "$1轻声呜咽着,努力保持清醒……" },
    {
        regex: /(.+) can feel (.+) eyelids grow heavy as (.+) drifts on the edge of trance\.\.\./,
        replacement: "$1能感觉到$2的眼皮愈发沉重,$3在恍惚的边缘游离……",
    },
    {
        regex: /(.+) lets out a low moan as (.+) muscles relax and (.+) starts to drop\.\.\./,
        replacement: "$2的肌肉松弛,发出一声低吟,$3的身体开始逐渐下垂……",
    },
    {
        regex: /(.+)'s eyes flutter as (.+) fights to keep them open\.\.\./,
        replacement: "$1的眼睛眨动着,而$2努力想让它们保持睁开的状态……",
    },
    {
        regex: /(.+) yawns and struggles to stay awake\.\.\./,
        replacement: "$1打着哈欠,努力保持清醒……",
    },
    {
        regex: /(.+) can feel (.+) eyelids grow heavy as (.+) drifts on the edge of sleep\.\.\./,
        replacement: "$1能感觉到$2的眼皮变得沉重,好像$3正在睡眠的边缘游离……",
    },
    {
        regex: /(.+) takes a deep, relaxing breath as (.+) muscles relax and (.+) eyes start to droop\.\.\./,
        replacement: "$1深吸了一口气,此时$2的肌肉逐渐放松,$3的眼睛开始耷拉……",
    },
    {
        regex: /(.+) takes another deep breath through (.+) gag\.\.\./,
        replacement: "$1通过$2的塞口物又深吸了一口气……",
    },
    {
        regex: /(.+) exhales slowly, fully relaxed\.\.\./,
        replacement: "$1缓缓地呼气,完全放松了下来……",
    },
    { regex: /(.+)'s muscles twitch weakly in (.+) sleep\.\.\./, replacement: "$1在$2的睡眠中肌肉微弱地抽动着……" },
    { regex: /(.+) moans softly and relaxes\.\.\./, replacement: "$1轻声呻吟着,然后逐渐放松下来……" },
    { regex: /(.+) fires a net wildly\./, replacement: "$1胡乱地射出一张网." },
    { regex: /(.+) fires at themselves point blank\./, replacement: "$1近距离朝自己开火." },
    { regex: /(.+) fires a net at (.+)\./, replacement: "$1向$2发射一张网." },
    {
        regex: /(.+) barely trembles, unable to move (.+) mouth or make a sound\.\.\./,
        replacement: "$1微微颤抖着,无法移动$2的嘴巴或发出声音……",
    },
    {
        regex: /(.+)'s eyes plead helplessly as (.+) muscles refuse to obey\.\.\./,
        replacement: "$2的肌肉不听使唤,$1的眼睛无助地恳求着……",
    },
    {
        regex: /(.+) manages to muster a quiet whimper, (.+) body held fast\.\.\./,
        replacement: "$1成功地勉强发出一声安静的呜咽,$2的身体被牢牢地控制住……",
    },
    {
        regex: /(.+)'s eyes widen as they try to speak without success\.\.\./,
        replacement: "$1的眼睛睁大,他们试图说话却没有成功……",
    },
    {
        regex: /(.+) looks around helplessly, unable to make a sound\.\.\./,
        replacement: "$1无助地环顾四周,发不出声音……",
    },
    { regex: /(.+)'s mouth moves in silence\.\.\./, replacement: "$1的嘴巴在寂静中动着……" },
    { regex: /(.+)'s mouth moves silently\.\.\./, replacement: "$1的嘴巴默默地动着……" },
    {
        regex: /(.+) whimpers, struggling in (.+) bindings and unable to speak\.\.\./,
        replacement: "$1呜咽着,在$2的捆绑中挣扎,无法言语……",
    },
    {
        regex: /(.+)'s eyes widen as they squirm in (.+) bondage, only a gentle moan escaping\.\.\./,
        replacement: "$1的眼睛睁得大大的,因为$2的身体在束缚中扭动着,无法动弹.$2只是轻轻地呻吟着,仿佛在忍受痛苦.",
    },
    {
        regex: /(.+) tries (.+) best to speak, but has to resign themselves to mearly a bound whimper\.\.\./,
        replacement: "无论$1如何竭尽全力地发声,最终却也只能发出被束缚着的微弱呜咽声……",
    },
    {
        regex: /(.+) squirms in (.+) bindings, (.+) mouth moving in silence\.\.\./,
        replacement: "$1在$2的束缚中扭动挣扎,$3的嘴巴无声地活动着……",
    },
    {
        regex: /(.+)'s eyelids flutter as a thought tries to enter (.+) blank mind\.\.\./,
        replacement: "当一个想法试图进入$2空白的脑海时,$1的眼皮会不由自主地颤动……",
    },
    {
        regex: /(.+) sways weakly in (.+) place, drifting peacefully\.\.\./,
        replacement: "$1在$2的地方无力地摇晃着,平静地飘荡……",
    },
    {
        regex: /(.+) trembles as something deep and forgotten fails to resurface\.\.\./,
        replacement: "$1颤抖着,因为某些深藏且被遗忘的东西未能重新浮现……",
    },
    {
        regex: /(.+) moans softly as (.+) drops even deeper into trance\.\.\./,
        replacement: "当$2陷入更深的恍惚状态时,$1轻声呻吟着……",
    },
    {
        regex: /(.+) quivers, patiently awaiting something to fill (.+) empty head\.\.\./,
        replacement: "$1颤抖着,耐心地等待着有什么来填补$2空洞的头脑……",
    },
    {
        regex: /(.+) stares blankly, (.+) mind open and suggestible\.\.\./,
        replacement: "$1茫然地凝视着,$2的思维敞开且易受影响……",
    },
    {
        regex: /(.+)'s eyelids flutter gently, awaiting a command\.\.\./,
        replacement: "$1的眼皮轻轻颤动,等待着指令……",
    },
    {
        regex: /(.+) trembles with a quiet moan as (.+) yearns to obey\.\.\./,
        replacement: "$1伴随着轻声呻吟微微颤抖,因为$2渴望服从……",
    },
    {
        regex: /(.+)'s eyes widen as (.+) gag inflates to completely fill (.+) throat\./,
        replacement: "当$2的塞口物膨胀至完全填满$3的喉咙时,$1的眼睛睁得大大的.",
    },
    { regex: /(.+) splutters and gasps for air around (.+) gag\./, replacement: "$1喷溅着并在$2口塞周围大口喘气." },
    {
        regex: /(.+)'s eyes flutter as (.+) collar starts to tighten around (.+) neck with a quiet hiss\./,
        replacement: "当$2的项圈开始悄无声息地在$3的脖子周围收紧时,$1的眼睛开始扑闪.",
    },
    {
        regex: /(.+) gasps for air as (.+) collar presses in around (.+) neck with a hiss\./,
        replacement: "$1因呼吸困难而大口喘气,$2的项圈带着嘶嘶声紧紧压在$3的脖子周围.",
    },
    {
        regex: /(.+)'s face runs flush, choking as (.+) collar hisses, barely allowing any air to (.+) lungs\./,
        replacement: "$1的脸涨得通红,在$2项圈发出嘶嘶声时被呛得喘不过气来,项圈几乎不让任何空气进入$3的肺部.",
    },
    {
        regex: /(.+) chokes and gasps desperately as (.+) collar slowly releases some pressure\./,
        replacement: "$1艰难地喘着粗气,拼命地吸气,这时$2项圈慢慢地释放了一些压力.",
    },
    {
        regex: /(.+)'s collar opens a little as (.+) lets out a moan, gulping for air\./,
        replacement: "$1的项圈稍稍打开了一些,$2发出一声呻吟,大口地吞咽着空气.",
    },
    {
        regex: /(.+) whimpers thankfully as (.+) collar reduces most of its pressure around (.+) neck\./,
        replacement: "$1满怀感激地呜咽着,因为$2的项圈减轻了环绕在$3脖子周围的大部分压力.",
    },
    {
        regex: /(.+) takes a deep breath as (.+) collar releases its grip with a hiss\./,
        replacement: "$1深吸了一口气,因为$2的项圈伴随着嘶嘶声松开了束缚.",
    },
    {
        regex: /(.+) gulps thankfully as the threat to (.+) airway is removed\./,
        replacement: "当折磨$1许久的窒息感消失后,她庆幸地长舒了一口气.",
    },
    {
        regex: /(.+)'s eyes start to roll back, gasping and choking as (.+) collar presses in tightly and completely with a menacing hiss\./,
        replacement:
            "$1的眼睛开始翻白,她的颈部被项圈死死勒入肉中,伴随着痛苦的喘息与项圈的收紧声,她再也无法获取一丁点空气.",
    },
    {
        regex: /(.+)'s eyes flutter with a groan, unable to get any air to (.+) lungs\./,
        replacement: "$1的眼睛伴随着呻吟微微颤动,无法使任何空气进入$2的肺部.",
    },
    {
        regex: /(.+) chokes and spasms, (.+) collar holding tight\./,
        replacement: "$1窒息并痉挛,$2项圈紧紧地勒着.",
    },
    {
        regex: /(.+) chokes and spasms, (.+) gripping (.+) throat relentlessly\./,
        replacement: "$1窒息并痉挛,$2无情地紧握着$3的喉咙.",
    },
    {
        regex: /(.+) convulses weakly with a moan, (.+) eyes rolling back as the collar hisses impossibly tighter\./,
        replacement: "$1痛苦地抽搐着,嘴里发出微弱的呻吟声,项圈发出不可能更紧的嘶嘶声,$2的眼睛开始翻白.",
    },
    {
        regex: /As (.+) collapses unconscious, (.+) collar releases all of its pressure with a long hiss\./,
        replacement: "当$1失去意识昏倒时,$2项圈伴随着一声长长的嘶嘶声释放了所有的压力.",
    },
    {
        regex: /As (.+) collapses unconscious, (.+) releases (.+) neck\./,
        replacement: "当$1昏倒失去知觉时,$2松开了$3的脖子.",
    },
    {
        regex: /As (.+) slumps unconscious, (.+) nose plugs fall out\./,
        replacement: "当$1无力地倒下失去意识时,$2的鼻塞掉了出来.",
    },
    {
        regex: /(.+) quivers with one last attempt to stay awake\.\.\./,
        replacement: "$1伴随着最后一次保持清醒的尝试而颤抖着……",
    },
    {
        regex: /(.+) trembles weakly with one last attempt to maintain (.+) senses\.\.\./,
        replacement: "$1虚弱地颤抖着,做着最后一次维持$2意识的尝试……",
    },
    { regex: /(.+)'s frowns as (.+) fights to remain conscious\./, replacement: "$1皱起眉头,因为$2在努力保持清醒." },
    {
        regex: /(.+)'s eyes immediately defocus, (.+) posture slumping slightly as (.+) loses control of (.+) body at the utterance of a trigger word\./,
        replacement: "$1的眼睛立刻失去焦点,当$2说出触发词时,$3的姿势轻微下垂,$3失去了对$4身体的控制.",
    },
    {
        regex: /(.+)'s eyes glaze over, (.+) posture slumping weakly as (.+) loses control of (.+) body\./,
        replacement: "$1的眼睛变得无神,$2的姿势虚弱地垮下,因为$3失去了对$4身体的控制.",
    },
    {
        regex: /(.+) reboots, blinking and gasping as (.+) regains (.+) senses\./,
        replacement: "$1重新启动,眨着眼并大口喘气,当$2重新获得$3的感知时.",
    },
    {
        regex: /(.+) blinks, shaking (.+) head with confusion as (.+) regains (.+) senses\./,
        replacement: "$1眨了眨眼,困惑地摇了摇$2的头,当$3重新获得$4的感知时.",
    },
    {
        regex: /(.+) gasps, blinking and blushing with confusion\./,
        replacement: "$1喘着气,眨着眼,因困惑而脸红.",
    },
    {
        regex: /(.+) concentrates, breaking the hold the previous trigger word held over (.+)\./,
        replacement: "$1集中精力,打破了之前触发词对$2的掌控.",
    },
    {
        regex: /(.+)'s eyes dart around, (.+) world suddenly plunged into darkness\./,
        replacement: "$1的眼睛快速转动,$2的世界突然陷入一片黑暗.",
    },
    {
        regex: /(.+) frowns as (.+) is completely deafened\./,
        replacement: "$1皱起眉头,因为$2完全丧失了听力.",
    },
    {
        regex: /(.+)'s eyes widen in a panic as (.+) muscles seize in place\./,
        replacement: "$1惊慌地睁大双眼,因为$2的肌肉僵在了原地.",
    },
    {
        regex: /(.+) is unable to fight the spell's hypnotizing influence, slumping weakly as (.+) eyes go blank\./,
        replacement: "$1无法抵御咒语的催眠作用,当$2的眼睛变得空洞时,无力地瘫倒.",
    },
    {
        regex: /(.+)'s protests suddenly fall completely silent\./,
        replacement: "$1的抗议突然彻底安静了下来.",
    },
    {
        regex: /(.+)'s mouth moves in protest but not a single sound escapes\./,
        replacement: "$1的嘴巴在抗议地动着,但没有一丝声音传出.",
    },
    {
        regex: /(.+) succumbs to the spell's overwhelming pressure, (.+) eyes closing as (.+) falls unconscious\./,
        replacement: "$1屈服于咒语那巨大的压力,当$3失去意识时,$2的眼睛闭上了.",
    },
    {
        regex: /(.+) gasps, blinking as the magic affecting (.+) is removed\./,
        replacement: "当$1身上的负面效果被消除时,$2大口喘气的同时眨了眨眼睛.",
    },
    {
        regex: /(.+) gasps, blinking as any magic affecting (.+) is removed\./,
        replacement: "当$1身上的负面效果被消除时,$2大口喘气的同时眨了眨眼睛.",
    },
    {
        regex: /(.+) trembles as (.+) clothing shimmers and morphs around (.+)\./,
        replacement: "$1颤抖着,当$2的衣物闪烁并在$3周围发生形态变化时.",
    },
    {
        regex: /(.+) squeaks as (.+) clothing shimmers and morphs around (.+)\./,
        replacement: "当$1的衣服闪烁并在$2周围变形的时候,$1发出短促的尖叫.",
    },
    { regex: /(.+) trembles as (.+) body shimmers and morphs\./, replacement: "$1颤抖着,当$2的身体闪烁并变形时." },
    { regex: /(.+) squeaks as (.+) body shimmers and morphs\./, replacement: "$1尖叫着,当$2的身体闪烁并变形时." },
    { regex: /(.+) squirms as (.+) arousal is paired\./, replacement: "$1扭动着,当$2的高潮被同步到自己身上时." },
    {
        regex: /(.+) quivers as (.+) feels (.+) impending denial\./,
        replacement: "$1颤抖着,当$2感觉到$3即将来临的拒绝时.",
    },
    {
        regex: /(.+) whimpers as (.+) feels (.+) impending denial\./,
        replacement: "$1呜咽着,当$2感受到$3即将到来的拒绝时.",
    },
    {
        regex: /(.+)'s muscles slump limply once more as another dose of chloroform is applied\./,
        replacement: "$1的肌肉再次绵软地松弛下来,当又一剂氯仿被使用时.",
    },
    {
        regex: /(.+) eyes go wide as the sweet smell of ether fills (.+) nostrils\./,
        replacement: "$1的眼睛睁得很大,当乙醚的甜香充斥着$2的鼻孔时.",
    },
    {
        regex: /(.+) slumps back in (.+) sleep as another dose of ether assails (.+) senses\./,
        replacement: "$1在另一剂乙醚冲击$3的感官时,$2又陷入了睡眠中.",
    },
    {
        regex: /(.+), unable to continue holding (.+) breath, takes a desparate gasp through the chemical-soaked cloth\./,
        replacement: "$1,无法继续屏住$2的呼吸,透过浸满化学制剂的布绝望地大口喘气.",
    },
    {
        regex: /(.+)'s body trembles as the chloroform sinks deep into (.+) mind\./,
        replacement: "$1的身体颤抖着,当氯仿深深侵入$2的脑海时.",
    },
    {
        regex: /(.+) takes a deep, calm breath as (.+) chloroform starts to lose its potency\.\.\./,
        replacement: "$1深吸一口气,保持平静,当$2的氯仿开始失去药效……",
    },
    {
        regex: /(.+) continues to sleep peacefully as the cloth is removed\.\.\./,
        replacement: "$1继续平静地睡着,当这块布被移除时……",
    },
    {
        regex: /(.+) gulps in fresh air as the cloth is removed\.\.\./,
        replacement: "$1在布料被移除时大口吞咽着新鲜空气……",
    },
    { regex: /(.+) starts to stir with a gentle moan\.\.\./, replacement: "$1开始缓慢地挣扎着, 轻轻地呻吟着." },
    { regex: /(.+)'s eyes flutter and start to open sleepily\.\.\./, replacement: "$1的眼睛微微颤动,开始困倦地睁开……" },
    {
        regex: /(.+) moans and trembles in frustration as (.+) is held right at the edge\.\.\./,
        replacement: "$1在高潮的边缘沮丧地呻吟并颤抖着……",
    },
    { regex: /(.+) leads (.+) out of the room by the ear\./, replacement: "$1揪着$2的耳朵把其带出房间." },
    { regex: /(.+) roughly pulls (.+) out of the room by the arm\./, replacement: "$1粗暴地拽着$2的胳膊把其带出房间." },
    { regex: /(.+) tugs (.+) out of the room by the tongue\./, replacement: "$1拽着$2的舌头离开房间." },
    { regex: /(.+) drags (.+) out of the room with a wince\./, replacement: "$1皱着眉把$2拖出房间." },
    { regex: /(.+) feels as though (.+) abilities are enhanced\./, replacement: "$1感觉好像$2的能力得到了增强." },
    { regex: /(.+) feels as though (.+) abilities are deminished\./, replacement: "$1感觉好像$2的能力被削弱了." },
    { regex: /(.+)'s abilities return to normal\./, replacement: "$1的能力回归正常." },
    { regex: /(.+) blinks and returns to (.+) senses\./, replacement: "$1眨了眨眼,回到了$2的感知中." },
    {
        regex: /(.+)'s breathing calms down as (.+) regains control of (.+) arousal\./,
        replacement: "$1的呼吸平稳下来,当$2重新掌控了$3的高潮状态时.",
    },
    { regex: /(.+) slumps weakly as (.+) slips into unconciousness\./, replacement: "$1虚弱地瘫倒,当$2陷入昏迷时." },
    { regex: /(.+)'s eyelids flutter and start to open sleepily\.\.\./, replacement: "$1的眼皮颤动,开始困倦地睁开……" },
    {
        regex: /(.+)'s body reshapes and grows to twice its size\./,
        replacement: "$1 的身体重新塑形并且长大到原来的两倍.",
    },
    {
        regex: /(.+)'s body reshapes and shrinks to half its size\./,
        replacement: "$1 的身体重新塑形并且缩小到原来的一半.",
    },
    { regex: /(.+)'s body returns to its normal size\./, replacement: "$1 的身体回归正常大小." },
    { regex: /(.+)'s (.+) engulfs (.+)\./, replacement: "$1 的 $2 吞噬了 $3 ." },
    {
        regex: /(.+) struggles in (.+) bindings, unable to reach (.+) collar's controls\./,
        replacement: "$1 在 $2 的束缚中挣扎,无法够到 $3 项圈的控制装置.",
    },
    {
        regex: /(.+) struggles in (.+) bindings, unable to reach (.+)'s collar controls\./,
        replacement: "$1 在 $2 的束缚中挣扎,无法够到 $3 的项圈控制装置.",
    },
    { regex: /(.+) presses a button on (.+) collar\./, replacement: "$1 按下 $2 项圈上的一个按钮." },
    { regex: /(.+) presses a button on (.+)'s collar\./, replacement: "$1 按下 $2 的项圈上的一个按钮." },
    {
        regex: /(.+)\'s collar beeps and a computerized voice says "Access Denied\./,
        replacement: '$1 的项圈发出蜂鸣声,一个电脑化的声音说: "访问被拒绝."  ',
    },
    {
        regex: /(.+)\'s collar chimes and a computerized voice reads out\:\nCurrent Level\: (.+)\.\.\.\nCorrective Cycles: (.+)\.\.\.\nTighten Trigger\: \'(.+)\'\.\.\.\nLoosen Trigger\: \'(.+)\'\.\.\.\nRemote Access\: (.+)\.\.\./,
        replacement:
            "$1 的项圈发出鸣响,电脑化的声音读出: \n当前等级: $2……\n校正周期: $3……\n收紧触发器: '$4'……\n放松触发器: '$5'……\n远程访问: $6……",
    },
    { regex: /(.+) gives (.+) to (.+)\./, replacement: "$1 把 $2 给 $3 ." },
    {
        regex: /(.+) slowly waves (.+) in an intricate pattern, making sure (.+) follows along with (.+)/,
        replacement: "$1 慢慢地挥动着 $2 形成复杂的图案,确保 $3 跟随他们的 $4.",
    },
    {
        regex: /(.+) repeats an indecipherable phrase, touching (.+) to (.+)'s (.+)/,
        replacement: "$1 重复着一个难以理解的咒语,将 $2 触碰到 $3 的 $4 .",
    },
    {
        regex: /(.+) holds both (.+) and (.+)'s (.+) tightly, energy traveling from one to the other/,
        replacement: "$1 紧紧地握着 $2 和 $3 的 $4 ,能量在两者之间传递.",
    },
    {
        regex: /(.+) waves (.+) in an intricate pattern and casts (.+) on (.+)/,
        replacement: "$1 挥动 $2 形成复杂的图案,并在 $4 上施展 $3 .",
    },
    {
        regex: /(.+) chants an indecipherable phrase, pointing (.+) at (.+) and casting (.+)/,
        replacement: "$1 吟诵着一个难以理解的咒语,将 $2 指向 $3 并施展 $4 .",
    },
    {
        regex: /(.+) chants an indecipherable phrase, tapping (.+) (.+) against (.+) and casting (.+)/,
        replacement: "$1 吟唱着一句难以理解的咒语, 用$2的$3轻触, 并施展出了$4魔法.",
    },
    {
        regex: /(.+) aims (.+) at (.+) and, with a grin, casts (.+)/,
        replacement: "$1 把 $2 瞄准 $3 ,带着笑容施展 $4 .",
    },
    {
        regex: /(.+) struggles to wield (.+)'s (.+), (.+) spell backfiring\./,
        replacement: "$1 挣扎着挥动 $2 的 $3 ,$4 法术产生反噬.",
    },
    {
        regex: /(.+) struggles to wield (.+)'s (.+), (.+) spell fizzling with no effect\./,
        replacement: "$1 挣扎着挥动 $2 的 $3 ,$4 法术毫无效果地消散了.",
    },
    { regex: /(.+) casts (.+) at (.+) but it seems to fizzle\./, replacement: "$1 向 $3 施放 $2 ,但似乎失效了." },
    {
        regex: /(.+) tries to explain the details of (.+) to (.+) but (.+) don't seem to understand\./,
        replacement: "$1 试图向 $3 解释 $2 的细节,但 $4 似乎不理解.",
    },
    {
        regex: /(.+) tries to teach (.+) (.+) but (.+) don't seem to have ̶i̶n̶s̶t̶a̶l̶l̶e̶d̶ embraced Magic™\./,
        replacement: "$1 试图教 $2 $3 ,但 $4 似乎没有接纳 Magic™ .",
    },
    {
        regex: /(.+)\'s (.+) fizzles when cast on (.+), none of its effects allowed to take hold\./,
        replacement: "$1 的 $2 在对 $3 施放时失效了,没有任何效果产生.",
    },
    {
        regex: /(.+)\'s paired spell fizzles as it attempts to pair with (.+)\./,
        replacement: "$1 的配对法术在尝试与 $2 配对时失效了.",
    },
    { regex: /(.+) squirms as (.+) arousal is paired\./, replacement: "$1 扭动着,当 $2 的兴奋被配对时." },
    {
        regex: /(.+) lets out a quiet gasp as the pleasure center of (.+) mind starts to tingle\./,
        replacement: "$1 发出一声轻轻的喘息,因为 $2 心灵的愉悦中心开始有刺痛感.",
    },
    {
        regex: /(.+)\'s mind is already full of spells. (.+) must forget one before (.+) can learn (.+)\./,
        replacement: "$1 的脑海中已经充满了咒语.$2 必须先忘记一个,$3 才能学会 $4 .",
    },
    {
        regex: /(.+) already knows a spell called (.+) and ignores (.+) new instructions\./,
        replacement: "$1 已经知道一个叫做 $2 的咒语,并且忽略了 $3 的新指令.",
    },
    {
        regex: /(.+) grins as they finally understand the details of (.+) and memorizes it for later\./,
        replacement: "$1 咧嘴笑了,因为他们终于理解了 $2 的细节,并将其记住以备后用.",
    },
    { regex: /(.+) gulps down (.+)'s (.+)\./, replacement: "$1 吞下了 $2 的 $3 ." },
    { regex: /(.+) leads (.+) out of the room by the (.+)\./, replacement: "$1 牵着 $2 走出房间." },
    { regex: /(.+) leads (.+) and (.+) out of the room\./, replacement: "$1 带着 $2 和 $3 走出房间." },
    { regex: /(.+) drags (.+) out of the room with a wince\./, replacement: "$1 拖着 $2 一边皱着眉走出房间." },
    { regex: /(.+)\'s (.+) state wears off\./, replacement: "$1 的 $2 状态消失了." },
    {
        regex: /(.+) successfully defends against (.+)'s (.+) attempt to force (.+) to drink (.+), spilling drink all over\./,
        replacement: "$1 成功地抵御了 $2 的 $3 企图强迫 $4 喝 $5 ,饮料洒得到处都是.",
    },
    {
        regex: /(.+) manages to wrest (.+)'s (.+) out of (.+) grasp\!/,
        replacement: "$1 设法夺过 $2 的 $3 从 $4 的手中!",
    },
    { regex: /(.+) makes an activity roll and gets: (.+)/, replacement: "$1 进行一次活动检定并获得: $2 " },
    {
        regex: /(.+) makes an activity check attack against (.+)\!/,
        replacement: "$1 进行一次活动检定攻击,攻击目标是 $2!",
    },
    { regex: /(.+) makes an activity check defending from (.+)\!/, replacement: "$1进行一次活动检定防御, 防御来自$2!" },
    {
        regex: /(.+) manages to get (.+) past (.+)'s (.+) lips, forcing (.+) to swallow\./,
        replacement: "$1 设法让 $2 经过 $3 的 $4 嘴唇,迫使 $5 吞咽.",
    },
    {
        regex: /(.+) lets out a long low moan as (.+)'s drink burns pleasurably down (.+) throat\./,
        replacement: "$1 发出一声长长的低吟,当 $2 的饮料愉快地灼烧着 $3 的喉咙.",
    },
    {
        regex: /(.+) gulps and quivers as (.+) body is slowly flooded with (.+)'s aphrodisiac\./,
        replacement: "$1 大口吞咽并颤抖着,当 $2 的身体慢慢被 $3 的催情剂淹没.",
    },
    {
        regex: /(.+) gasps, snapping back into (.+) senses confused and blushing\./,
        replacement: "$1 喘息着,突然回到 $2 的意识中,感到困惑并脸红.",
    },
    {
        regex: /(.+) groans as air is allowed back into (.+) lungs\./,
        replacement: "$1 呻吟着,当空气重新回到 $2 的肺部.",
    },
    {
        regex: /(.+)\'s eyes flutter as (.+) wraps (.+) hand around (.+) neck\./,
        replacement: "$1 的眼睛眨动着,当 $2 用 $3 的手环绕着 $4 的脖子.",
    },
    {
        regex: /(.+) gasps for air as (.+) tightens (.+) grip on (.+) neck\./,
        replacement: "$1 喘着粗气想要呼吸,当 $2 收紧 $3 对 $4 脖子的控制.",
    },
    {
        regex: /(.+)\'s face runs flush, choking as (.+) presses firmly against (.+) neck, barely allowing any air to (.+) lungs\./,
        replacement: "$1 的脸涨得通红,窒息着,当 $2 紧紧压在 $3 的脖子上,几乎不让任何空气进入 $4 的肺里.",
    },
    {
        regex: /(.+) gasps in relief as (.+) releases (.+) pressure on (.+) neck\./,
        replacement: "$1 如释重负地喘着气,当 $2 减轻对 $4 脖子的压力时.",
    },
    { regex: /(.+) chokes and spasms, struggling in (.+) gag\./, replacement: "$1 呛着并痉挛,在 $2 中挣扎." },
    {
        regex: /(.+) convulses weakly with a moan, (.+) eyes rolling back as (.+) clenches around (.+) throat even tighter\./,
        replacement: "$1 虚弱地抽搐着发出呻吟声, 当 $3 更紧地掐住 $4 的喉咙, $2 的眼睛翻白.",
    },
    {
        regex: /(.+) convulses weakly with a moan, (.+) eyes rolling back as (.+) lungs scream for air\./,
        replacement: "$1 虚弱地抽搐着并呻吟,$2 眼睛翻白,$3 的肺在渴求空气.",
    },
    {
        regex: /(.+) snaps back into (.+) senses at (.+)'s voice\./,
        replacement: "$1 突然回到 $2 的意识中,听到了 $3 的声音.",
    },
    {
        regex: /(.+)manages to get (.+) past (.+)'s (.+)lips, forcing (.+) to swallow\./,
        replacement: "$1 设法让 $2 经过 $3 的 $4 嘴唇,迫使 $5 吞咽.",
    },
    {
        regex: /(.+) manages to get (.+) past (.+)'s (.+) lips, forcing (.+) to swallow it\./,
        replacement: "$1 设法让 $2 经过 $3 的 $4 嘴唇,迫使 $5 吞咽它.",
    },
    {
        regex: /(.+) successfully defends against (.+)'s (.+) attempt to force (.+) to drink (.+)\./,
        replacement: "$1 成功抵御了 $2 的 $3 企图迫使 $4 喝下 $5 .",
    },
    {
        regex: /(.+) leads (.+) and (.+) out of the room by (.+) ears\./,
        replacement: "$1 带着 $2 和 $3 走出房间,拉着 $4 的耳朵.",
    },
    {
        regex: /(.+) roughly Pulls (.+) and (.+) out of the room by (.+) arms\./,
        replacement: "$1 粗暴地拉着 $2 和 $3 走出房间,抓住 $4 的手臂.",
    },
    {
        regex: /(.+) tugs (.+) and (.+) out of the room by (.+) tongues\./,
        replacement: "$1 拽着 $2 和 $3 走出房间,用 $4 的舌头.",
    },
    { regex: /(.+) tries (.+) best to escape from (.+)'s grip\.\.\./, replacement: "$1 竭尽全力从 $3 的控制中挣脱..." },
    {
        regex: /(.+)\'s eyes start to roll back with a groan as (.+) completely closes (.+) airway with (.+) hand\./,
        replacement: "$1 的眼睛开始翻白并呻吟,当 $2 用 $4 的手完全封闭 $3 的气道时.",
    },
    { regex: /(.+) grabs at (.+)'s (.+), trying to steal it\!/, replacement: "$1一把抓住$2的$3, 试图偷取它!" },
    {
        regex: /(.+) fails to steal (.+)'s (.+) and is dazed from the attempt\!/,
        replacement: "$1未能偷走$2的$3, 并且在尝试之后感到茫然失措!",
    },
    {
        regex: /(.+)'s leash seems to be cursed and slips out of (.+)'s hand\./,
        replacement: "$1的牵引绳似乎被诅咒了,从$2手中滑落.",
    },
    {
        regex: /(.+)'s eyes lock on to (.+) and (.+) follows (.+) out of the room obediently\./,
        replacement: "$1的目光锁定在$2上,接着$3顺从地跟随$4走出房间.",
    },
    {
        regex: /(.+) looks around, a little confused about how (.+) got here\./,
        replacement: "$1环顾四周,有点搞不清楚$2是怎么来到这里的.",
    },
    {
        regex: /(.+) moans quietly as (.+) slips back down under trance\.\.\./,
        replacement: "当$1再次陷入恍惚时,她低声呻吟起来……",
    },
    {
        regex: /(.+) gasps quietly as (.+) mind can suddenly form sentences once again\.\.\./,
        replacement: "$1轻轻地喘息着,$2的大脑突然又能组织句子了……",
    },
    { regex: /(.+) gasps as pleasure rushes over (.+)\./, replacement: "$1因极度的快感而喘息不已." },
    { regex: /(.+)'s mouth falls silent once again\.\.\./, replacement: "$1再次陷入沉默,嘴唇紧闭." },
    { regex: /(.+) gasps as pleasure (.+) over (.+)\./, replacement: "$1 因愉悦而喘息,(这种愉悦)笼罩着 $3." },
    {
        regex: /(.+)'s blank expression hides (.+) impending denial\./,
        replacement: "$1茫然的表情掩饰了$2他即将要否认的事实.",
    },
    {
        regex: /(.+)'s face begins to blush and (.+) breathing speeds up\./,
        replacement: "$1的脸开始泛红,$2呼吸也加快了.",
    },
    { regex: /(.+) struggles to perform some action\./, replacement: "$1挣扎着去做某个动作." },
    { regex: /(.+) starts to remove clothing from (.+) body\./, replacement: "$1开始从$2身上脱去衣服." },
    { regex: /(.+) moves their body into a pose obediently\./, replacement: "$1顺从地摆出一个姿势." },
    { regex: /(.+)'s eyes start to follow (.+)'s every movement\./, replacement: "$1的目光开始追随$2的一举一动." },
    { regex: /(.+) mouth starts to move automatically\./, replacement: "$1嘴巴开始不由自主地动起来." },
    {
        regex: /(.+) looks frustrated, their inability to both walk and talk preventing them from serving drinks./,
        replacement: "$1 看起来很沮丧,既不能走路也不能说话,这使得他们无法为客人提供饮料.",
    },
    { regex: /(.+) opens her mouth but no sound comes out./, replacement: "$1张开嘴,但发不出声音." },
    { regex: /(.+) transform the Power Staff into Staff/, replacement: "$1将能量杖转换为法杖." },
    { regex: /(.+) transform the Power Staff into Wand/, replacement: "$1能量杖变成魔杖." },
    {
        regex: /(.+) groans softly as (.+) is allowed speech once more\.\.\./,
        replacement: "$1再次获准说话时,$2轻轻地呻吟着……",
    },
    { regex: /(.+) mouth starts to move automatically\./, replacement: "$1的嘴巴开始不由自主地动起来." },
    { regex: /(.+) has accessed your remote settings\!/, replacement: "$1访问了您的远程设置!" },
    {
        regex: /(.+) waves (.+) in front of (.+), and with a sudden boop, casts (.+) on (.+), the spell's power also arcing to (.+)\./,
        replacement: '$ $1把$2的$3举到$4面前,突然用魔杖敲了一下,施展了"$5"咒语,咒语的力量也传到了$6身上.',
    },
    { regex: /(.+) successfully saves against (.+)'s \[(.+)\] (.+)\./, replacement: '$1成功抵御了$2的 [$3] "$4"咒语.' },
    {
        regex: /(.+) baps (.+) with (.+) and, with a grin, casts (.+), the spell's power also arcing to (.+)\./,
        replacement: '$1用$2的$4拍了拍$3,笑着施展了"$5"咒语,咒语的力量也传到了$6身上.',
    },
    {
        regex: /(.+) splutters and chokes\, struggling to breathe\./,
        replacement: "$1快要喘不过来了 ,咳得厉害 ,挣扎着想要呼吸.",
    },
    {
        regex: /(.+) trembled as pleasure rushes over (.+)\./,
        replacement: "当愉悦的感觉涌上$1的身体时 ,$2不由得颤抖起来.",
    },
    {
        regex: /(.+) grunts and moans, straining to breathe\./,
        replacement: "$1发出粗重的喘息声和呻吟声,努力呼吸着.",
    },
    {
        regex: /(.+) swallows (.+) (.+)\./,
        replacement: "$1喝下了$2的$3.",
    },
];

/**
 * 翻译动作文本
 * @type {TranslationFunction}
 */
export function translateActivityText(key) {
    if (!LSCGenabled()) return undefined;
    if (translation[key]) return translation[key];
    for (const { regex, replacement } of regexTranslations) {
        const match = regex.exec(key);
        if (match) {
            return replacement.replace(/\$(\d+)/g, (_, index) => translatePronouns(match[index]));
        }
    }
    return undefined;
}
