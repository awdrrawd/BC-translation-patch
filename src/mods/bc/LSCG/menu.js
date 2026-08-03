import { LSCGenabled } from "./enable";

const translation = {
    // LSCG
    "LSCG Settings": "LSCG 设置",
    // 通用设置第一页
    "General": "通用设置",
    "- LSCG General -": "- LSCG 全局设置 -",
    "LSCG Scripts Enabled:": "LSCG 功能开关:",
    "Enable LSCG Features.": "启用 LSCG 核心功能",
    "Block Settings While Restrained:": "束缚状态下禁用设置:",
    "Prevents LSCG settings access while restrained.": "处于束缚状态时禁止访问 LSCG 设置",
    "Immersive Conditions:": "沉浸式状态模拟:",
    "Applies a more restrictive set of conditional states while incapacitated by LSCG.":
        "当因 LSCG 效果丧失行动能力时，启用更严格的状态限制",
    "Blur While Edged:": "边缘控制视觉模糊:",
    "Apply extra blurring to the screen while edging.": "处于边缘控制状态时增加屏幕模糊效果",
    "Enable Lipstick Marks:": "启用唇印效果:",
    "Apply kiss marks when lipstick-wearing people kiss you on the cheek/forehead/neck.":
        "当涂有口红的角色亲吻你的脸颊/前额/颈部时显示唇印",
    "Dry Lipstick:": "防止留下唇印:",
    "Never apply kissmarks when you are the kisser.": "作为主动亲吻方时不会留下唇印",
    "Enable Boop Reactions:": "启用互动反应:",
    "Auto-react when booped.": "被轻触时自动做出反应",
    "Show Check Rolls:": "显示判定数值:",
    "If enabled, will display the attacker/defender roll values for activity checks.":
        "启用后将显示活动判定中的攻击方/防御方掷骰数值",
    "Share Public Craftings:": "公开自制物品:",
    "If enabled, other LSCG users in the room will be able to use your crafted items on other people.":
        "启用后，同房间的其他 LSCG 用户可使用你制作的物品",
    "Hide Resizing Effects:": "隐藏尺寸变化效果:",
    "If checked, you will not see any LSCG resizing effects. (eg. from magic)":
        "勾选后将隐藏所有尺寸变化特效（如魔法效果）",
    "Hide all Opacity Overrides:": "隐藏透明度特效:",
    "If checked, will skip any opacity override effects. (includes x-ray vision)":
        "勾选后将禁用所有透明度覆盖效果（包括透视视觉）",
    "Prevent Remote Opacity Changes:": "禁止远程修改透明度:",
    "If checked, other players will not be able to directly modify the opacity settings on your wardrobe items.":
        "勾选后其他玩家无法直接调整你服装的透明度设置",
    "Enable Clothed Erection Detection:": "启用衣物下勃起检测:",
    "If checked, you will get a private message if you can feel an erection during certain activities.":
        "勾选后，特定活动中感知到勃起时将收到私密提示",
    "Allow LSCG Leashing:": "允许束缚互动:",
    "Allow custom leashing from LSCG activities such as hand-holding, hypnosis, etc.":
        "允许通过牵手、催眠等 LSCG 互动建立束缚关系",
    "Enable Tamperproof Items:": "启用Tamperproof词条物品:",
    "Enable tamperproof features on crafted items you wear.": "为穿戴的自制物品启用防篡改保护",
    "Enable Chaotic/Evolving Items:": "启用Chaotic/Evolving词条物品:",
    "Enable chaotic/evolving features on crafted items you wear.": "为穿戴的自制物品启用混沌/进化特性",
    "Block DOGS Devious Padlocks:": "屏蔽DOGS挂锁:",
    "If checked, LSCG item applier (magic, cursed item, etc) will turn Devious Padlocks into regular Exclusive Padlocks on apply.":
        "勾选后，LSCG 物品应用（如魔法、诅咒物品等）将把Devious Padlocks转换为普通Exclusive Padlocks",
    "Enhance Map Lighting [EXPERIMENTAL]:": "增强地图照明 [实验性]:",
    "If checked, map lighting will become more dynamic based on light sources.":
        "勾选后，地图照明将根据光源变得更加动态",

    // 触发催眠第一页
    "Triggered Hypnosis": "指令触发式催眠",
    "- LSCG Triggered Hypnosis -": "- LSCG 指令催眠系统 -",
    "Enabled:": "功能开关:",
    "Enabled the Triggered Hypnosis Features.": "启用后将激活指令催眠系统功能",
    "Random Trigger:": "随机触发词:",
    "If enabled, your trigger word will be selected from a list of random english words.":
        "启用后将从随机英文词库中选取触发词",
    "Trigger Words:": "催眠触发词:",
    "Custom list of words and/or phrases as hypnisis triggers. Separated by a comma.":
        "自定义催眠触发词/短语列表（逗号分隔）",
    "Awaken Words:": "唤醒指令:",
    "Custom list of words and/or phrases as awakener triggers. Separated by a comma.":
        "自定义唤醒触发词/短语列表（逗号分隔）",
    "Silence Trigger Words:": "禁言指令:",
    "When spoken while hypnotized, will prevent speech. Separated by a comma.":
        "催眠状态下说出时将禁止发言（逗号分隔）",
    "Allow Speech Trigger Words:": "解禁指令:",
    "When spoken while hypnotized, will allow speech. Separated by a comma.": "催眠状态下说出时将允许发言（逗号分隔）",
    "Whitelist Member IDs:": "操作白名单:",
    "Comma separated list of member IDs exclusive allowed to access your hypno settings and triggers. If empty will use standard Item Permissions.":
        "可操作催眠设置的成员ID列表（逗号分隔，留空则使用物品默认权限）",
    "Hypnosis Length (min.):": "催眠持续时间(分钟):",
    "Length of hypnosis time (in minutes) before automatically recovering. Set to 0 for indefinite.":
        "自动苏醒前的催眠时长（0为永久）",
    "Cooldown (sec.):": "抗性周期(秒):",
    "Cooldown time (in seconds) before you can be hypnotized again.": "再次接受催眠所需间隔时间",
    "Enable Cycle:": "启用指令轮替:",
    "If checked, only one trigger will be active at a time and will cycle after use.":
        "启用后每次仅激活一个触发指令，使用后自动轮换",
    "Trigger Cycle Time (min.):": "指令轮替间隔(分钟):",
    "Number of minutes after activation to wait before cycling to a new trigger.": "触发指令使用后的轮替等待时间",

    // 触发催眠第二页
    "Allow Remote Access:": "启用远程控制:",
    "If checked, allowed users can modify these settings.": "授权用户可远程修改当前设置",
    "Remote Access Requires Trance:": "需处于催眠状态:",
    "If checked, remote access is only possible while actively hypnotized.": "仅在被催眠期间允许远程访问",
    "Remote Access Limited to Hypnotizer:": "仅限催眠者操控:",
    "If checked, only the user who hypnotized you can access your settings (after matching other conditions).":
        "仅当前催眠者满足条件后可操控设置",
    "Allow Remote Override Member Modification:": "开放成员列表编辑权限:",
    "If checked, any remote users can change your Override Member Id list (otherwise, only owner can).":
        "允许所有远程用户修改成员覆盖列表（否则仅限所有者）",
    "Lockable:": "可锁定设置:",
    "If checked, allowed users can lock you out of these settings.": "授权用户可锁定当前设置界面",
    "Build arousal while hypnotized:": "催眠状态兴奋累积:",
    "If checked being hypnotized will increase arousal.": "处于催眠状态时将持续积累兴奋值",
    "Enable Spirals:": "启用催眠螺旋:",
    "If checked headsets and other spirals can cause trance.": "启用后，头戴设备和其他螺旋类物品可以引发催眠状态",
    "Hypnotized Eye Color:": "催眠瞳色:",
    "Hex code of your eye color while hypnotized (default: #A2A2A2).":
        "催眠状态下的瞳孔色值（十六进制，默认：#A2A2A2）",
    "Hypnotized Eye Type:": "催眠眼型:",
    "Eye type # to use while under hypnosis (default: 9).": "催眠时采用的眼型编号（默认：9）",
    "Enable wake-up on snaps:": "启用打响指唤醒:",
    "If checked you exit the trance when you hear someone snapping.": "启用后听到打响指声时将结束催眠状态",

    // 触发催眠第三页
    "Enable Suggestion Programming": "启用暗示植入",
    "If checked, only your hypnotizer may induce hypnotic suggestions within you.":
        "勾选后，只有你的催眠者可以对你植入催眠暗示",
    "Programming Limited to Hypnotizer": "仅限催眠者植入",
    "If checked, hypnotic suggestions may be induced within you while under trance.":
        "勾选后，在催眠状态下可被植入暗示",
    "Limit Suggestion Removal": "限制暗示移除",
    "If checked, only your owner or whoever added the suggestion can change/remove it.":
        "勾选后，只有你的主人或添加暗示的人可以更改/移除暗示",
    "Allow Suggestion Removal": "允许移除暗示",
    "If checked, you can remove suggestions installed in you with '/lscg remove-suggestion' if you are not immersive and not on extreme difficulty.":
        "勾选后，若非沉浸模式且非极端难度，可使用指令'/lscg remove-suggestion'移除已植入的暗示",
    "Always Submit to Suggestions:": "绝对服从暗示:",
    "If checked, you will always submit to suggestions.": "勾选后将绝对服从所有暗示",
    "Always Submit to Member IDs:": "强制服从成员ID:",
    "Comma separated list of member IDs. If empty will use standard Item Permissions. You will always submit to their suggestions.":
        "逗号分隔的成员ID列表（留空则使用默认物品权限），将绝对服从这些成员的暗示",
    "Blocked Instructions:": "禁止的暗示指令:",
    "Toggle which suggestion instructions you want to block on yourself.": "选择要禁止的特定暗示指令类型",

    // 触发催眠第三页
    "Orgasm": "高潮",
    "Induce overwhelming pleasure in the subject.": "在受测目标身上引发极度的愉悦.",
    "Denial": "拒绝",
    "Prevent the subject from achieving orgasm.": "阻止目标达到性高潮.",
    "Insatiable": "永不满足",
    "Infuse the subject with an endless arousal.": "给目标注入无尽的兴奋感.",
    "Perform Activity": "执行活动",
    "Compel the subject to perform an activity.": "强迫目标进行一项活动.",
    "Strip": "脱衣",
    "Make the subjects clothing uncomfortable.": "使目标的衣服变得不舒服.",
    "Assume Pose": "采取姿势",
    "Compel the subject to assume a pose.": "强迫目标采取一个姿势.",
    "Follow": "跟随",
    "Compel the subject to follow someone. (Requires LSCG leashing enabled on both)":
        "强迫目标跟随某人.(需要双方都启用 LSCG 捆绑)",
    "Speak Phrase": "说出短语",
    "Compel the subject to speak a phrase.": "强迫目标说出一个短语.",
    "Serve": "服务",
    "Compel the subject to serve drinks.": "强迫目标去提供饮料.",
    "Forget": "忘记",
    "Remove a previous instruction from the subject.": "从目标身上移除之前的指令.",

    // 窒息玩法第一页
    "Breathplay": "窒息玩法",
    "- LSCG Breathplay -": "- LSCG 窒息系统 -",
    "Enable Hand Choking:": "启用手部窒息:",
    "Enabled breathplay using nose plugs and sufficient gags.": "启用通过鼻塞和有效口塞进行的窒息玩法",
    "Enable Gag Suffocation:": "启用口塞窒息:",
    'Enables breathplay using "Choke Neck" activity. If done repeatedly will cause blackout.':
        '启用"颈部窒息"活动进行窒息玩法，反复操作可能导致昏迷',
    "Enable Chain Choking:": "启用链条窒息:",
    "Enabled breathplay using choke chain neck restraint.": "启用通过颈部束缚链进行的窒息玩法",
    "Sleep on Passout:": "昏迷后沉睡:",
    "Will force sleep on passout.": "昏迷后将强制进入睡眠状态",
    "Sleep time (minutes):": "沉睡时间(分钟):",
    "How long you will sleep after passout if enabled.": "启用后，昏迷后将沉睡的时长",

    // 窒息玩法第二页购买菜单
    "Now available:": "新品上市：",
    "Andrew's Collar Control Module!!": "安德鲁智能项圈控制模块！！",
    "Has your owner sent you shopping for a more controlling collar?": "您的主人是否让您寻找更具掌控力的项圈？",
    "Are you looking for some extra motivation for good behavior?": "是否在寻求规范行为的额外动力？",
    "Act now and secure your Control Module now for the low low price of $500!":
        "立即抢购！现在仅需500美元即可拥有这款控制模块！",
    "Attach this revolutionary new device to your existing collar and it will":
        "将这款革命性设备与现有项圈连接后，即可",
    "enhance it with the ability to tighten and loosen on command!": "实现智能收放控制功能！",
    "Let your dom quiet down those bratty moments and reward good behavior!":
        "让您的主人轻松管教任性时刻，及时奖励乖巧表现！",
    "Purchase - $500": "立即购买 - $500",
    "Unlock Andrew's Collar Module": "解锁安德鲁项圈模块",
    "- Andrew co.® makes no guarantees as to the behavior of the wearer -": "- 安德鲁公司®对佩戴者行为效果不作担保 -",

    // 窒息玩法第二页
    // "Enabled:": "功能开关:",
    "Enabled the Choking Collar Features.": "启用窒息项圈功能",
    // "Allow Remote Access:": "允许远程访问:",
    "Enables Remote Access to Collar Settings.": "允许远程控制项圈设置",
    // "Lockable:": "可锁定:",
    "Allowes Remote Access Users to lock you out of these settings.": "允许远程用户锁定这些设置（禁止佩戴者修改）",
    "Allow Self-Tightening:": "允许自主收紧:",
    "Allow the wearer to tighten their own collar.": "允许佩戴者自行收紧项圈",
    "Allow Self-Loosening:": "允许自主放松:",
    "Allow the wearer to loosen their own collar.": "允许佩戴者自行放松项圈",
    "Allowed Members IDs:": "授权成员ID:",
    "Comma separated list of member IDs who can activate the collar. Leave empty for item permissions.":
        "可激活项圈的成员ID列表（逗号分隔，留空则遵循物品默认权限）",
    "Limit to Crafted User:": "限定制作者使用:",
    "Limits collar activation to crafted user and allowed list. If no crafted user will use item permissions.":
        "仅限物品制作者及授权列表可使用（无制作者时遵循物品权限）",
    "Tighten Trigger:": "收紧指令:",
    "Word or phrase that, if spoken, will tighten the collar.": "说出该词/短语将触发项圈收紧",
    "Loosen Trigger:": "放松指令:",
    "Word or phrase that, if spoken, will loosen the collar.": "说出该词/短语将触发项圈放松",
    "Immersive:": "沉浸模式:",
    "Prevents the wearer from viewing triggers via show-triggers.": "隐藏触发指令（无法通过show-triggers查看）",
    "Enable Buttons:": "启用快捷按钮:",
    "Allows activation of the collar features via buttons (activities & commands).":
        "允许通过快捷按钮（活动与指令）激活项圈功能",
    "Any Collar:": "通用适配模式:",
    "If enabled, any collar can trigger and activate.": "启用后所有项圈均可触发功能（不限定特定项圈）",
    "Update": "保存设置",
    "Update Collar:": "项圈设置更新:",
    "Current Name: undefined": "当前项圈名称: 未设置",

    // 药物强化效果第一页
    "Drug Enhancements": "药物强化效果",
    "- LSCG Drug Enhancements -": "- LSCG 药物强化设置 -",
    // "Triggered Hypnosis": "指令触发式催眠",
    "Enable Enhanced Drinks, Injectors and Net Gun.": "启用强化版饮品、注射器和网枪功能",
    "Enable Sedative:": "启用镇静剂效果:",
    'Activates for any injector or drink with "horny" or "aphrodisiac" in its crafted name or description.':
        '对名称或描述中含"催情"或"媚药"的注射器/饮品生效',
    "Enable Brainwash Drug:": "启用洗脑药物效果:",
    'Activates for any injector or drink with "mind control," "hypnotizing," or "brainwashing" in its crafted name or description.':
        '对名称或描述中含"精神控制"、"催眠"或"洗脑"的注射器/饮品生效',
    "Enable Aphrodisiac:": "启用催情剂效果:",
    'Activates for any injector or drink with "sedative" or "tranquilizer" in its crafted name or description.':
        '对名称或描述中含"镇静"或"安定"的注射器/饮品生效',
    "Filled Glass Sip Limit:": "满杯饮用次数限制:",
    "Number of sips before your filled glasses empty. (0 for no limit)": "玻璃杯饮尽前的使用次数（0为无限）",
    "Allow Continuous Delivery:": "启用呼吸器持续供气:",
    "If true, will allow respirators to deliver a continuous supply of drugged gas.":
        "启用后，呼吸器将持续释放麻醉气体",
    "Inexhaustible Gases:": "无限气体供应:",
    "If true, any continuous delivery (eg. respirator) on you will never run out of gas.":
        "启用后，持续供气设备（如呼吸器）将不会耗尽",
    "Show Drug Levels:": "显示药物浓度:",
    "If true, will display bars showing the level of each drug type.": "启用后将显示各类药物的浓度条",
    "Heartbeat Sound:": "启用心跳音效:",
    "If true, enables an occasional heartbeat sound while under the influence of aphrodisiac.":
        "催情剂生效期间将播放间歇性心跳声",
    "Chaotic Net Gun:": "混乱模式网枪:",
    "If true, your net gun will fire wildly and have a 50/50 chance to net a random character instead of your target.":
        "启用后网枪将随机发射，50%概率捕获非目标角色",

    // 药物强化效果第二页
    "Enable Chloroform:": "启用氯仿麻醉:",
    "Fall asleep if chloroformed.": "被氯仿药棉麻醉时将陷入昏睡",
    "Chloroform Never Fades:": "氯仿效果永续:",
    "If enabled one rag over your mouth will last forever until removed, otherwise its potency will fade after an hour.":
        "启用后，覆盖口部的药棉将永久有效（需手动移除），否则药效将在1小时后消退",

    // 互动行为第一页
    "Activities": "互动行为",
    "- LSCG Activities -": "- LSCG 互动设置 -",
    "Please Select a Zone": "请选择作用区域",
    "Can Induce Trance": "可诱导催眠状态",
    "Using this activity on this location can trigger hypnosis.": "在该部位进行此互动可能诱发催眠效果",
    "Repeats Required": "触发所需次数",
    "Number times within 5 minutes this activity must be done before hypnosis or sleep is triggered.":
        "5分钟内需重复该互动次数方可触发催眠/睡眠效果",
    "Trance Arousal Threshold": "催眠触发敏感度",
    "Arousal threshold required for this activity to trigger hypnosis. If both trance and sleep are checked, lower arousal triggers sleep.":
        "触发催眠所需敏感度阈值（若同时启用催眠与睡眠，较低敏感度将触发睡眠）",
    "Can Awaken": "可解除状态",
    "Using this activity on this location will awaken you from trance or deep sleep.":
        "在该部位进行此互动可解除催眠/深度睡眠状态",
    "Can Cause Orgasm": "可引发高潮",
    "Using this activity on this location can cause an orgasm.": "在该部位进行此互动可能引发高潮",
    "Orgasm Arousal Threshold": "高潮触发敏感度",
    "Arousal threshold required for this activity to cause an orgasm.": "引发高潮所需敏感度阈值",
    "Allowed Member IDs": "授权成员ID",
    "Member IDs who can trance/sleep/awaken/orgasm with this activity. Leave empty to use BC item permissions":
        "可使用此互动进行催眠/睡眠/唤醒/高潮操作的成员ID（留空则遵循BC物品默认权限）",
    "Can Induce Sleep": "可诱导睡眠",
    "Using this activity on this location can put them to sleep.": "在该部位进行此互动可能诱发睡眠状态",

    // 魔法第一页购买页面
    "Magic™": "魔法™",
    "- LSCG Magic™ -": "- LSCG 魔法™ -",
    // "Now available:": "新品上市：",
    "Magic™!": "魔法™！",
    "Want to wow and amaze your friends and lovers?": "想让挚友与爱人感受魔法的震撼吗？",
    "Are you looking to impress and punish your enemies?": "欲向敌人施以魔法的惩戒与威慑？",
    "With just a simple signature you too can experience the thrill of Magic™!":
        "只需轻轻签名，即刻体验魔法™的非凡魅力！",
    "- Reveal the ancient secrets of the arcane! -": "- 揭开奥术的远古秘辛 -",
    "- Craft your own amazing potions! -": "- 调配独门魔法药剂 -",
    "- Share in your powers, or dont! -": "- 魔法天赋，独享或共享 -",
    "~Sign Here~": "~在此缔结契约~",
    "Apply signature to scroll": "签署卷轴",
    "~ Any sufficiently advanced technology is indistinguishable from magic ~": "~ 至臻技艺，皆同魔法无异 ~",
    "* Signatory agrees to Magic™ Installation (ᴘᴀᴛ. ᴘᴇɴᴅ.) required to experience spell effects *":
        "*签署即视为同意魔法™契约（专利认证中），方可施展法术*",

    // 魔法第一页
    // "Triggered Hypnosis": "指令触发式催眠",
    "Enabled the use and application of Magic™.": "激活魔法™系统",
    "Enable Wild Magic:": "启用混沌魔法:",
    "Cast a random spell from your spell list, with a chance of a truly random spell.":
        "从已知法术中随机施放，有小概率触发未知混沌法术",
    "Force Wild Magic": "强制混沌施法",
    "Prevent the ability to choose the spell you are casting.": "施法时无法自主选择法术",
    "True Wild Magic": "纯粹混沌魔法",
    "Generate a truly random spell whenever casting.": "每次施法必定触发完全随机效果",
    "Prevent X-Ray Vision": "屏蔽透视效果",
    "Lead-line all your clothing.": "为所有衣物施加防透视结界",
    "Blocked Effects:": "法术屏蔽列表:",
    "Toggle which spell effects you want to block on yourself.": "设置要免疫的法术效果类型",
    "Block": "屏蔽",
    "Allowed": "允许",

    // 魔法第二页
    "Spell Crafting": "法术研习",
    "Create your arcane sorceries and potions.": "创造独属于你的奥术秘法与魔药配方",
    "No Spells Known...": "尚未掌握任何法术...",
    "Create new Spell": "创制新法术",
    "Spell Name:": "法术真名:",
    "Name of your powerful spell": "为你的秘法赋予真名",
    "Casting Phrase:": "咒文吟诵:",
    "Phrase/word to cast your spell by typing <Casting phrase> <target Name> in the chat.":
        "在聊天栏输入<咒文> <目标名>即可施放",
    "Allow Potion:": "可调制魔药:",
    "Allows this spell to be brewed into a crafted potion bottles/glasses/mugs using its name.":
        "允许将此法术转化为同名魔药（可装入各类容器）",
    "Allow Voice Casting:": "允许言灵施法:",
    "Allows this spell to be cast by speaking its name or specified casting phrase.": "可通过吟诵真名或特定咒文施放",
    "Effect #1:": "第一重效果:",
    "Effect #2:": "第二重效果:",
    "Effect #3:": "第三重效果:",
    "An effect the spell has.": "此法将显现的威能",
    "Next": "下一个",
    "Previous": "上一个",

    // 魔法第三页
    "Remote Allowed Member IDs:": "远程操控授权名单:",
    "Comma separated list of member IDs. If empty will use standard Item Permissions.":
        "逗号分隔的成员ID列表（留空则遵循物品默认权限）",
    "Never Defend:": "完全放弃抵抗:",
    "If checked, you will never defend against spells cast on you.": "启用后将完全不对任何法术效果进行抵抗",
    "Defenseless Against Member IDs:": "特定成员豁免抵抗:",
    "Comma separated list of member IDs. If empty will use standard Item Permissions. You will never defend against their spells.":
        "指定成员ID列表（留空则遵循物品权限），对其法术将完全不进行抵抗",
    "Limited Spell Duration:": "法术时效限制:",
    "If checked, you will eventually break free from a detrimental spell's effects, the time variable based on how poorly you fail an activity roll against the caster.":
        "启用后可根据对抗检定失败程度，逐步解除负面法术效果",
    "Maximum Spell Duration:": "法术最大持续时间:",
    "Maximum amount of time, in minutes, you will be affected by any specific spell effects. Set to 0 for no maximum.":
        "单个法术效果最长持续时间（分钟，0为无限制）",
    "Allow Outfit Spell to Change Neck Items:": "允许幻装术修改颈部装备:",
    "If checked, outfit spell effects can modify and replace your neck items.": "启用后幻装术可影响颈部装备",
    "Allow Polymorph Spell to Change Genitals:": "允许变形术修改生殖特征:",
    "If checked, polymorph spell effects can modify your genitals.": "启用后变形术可改变生殖器官形态",
    "Allow Polymorph Spell to Change Pronouns:": "允许变形术修改人称代词:",
    "If checked, polymorph spell effects can modify your pronouns.": "启用后变形术可改变你的人物称谓",
    "Require Whitelist:": "仅限白名单操作:",
    "If checked, only people on your whitelist can cast spells on you or teach you spells.":
        "启用后仅白名单成员可对你施法或传授法术",

    // 魔法 - 灵魂出窍设置
    "-- Astral Projection Settings --": "-- 灵魂出窍设置 --",
    "Extra configuration for your spirit form.": "关于灵魂形态的额外配置",
    "Spirit Speech effects:": "灵魂语言效果:",
    "Select what level of effect to apply to spirit speech.": "选择对灵魂语言施加的效果等级",
    "None": "无",
    "Glow": "发光",
    "Float": "漂浮",
    "Disable Soul Bindings:": "解除灵魂绑定:",
    "If checked, prevent any soul-bound restraints from binding your spirit form.":
        "启用后，任何灵魂绑定的束缚都无法影响你的灵魂形态",
    "Spirit Color:": "灵魂颜色:",
    "Overrides the default tint color of your astral projection (default is #00ced1).":
        "覆盖默认的灵魂形态色调（默认值为#00ced1）",
    "Spirit Form Outfit:": "灵魂形态装扮:",
    "Outfit name that will be used for your spirit form. Highly recommended that this outfit includes all desired body/cosplay/clothing.":
        "将用于灵魂形态的装扮名称。强烈建议该装扮包含所有想要的身体/角色/服装元素",
    "Hide Corporeal Form:": "隐藏肉体形态:",
    "If true, your corporeal form will vanish while projected into spirit realm":
        "启用后，进入灵魂形态时肉体将完全隐形",

    // 魔法翻译
    "Hypnotizing": "催眠术",
    "Hypnotizes the target.": "使目标进入催眠状态",
    "Slumbering": "沉睡咒",
    "Induces a deep slumber in the target.": "使目标陷入深度沉睡",
    "Arousing": "情欲唤起",
    "Arouses the target.": "激发目标的生理欲望",
    "Blinding": "目盲术",
    "Prevents the target from seeing.": "使目标暂时失明",
    "Deafening": "失聪术",
    "Prevents the target from hearing.": "使目标暂时失去听觉",
    "Gagged": "禁言术",
    "Gags the target.": "使目标无法发声",
    "Petrifying": "石化术",
    "Petrifies the target.": "将目标转化为石像",
    "Enlarging": "巨化术",
    "Enlarges the target to twice their size.": "使目标体型增大一倍",
    "Bless": "祝福术",
    "Applies a +5 buff to all the target's skills for 15 minutes": "使目标所有技能提升5点，持续15分钟",
    "Bane": "诅咒术",
    "Applies a -5 debuff to all the target's skills for 15 minutes": "使目标所有技能降低5点，持续15分钟",
    "Pairing": "共感连结",
    "Pair two targets, such that when one feels arousal the other also does.": "使两个目标建立感官连结，共享情欲感受",
    "Siphoning": "快感转移",
    "Redirect all of the target's orgasmic pleasure to another.": "将目标的快感完全转移至他人",
    "Outfit": "幻装术",
    "Magically change the target's clothing and equipment.": "魔法改变目标的衣着装备",
    "Polymorph": "变形术",
    "Polymorph the target's body and/or cosplay items": "改变目标形体及装扮",
    "Dispel": "驱散术",
    "Dispels any existing effects on the target (including anything drug induced).": "解除目标所有状态效果(含药物影响)",
    "X-Ray Vision": "透视之眼",
    "Grants the target X-Ray vision": "赋予目标透视能力",
    "Magic Barrier": "魔法屏障",
    "Create a magic barrier that protect and reflect incoming spell": "生成可防护并反弹法术的魔法屏障",
    "Disarming": "缴械术",
    "Disarm the target": "解除目标的武装",
    "Denying": "快感剥夺",
    "Denies the target any orgasms.": "禁止目标获得高潮",
    "Forced Orgasm": "强制高潮",
    "Forced an orgasm upon the target.": "强制引发目标高潮",
    "Astral Projection": "灵魂出窍",
    "Project the target's soul into the Astral Plane": "将目标的灵魂投射到星界",

    // 飞溅效果
    "Splatters": "飞溅效果",
    "- LSCG Splatters -": "- LSCG 飞溅效果设置 -",
    "Enable Splatters:": "启用飞溅效果:",
    "Enable splatter integration.": "激活飞溅效果系统功能",
    "Give Splatters:": "允许施加飞溅:",
    "Allow splattering on others.": "允许对其他角色使用飞溅效果",
    "Receive Splatters:": "允许接收飞溅:",
    "Allow others to splatter you.": "允许其他角色对你使用飞溅效果",
    "Auto Splatter:": "自动飞溅:",
    "If enabled, will prompt for splatter on orgasm.": "高潮时将自动触发飞溅效果",
    "Uncontrollable when Bound:": "束缚时不可控:",
    "If enabled, the user will only be able to control where splatter is applied if unrestrained.":
        "被束缚时将失去对飞溅位置的控制权",
    "Lovers Only:": "仅限亲密对象:",
    "If enabled, only your lovers and whitelist will be able to apply splatters to you.":
        "仅允许亲密关系者及白名单成员使用飞溅效果",
    "Splatter Whitelist:": "飞溅白名单:",
    "Set member numbers who are explicitly allowed to splatter on you. Comma separated list of member IDs.":
        "指定允许使用飞溅效果的成员ID（逗号分隔）",
    "Splatter Blacklist:": "飞溅黑名单:",
    "Set member numbers who are explicitly blocked from splattering on you. Comma separated list of member IDs.":
        "指定禁止使用飞溅效果的成员ID（逗号分隔）",
    "Splatter Color Override:": "自定义飞溅颜色:",
    "Override color [hex code] for splatter application. Can comma separate possible values (eg: #FFF, #F0F0F0).":
        "覆盖默认飞溅颜色（十六进制色码，可多值逗号分隔如：#FFF,#F0F0F0）",
    "Splatter Opacity % Override:": "自定义飞溅透明度:",
    "Override opacity for splatter application. Can comma separate possible values and provide range (eg: 20, 60-70).":
        "覆盖默认透明度（百分比，可设范围如：20,60-70）",
    "Minimum Required Arousal:": "最低兴奋阈值:",
    "Minimum arousal required to do give splatter.": "触发飞溅效果所需的最低兴奋值",

    // LSCG 远程设置
    "You do not have access to her mind...": "你无权访问她的思维...",
    "You do not have access to her collar...": "你无权访问她的项圈...",
    "Section is Unavailable": "该部分不可用",
    "Needs BC item permission": "需要BC项权限",
    // LSCG 远程设置
    "LSCG Remote Settings": "LSCG 远程设置",
    // "Triggered Hypnosis": "指令触发式催眠",
    "Override Trigger Words:": "覆盖催眠触发词:",
    "Override Awaken Words:": "覆盖唤醒指令:",
    "Override Allowed Member IDs:": "覆盖授权成员ID:",
    "Programming Limited to Hypnotizer:": "仅限催眠者编程:",
    "Maximum amount of time, in minutes, the target will be affected by any specific spell effects. Set to 0 for unlimited.":
        "目标受法术影响的最长时间(分钟)，设为0表示无限时长",
    "If checked, the target will eventually break free from a detrimental spell's effects, the time variable based on how poorly they fail an activity roll against the caster.":
        "勾选后，目标会根据对抗施法者检定的失败程度，逐渐解除负面法术效果",
    "If checked, the target will never defend against spells cast on them.": "勾选后，目标将不会抵抗任何对其施放的法术",
    "Comma separated list of member IDs. If empty will use standard Item Permissions. The target will never defend against their spells.":
        "逗号分隔的成员ID列表（留空则使用物品默认权限），目标不会抵抗这些成员的法术",
    "Lead-line all the target's clothing.": "为目标所有衣物施加防透视结界",

    // 暗示设置
    "Suggestions": "暗示设置",
    "Induce Suggestion": "诱导暗示",
    "Induce a new hypnotic suggestion into the subject.": "向受试者诱导一个新的催眠暗示.",
    "No Suggestions Yet...": "目前还没有暗示……",
    "Rename Suggestion": "暗示名字",
    "Induce New Suggestion": "添加暗示",
    "Trigger Phrase:": "触发短语:",
    "Trigger phrase for this suggestion.": "这个是暗示的触发短语",
    "Exclusive:": "专属:",
    "If checked, only the creator of this suggestion can view, edit, or trigger it.":
        "如果勾选,只有此建议的创建者可以查看、编辑或触发它.",
    "Instruction #1:": "",
    "Instruction #2:": "",
    "Instruction #3:": "",
    "A suggested instruction.": "一个催眠指令",
    // "None": "无",
    "Select Instructions to Forget:": "",
    "Target": "目标",
    "Self": "自己",
    "Subject will always target themselves": "主体总是会以自身为目标",
    "Configure specific target member id number or name": "配置特定目标成员的ID编号或名称",
    "Speaker Only": "直接对施法者使用动作",
    "Subject will always target the speaker": "这个勾了就是直接以是施法者为目标,下面就不用填id了",
    "Phrase": "短语",
    "Configure specific phrase": "设置特定短语",
    "All Instructions": "全选指令",
    "Selest Instructions to Forget:": "忘记某项指令",
    "Selest Activity": "选择活动",

    "Upper Pose:": "上身姿势:",
    "Lower Pose:": "下身姿势:",
    "Full Pose:": "全身姿势:",
    "BaseUpper": "基础上身姿势",
    "BaseLower": "基础下身姿势",
    "Yoked": "举手",
    "OverTheHead": "手高举头顶",
    "BackBoxTie": "背部箱式捆绑",
    "BackElbowTouch": "背部肘部触碰",
    "BackCuffs": "背部手铐束缚",
    "Hogtied": "四马攒蹄式捆绑",
    "KneelingSpread": "跪姿张开",
    "LegsClosed": "双腿闭合",
    "Spread": "张开",
    "LegsOpen": "双腿张开",
    "Allow Suggestion Removal:": "允许删除暗示:",
    "Locked:": "锁定:",
    "If checked, the user will be allowed to remove installed suggestions.": "若此项被勾选,用户将获准删除已有的暗示.",
    "If checked, the user out of their own hypnosis settings.": "若勾选此项,用户将退出其自身的催眠设置.",
    "Select Activity:": "选择动作:",
    "Target:": "目标:",
    "Phrase:": "短语:",
    "Name:": "名称:",
    "Name": "名称:",

    // 套装收藏夹
    "Outfit Collection": "套装收藏夹",
    "- LSCG Outfit Collection -": "- LSCG 套装收藏夹 -",

    // 诅咒物品
    "- LSCG Cursed Items -": "- LSCG 诅咒物品 -",
    "Enable Cursed Items:": "启用诅咒物品:",
    "Enable Cursed Items.": "启用诅咒物品。",
    "Vulnerable:": "承受效果:",
    "If checked, you are vulnerable to cursed items and susceptable to their effects when worn...":
        "如果勾选，您将承受诅咒物品及其穿戴时的效果...",
    "Allowed Crafter:": "允许的制作者:",
    "Who's cursed items can can activate on you. (based on: Public < Friend < Whitelist < Lover < Owner < Self)":
        "谁的诅咒物品可以在你身上激活。（基于：公开 < 朋友 < 白名单 < 爱人 < 拥有者 < 自己）",
    "Everyone (except blacklisted)": "所有人（黑名单除外）",
    "Friends and above": "朋友及以上",
    "Whitelisted and above": "白名单及以上",
    "Lovers and above": "恋人及以上",
    "Owners or Self": "主人或自己",
    "Self Only": "仅自己",
    "Suppress Emotes:": "抑制消息:",
    "If true, All cursed items on you will exhaust after applying their outfit regardless of item settings.":
        "如果勾选，所有在您身上的诅咒物品将在应用其套装后耗尽，而不考虑物品设置。",
    "Always Exhaust:": "始终会耗尽:",
    "If true, no cursed items on you will publically emote as they grow item by item. They will still inform locally.":
        "如果勾选，您身上的所有诅咒物品在逐个添加物品时将不会公开发送消息。这仍会在本地通知。",
    "No Cursed Items Yet...": "目前还没有诅咒物品...",
    "Create a cursed item that can spread.": "创建一个可以传播的诅咒物品。",
    "Create New Cursed Item": "创建新的诅咒物品",
    "Cursed Item Name:": "诅咒物品名称:",
    "Name of this Cursed Item.": "此诅咒物品的名称。",
    "Applied Outfit:": "应用的套装:",
    "Outfit name that will be applied by the cursed item.": "将由此诅咒物品应用的套装名称。",
    "Inexhaustable:": "不可耗尽:",
    "If checked, this cursed item will continue to enforce its outfit until removed.":
        "如果勾选，此诅咒物品将继续强制应用其套装，直到被移除。",
    "If checked, this cursed item is active and can spread.": "如果勾选，此诅咒物品处于激活状态并且可以传播。",
    "Suppress Emote:": "抑制表情:",
    "If checked, this item will not publically emote as it grows item by item. They will still inform locally.":
        "如果勾选，此物品在逐个添加物品时将不会公开发送消息。它们仍会在本地通知。",
    "Strip Level:": "脱衣等级:",
    "Determines what type of non-outfit appearance items will also be removed.": "决定将移除哪些类型的非套装外观物品。",
    "Insta-Strip:": "瞬间脱衣:",
    "If true, the victim will be stripped instantly regardless of apply speed.":
        "如果勾选，受害者将立即脱衣，而不考虑应用速度。",
    "Apply Speed:": "应用速度:",
    "Determines how fast the cursed item applies its outfit.": "决定诅咒物品应用其套装的速度。",
    "Medium": "中等",
    "Slow": "慢",
    "Instant": "瞬间",
    "Custom Speed (seconds):": "自定义速度（秒）:",
    "Custom (seconds)": "自定义（秒）",
    "Determines the speed (in seconds). Must be between 1 and 3600 (1 hour)":
        "决定速度（以秒为单位）。必须在 1 到 3600（1 小时）之间。",
    "Open Cursed Items Wiki on GitHub": "在 GitHub 上打开诅咒物品 Wiki",

    // 杂七杂八
    "Configure": "配置",
    "Module is deactivated": "模块已停用",
    "Select a spell to cast...": "选择一个要施放的法术...",
    "Poses": "姿势",
    "Magic": "魔法",
    "Cast Spell": "施放咒语",
    "Wild Magic": "野性魔法",
    "Teach Spell": "教授咒语",
    "Asleep": "睡着",
    "Aroused": "兴奋状态",
    "Deafened": "耳聋",
    "Blinded": "失明",
    "Enlarged": "变大",
    "Petrified": "石化",
    "Blessed": "受庇佑",
    // "Forced Orgasm": "强制高潮",
    "Select a paired target...": "选择一个配对的目标...",
    "Arousal Paired": "兴奋配对",
    "Orgasms Siphoned": "吸取性高潮",
    "Baned": "被诅咒",
    "Paste Outfit Code:": "粘贴服装代码:",
    "Redressed": "更衣",
    "Whole Body:": "整体:",
    "Hair:": "头发:",
    "Skin/Jewelry/Makeup:": "皮肤/珠宝/化妆:",
    "Genitals:": "生殖器:",
    "Polymorphed": "变形",
    "Polymorph applies cosplay items from the outfit code.": "变形会应用来自服装代码中的角色扮演道具.",
    "Polymorph changes the target's skin.": "变形会改变目标的皮肤.",
    "Polymorph changes the target's genitals.": "变形会改变目标的生殖器.",
    "Polymorph modifies the whole body.": "变形会修改整个身体.",
    "Cosplay:": "角色装扮:",
    "Hypnotized": "被催眠",
    "Show whisper button on chat messages": "在聊天消息中显示密语按钮",
    "Adds a whisper button to chat messages, allowing you to whisper to the sender more conveniently.":
        "在聊天消息中添加一个密语按钮,使您能够更便捷地与发送者进行密语交流.",
    "Control Collar": "控制项圈",
    "Update Collar to Current": "将项圈更新为当前",
    "View next items": "查看下一项物品",
    "Mode: Preview": "模式: 预览",
    "Sold": "已售出",
    "Mode: Shop": "模式: 商店",
    "Player money": "玩家金钱",
    "Underwear": "内衣",
    "Nude": "裸体",
    "View previous items": "查看上一项",
    "Cosplay": "角色装扮",

    // 地图增强设置
    "- LSCG Map Enhancements -": "- LSCG 地图增强设置 -",
    "Map Enhancements": "地图增强",
    "Enhance Map Lighting:": "增强地图照明:",
    "If checked, map lighting will become more dynamic based on light sources [EXPERIMENTAL].":
        "如果勾选，地图照明将根据光源变得更加动态 [实验性].",
    "Disable Lighting Animation:": "禁用照明动画:",
    "If checked, lighting animations will be disabled (Enable if maps running slow).":
        "如果勾选，照明动画将被禁用（如果地图运行缓慢，请启用）.",
    "Use Room's Ambient Darkness:": "使用房间的环境黑暗:",
    "If checked, will use the room customization filter as ambient darkness (Recommended).":
        "如果勾选，将使用房间自定义滤镜作为环境黑暗（推荐）.",
    "Use Alternate Blinding Effect:": "使用替代失明效果:",
    "If checked, you will use an alternate blinding effect while in maps.": "如果勾选，在地图中将使用替代失明效果.",
    "Hide Vanilla Fog Squares:": "隐藏原版迷雾方块:",
    "If checked, the vanilla fog squares will be hidden leaving just the enhanced vision lines.":
        "如果勾选，原版迷雾方块将被隐藏，只留下增强的视觉线条.",
    "Hide Dark Lights:": "隐藏暗光源:",
    "If checked, lights that emit 'darkness' will not be used.": "如果勾选，发出“黑暗”的光源将不被使用.",

    // 主菜单
    "Open Help": "打开帮助",
    "Export LSCG Settings": "导出 LSCG 设置",
    "Open LSCG Wiki on GitHub.": "在 GitHub 上打开 LSCG Wiki",
    "Open LSCG Latest Release on Github.": "在 Github 上打开 LSCG 最新版本",
    "Import LSCG Settings": "导入 LSCG 设置",
    "Emergency reset of LSCG": "LSCG 紧急重置",
    "LSCG main menu": "返回主菜单",
    "Export": "导出设置",
    "Import": "导入设置",
    "Latest Changes": "最近更新",
    "Cursed Items": "诅咒物品",

    "Main Menu": "主菜单",

    "[WCE] clear and reload the drawing cache of all characters": "[WCE] 清除并重新加载所有角色的绘图缓存.",
};

const regexTranslations = [
    { regex: /(.+) has too much willpower to let you in\.\.\./, replacement: "$1 拥有太多意志力不让你进入……" },
    {
        regex: /You must be the owner to purchase this module for (.+)\.\.\./,
        replacement: "你得是 $1 的主人才能买这个模块……",
    },
    {
        regex: /(.+) is resisting any hypnotic suggestions\.\.\./,
        replacement: "$1 正在抵制任何催眠暗示……",
    },
    {
        regex: /Installed by(.+)/,
        replacement: "制作人$1",
    },
    {
        regex: /Trigger Phrase(.+)/,
        replacement: "触发短语:$1",
    },
    {
        regex: /You must be the owner to purchase this module for (.+).../,
        replacement: "您必须是主人才能为 $1 购买此模块……",
    },
    {
        regex: /Current Name: (.+)/,
        replacement: "当前项圈名称: $1",
    },
];

/**
 * 翻译菜单文本
 * @param {string} key
 * @returns {string | undefined} 如果翻译成功则返回翻译后的文本，否则返回undefined
 */
export function translateMenuText(key) {
    if (!LSCGenabled()) return undefined;
    if (translation[key]) return translation[key];
    for (const { regex, replacement } of regexTranslations) {
        if (regex.test(key)) {
            return key.replace(regex, replacement);
        }
    }
    return undefined;
}
