import { BCXenabled } from "./enable";

const regexTranslations = [
    {
        regex: /Failed to get role data from (.+)\. This can be caused by missing permission to interact with their items\, the user having left the room meanwhile\, or the user not having the BC tab focused\./,
        replacement:
            "无法从 $1 获取角色数据.这可能是由于缺乏与其物品交互的权限、用户已离开房间,或者用户未将 BC 标签页聚焦.",
    },
    { regex: / Global\: Configuration for (.+) \-/, replacement: "- 全局: $1 的配置 -" },
    { regex: /\- Miscellaneous\: Configuration for (.+) \-/, replacement: "- 杂项: $1 的配置 -" },
    { regex: /Dear (.+),/, replacement: "亲爱的 $1," },
    { regex: / Miscellaneous\: Configuration for (.+) \-/, replacement: "- 杂项: $1 的配置 -" },
    {
        regex: /\- Export \/ Import of Behaviour Log \- Configuration on (.+) \-/,
        replacement: "- 导出/导入 行为日志 - $1 上的配置 -",
    },
    {
        regex: / Export \/ Import of BCX module configurations on (.+) \-/,
        replacement: "- 导出 / 导入 $1 的BCX模块配置 -",
    },
    {
        regex: / Relationships\: Custom names shown \(only\) to (.+) \-/,
        replacement: "- 关系: 自定义名称(仅)显示给 $1 -",
    },
    {
        regex: /\- Export \/ Import of Authority \- Permissions on (.+) \-/,
        replacement: "- 导出 / 导入 权限 - $1 的权限 -",
    },
    {
        regex: /\- Export \/ Import of Commands \- Limits on (.+) \-/,
        replacement: "- 导出 / 导入 指令 - 对 $1 的限制 - ",
    },
    { regex: /\- Export \/ Import of Curses \- Limits on (.+) \-/, replacement: "- 导出 / 导入 诅咒 - 限制 $1 - " },
    { regex: /\- Export \/ Import of Rules \- Limits on (.+) \-/, replacement: "- 导出 / 导入 规则- $1 限制 -" },
    { regex: /\- Export \/ Import of Relationships on (.+) \-/, replacement: "- 导出 / 导入 $1 上的关系 -" },
    { regex: /\- Commands\: List all commands for (.+) \-/, replacement: "- 指令: 列出 $1 的所有指令 -" },
    { regex: / Authority\: Permission Settings for (.+) \-/, replacement: "- 权限: $1 的权限设置 -" },
    { regex: /\- Curses\: All active curses on (.+) \-/, replacement: "- 诅咒: 对 $1 的所有有效诅咒 -" },
    { regex: / Behaviour Log\: Configuration for (.+) \-/, replacement: "- 行为日志: $1 的配置 -" },
    { regex: /\- Rules\: All active rules on (.+) \-/, replacement: "- 规则: $1 上的所有活动规则 -" },
    { regex: /\- Authority\: Role Management for (.+) \-/, replacement: "- 权限: $1 的角色管理 -" },
    { regex: /\- Export \/ Import of Curses on (.+) \-/, replacement: "- 导出 / 导入 $1 上的诅咒 -" },
    { regex: /\- Export \/ Import of Rules on (.+) \-/, replacement: "- 导出 / 导入 $1 的规则 -" },
    { regex: /\- Behaviour Log\: About (.+) \-/, replacement: "- 行为日志: 关于 $1 -" },
    { regex: /\- Curses\: Place new curses on (.+) \-/, replacement: "- 诅咒: 对 $1 施加新的诅咒 -" },
    { regex: /\- Rules\: Create new rules for (.+) \-/, replacement: "- 为 $1 创建新规则 -" },
    { regex: /Added by\: (.+) \((.+)\)/, replacement: "添加者: $1 ($2)" },
    {
        regex: /Forbid using remotes on self \((.+) using one on (.+)\)/,
        replacement: "禁止对自己使用遥控器($1 在 $2身上使用)",
    },
    {
        regex: /Forbid using keys on self \((.+) using one on (.+)\)/,
        replacement: "禁止对自己使用钥匙($1 在 $2身上使用)",
    },
    {
        regex: /Forbid picking locks on self \((.+) picking one on (.+)\)/,
        replacement: "禁止撬自己的锁($1 在 $2身上使用)",
    },
    {
        regex: /Forbid using locks on self \((.+) using one on (.+)\)/,
        replacement: "禁止对自己使用锁($1 在 $2身上使用)",
    },
    {
        regex: /Forbid wardrobe use on self \((.+) using (.+)'s wardrobe\)/,
        replacement: "禁止更换自己的服装($1 使用 $2 的衣柜)",
    },
    {
        regex: /Forbid freeing self \((.+) removing any items from (.+)'s body\)/,
        replacement: "禁止自己解开自己的拘束($1 从 $2 身上移除任何物品)",
    },
    {
        regex: /Prevent using BCX permissions \((.+) using her permissions for her own BCX\, with some exceptions\)/,
        replacement: "禁止使用BCX权限($1 使用她自己BCX的权限,有一些例外)",
    },
    { regex: /Prevent changing own emoticon \(for just (.+)\)/, replacement: "防止更改自己的表情符号(仅限 $1)" },
    {
        regex: /Force\-hide UI elements \(e\.g\.\, icons\, bars\, or names\)/,
        replacement: "强制隐藏UI元素(例如图标、条形、或名称)",
    },
    {
        regex: /Sensory deprivation\: Sound \(impacts (.+)'s hearing\; adjustable\)/,
        replacement: "感官剥夺: 听觉(影响 $1 的听觉；可调节)",
    },
    {
        regex: /Hearing whitelist \(of members whom (.+) can always understand\)/,
        replacement: "听觉白名单($1 始终能够理解的成员)",
    },
    {
        regex: /Sensory deprivation: Sight \(impacts (.+)'s sight\; adjustable\)/,
        replacement: "感官剥夺: 视觉(影响 $1 的视觉；可调节)",
    },
    {
        regex: /Seeing whitelist \(of members whom (.+) can always see\)/,
        replacement: "视觉白名单($1 始终能够看到的成员)",
    },
    {
        regex: /Control profile online description \(directly sets (.+)'s description\)/,
        replacement: "控制在线描述资料(直接设置 $1 的描述)",
    },
    { regex: /Control nickname \(directly sets (.+)'s nickname\)/, replacement: "控制昵称(直接设置 $1 的昵称)" },
    {
        regex: /Ready to be summoned \(leash (.+) from anywhere using a beep with message\)/,
        replacement: "准备好被召唤(随时随地使用蜂鸣消息传送 $1 )",
    },
    {
        regex: /Allow changing the whole appearance \(of (.+) - for the defined roles\)/,
        replacement: "允许更改整体外观(对于定义的角色更改 $1 的外观)",
    },
    {
        regex: /Enforce faltering speech \(an enhanced studder effect is added to (.+)'s chat texts\)/,
        replacement: "强制口吃(对 $1 的聊天文本添加了增强的阿巴阿巴的效果)",
    },
    {
        regex: /Force garbled speech \(force (.+) to talk as if they were gagged\)/,
        replacement: "强制言语混乱(强制 $1 说话, 就像被堵住一样)",
    },
    { regex: /Forbid going afk \(logs whenever (.+) is inactive\)/, replacement: "禁止 AFK(记录 $1 无操作时)" },
    {
        regex: /Track rule effect time \(counts the time this rule's trigger conditions were fulfilled\)/,
        replacement: "追踪规则生效时间(计算此规则的触发条件得到满足的时间)",
    },
    {
        regex: /Listen to my voice \(regularly show configurable sentences to (.+)\)/,
        replacement: "听我的声音(定时向 $1 弹出指定的句子)",
    },
    {
        regex: /Track BCX activation \(logs if (.+) enters the club without BCX\)/,
        replacement: "追踪BCX激活情况(如果 $1 在没有BCX的情况下进入俱乐部,则记录)",
    },
    { regex: /Eyes \(Control (.+)'s eyes\)/, replacement: "眼睛 (控制 $1 的眼睛)" },
    { regex: /Mouth \(Control (.+)'s mouth\)/, replacement: "嘴巴 (控制 $1 的嘴巴)" },
    { regex: /Arms \(Control (.+)'s arm poses\)/, replacement: "手臂 (控制 $1 的手臂姿势)" },
    { regex: /Legs \(Control (.+)'s leg poses\)/, replacement: "腿 (控制 $1 的腿部姿势)" },
    { regex: /Allfours \(Make (.+) get on all fours\)/, replacement: "四肢着地 (让 $1 四肢着地)" },
    {
        regex: /Go and wait \(Makes (.+) leave and wait in another chat room\.\)/,
        replacement: "前去等待 (让 $1 离开并在另一个聊天室等待)",
    },
    {
        regex: /Send to cell \(Lock (.+) in a singleplayer isolation cell\)/,
        replacement: "送到监狱 (锁定 $1 在单人隔离监狱中)",
    },
    { regex: /Send to asylum \(Lock (.+) into the aslyum\)/, replacement: "送入收容所 (把 $1 关进收容所)" },
    { regex: /Deposit all keys \(Store away (.+)\'s keys\)/, replacement: "存放所有钥匙 (存放 $1 的所有钥匙)" },
    {
        regex: /Show remaining time \(Remaining time of keyhold\, asylum stay\, or GGTS training\)/,
        replacement: "显示剩余时间 (持钥匙时间、收容所逗留时间或 GGTS 训练)",
    },
    {
        regex: /Send to serve drinks \(Force (.+) to do bound maid work\)/,
        replacement: "发送去送饮料 (强制 $1 做女仆工作)",
    },
    {
        regex: /Manipulate the arousal meter \(Controls (.+)\'s orgasms directly\)/,
        replacement: "操控欲望仪表 (直接控制 $1 的高潮)",
    },
    { regex: /Emoticon \(Control (.+)\'s emoticon\)/, replacement: "表情符号 (控制 $1 的表情符号)" },
    { regex: /Forced say \(Makes (.+) instantly say the text\)/, replacement: "强制说话 (使 $1 立即说出文本)" },
    { regex: /Say \(Blocks (.+) until she typed the text\)/, replacement: "说话 (阻止 $1 直到她输入文本)" },
    {
        regex: /Typing task \(Orders (.+) to type a text several times or until she makes a mistake\)/,
        replacement: "打字任务 (命令 $1 多次输入文本或直到她犯错)",
    },
    {
        regex: /Forced typing task \(Orders (.+) to type a text a set number of times\)/,
        replacement: "强制打字任务 (命令 $1 输入固定次数的文本)",
    },
    {
        regex: /This rule prevents (.+) from adding characters with the set minimum role or a higher one to their bondage club blacklist and ghostlist\./,
        replacement: "此规则防止 $1 将设置的最低角色或更高角色的角色添加到她的束缚俱乐部黑名单和忽视列表中.",
    },
    {
        regex: /This rule prevents (.+) from adding characters with a role lower than a BCX Mistress to their bondage club whitelist\./,
        replacement: "此规则防止 $1 将低于 BCX 女主人 的角色的角色添加到她的绑缚俱乐部白名单中.",
    },
    {
        regex: /This rule forbids (.+) to use any kind of lock on her own body. \(Others still can add locks on her items normally\)/,
        replacement: "此规则禁止 $1 在自己的身体上使用任何类型的锁. (其他人仍然可以正常在她的物品上添加锁)",
    },
    {
        regex: /This rule forbids (.+) to use the wardrobe of other club members\./,
        replacement: "此规则禁$1 使用其他俱乐部成员的衣柜.",
    },
    { regex: /This rule forbids (.+) to create new rooms\./, replacement: "此规则禁$1 创建新房间." },
    {
        regex: /This rule forbids (.+) to use or trigger a vibrator or similar remote controlled item on other club members\./,
        replacement: "此规则禁止 $1 在其他俱乐部成员身上使用或触发振动器或类似的远程控制物品.",
    },
    {
        regex: /This rule forbids (.+) to unlock any locked item on other club members\, with options to still allow unlocking of owner and\/or lover locks and items\. Note\: Despite the name\, this rule also blocks unlocking locks that don\'t require a key \(e\.g\. exclusive lock\)\. However\, locks that can be unlocked in other ways \(timer locks by removing time\, code\/password locks by entering correct code\) can still be unlocked by (.+)\./,
        replacement:
            "此规则禁 $1 解锁其他俱乐部成员的任何上锁物品, 选项允许仍然解锁所有者和/或情人的锁和物品.注意: 尽管名称如此, 此规则还会阻止解锁不需要钥匙的锁(例如, 专属锁).但是, 可以通过其他方式解锁的锁(通过减少时间的定时器锁, 通过输入正确代码解锁的代码 / 密码锁)仍然可以由 $2 解锁.",
    },
    {
        regex: /This rule forbids (.+) to lockpick any locked items on other club members\./,
        replacement: "此规则禁$1 对其他俱乐部成员的任何上锁物品进行撬锁.",
    },
    {
        regex: /This rule shows the amount of time that (.+) spent \(online\) in the club\, since the rule was added\, while all of the rule\'s trigger conditions were fulfilled\. So it can for instance log the time spent in public rooms \/ in the club in general, or in a specific room or with some person as part of a roleplayed task or order\. The currently tracked time can be inquired by whispering \'\!ruletime\' to (.+)\. To reset the counter\, remove and add the rule again\./,
        replacement:
            "此规则显示了自规则添加以来 $1 在俱乐部度过的(在线)时间, 同时满足了所有规则的触发条件. 因此, 它可以记录在公共房间/俱乐部中总共度过的时间, 或在特定房间或与某人一起作为角色扮演任务或命令的一部分中度过的时间. 通过私聊 '!ruletime' 给 $2 可以查询当前跟踪的时间. 要重置计数器, 请删除并再次添加规则.",
    },
    {
        regex: /This rule logs whenever money is used to buy something. It also shows how much money (.+) currently has in the log entry\. Optionally\, earning money can also be logged\. Note\: Please be aware that this last option can potentially fill the whole behaviour log rapidly\./,
        replacement:
            "此规则记录每当金钱用于购买物品时. 日志条目还显示 (.+) 当前在日志中的金钱金额. 可以选择记录赚钱的情况. 注意: 请注意, 最后一个选项可能会迅速填满整个行为日志.",
    },
    {
        regex: /This rule forbids (.+) to use or trigger a vibrator or similar remote controlled item on her own body\. \(Others still can use remotes on her\)/,
        replacement: "此规则禁$1 对自己的身体使用或触发振动器或类似的远程控制物品. (其他人仍然可以在她身上使用遥控器)",
    },
    {
        regex: /This rule forbids (.+) to unlock any locked item on her own body\. Note\: Despite the name\, this rule also blocks unlocking locks that don\'t require a key \(e\.g\. exclusive lock\)\. However\, locks that can be unlocked in other ways \(timer locks by removing time\, code\/password locks by entering correct code\) can still be unlocked by (.+)\. Others can still unlock her items on her normally\./,
        replacement:
            "此规则禁 $1 解锁自己身体上的任何上锁物品. 注意: 尽管名称如此, 此规则还会阻止解锁不需要钥匙的锁(例如, 专属锁). 但是, 可以通过其他方式解锁的锁(通过减少时间的定时器锁, 通过输入正确代码解锁的代码 / 密码锁)仍然可以由 $2 解锁. 其他人仍然可以正常解锁她身上的物品.",
    },
    {
        regex: /This rule forbids (.+) to lockpick any locked items on her own body\. \(Others still can pick locks on her normally\)/,
        replacement: "此规则禁 $1 在自己的身体上撬任何上锁物品. (其他人仍然可以正常撬她的锁)",
    },
    {
        regex: /This rule forbids (.+) to use any kind of lock on other club members\./,
        replacement: "此规则禁 $1 在其他俱乐部成员身上使用任何类型的锁.",
    },
    {
        regex: /This rule forbids (.+) to access her own wardrobe\. \(Others still can change her clothes normally\)/,
        replacement: "此规则禁 $1 访问自己的衣柜. (其他人仍然可以正常更改她的衣服)",
    },
    {
        regex: /Allows to restrict the body poses (.+) is able to get into by herself\./,
        replacement: "允许限制 $1 可以自行摆出的身体姿势.",
    },
    {
        regex: /This rule forbids (.+) access to some parts of their own BCX they have permission to use\, making it as if they do not have \'self access\' \(see BCX tutorial on permission system\) while the rule is active\. This rule still leaves access for all permissions where the lowest permitted role \(\'lowest access\'\) is also set to (.+) \(to prevent getting stuck\)\. This rule does not affect (.+)\'s permissions to use another users\'s BCX\./,
        replacement:
            "此规则禁 $1 访问她们有权限使用的自己的 BCX 的某些部分, 使其好像在规则激活时没有 'self access'(请参阅 BCX 权限系统上的教程). 该规则仍然保留了所有最低允许角色('lowest access')也设置为 $2 的权限访问(以防止被困住). 此规则不影响 $3 对其他用户的 BCX 的使用权限.",
    },
    {
        regex: /This rule forbids (.+) to use a maid's help to get out of restraints in the club\'s main hall\. Recommended to combine with the rule\: \'Force \'Cannot enter single\-player rooms when restrained\' \(Existing BC setting\)\' to prevent NPCs in other rooms from helping\./,
        replacement:
            "此规则禁 $1 在俱乐部的主大厅中使用女仆的帮助来解开约束. 建议与规则结合使用: '强制'被约束时无法进入单人房间''(现有的 BC 设置)', 以防止其他房间的 NPC 提供帮助.",
    },
    {
        regex: /This rule forbids (.+) to change her Bondage Club multiplayer difficulty, regardless of the current value\./,
        replacement: "此规则禁 $1 更改她的 Bondage Club 多人游戏难度, 无论当前值如何.",
    },
    {
        regex: /This rule forbids (.+) to use the antiblind command\. Antiblind is a BCX feature that enables a BCX user to see the whole chat room and all other characters at all times\, even when wearing a blinding item\. If (.+) should be forbidden to use the command\, this rule should be used\./,
        replacement:
            "此规则禁 $1 使用 antiblind 命令. Antiblind 是 BCX 的一个功能, 它使 BCX 用户能够在任何时候看到整个聊天室和所有其他角色, 即使佩戴蒙眼物品. 如果 $2 被禁止使用该命令, 应使用此规则.",
    },
    {
        regex: /This rule forbids (.+) to use any items on other characters\. Can be set to only affect using items on characters with a higher dominant \/ lower submissive score than (.+) has\./,
        replacement:
            "此规则禁 $1 在其他角色身上使用任何物品. 可以设置为仅在 $2 的主导/从属得分高于/低于的角色身上使用.",
    },
    {
        regex: /This rule forbids (.+) to remove any items from her own body\. Other people can still remove them\. The rule has a toggle to optionally still allow to remove items which were given a low difficulty score by the original asset maker\, such as hand\-held items\, plushies\, etc\. This means that custom crafted properties given to an item such as \'decoy\' are not factored in\./,
        replacement:
            '此规则禁 $1 从自己的身体上取下任何物品. 其他人仍然可以取下它们. 该规则具有一个切换按钮, 可以选择仍然允许取下原始资产制作者给予低难度评分的物品, 例如手持物品、毛绒玩具等. 这意味着赋予物品的自定义属性(例如"诱饵")并未计入其中.',
    },
    {
        regex: /This rule prevents (.+) from leaving the room they are currently inside while at least one character with the set minimum role or a higher one is present inside\. NOTE\: Careful when setting the minimum role too low\. If it is set to public for instance\, it would mean that (.+) can only leave the room when they are alone in it\./,
        replacement:
            "此规则阻 $1 在当前有至少一个设置的最小角色或更高角色的角色在内时离开所在的房间. 注意: 在设置最小角色时要小心. 例如, 如果设置为 public, 那么 $2 只能在房间内独自一人时离开.",
    },
    {
        regex: /This rule sets (.+)\'s online description \(in her profile\) to any text entered in the rule config\, blocking changes to it\. Warning\: This rule is editing the actual profile text\. This means that after saving a changed text, the original text is lost\!/,
        replacement:
            "此规则将 $1 的在线描述(在她的个人资料中)设置为在规则配置中输入的任何文本, 阻止对其进行更改. 警告: 此规则正在编辑实际的个人资料文本. 这意味着在保存更改的文本后, 原始文本将丢失!",
    },
    {
        regex: /This rule forbids (.+) to do any room admin actions \(except for kick\/ban\)\, when she is restrained\.Note\: This rule does not affect an admin\'s ability to bypass locked rooms\, if restraints allow it\. Tip\: This rule can be combined with the rule 'Force \´Return to chatrooms on relog\´' to trap (.+) in it\./,
        replacement:
            "此规则禁 $1 在被拘束时执行任何房间管理员操作(除了踢出/封禁). 注意: 此规则不影响管理员通过锁定的房间的能力, 如果拘束允许的话. 提示: 此规则可以与规则 强制'重新登录时返回聊天室' 结合使用, 以将 $2 困在其中.",
    },
    {
        regex: /This rule prevents (.+) from seeing their own arousal meter\, even while it is active and working\. This means\, that it is a surprise to them\, when the orgasm \(quick\-time event\) happens. Does not effect other characters being able to see the meter\, if club settings allow that\./,
        replacement:
            "此规则阻止 $1 查看自己的性唤起仪表, 即使它处于活动和工作状态. 这意味着对于她来说, 当性高潮(快感事件)发生时, 这将是一个惊喜. 如果俱乐部设置允许, 不影响其他角色能够看到仪表.",
    },
    {
        regex: /This rule impacts (.+)\'s ability to control their orgasms\, independent of items\. There are three control options\, which are\: Never cum \(always edge, the bar never reaches 100\%\)\, force into ruined orgasm \(orgasm screen starts, but doesn't let her actually cum\) and prevent resisting orgasm \(able to enter orgasm screen, but unable to resist it\)\./,
        replacement:
            "此规则影响 $1 控制她的性高潮的能力, 独立于物品. 有三个控制选项, 它们分别是: 永不高潮(始终边缘, 条形永远不达到100 %), 强迫进入毁坏的高潮(高潮画面开始, 但不让她真正高潮) 和 防止抵抗高潮(能够进入高潮画面, 但无法抵抗它).",
    },
    {
        regex: /This rule forces (.+) to always leave the room slowly\, independent of the items she is wearing\. WARNING\: Due to limitation in Bondage Club itself\, only BCX users will be able to stop (.+) from leaving the room\. This rule will ignore BC\'s roleplay difficulty setting \'Cannot be slowed down\' and slow down (.+) regardless\!/,
        replacement:
            "此规则强制 $1 总是缓慢离开房间, 与她穿戴的物品无关. 警告: 由于 Bondage Club 本身的限制, 只有BCX用户才能阻 $2 离开房间. 此规则将忽略BC的角色扮演难度设置 '无法减速', 并且无论如何都会减缓 $3!",
    },
    {
        regex: /This rule enforces full blindness when wearing any item that limits sight in any way\. \(This rules does NOT respect Light sensory deprivation setting and always forces player to be fully blind\. The crafting property \'thin\' is not factored in either due to technical limitations\. \)/,
        replacement:
            "此规则在佩戴任何以任何方式限制视力的物品时强制完全失明.  (该规则不考虑轻度感官剥夺设置, 始终强制玩家完全失明. 由于技术限制, 制作属性 '薄' 也未考虑在内.)",
    },
    {
        regex: /This rule forbids (.+) from opening the room admin screen while blindfolded\, as this discloses the room background and the member numbers of admins\, potentially in the room right now\. If (.+) is a room admin, she can still use chat commands for altering the room or kicking\/banning\./,
        replacement:
            "此规则禁 $1 在被蒙眼的情况下打开房间管理界面, 这会显示房间背景和管理员的会员编号, 可能就在当前房间. 如果 $2 是房间管理员, 她仍然可以使用聊天命令来更改房间或 踢出/封禁.",
    },
    {
        regex: /This rule enforces hiding of certain UI elements for (.+) over all characters inside the room\. Different levels of the effect can be set which follow exactly the behavior of the \'eye\'\-toggle in the button row above the chat\. There is also an option to hide emoticon bubbles over all characters\' heads\./,
        replacement:
            "此规则强制隐藏 $1 在房间内所有角色的某些UI元素. 可以设置不同级别的效果, 完全遵循上方聊天框上方的 '眼睛' 切换按钮的行为. 还有一个选项, 可以隐藏所有角色头上的表情气泡.",
    },
    {
        regex: /This rule impacts (.+)\'s natural ability to hear in the same way items do\, independent of them \(strength of deafening can be adjusted\)\./,
        replacement: "此规则影响 $1 对声音的自然感知方式, 独立于物品(可以调整失聪的强度).",
    },
    {
        regex: /This rule defines a list of members whose voice can always be understood by (.+) \- independent of any sensory deprivation items or hearing impairing BCX rules on (.+)\. There is an additional option to toggle whether (.+) can still understand a white\-listed member\'s voice if that member is speech impaired herself \(e\.g\. by being gagged\)\./,
        replacement:
            "此规则定义了一个成员列表, $1 始终可以听懂这些成员的声音 - 与 $2 身上的任何感官剥夺物品或听力受损的 BCX 规则无关. 还有一个额外的选项, 可以切换是否 $3 仍然能听懂一个被列入白名单的成员的声音, 即使该成员本身有言语障碍(例如被口球堵住).",
    },
    {
        regex: /This rule impacts (.+)\'s natural ability to see in the same way items do\, independent of them \(strength of blindness can be adjusted\)\./,
        replacement: "此规则影响 $1 对视觉的自然感知方式, 独立于物品(可以调整失明的强度).",
    },
    {
        regex: /This rule defines a list of members whose appearance can always be seen normally by (.+) \- independent of any blinding items or seeing impairing BCX rules on (.+)\./,
        replacement:
            "此规则定义了一个成员列表, $1 始终可以正常看到这些成员的外观 - 与 $2 身上的任何蒙眼物品或视觉受损的 BCX 规则无关.",
    },
    {
        regex: /This rule enforces full blindness when the eyes are closed\. \(Light sensory deprivation setting is still respected and doesn\'t blind fully\)/,
        replacement: "此规则在闭眼时强制完全失明. (仍然尊重光感剥夺设置, 不会完全失明)",
    },
    {
        regex: /This rule forces (.+)\'s base game setting \'Return to chatrooms on relog\' to configurable value and prevents her from changing it\./,
        replacement: "此规则将 $1 的基础游戏设置'重新登录时返回聊天室'强制设置为可配置的值, 并防止她更改它.",
    },
    {
        regex: /This rule forces (.+)\'s base game or BCX setting \'Keep all restraints when relogging\' to the configured value and prevents her from changing it\. There is also an option to restore the setting to the state it was in before the rule changed it\. The restoration happens either when the rule becomes inactive \(for instance through toggle or unfulfilled trigger conditions\) or when it is removed\./,
        replacement:
            '此规则将 $1 的基础游戏或 BCX 设置"重新登录时保留所有约束"强制设置为配置的值, 并防止她更改它. 还有一个选项, 可以将设置恢复到规则更改之前的状态.  恢复发生在规则变得不活跃时(例如通过切换或不满足的触发条件)或在删除规则时.',
    },
    {
        regex: /This rule forces (.+)\'s base game or BCX setting \'Garble chatroom names and descriptions while blind\' to the configured value and prevents her from changing it\. There is also an option to restore the setting to the state it was in before the rule changed it\. The restoration happens either when the rule becomes inactive \(for instance through toggle or unfulfilled trigger conditions\) or when it is removed\./,
        replacement:
            '此规则将 $1 的基础游戏或 BCX 设置"在失明时混淆聊天室名称和描述"强制设置为可配置的值, 并防止她更改它. 还有一个选项, 可以将设置恢复到规则更改之前的状态.  恢复发生在规则变得不活跃时(例如通过切换或不满足的触发条件)或在删除规则时.',
    },
    {
        regex: /This rule forces (.+)\'s base game setting \'Sensory deprivation setting\' to configurable value and prevents her from changing it\./,
        replacement: '此规则将 $1 的基础游戏设置"感官剥夺设置"强制设置为可配置的值, 并防止她更改它.',
    },
    {
        regex: /This rule forces (.+)\'s base game or BCX setting \'Prevent others from changing cosplay items\' to the configured value and prevents her from changing it\. There is also an option to restore the setting to the state it was in before the rule changed it\. The restoration happens either when the rule becomes inactive \(for instance through toggle or unfulfilled trigger conditions\) or when it is removed\./,
        replacement:
            '此规则将 $1 的基础游戏或 BCX 设置"防止其他人更改角色扮演服饰项目"强制设置为可配置的值, 并防止她更改它. 还有一个选项, 可以将设置恢复到规则更改之前的状态.  恢复发生在规则变得不活跃时(例如通过切换或不满足的触发条件)或在删除规则时.',
    },
    {
        regex: /This rule forces (.+)\'s base game or BCX setting \'Allow safeword use\' to the configured value and prevents her from changing it\. There is also an option to restore the setting to the state it was in before the rule changed it\. The restoration happens either when the rule becomes inactive \(for instance through toggle or unfulfilled trigger conditions\) or when it is removed\./,
        replacement:
            '此规则将 $1 的基础游戏或 BCX 设置"允许使用安全词"强制设置为可配置的值, 并防止她更改它. 还有一个选项, 可以将设置恢复到规则更改之前的状态.  恢复发生在规则变得不活跃时(例如通过切换或不满足的触发条件)或在删除规则时.',
    },
    {
        regex: /This rule forces (.+)\'s base game or BCX setting \'Cannot enter single\-player rooms when restrained\' to the configured value and prevents her from changing it\. There is also an option to restore the setting to the state it was in before the rule changed it\. The restoration happens either when the rule becomes inactive \(for instance through toggle or unfulfilled trigger conditions\) or when it is removed\./,
        replacement:
            '此规则将 $1 的基础游戏或 BCX 设置"受限时不能进入单人房间"强制设置为可配置的值, 并防止她更改它. 还有一个选项, 可以将设置恢复到规则更改之前的状态.  恢复发生在规则变得不活跃时(例如通过切换或不满足的触发条件)或在删除规则时.',
    },
    {
        regex: /This rule sets (.+)\'s nickname \(replacing her name in most cases\) to any text entered in the rule config\, blocking changes to it from BC's nickname menu\. You can optionally choose whether the previous BC nickname will be restored while the rule is not in effect\./,
        replacement:
            "此规则将 $1 的昵称(在大多数情况下替换她的名字)设置为规则配置中输入的任何文本, 阻止 BC 的昵称菜单更改它. 您还可以选择在规则不生效时是否恢复先前的 BC 昵称.",
    },
    {
        regex: /This rule forces (.+) to constantly participate in the kidnappers league\'s suitcase delivery task\, by automatically giving her a new suitcase\, whenever the suitcase item slot is empty\./,
        replacement:
            "此规则强制 $1 不断参与绑匪联盟的手提箱交付任务, 每当手提箱物品槽为空时, 就会自动给她一个新的手提箱.",
    },
    {
        regex: /This rule only allows selected roles to leash (.+)\, responding with a message about unsuccessful leashing to others when they attempt to do so\./,
        replacement: "此规则只允许选定的角色拴住 $1, 在其他人尝试时向他们回复关于无法拴住的消息.",
    },
    {
        regex: /This rule hides persons on (.+)\'s friend list when she is fully blinded\, which also makes sending beeps impossible\. Received beeps can still be answered\. The rule allows to manage a list of members who can be seen normally\./,
        replacement:
            "此规则在 $1 完全失明时隐藏她的好友列表上的人物, 这也使得发送哔声成为不可能. 仍然可以回答接收到的哔声. 规则允许管理一个可以正常看到的成员列表.",
    },
    {
        regex: /This rule lets you define a minimum role which \(and all higher roles\) has permission to fully change the whole appearance of (.+) \(body and cosplay items\)\, ignoring the settings of the BC online preferences \'Allow others to alter your whole appearance\' and \'Prevent others from changing cosplay items\'\. So this rule can define a group of people which is allowed\, while everyone else is not\. IMPORTANT\: Only other BCX users will be able to change (.+)\'s appearance if this rule allows them to\, while the BC settings would forbid them to\./,
        replacement:
            "此规则允许您定义一个最低角色, 该角色(及所有更高的角色)具有完全更改 $1 整体外观的权限(包括身体和cosplay物品), 而不考虑 BC 在线首选项 '允许他人更改你的整体外观' 和 '阻止他人更改cosplay物品' 的设置. 因此, 此规则可以定义一个被允许的人群, 而其他所有人则不允许. 重要提示: 只有其他 BCX 用户可以在此规则允许的情况下更改 $2 的外观, 而 BC 设置会禁止他们这样做.",
    },
    {
        regex: /This rule forces (.+)\'s base game or BCX setting \'Locks on you can\'t be picked\' to the configured value and prevents her from changing it\. There is also an option to restore the setting to the state it was in before the rule changed it\. The restoration happens either when the rule becomes inactive \(for instance through toggle or unfulfilled trigger conditions\) or when it is removed\./,
        replacement:
            "此规则强制 $1 的基础游戏或 BCX 设置 '锁定在你身上不能被撬开' 为配置的值, 并防止她更改它. 还有一个选项, 可以将设置恢复到规则更改之前的状态. 恢复发生在规则变为非活动状态时(例如通过切换或不符合触发条件)或被移除时.",
    },
    {
        regex: /This rule observes (.+)\, logging it as a rule violation if the club was previously entered at least once without BCX active\./,
        replacement: "此规则监视 $1, 如果至少有一次在未激活 BCX 的情况下进入俱乐部, 则将其记录为违规.",
    },
    {
        regex: /This rule reminds or tells (.+) one of the recorded sentences at random in a settable interval\. Only (.+) can see the set message and it is only shown if in a chat room\./,
        replacement:
            "此规则以可设置的间隔随机提醒或告诉 $1 记录的一条句子. 只有 $2 能看到设置的消息, 并且只在聊天室中显示.",
    },
    {
        regex: /This rule gives (.+) ability to understand parts of a muffled sentence ungarbled\, based on a white list of words and\/or randomly\. On default\, applies only to muffled hearing from deafening effects on (.+)\, but optionally can be enhanced to allow also partially understanding the muffled speech of other persons who are speech impaired\. Doesn\'t affect emotes and OOC text\./,
        replacement:
            "此规则赋予 $1 以能够理解部分被压制的句子的能力, 基于一个白名单词汇和/或随机选择. 默认情况下, 仅适用于 $2 受到压制效果而听力受损的情况, 但可选择增强以允许部分理解其他言语受损的人的压抑语音. 不影响表情和 OOC 文本.",
    },
    {
        regex: /This rule forbids (.+) to use the antigarble command\. Antigarble is a BCX feature that enables a BCX user to understand muffled voices from other gagged characters or when wearing a deafening item\. If (.+) should be forbidden to use the command\, this rule should be used\./,
        replacement:
            "此规则禁 $1 使用 antigarble 命令. Antigarble 是 BCX 的一项功能, 允许 BCX 用户在其他被塞口球的角色或佩戴耳聋物品时理解压制的声音. 如果不允许 $2 使用该命令, 应使用此规则.",
    },
    {
        regex: /This rule forbids (.+) to send an emote \(with \* or \/me\) to all people inside a chat room\./,
        replacement: "此规则禁 $1 向聊天室内的所有人发送表情符号(使用 * 或 /me).",
    },
    {
        regex: /This rule forces (.+)'s base game setting 'Arousal meter' to configurable value and prevents her from changing it.\./,
        replacement: "此规则强制控制 $1 的基础游戏设置中的性奋量表模式，并阻止她更改模式.",
    },
    {
        regex: /This rule forces (.+)'s base game or BCX setting \'Hide non-adjacent players while partially blind\' to the configured value and prevents her from changing it\. There is also an option to restore the setting to the state it was in before the rule changed it\. The restoration happens either when the rule becomes inactive \(for instance through toggle or unfulfilled trigger conditions\) or when it is removed\./,
        replacement:
            "该规则会强制 $1 的基础游戏或 BCX 设置中的 “部分失明时隐藏非相邻玩家 ”改为你设定的值，并阻止她更改该设置.还有一个选项可以将设置恢复到规则改变之前的状态.当规则失效（例如关闭或触发条件未满足）或被移除时，就会发生恢复.",
    },
    {
        regex: /This rule forbids (.+) to leave their current club owner or get a new one\. Advancing ownership from trial to full ownership is unaffected. Doesn\'t prevent the club owner from releasing her\./,
        replacement:
            "此规则禁 $1 离开她当前的俱乐部所有者或寻找新的. 从试用到完整所有权的提升不受影响. 不阻止俱乐部所有者解救她.",
    },
    {
        regex: /This rule forbids (.+) to get a new lover. Advancing lovership from dating to engagement or from engagement to marriage is unaffected\./,
        replacement: "此规则禁 $1 找到新的恋人. 从约会到订婚或从订婚到结婚的提升不受影响.",
    },
    {
        regex: /This rule allows (.+) to only communicate using a list of specific sound patterns in chat messages and whispers. These patterns cannot be mixed in the same message, though\. Only one sound from the list per message is valid\. That said, any variation of a sound in the list is allowed as long as the letters are in order\. \(Example\: if the set sound is \'Meow\'\, then this is a valid message\: \'Me\.\.ow\? meeeow\! mmeooowwwwwww\?\! meow\. me\.\. oo\.\.w \~\'\)/,
        replacement:
            "此规则允许 $1 仅使用聊天消息和私语中的特定声音模式进行通信. 但这些模式不能在同一条消息中混合. 每条消息只能包含列表中的一个声音. 也就是说, 只有一个声音是有效的. 换句话说, 只要字母是按顺序的, 列表中声音的任何变体都是允许的.  (例如: 如果设置的声音是 'Meow', 那么以下是有效的消息: 'Me..ow? meeeow! mmeooowwwwwww?! meow. me.. oo..w ~')",
    },
    {
        regex: /This rule alters (.+)\'s outgoing whisper messages while gagged to be garbled the same way normal chat messages are. This means\, that strength of the effect depends on the type of gag and \(OOC text\) is not affected\. Note\: While the rule is in effect\, the BC immersion preference \'Prevent OOC \& whispers while gagged\' is altered\, to allow gagged whispers\, since those are now garbled by the rule\. OOC prevention is not changed\./,
        replacement:
            "此规则更改 $1 在被口球时发出的私语消息, 使其与正常聊天消息一样被压制. 这意味着效果的强度取决于口球的类型, 而(OOC 文本)不受影响. 注意: 在规则生效期间, BC 沉浸偏好 'Prevent OOC & whispers while gagged' 会发生变化, 以允许被压制的私语, 这些现在由规则压制. OOC 防护没有改变.",
    },
    {
        regex: /This rule forbids (.+) to use OOC \(messages between round brackets\) in chat or OOC whisper messages at any moment\. This is a very extreme rule and should be used with great caution\!/,
        replacement: "此规则禁 $1 在任何时候在聊天中使用 OOC(圆括号之间的消息). 这是一个非常极端的规则, 应谨慎使用!",
    },
    {
        regex: /This rule forbids (.+) to use certain words in the chat\. The list of banned words can be configured\. Checks are not case sensitive \(forbidding \'no\' also forbids \'NO\' and \'No\'\)\. Doesn\'t affect emotes and OOC text\, but does affect whispers\./,
        replacement:
            "这个规则禁止 $1 在聊天中使用特定的单词.禁用的单词列表可以进行配置.检查时不区分大小写(禁用 'no' 也会禁用 'NO' 和 'No').这个规则不影响表情和 OOC 文本,但会影响私语.",
    },
    {
        regex: /This rule forbids (.+) to send a message to all people inside a chat room\. Does not affect whispers or emotes\, but does affect OOC\./,
        replacement: "在聊天室里,你不能给所有人发消息,但可以私聊或用表情符号.这个规则也会影响到OOC.",
    },
    { regex: /(.+) can only say the custom name/, replacement: "$1 只能说出定制名称" },
    {
        regex: /This rule can set the time (.+) needs to leave the current room\, when items or a rule force her to leave it slowly\. The time can be set between 1 and 600 seconds \(10 mins\)\./,
        replacement:
            "这个规则可以设定一个时间,当物品或规则逼迫她慢慢离开当前房间时,需要等待的时间.设置的时间范围是1到600秒(10分钟)之间.",
    },
    {
        regex: /This rule forces (.+) to switch rooms from anywhere in the club to the chat room of the summoner after 15 seconds\. It works by sending a beep message with the set text or simply the word \'summon\' to (.+)\. Members who are allowed to summon (.+) can be set\. NOTES\: (.+) can always be summoned no matter if she has a leash or is prevented from leaving the room \(ignoring restraints or locked rooms\)\. However\, if the target room is full or locked\, she will end up in the lobby\. Summoning will not work if the room name is not included with the beep message\!/,
        replacement:
            "这个规则要求在15秒内,$1必须从俱乐部的任何地方切换到召唤者的聊天室.它通过向$2发送一条带有设置文本或简单包含单词'召唤'的蜂鸣消息来实现.允许设置可以召唤$3的成员.注意: 无论$4是否被束缚或禁止离开房间(忽略限制或锁定的房间),她总是可以被召唤.但是,如果目标房间已满或已锁定,她将会进入大堂.如果蜂鸣消息中没有包含房间名,那么召唤将无效！",
    },
    {
        regex: /This rule forbids (.+) to enter all rooms, that are not on an editable whitelist of still allowed ones\. NOTE\: As safety measure this rule is not in effect while the list is empty\. TIP\: This rule can be combined with the rule \"Forbid creating new rooms\"\./,
        replacement:
            "这个规则禁止 $1 进入不在可编辑白名单上的所有房间.注意: 作为安全措施,这个规则在列表为空时不会生效.提示: 这个规则可以和 '禁止创建新房间' 的规则一起使用.",
    },
    {
        regex: /Here you switch the rule on\/off\, set a timer for activating\/deactivating \/ deleting the rule and define when it can trigger, such as either always or based on where the player is and with whom\.The small green\/red bars next to the checkboxes indicate whether a condition is true at present or not and the big bar whether this means that the rule is in effect\, if active\. Depending on the rule\, you can either enforce its effect\, log all violations\, or both at the same time\. Lastly on the bottom right\, you can set whether the trigger conditions of this rule should follow the global rules config or not\./,
        replacement:
            "在这里,您可以切换规则的开关状态,设置激活、停用或删除规则的计时器,并定义它何时触发,比如说总是或者根据玩家的位置和与谁在一起.复选框旁边的小绿条和红条显示条件当前是否成立,大条则表示这个规则是否生效(如果已激活).具体来说,根据不同的规则,您可以选择强制执行效果、记录所有违规行为,或者两者都做.最后,在右下角,您可以设置这个规则的触发条件是否要遵循全局规则配置.",
    },
    {
        regex: /This rule forces (.+) to talk as if they were gagged\, automatically garbling all of their speech\. This rule does not affect OOC\. This rule only affects whispers if the rule \"Garble whispers while gagged\" is also in effect\./,
        replacement:
            "这个规则强迫 $1 像被堵嘴一样说话,自动让她的所有话都变得模糊.这个规则不影响 OOC.只有在 '口球时扭曲私语' 这个规则生效的时候,这个规则才会影响私语..",
    },

    {
        regex: /This rule forbids (.+) to use OOC \(messages between round brackets\) in chat or OOC whisper messages while she is gagged\./,
        replacement: "此规则禁止 $1 在被堵嘴时在聊天或 OOC 私聊消息中使用 OOC（圆括号内的消息）。",
    },
    {
        regex: /This rule forbids (.+) to use the action command\. Action is a BCX feature that enables to format a message to look like a BC chat action\. If (.+) should be forbidden to use the command to communicate, this rule should be used\./,
        replacement:
            "此规则禁止 $1 使用动作命令。动作是 BCX 的一项功能，可以将消息格式化为类似 BC 聊天动作的样式。如果应禁止 $2 使用该命令进行交流，则应使用此规则。",
    },
    {
        regex: /This rule forbids (.+) to send any beeps with message, except to the defined list of member numbers\. Sending beeps without a message is not affected\. Optionally, it can be set that (.+) is only forbidden to send beeps while she is unable to use her hands \(e\.g\. fixed to a cross\)\./,
        replacement:
            "此规则禁止 $1 发送带有消息的哔哔声，除非发送给定义的成员编号列表。发送不带消息的哔哔声不受影响。可选地，可以设置为仅当 $2 无法使用双手（例如固定在十字架上）时禁止发送哔哔声。",
    },
    {
        regex: /This rule forbids (.+) to whisper anything to most people inside a chat room, except to the defined roles\. Also affects whispered OOC messages\./,
        replacement:
            "此规则禁止 $1 在聊天室内向大多数人私聊任何内容，除非是向定义的角色私聊。此规则也影响私聊的 OOC 消息。",
    },
    {
        regex: /This rule prevents (.+) from receiving any beep \(regardless if the beep carries a message or not\), except for beeps from the defined list of member numbers\. If someone tries to send (.+) a beep message while this rule blocks them from doing so, they get an auto reply beep, if the rule has an auto reply set\. (.+) won't get any indication that she would have received a beep unless the rule is not enforced, in which case she will see both the beep and the auto reply\. Optionally, the rule can be set to only activate while (.+) is unable to use her hands \(e\.g\. fixed to a cross\)\./,
        replacement:
            "此规则阻止 $1 接收任何哔哔声（无论是否带有消息），除非来自定义的成员编号列表。如果有人尝试向 $2 发送哔哔消息但被此规则阻止，且规则设置了自动回复，则他们会收到自动回复的哔哔声。$3 不会收到任何提示表明她本应收到哔哔声，除非规则未生效，此时她会同时看到哔哔声和自动回复。可选地，可以设置为仅当 $4 无法使用双手（例如固定在十字架上）时激活此规则。",
    },
    {
        regex: /This rule prevents (.+) from receiving any whispers, except from the defined roles\. If someone tries to send (.+) a whisper message while this rule blocks them from doing so, they get an auto reply whisper, if the rule has an auto reply set \(text field is not empty\)\. (.+) won't get any indication that she would have received a whisper unless the rule is not enforced, in which case she will see both the whisper and the auto reply\. This rule can also be used \(by dommes\) to prevent getting unwanted whispers from strangers in public\./,
        replacement:
            "此规则阻止 $1 接收任何私聊消息，除非来自定义的角色。如果有人尝试向 $2 发送私聊消息但被此规则阻止，且规则设置了自动回复（文本字段不为空），则他们会收到自动回复的私聊消息。$3 不会收到任何提示表明她本应收到私聊消息，除非规则未生效，此时她会同时看到私聊消息和自动回复。此规则也可用于（由主导者）防止在公共场合收到陌生人的 unwanted 私聊消息。",
    },
    {
        regex: /This rule forbids (.+) to use any \(sexual\) activities in chat rooms\. Other players can still use activities on her, as this rules does not block the arousal & sexual activities system itself, as forcing the according BC setting would\./,
        replacement:
            "此规则禁止 $1 在聊天室中使用任何（性）活动。其他玩家仍然可以对她使用活动，因为此规则不会阻止 arousal 和性活动系统本身，这与强制更改相应的 BC 设置不同。",
    },
    {
        regex: /This rule prevents (.+) from showing, removing or changing an emoticon \(afk, zZZ, etc\.\) over her head\. It also blocks her from using the emoticon command on herself\./,
        replacement:
            "此规则阻止 $1 显示、移除或更改头顶的表情符号（如 afk、zZZ 等）。同时禁止她对自己使用表情符号命令。",
    },
    {
        regex: /This rule gives (.+) a list of words from which at least one has to always be used in any chat message\. The list of mandatory words can be configured\. Checks are not case sensitive \(adding 'miss' also works for 'MISS' and 'Miss' - Note: 'Miiiiissss' would also match\)\. Doesn't affect whispers, emotes and OOC text\. There is a toggle for affecting whispers, too\./,
        replacement:
            "此规则为 $1 提供一个单词列表，任何聊天消息中必须至少使用其中一个单词。必选单词列表可配置。检查不区分大小写（添加 'miss' 也会匹配 'MISS' 和 'Miss'——注意：'Miiiiissss' 也会匹配）。不影响私聊、表情和 OOC 文本。也可选择是否影响私聊。",
    },
    {
        regex: /This rule forces (.+)'s base game setting 'Item permission' to configurable value and prevents her from changing it\./,
        replacement: "此规则强制将 $1 的基础游戏设置 '物品权限' 设为可配置的值，并阻止她更改该设置。",
    },
    {
        regex: /This rule forbids (.+) to do any room admin actions \(except for kick\/ban\), when she is restrained\. Note: This rule does not affect an admin's ability to bypass locked rooms, if restraints allow it\. Tip: This rule can be combined with the rule 'Force ´Return to chatrooms on relog´' to trap (.+) in it\./,
        replacement:
            "此规则禁止 $1 在被束缚时执行任何房间管理操作（踢出/封禁除外）。注意：如果束缚允许，此规则不会影响管理员绕过锁定房间的能力。提示：此规则可与规则 '强制重新登录后返回聊天室' 结合使用，以将 $2 困在其中。",
    },
    {
        regex: /This rule limits (.+)'s ability to send a message to all people inside a chat room to only the set number per minute\. Does not affect whispers or emotes, but does affect OOC\. Note: Setting '0' will have no effect, as there is another rule to forbid open talking completely\./,
        replacement:
            "此规则限制 $1 在聊天室内向所有人发送消息的频率为每分钟仅可发送设定的次数。不影响私聊或表情，但会影响 OOC。注意：设置为 '0' 将无效，因为另有规则完全禁止公开发言。",
    },
    {
        regex: /This rule forbids (.+) to send an emote \(with \* or \/me\) to all people inside a chat room to only the set number per minute\. Note: Setting '0' will have no effect, as there is another rule to forbid using emotes completely\./,
        replacement:
            "此规则禁止 $1 在聊天室内向所有人发送表情（使用 * 或 /me）的频率为每分钟仅可发送设定的次数。注意：设置为 '0' 将无效，因为另有规则完全禁止使用表情。",
    },
    {
        regex: /This rule gives (.+) a list of words from which at least one has to always be used in any emote message\. The list of mandatory words can be configured\. Checks are not case sensitive \(adding 'miss' also works for 'MISS' and 'Miss' - Note: 'Miiiiissss' would also match\)\./,
        replacement:
            "此规则为 $1 提供一个单词列表，任何表情消息中必须至少使用其中一个单词。必选单词列表可配置。检查不区分大小写（添加 'miss' 也会匹配 'MISS' 和 'Miss'——注意：'Miiiiissss' 也会匹配）。",
    },
    {
        regex: /This rule enforces full blindness when the eyes are closed\. \(Light sensory deprivation setting is still respected and doesn't blind fully\)/,
        replacement: "此规则在闭眼时强制完全失明。（轻度感官剥夺设置仍会生效，不会完全失明）",
    },
    {
        regex: /This rule forces (.+)'s base game setting 'Arousal meter' to configurable value and prevents her from changing it\./,
        replacement: "此规则强制将 $1 的基础游戏设置 '兴奋度计量条' 设为可配置的值，并阻止她更改该设置。",
    },
    {
        regex: /This rule lets you define a minimum role which (.+) will automatically give room admin rights to \(if she has admin rights in the room\)\. Also has the option to remove admin rights from (.+) afterwards\./,
        replacement:
            "此规则允许您定义一个最低角色，$1 会自动将房间管理员权限授予该角色（如果她在房间中拥有管理员权限）。还可选择在此后移除 $2 的管理员权限。",
    },
    {
        regex: /This rule enforces full blindness when wearing any item that limits sight in any way\. \(This rules does NOT respect Light sensory deprivation setting and always forces player to be fully blind\. The crafting property 'thin' is not factored in either due to technical limitations\. \)/,
        replacement:
            "此规则在佩戴任何限制视力的物品时强制完全失明。（此规则不遵循轻度感官剥夺设置，并始终强制玩家完全失明。由于技术限制，制作属性 '薄' 也不会被考虑在内。）",
    },
    {
        regex: /This rule forces (.+)'s base game setting 'Arousal speech stuttering' to configurable value and prevents her from changing it\./,
        replacement: "此规则强制将 $1 的基础游戏设置 '兴奋时口吃' 设为可配置的值，并阻止她更改该设置。",
    },
    {
        regex: /Thus rule converts (.+)'s messages, so she is only able to speak studdering and with random filler sounds, for some \[RP\] reason \(anxiousness, arousal, fear, etc\.\)\. Converts the typed chat text automatically\. Affects chat messages and whispers, but not OOC\./,
        replacement:
            "此规则转换 $1 的消息，使她只能以口吃和随机填充音的方式说话，出于某些 [RP] 原因（焦虑、兴奋、恐惧等）。自动转换输入的聊天文本。影响聊天消息和私聊，但不影响 OOC。",
    },
    {
        regex: /(.+) will automatically send all defined member numbers \(if they are currently online and friends with (.+)\) a beep the moment (.+) joins the club or the moment she start BCX to make her presence known\. Disconnects don't count as coming into the club again, as far as detectable\. NOTE: Trigger conditions should not be selected when using this rule, as if you for instance select 'when in public room' the rule will only greet when you load BCX in a public room\./,
        replacement:
            "$1 将在加入俱乐部或启动 BCX 时自动向所有定义的成员编号（如果他们当前在线且是 $2 的好友）发送哔哔声，以告知她的存在。只要可检测到，断开连接不会被视为再次进入俱乐部。注意：使用此规则时不应选择触发条件，例如，如果选择 '在公共房间时'，则规则仅在您在公共房间加载 BCX 时才会触发问候。",
    },
    {
        regex: /This rule forbids (.+) to use any words longer than set limit and limits number of words too\. Both limits are configurable independently\. Doesn't affect OOC text, but does affect whispers\. Note: Setting '0' means this part is not limited \(∞\), as there is another rule to forbid open talking completely\./,
        replacement:
            "此规则禁止 $1 使用超过设定长度的单词，并限制单词数量。两个限制可独立配置。不影响 OOC 文本，但会影响私聊。注意：设置为 '0' 表示该部分不受限制（∞），因为另有规则完全禁止公开发言。",
    },
    {
        regex: /Forces (.+) to greet people newly entering the current chat room with the set sentence\. NOTE: Only (.+) and the new guest can see the message not to make it spammy\. After a new person has been greeted, she will not be greeted for 10 minutes after she left \(including disconnect\) the room (.+) is in\. Setting an emote as a greeting is also supported by starting the set message with one or two '\*' characters\./,
        replacement:
            "强制 $1 使用设定的句子问候新进入当前聊天室的人。注意：只有 $2 和新客人可以看到该消息，以避免刷屏。新客人被问候后，在她离开（包括断开连接）$3 所在的房间后 10 分钟内不会再次被问候。支持将表情设置为问候语，只需在设定消息的开头添加一个或两个 '*' 字符。",
    },
    {
        regex: /This rule forbids (.+) to revieve training by the base club's GGTS feature\. If the rule is enforced while (.+) has remaining GGTS training time, it is removed the moment (.+) enters the GGTS room\./,
        replacement:
            "此规则禁止 $1 通过俱乐部基础的 GGTS 功能接受训练。如果规则在 $2 仍有剩余 GGTS 训练时间时生效，则在她进入 GGTS 房间时，剩余时间将被移除。",
    },
    {
        regex: /This rule prevents (.+) to work as a club slave by picking up a club slave collar from the club management room\./,
        replacement: "此规则阻止 $1 通过从俱乐部管理室领取俱乐部奴隶项圈来担任俱乐部奴隶。",
    },
    {
        regex: /This rule prevents (.+) to use items she does not own herself, but can use on someone because this person owns them\./,
        replacement: "此规则阻止 $1 使用她自己不拥有但可以因他人拥有而使用的物品。",
    },
    {
        regex: /This rule forces (.+)'s base game or BCX setting 'Block advanced vibrator modes' to the configured value and prevents her from changing it\. There is also an option to restore the setting to the state it was in before the rule changed it\. The restoration happens either when the rule becomes inactive \(for instance through toggle or unfulfilled trigger conditions\) or when it is removed\./,
        replacement:
            "此规则强制将 $1 的基础游戏或 BCX 设置 '阻止高级振动模式' 设为配置的值，并阻止她更改该设置。还可选择将设置恢复为规则更改前的状态。恢复会在规则变为非活动状态时（例如通过切换或未满足触发条件）或规则被移除时生效。",
    },
    {
        regex: /This rule forces (.+)'s base game or BCX setting 'Show AFK bubble' to the configured value and prevents her from changing it\. There is also an option to restore the setting to the state it was in before the rule changed it\. The restoration happens either when the rule becomes inactive \(for instance through toggle or unfulfilled trigger conditions\) or when it is removed\./,
        replacement:
            "此规则强制将 $1 的基础游戏或 BCX 设置 '显示 AFK 气泡' 设为配置的值，并阻止她更改该设置。还可选择将设置恢复为规则更改前的状态。恢复会在规则变为非活动状态时（例如通过切换或未满足触发条件）或规则被移除时生效。",
    },
    {
        regex: /This rule forces (.+)'s base game or BCX setting 'Allow others to alter your whole appearance' to the configured value and prevents her from changing it\. There is also an option to restore the setting to the state it was in before the rule changed it\. The restoration happens either when the rule becomes inactive \(for instance through toggle or unfulfilled trigger conditions\) or when it is removed\./,
        replacement:
            "此规则强制将 $1 的基础游戏或 BCX 设置 '允许他人完全更改你的外观' 设为配置的值，并阻止她更改该设置。还可选择将设置恢复为规则更改前的状态。恢复会在规则变为非活动状态时（例如通过切换或未满足触发条件）或规则被移除时生效。",
    },
    {
        regex: /This rule forbids (.+) to go afk and logs when the allowed inactivity threshold is overstepped\./,
        replacement: "此规则禁止 $1 进入 AFK 状态，并在超过允许的不活动阈值时记录日志。",
    },
    {
        regex: /Sets a specific sentence that (.+) must say loud after entering a room that is not empty\. The sentence is autopopulating the chat window text input\. When to say it is left to (.+), but when the rule is enforced, it is the only thing that can be said in this room after joining it\. Emotes can still be used, though, unless toggled to be forbidden\. Disconnects don't count as coming into a new room again, as far as detectable\./,
        replacement:
            "设置一个特定的句子，$1 必须在进入非空房间后大声说出。该句子会自动填充到聊天窗口的文本输入框中。何时说出由 $2 决定，但当规则生效时，这是加入房间后唯一可以说的内容。不过，表情仍然可以使用，除非设置为禁止。只要可检测到，断开连接不会被视为再次进入新房间。",
    },
    {
        regex: /This rule forces (.+)'s base game or BCX setting 'Allow item blur effects' to the configured value and prevents her from changing it\. There is also an option to restore the setting to the state it was in before the rule changed it\. The restoration happens either when the rule becomes inactive \(for instance through toggle or unfulfilled trigger conditions\) or when it is removed\./,
        replacement:
            "此规则强制将 $1 的基础游戏或 BCX 设置 '允许物品模糊效果' 设为配置的值，并阻止她更改该设置。还可选择将设置恢复为规则更改前的状态。恢复会在规则变为非活动状态时（例如通过切换或未满足触发条件）或规则被移除时生效。",
    },
    {
        regex: /This rule forces (.+)'s base game or BCX setting 'Flip room vertically when upside-down' to the configured value and prevents her from changing it\. There is also an option to restore the setting to the state it was in before the rule changed it\. The restoration happens either when the rule becomes inactive \(for instance through toggle or unfulfilled trigger conditions\) or when it is removed\./,
        replacement:
            "此规则强制将 $1 的基础游戏或 BCX 设置 '倒置时垂直翻转房间' 设为配置的值，并阻止她更改该设置。还可选择将设置恢复为规则更改前的状态。恢复会在规则变为非活动状态时（例如通过切换或未满足触发条件）或规则被移除时生效。",
    },
    {
        regex: /This rule forces (.+)'s base game or BCX setting 'Prevent random NPC events' to the configured value and prevents her from changing it\. There is also an option to restore the setting to the state it was in before the rule changed it\. The restoration happens either when the rule becomes inactive \(for instance through toggle or unfulfilled trigger conditions\) or when it is removed\./,
        replacement:
            "此规则强制将 $1 的基础游戏或 BCX 设置 '阻止随机 NPC 事件' 设为配置的值，并阻止她更改该设置。还可选择将设置恢复为规则更改前的状态。恢复会在规则变为非活动状态时（例如通过切换或未满足触发条件）或规则被移除时生效。",
    },
    {
        regex: /This rule forbids (.+) to leave any of their lovers, independent of lovership stage \(leaving dating, engaged and married characters is forbidden\)\. Doesn't prevent her lovers from breaking up with her\./,
        replacement:
            "此规则禁止 $1 离开任何恋人，无论恋爱阶段如何（禁止离开约会、订婚和已婚的角色）。但不阻止她的恋人与其分手。",
    },
    {
        regex: /This rule forbids (.+) to let go of any of their subs\. \(affects both trial and full ownerships\)\. Doesn't prevent her submissives from breaking the bond\./,
        replacement: "此规则禁止 $1 放弃任何他们的 sub（影响试用和完全所有权）。但不阻止她的 submissives 解除关系。",
    },
    {
        regex: /This rule forbids (.+) to use certain words as part of any emote messages\. The list of banned words can be configured\. Checks are not case sensitive \(forbidding 'no' also forbids 'NO' and 'No'\)\./,
        replacement:
            "此规则禁止 $1 在任何表情消息中使用某些单词。被禁单词列表可配置。检查不区分大小写（禁止 'no' 也会禁止 'NO' 和 'No'）。",
    },
    {
        regex: /This rule forces (.+) to retype any chat\/whisper\/emote\/OOC message as a punishment when they try to send it and another enforced BCX speech rule determines that there is any rule violation in that message\./,
        replacement:
            "此规则强制 $1 作为惩罚重新输入任何聊天/私聊/表情/OOC 消息，当她们尝试发送消息且其他已生效的 BCX 语言规则判定该消息存在违规时。",
    },
    {
        regex: /This rule forces (.+)'s base game or BCX setting 'Players can drag you to rooms when leashed' to the configured value and prevents her from changing it\. There is also an option to restore the setting to the state it was in before the rule changed it\. The restoration happens either when the rule becomes inactive \(for instance through toggle or unfulfilled trigger conditions\) or when it is removed\./,
        replacement:
            "此规则强制将 $1 的基础游戏或 BCX 设置 '玩家在被牵绳时可以拖拽你到房间' 设为配置的值，并阻止她更改该设置。还可选择将设置恢复为规则更改前的状态。恢复会在规则变为非活动状态时（例如通过切换或未满足触发条件）或规则被移除时生效。",
    },
    {
        regex: /This rule forces (.+)'s base game or BCX setting 'Events while plugged or vibed' to the configured value and prevents her from changing it\. There is also an option to restore the setting to the state it was in before the rule changed it\. The restoration happens either when the rule becomes inactive \(for instance through toggle or unfulfilled trigger conditions\) or when it is removed\./,
        replacement:
            "此规则强制将 $1 的基础游戏或 BCX 设置 '插入或振动时的事件' 设为配置的值，并阻止她更改该设置。还可选择将设置恢复为规则更改前的状态。恢复会在规则变为非活动状态时（例如通过切换或未满足触发条件）或规则被移除时生效。",
    },
    {
        regex: /This rule forces (.+)'s base game or BCX setting 'Allow item tint effects' to the configured value and prevents her from changing it\. There is also an option to restore the setting to the state it was in before the rule changed it\. The restoration happens either when the rule becomes inactive \(for instance through toggle or unfulfilled trigger conditions\) or when it is removed\./,
        replacement:
            "此规则强制将 $1 的基础游戏或 BCX 设置 '允许物品染色效果' 设为配置的值，并阻止她更改该设置。还可选择将设置恢复为规则更改前的状态。恢复会在规则变为非活动状态时（例如通过切换或未满足触发条件）或规则被移除时生效。",
    },
    {
        regex: /This rule forbids (.+) to start a trial with new submissive\. Advancing ownership from trial to full ownership is unaffected\./,
        replacement: "此规则禁止 $1 与新 submissive 开始试用关系。从试用升级为完全所有权不受影响。",
    },
    {
        regex: /Rule violations will not be logged/,
        replacement: "规则违规将不会被记录",
    },
    { regex: /Your BCX version: (.+)/, replacement: "您的 BCX 版本: $1" },
    { regex: /Your initially selected BCX preset was: \"(.+)\"/, replacement: '你最初选择的BCX预设是: "$1"' },
    { regex: /- Rules: Description of the rule: \"(.+)\"-/, replacement: '- 规则描述: "$1" -' },
    { regex: /- View \/ Edit the \'(.+)\' rule -/, replacement: "- 查看/编辑 '$1' 规则 -" },
    { regex: /(.+)\"Force \'(.+)/, replacement: "$1\"强制 '$2" },
    { regex: /(.+)Forbid using remotes on others(.+)/, replacement: "$1禁止对别人使用遥控器$2" },
    { regex: /(.+)Forbid using remotes on self(.+)/, replacement: "$1禁止对自己使用遥控器$2" },
    { regex: /(.+)Forbid using keys on others(.+)/, replacement: "$1禁止对别人使用遥控器$2" },
    { regex: /(.+)Forbid using keys on self(.+)/, replacement: "$1禁止对自己使用钥匙$2" },
    { regex: /(.+)Forbid tying up others(.+)/, replacement: "$1禁止捆绑别人$2" },
    { regex: /(.+)Prevent blacklisting(.+)/, replacement: "$1禁止增加黑名单$2" },
    { regex: /(.+)Forbid freeing self(.+)/, replacement: "$1禁止自己解开自己的拘束$2" },
    { regex: /(.+)Forbid creating new rooms(.+)/, replacement: "$1禁止创建新房间$2" },
    { regex: /(.+)Restrict allowed body poses(.+)/, replacement: "$1限制允许的身体姿势$2" },
    { regex: /(.+)Forbid using locks on self(.+)/, replacement: "$1禁止对自己使用锁$2" },
    { regex: /(.+)Forbid picking locks on self(.+)/, replacement: "$1禁止自己的撬自己的锁$2" },
    { regex: /(.+)Forbid wardrobe use on self(.+)/, replacement: "$1禁止更换自己的服装$2" },
    { regex: /(.+)Forbid picking locks on others(.+)/, replacement: "$1禁止撬别人的锁$2" },
    { regex: /(.+)Forbid using locks on others(.+)/, replacement: "$1禁止对别人使用锁$2" },
    { regex: /(.+)Forbid wardrobe use on others(.+)/, replacement: "$1禁止更换别人的服装$2" },
    { regex: /(.+)Restrict entering rooms(.+)/, replacement: "$1限制进入房间$2" },
    { regex: /(.+)Prevent leaving the room(.+)/, replacement: "$1禁止离开房间$2" },
    { regex: /(.+)Forbid the antiblind command(.+)/, replacement: "$1禁止使用防盲指令$2" },
    { regex: /(.+)Prevent usage of all activities(.+)/, replacement: "$1禁止使用所有交互动作$2" },
    { regex: /(.+)Forbid mainhall maid services(.+)/, replacement: "$1禁止大厅女仆服务$2" },
    { regex: /(.+)Forbid changing difficulty(.+)/, replacement: "$1禁止改变难度$2" },
    { regex: /(.+)Prevent whitelisting(.+)/, replacement: "$1禁止增加白名单$2" },
    { regex: /(.+)Forbid the action command(.+)/, replacement: "$1禁止动作指令$2" },
    { regex: /(.+)Prevent using BCX permissions(.+)/, replacement: "$1禁止使用 BCX 权限$2" },
    { regex: /(.+)Forbid looking at room admin UI(.+)/, replacement: "$1禁止查看房间管理界面$2" },
    { regex: /(.+)Forbid using GGTS(.+)/, replacement: "$1禁止使用 GGTS$2" },
    { regex: /(.+)Prevent working as club slave(.+)/, replacement: "$1禁止成为俱乐部的奴隶$2" },
    { regex: /(.+)Prevent using items of others(.+)/, replacement: "$1禁止使用别人的物品$2" },
    { regex: /(.+)Prevent changing own emoticon(.+)/, replacement: "$1禁止更改自己的表情符号$2" },
    { regex: /(.+)Force-hide UI elements(.+)/, replacement: "$1强制隐藏 UI 元素$2" },
    { regex: /(.+)Sensory deprivation: Sound(.+)/, replacement: "$1感觉剥夺: 听觉$2" },
    { regex: /(.+)Hearing whitelist(.+)/, replacement: "$1听觉白名单$2" },
    { regex: /(.+)Sensory deprivation: Sight(.+)/, replacement: "$1感觉剥夺: 视觉$2" },
    { regex: /(.+)Seeing whitelist(.+)/, replacement: "$1视觉白名单$2" },
    { regex: /(.+)Fully blind when eyes are closed(.+)/, replacement: "$1闭上眼睛时完全失去视力$2" },
    { regex: /(.+)Field of vision for eyes(.+)/, replacement: "$1眼睛的视野$2" },
    { regex: /(.+)Fully blind when blindfolded(.+)/, replacement: "$1蒙眼时完全看不见$2" },
    { regex: /(.+)Always leave rooms slowly(.+)/, replacement: "$1总是慢慢离开房间$2" },
    { regex: /(.+)Set slowed leave time(.+)/, replacement: "$1设置缓慢离开的时间$2" },
    { regex: /(.+)Control ability to orgasm(.+)/, replacement: "$1控制高潮$2" },
    { regex: /(.+)Secret orgasm progress(.+)/, replacement: "$1隐藏高潮进度$2" },
    { regex: /(.+)Room admin transfer(.+)/, replacement: "$1转移房间管理权限$2" },
    { regex: /(.+)Limit bound admin power(.+)/, replacement: "$1限制被束缚时管理员的权限$2" },
    { regex: /(.+)Control profile online description(.+)/, replacement: "$1控制在线个人简介$2" },
    { regex: /(.+)Control playername(.+)/, replacement: "$1控制昵称$2" },
    { regex: /(.+)Always carry a suitcase(.+)/, replacement: "$1总是携带一个手提箱$2" },
    { regex: /(.+)Restrict being leashed by others(.+)/, replacement: "$1限制被别人牵引$2" },
    { regex: /(.+)Hide online friends if blind(.+)/, replacement: "$1失明时隐藏好友列表$2" },
    { regex: /(.+)Ready to be summoned(.+)/, replacement: "$1准备好被召唤$2" },
    { regex: /(.+)Allow changing the whole appearance(.+)/, replacement: "$1允许改变整体外观$2" },
    { regex: /(.+)Item permission(.+)/, replacement: "$1物品权限$2" },
    { regex: /(.+)Locks on you can't be picked(.+)/, replacement: "$1锁在你身上无法被撬开$2" },
    {
        regex: /(.+)Cannot enter single-player rooms when restrained(.+)/,
        replacement: "$1当被束缚时不能进入单人房间$2",
    },
    { regex: /(.+)Allow safeword use(.+)/, replacement: "$1允许使用安全词$2" },
    { regex: /(.+)Arousal meter(.+)/, replacement: "$1高潮条$2" },
    { regex: /(.+)Block advanced vibrator modes(.+)/, replacement: "$1屏蔽高级震动器模式$2" },
    { regex: /(.+)Arousal speech stuttering(.+)/, replacement: "$1兴奋时口吃$2" },
    { regex: /(.+)Show AFK bubble(.+)/, replacement: "$1显示 AFK 气泡$2" },
    { regex: /(.+)Allow others to alter your whole appearance(.+)/, replacement: "$1允许别人改变你的整体外观$2" },
    { regex: /(.+)Prevent others from changing cosplay items(.+)/, replacement: "$1禁止别人更换你的角色扮演道具$2" },
    { regex: /(.+)Sensory deprivation setting(.+)/, replacement: "$1感官剥夺设置$2" },
    { regex: /(.+)Hide non-adjacent players while partially blind(.+)/, replacement: "$1在部分失明时隐藏非相邻玩家$2" },
    {
        regex: /(.+)Garble chatroom names and descriptions while blind(.+)/,
        replacement: "$1失明时混淆聊天室的名称和描述$2",
    },
    { regex: /(.+)Keep all restraints when relogging(.+)/, replacement: "$1重新登录时保存所有束缚和道具$2" },
    {
        regex: /(.+)Players can drag you to rooms when leashed(.+)/,
        replacement: "$1当被牵住时, 玩家可以把你拖到其他房间$2",
    },
    { regex: /(.+)Return to chatrooms on relog(.+)/, replacement: "$1重新登录时返回聊天室$2" },
    { regex: /(.+)Events while plugged or vibed(.+)/, replacement: "$1插着或振动时发生事件$2" },
    { regex: /(.+)Allow item tint effects(.+)/, replacement: "$1允许物品染色效果$2" },
    { regex: /(.+)Allow item blur effects(.+)/, replacement: "$1允许物品模糊效果$2" },
    { regex: /(.+)Flip room vertically when upside-down(.+)/, replacement: "$1倒立时房间垂直翻转$2" },
    { regex: /(.+)Prevent random NPC events(.+)/, replacement: "$1阻止随机 NPC 事件$2" },
    {
        regex: /Cheat: (.+) (kidnappings, ransoms, asylum, club slaves)/,
        replacement: "作弊: $1 (绑架、赎金、庇护、俱乐部奴隶)",
    },
    { regex: /(.+)Forbid club owner changes(.+)/, replacement: "$1禁止更换俱乐部主人$2" },
    { regex: /(.+)Forbid getting new lovers(.+)/, replacement: "$1禁止交新的恋人$2" },
    { regex: /(.+)Forbid breaking up with lovers(.+)/, replacement: "$1禁止与恋人分手$2" },
    { regex: /(.+)Forbid taking new submissives(.+)/, replacement: "$1禁止接收新的顺从者$2" },
    { regex: /(.+)Forbid disowning submissives(.+)/, replacement: "$1禁止放弃顺从者$2" },
    { regex: /(.+)Allow specific sounds only(.+)/, replacement: "$1仅允许特定声音$2" },
    { regex: /(.+)Garble whispers while gagged(.+)/, replacement: "$1嘴巴被堵住时混淆私聊$2" },
    { regex: /(.+)Block OOC chat while gagged(.+)/, replacement: "$1嘴巴被堵住时阻止 OOC 聊天$2" },
    { regex: /(.+)Block OOC chat(.+)/, replacement: "$1阻止 OOC 聊天$2" },
    { regex: /(.+)Doll talk(.+)/, replacement: "$1玩偶言语$2" },
    { regex: /(.+)Forbid saying certain words in chat(.+)/, replacement: "$1禁止在聊天中说某些词$2" },
    { regex: /(.+)Forbid saying certain words in emotes(.+)/, replacement: "$1禁止在表情中说某些词$2" },
    { regex: /(.+)Forbid talking openly(.+)/, replacement: "$1禁止公开聊天$2" },
    { regex: /(.+)Limit talking openly(.+)/, replacement: "$1限制公开聊天$2" },
    { regex: /(.+)Forbid using emotes(.+)/, replacement: "$1禁止使用表情符号$2" },
    { regex: /(.+)Limit using emotes(.+)/, replacement: "$1限制使用表情符号$2" },
    { regex: /(.+)Restrict sending whispers(.+)/, replacement: "$1限制发送耳语$2" },
    { regex: /(.+)Restrict receiving whispers(.+)/, replacement: "$1限制接收耳语$2" },
    { regex: /(.+)Restrict sending beep messages(.+)/, replacement: "$1限制发送蜂鸣消息$2" },
    { regex: /(.+)Restrict receiving beeps(.+)/, replacement: "$1限制接收蜂鸣$2" },
    { regex: /(.+)Order to greet club(.+)/, replacement: "$1登录时自动发蜂鸣消息$2" },
    { regex: /(.+)Forbid the antigarble option(.+)/, replacement: "$1禁止反语言混淆选项$2" },
    { regex: /(.+)Force to retype(.+)/, replacement: "$1强制重新输入$2" },
    { regex: /(.+)Order to greet room(.+)/, replacement: "$1进房间时自动发送的问候语$2" },
    { regex: /(.+)Greet new guests(.+)/, replacement: "$1问候新客人$2" },
    { regex: /(.+)Enforce faltering speech(.+)/, replacement: "$1强制断句说话$2" },
    { regex: /(.+)Establish mandatory words(.+)/, replacement: "$1建立必用的词汇$2" },
    { regex: /(.+)Establish mandatory words in emotes(.+)/, replacement: "$1在表情中建立必用的词汇$2" },
    { regex: /(.+)Partial hearing(.+)/, replacement: "$1部分听觉$2" },
    { regex: /(.+)Force garbled speech(.+)/, replacement: "$1强制口吃说话$2" },
    { regex: /(.+)Forbid going afk(.+)/, replacement: "$1禁止 AFK$2" },
    { regex: /(.+)Track rule effect time(.+)/, replacement: "$1追踪规则生效时间$2" },
    { regex: /(.+)Listen to my voice(.+)/, replacement: "$1听我的声音$2" },
    { regex: /(.+)Log money changes(.+)/, replacement: "$1记录货币变动$2" },
    { regex: /(.+)Track BCX activation(.+)/, replacement: "$1追踪 BCX 激活情况$2" },
    { regex: /Force \'(.+)\'/, replacement: "强制 '$1'" },
    { regex: /Force \'(.+)\' (Existing BC setting)/, replacement: "强制 '$1' (现有的 BC 设置)" },
];

const translation = {
    // BCX
    "You can find BCX here ►": "在此处可找到 BCX ►",
    "- Bondage Club Extended -": "- Bondage Club 扩展 -",
    "BCX TUTORIAL: Welcome": "BCX教程: 欢迎",
    "Loading...": "加载中...",
    "BCX TUTORIAL: Adding curses": "BCX教程: 添加诅咒",
    "BCX TUTORIAL: Quick overview": "BCX教程: 快速概述",
    "BCX TUTORIAL: End of introduction": "BCX教程: 介绍结束",
    "BCX TUTORIAL: Curses module overview": "BCX教程: 诅咒模块概述",
    "BCX TUTORIAL: New chat room icons": "BCX教程: 新的聊天室图标",
    "BCX TUTORIAL: Logging module screen": "BCX教程: 日志模块界面",
    "BCX TUTORIAL: Rules module overview": "BCX教程: 规则模块概述",
    "BCX TUTORIAL: Logging configuration screen": "BCX教程: 日志配置界面",
    "BCX TUTORIAL: Introduction to roles and permissions": "BCX教程: 角色和权限介绍",
    "BCX TUTORIAL: Permission system base principles": "BCX教程: 权限系统的基本原理",
    "BCX TUTORIAL: Limiting curse slots / rules": "BCX教程: 限制诅咒 插槽/规则",
    "BCX TUTORIAL: General permission examples": "BCX教程: 一般权限示例",
    "BCX TUTORIAL: Permission setup example 1": "BCX教程: 权限设置示例1",
    "BCX TUTORIAL: Permission setup example 2": "BCX教程: 权限设置示例2",
    "BCX TUTORIAL: Permission system overview": "BCX教程: 权限系统概述",
    "BCX TUTORIAL: Commands module overview": "BCX教程: 指令模块概述",
    "BCX TUTORIAL: Trigger conditions": "BCX教程: 触发条件",
    "BCX TUTORIAL: Adding a rule": "BCX教程: 添加规则",
    "BCX TUTORIAL: Chat commands": "BCX教程: 聊天指令",
    "Please choose a preset, which sets your default experience, permissions and configuration.":
        "请选择一个预设,以设定您的默认体验、权限和配置.",
    "Note: You can change the defaults, but changing to another preset is not possible without resetting BCX fully.":
        "注意: 您可以更改默认值, 但在不完全重置 BCX 的情况下, 无法更改为另一个预设.",
    "Dominant": "支配者",
    "This preset is for dominants who": "此预设适用于",
    "never intend to submit. Therefore,": "从不想屈服的支配者.因此, ",
    "most modules are not loaded at": "大多数模块在启动时.",
    "start. That said, you can still use": "未加载.话虽如此, 您仍然可以使用",
    "the BCX graphical user interface": "BCX 的图形用户界面",
    "on other BCX users to use actions,": "对其他 BCX 用户采取您有权限的操作,",
    "you have permission for, on them,": "对他们, ",
    "same as with all other presets.": "与所有其他预设相同.",
    "Switch/Exploring": "转换/探索",
    "This preset is for switches who": "此预设适用于那些",
    "are sometimes dominant and": "有时处于主导地位且,",
    "sometimes submissive, enabling": "有时处于服从地位, 从而",
    "them to explore BCX slowly, while": "让他们能够慢慢探索 BCX, 同时",
    "having full control over all of its": "完全掌控其所有的",
    "settings and features.": "设置和功能.",
    "Easily try out all features": "轻松试用所有功能",
    "Submissive": "服从者",
    "This preset is for submissives,": "此预设是为服从者准备的,",
    "who want to give some of their": "那些想要交出部分",
    "control to selected dominants and": "控制权给选定的支配者和",
    "lovers, giving only them authority": "爱人, 只赋予他们权限",
    "over some of BCX's settings. You": "对 BCX 的部分设置.您",
    "can irreversably give away more": "可以不可逆转地交出更多",
    "and more control, when you want.": "控制权, 只要您愿意.",
    "Similar to Ace's Cursed Script": "类似于 Ace 的诅咒脚本",
    "Slave": "奴隶",
    "This preset is a much more": "此预设是更为",
    "extreme submissive experience,": "极端的顺从体验, ",
    "not leaving much control over the": "没有留下太多对",
    "settings and permissions to you,": "设置和权限的控制给您, ",
    "thus enabling others to use many": "从而使别人能够使用许多",
    "of BCX's features on you. Owners": "BCX 在您身上的功能.所有者",
    "can even unblock the most extreme": "甚至可以解除最极端的",
    "settings, if they desire so.": "设置, 如果他们希望这样做的话.",
    "BCX: First time init finalized": "BCX: 首次初始化完成",
    "This is the latest version": "这是最新版本",
    "View changelog": "查看更新日志",
    "Enable typing indicator": "启用输入指示器(打字中的气泡)",
    "Show BCX icons above characters in chatroom": "在聊天室中的角色上方显示 BCX 图标",
    "Show your BCX Supporter Heart to all BCX users": "向所有 BCX 用户展示您的 BCX 支持者之心",
    "Cheat: Give yourself the mistress padlock and its key": "作弊：给自己女王锁及其钥匙",
    "Cheat: Give yourself the pandora padlock and its key": "作弊：给自己潘多拉魔盒锁及其钥匙",
    "- Permanent deletion of ALL Bondage Club Extended data -": "- 永久删除所有 Bondage Club 扩展数据 -",
    "Use the following text to auto fill the chat room search field:": "使用以下文本自动填充聊天室搜索字段:",
    "Hide BC's typing & wardrobe icon on users showing BCX one": "在显示 BCX 的用户上隐藏 BC 的打字和衣柜图标",
    "Cheat: 阻止随机 NPC 事件 (kidnappings, ransoms, asylum, club slaves)":
        "作弊：阻止随机 NPC 事件(绑架、赎金、收容所、俱乐部奴隶)",
    "Enable status indicator showing when you are in any player's BCX menu, biography, or wardrobe":
        "当您处于任何玩家的 BCX 菜单、个人简介(bio)或衣柜中时, 启用显示状态的气泡",
    "If you confirm, all BCX data (including settings, curses, logs, ...) will be permanently deleted!":
        "如果您确认, 所有 BCX 数据(包括设置、诅咒、日志……)将被永久删除!",
    "you confirm, all BCX data (including settings, curses, logs, ...) will be permanently deleted!":
        "您确认, 所有 BCX 数据(包括设置、诅咒、日志……)将被永久删除!",
    "As part of the deletion process, the window will reload, logging you out of your account.":
        "作为删除过程的一部分, 窗口将重新加载, 使您退出您的帐户.",
    "You will be able to use BCX again, but none of your current data will be coming back!":
        "您将能够再次使用 BCX, 但您当前的任何数据都不会恢复!",
    "Cheat: Prevent loosing Mistress status when reputation falls below 50 dominance":
        "作弊：当声望低于 50 支配力时防止失去女主人地位",
    "Use the extended wardrobe importer as default": "使用扩展的衣橱导入器作为默认选项",
    "This action cannot be undone!": "此操作不可撤销!",
    "Authority module permissions": "权限模块的权限",
    "Hierarchy of roles:": "角色权限的层级：",
    "Actual character name": "实际角色名称",
    "Lowest permitted role": "最低允许角色",
    "Enforce speaking it?": "强制说出吗?",
    "Export compressed": "导出压缩",
    "Member Number:": "成员编号:",
    "Behaviour Log": "行为日志",
    "Custom name": "自定义名称",
    "- Warning -": "- 警告 -",
    "Deleting...": "删除中…",
    "is permitted": "被允许",
    "New name:": "新名称:",
    "Commands": "指令",
    "Filter:": "筛选:",
    "Attach": "附加",
    "note:": "记录:",
    "Curses": "诅咒",
    "Body": "身体",
    "when": "当",
    "Praise": "表扬",
    "Only note": "仅记录",
    "Scold": "责备",
    "Name": "名称",
    "Note": "笔记",
    "room": "房间",
    "Rules": "规则",
    "Items": "物品",
    "Normal": "普通",
    "Limited": "受限制的",
    "Blocked": "被阻挡的",
    "Clothing": "服装",
    "Relationships": "人际关系",
    "room named": "房间名字",
    "Filter name:": "筛选名称:",
    "Member number": "成员编号",
    "room with role": "具有角色的房间",
    "Timer disabled": "定时器已禁用",
    "room with member": "有成员的房间",
    "Enforce this rule": "执行此规则",
    "Rule trigger conditions:": "规则触发条件:",
    "Please select a member.": "请选择一位成员.",
    "Curse trigger conditions:": "诅咒触发条件:",
    "Timer disabled by default": "定时器默认禁用",
    "Remove the item when the curse": "诅咒时移除物品",
    "Set to global rules configuration": "设置为全局规则配置",
    "Set to global curses configuration": "设置为全局诅咒配置",
    "Example: which rope tie is used": "示例: 使用了哪种绳索绑法",
    "Also curse the item's configuration": "同时对物品的配置施加诅咒",
    "This rule is active and can trigger": "此规则处于激活的状态并且可以触发",
    "This curse is active and can trigger": "此诅咒处于激活状态并且可以触发",
    "triggering - does not remove locked items": "触发 - 不会移除锁定的物品",
    "becomes inactive, removed, or is no longer": "变得不活跃、被移除或不再存在",
    "Note: Settings are applied to new curses and all existing ones set to the global config.":
        "注意: 这些设置适用于新的诅咒, 以及所有已设置为全局配置的现有诅咒",
    "- View / Edit the 'Miscellaneous' curse -": "- 查看/编辑 '杂项'诅咒 -",
    "- View / Edit the global curses configuration -": "- 查看/编辑 全局诅咒配置 -",
    '- Commands: Description of the command: "Eyes" -': '- 指令描述: "眼睛" -',
    '- Commands: Description of the command: "Mouth" -': '- 指令描述: "嘴巴" -',
    '- Commands: Description of the command: "Arms" -': '- 指令描述: "手臂" -',
    '- Commands: Description of the command: "Legs" -': '- 指令描述: "腿" -',
    '- Commands: Description of the command: "Allfours" -': '- 指令描述: "四肢着地" -',
    '- Commands: Description of the command: "Go and wait" -': '- 指令描述: "去等待" -',
    '- Commands: Description of the command: "Send to cell" -': '- 指令描述: "送进监狱" -',
    '- Commands: Description of the command: "Send to asylum" -': '- 指令描述: "送进收容所" -',
    '- Commands: Description of the command: "Deposit all keys" -': '- 指令描述: "没收所有钥匙" -',
    '- Commands: Description of the command: "Show remaining time" -': '- 指令描述: "显示剩余时间" -',
    '- Commands: Description of the command: "Send to serve drinks" -': '- 指令描述: "送去招待饮料" -',
    '- Commands: Description of the command: "Manipulate the arousal meter" -': '- 指令描述: "操纵高潮条" -',
    '- Commands: Description of the command: "Emoticon" -': '- 指令描述: "表情符号" -',
    '- Commands: Description of the command: "Forced say" -': '- 指令描述: "强制说" -',
    '- Commands: Description of the command: "Say" -': '- 指令描述: "说" -',
    '- Commands: Description of the command: "Typing task" -': '- 指令描述: "输入任务" -',
    '- Commands: Description of the command: "Forced typing task" -': '- 指令描述: "强制输入任务" -',
    "- Global: Enable/Disable BCX's modules -": "- 全局: 启用/禁用BCX的模块 -",
    "Warning: Disabling a module will reset all its settings and stored data!":
        "警告: 禁用模块将重置其所有设置和存储的数据!",
    "Authority module permissions (continued)": "权限模块权限 (延续)",
    "Behaviour Log module permissions": "行为日志模块权限",
    "Behaviour Log module permissions (continued)": "行为日志模块权限 (延续)",
    "Curses module permissions": "诅咒模块权限",
    "Curses module permissions (continued)": "诅咒模块权限 (延续)",
    "Rules module permissions": "规则模块权限",
    "Commands module permissions": "指令模块权限",
    "Relationships module permissions": "关系模块权限",
    "Export-Import module permissions": "导出-导入 模块权限",
    "Miscellaneous module permissions": "其他模块权限",
    "Restore previous value when rule ends": "规则结束时恢复之前的值",
    "Behaviour log entry when rule is violated": "违反规则时记录到行为日志",
    "Global": "全局",
    "Authority": "权限",
    "Export-Import": "导入导出",
    "Miscellaneous": "杂项",
    "For saying 'thank you' with a tip": "用于赞助支持",
    "Open changelog on GitHub": "在 GitHub 上打开更新日志",
    "Open invite to BCX Discord server": "打开 BCX Discord服务器邀请",
    "Show the BCX tutorial again": "再次显示 BCX教程",
    "Close tutorial": "关闭教程",
    "Instant Messenger": "即时消息",
    'Your initially selected BCX preset was: "Dominant"': '你最初选择的BCX预设是: "支配者"',
    'Your initially selected BCX preset was: "Switch"': '你最初选择的BCX预设是: "转换者"',
    'Your initially selected BCX preset was: "Submissive"': '你最初选择的BCX预设是: "服从者"',
    'Your initially selected BCX preset was: "Slave"': '你最初选择的BCX预设是: "奴隶"',
    "Manage BCX modules": "管理 BCX模块",
    "Clear all BCX data": "清除所有 BCX数据",
    "Enable/Disable individual modules": "启用/禁用 单个模块",
    "Emergency reset of BCX": "紧急重置BCX",
    "Confirm": "确认",
    "Cancel": "取消",
    "BCX main menu": "BCX 主菜单",
    "Add as owner": "添加为所有者",
    "Add as mistress": "添加为女主人",
    "Clubowner": "俱乐部主人",
    "Owner": "所有者",
    "Lover": "恋人",
    "Mistress": "女主人",
    "Whitelist": "白名单",
    "Friend": "朋友",
    "Public": "公开",
    "Configure the role-based BCX permissions": "配置基于角色的 BCX 权限",
    "Select member number from list": "从列表中选择成员编号",
    "You - either top or bottom of the hierarchy": "你 - 可以是层次结构的顶部或底部",
    "Your owner, visible on your character profile": "你的所有者,在你的角色资料中可见",
    'Any character, added to the list on the left as "Owner"': '任何角色,添加到左侧列表中作为 "所有者"',
    "Any of your lovers, visible on your character profile": "你的任何恋人,在你的角色资料中可见",
    'Any character, added to the list on the left as "Mistress"': '任何角色,添加到左侧列表中作为 "女主人"',
    "Anyone you have white-listed": "你白名单中的任何人",
    "Anyone you have friend-listed": "你好友名单中的任何人",
    "Anyone, who can use items on you": "任何可以在你身上使用物品的人",
    "Allow forbidding self access": "允许禁止自己访问",
    "Allow granting Mistress status": "允许授予女主人身份",
    "Allow granting Owner status": "允许授予所有者身份",
    "Allow granting self access": "允许授予自己访问权限",
    "Allow lowest access modification": "允许最低访问权限修改",
    "Previous screen": "上一页",
    "Allow revoking Mistress status": "允许撤销女主人身份",
    "Allow revoking Owner status": "允许撤销所有者身份",
    "Allow viewing list of owners/mistresses": "允许查看所有者/女主人列表",
    "Allow deleting log entries": "允许删除日志条目",
    "Allow to attach notes to the body": "允许附加注释到身体上",
    "Allow to configure what is logged": "允许配置日志记录的内容",
    "Allow to praise or scold": "允许表扬或责备",
    "Allow to see normal log entries": "允许查看正常的日志条目",
    "Allow to see protected log entries": "允许查看受保护的日志内容",
    "Allow changing colors of cursed objects": "允许更改被诅咒物品的颜色",
    "Allow to view who added the curse originally": "允许查看最初添加诅咒的人",
    "Allows editing the global curses configuration": "允许编辑全局诅咒配置",
    "Allows handling curses on limited object slots": "允许在限制的物体槽上处理诅咒",
    "Allows handling curses on non-limited object slots": "允许在非限制的物体槽上处理诅咒",
    "Allows to limit/block individual curse object slots": "允许限制/阻止单个诅咒对象槽",
    "Allow to view who added the rule originally": "允许查看最初添加规则的人",
    "Allows controlling limited rules": "允许控制限制的规则",
    "Allows controlling non-limited rules": "允许控制非限制的规则",
    "Allows editing the global rules configuration": "允许编辑全局规则配置",
    "Allows to limit/block specific rules": "允许限制/阻止特定规则",
    "Allows controlling limited commands": "允许控制限制的指令",
    "Allows controlling non-limited commands": "允许控制非限制的指令",
    "Allows to limit/block specific commands": "允许限制/阻止特定指令",
    "Allow changing relationship config for herself": "允许更改自己的关系配置",
    "Allow changing relationship config for others": "允许更改别人的关系配置",
    "Allow viewing others in relationship list": "允许查看关系列表中的别人",
    "Allow exporting BCX module configurations": "允许导出 BCX 模块配置",
    "Allow importing items using wardrobe": "允许使用衣柜导入物品",
    "Allow using the allowactivities command on this player": "允许在此玩家上使用 allowactivities 命令",
    '- Authority: Changing minimum access to permission "Allows controlling limited commands" -':
        '- 权限: 更改对权限 "允许控制限制的指令" 的最小访问权限',
    "Info: Currently set role: Owner → Newly selected role: Owner":
        "信息: 当前设置的角色: 所有者 → 新选择的角色: 所有者",
    "This player's owner, visible on their character profile": "这个玩家的所有者,可在他们的角色资料中看到",
    "This player - either top or bottom of the hierarchy": "这个玩家 - 可能是层级的顶端或底端",
    "Any lover of this player, visible on their profile": "这个玩家的任何恋人,在他们的资料中可见",
    "Anyone this player has white-listed": "任何已加入白名单的玩家",
    "Anyone this player has friend-listed": "任何已加入好友列表的玩家",
    "Anyone, who can use items on this player": "任何可以在这个玩家身上使用物品的玩家",
    "You have no permission to use this": "您没有使用此功能的权限",
    "Skip tutorial": "跳过教程",
    "<< Back to the tutorial": "<< 返回教程",
    '- Authority: Changing minimum access to permission "Allow forbidding self access" -':
        '- 权限: 更改对权限 "允许禁止自我访问" 的最小访问权限',
    '- Authority: Changing minimum access to permission "Allows editing the global curses configuration" -':
        '- 权限: 更改对权限 "允许编辑全局诅咒配置" 的最小访问权限',
    "The log has been cleared": "日志已被清除",
    "Configure logging": "配置日志记录",
    "Ability to see attached notes": "能够查看附加的备注",
    "Yes": "是",
    "Log changes in logging configuration": "记录日志配置的更改",
    "Protected": "受保护的",
    "Log changes in permission settings": "记录权限设置的更改",
    "Log deleted log entries": "记录删除的日志条目",
    "Log each addition, removal or change of rules": "记录每个规则的添加、移除或更改",
    "No": "否",
    "Log each application, removal or change of curses": "记录每个诅咒的应用、移除或更改",
    "Delete all log entries": "删除所有日志条目",
    "Log each change in relationships module": "记录关系模块的每次更改",
    "Log each change of commands limit": "记录命令限制的每次更改",
    "Log each single orgasm": "记录每一次的高潮",
    "Log every rule violation": "记录每一次违规",
    "Log every time a triggered curse reapplies an item": "记录每一次触发的诅咒重新应用物品",
    "Log getting or losing a BCX owner/mistress": "记录每一次增加或删除 BCX 所有者/女主人",
    "Log praising or scolding behavior": "记录赞扬或责备的行为",
    "Log which private rooms are entered": "记录进入哪些私人房间",
    "Log which public rooms are entered": "记录进入哪些公开房间",
    "Back": "返回",
    "ALL": "全部",
    "Activate all": "全部激活",
    "A. only": "仅激活",
    "Deactivate all": "全部停用",
    "D. only": "仅停用",
    "Change global rules config": "更改全局规则配置",
    "Remaining duration of the curse": "诅咒的剩余持续时间",
    "Add new rule": "添加新规则",
    "Existing rules set to global rules config are also changed": "全局规则配置中的现有规则也将被更改",
    "...from the list of yet unestablished rules": "......从尚未建立的规则列表中",
    "Switch all added rules to active": "将所有已添加规则切换为激活状态",
    "Activate only global config rules": "仅激活全局配置规则",
    "Deactivate only global config rules": "仅停用全局配置规则",
    "Switch all added rules to inactive": "将所有已添加规则切换为非激活状态",
    "Restrict entering rooms (only allow entering specific ones)": "限制进入房间(仅允许进入特定房间)",
    "Prevent leaving the room (while defined roles are inside)": "防止离开房间(当指定的角色在房间内时)",
    "Forbid tying up others (either everybody or only more dominant characters)":
        "禁止捆绑他人(可以是所有人或仅更占主导地位的角色)",
    "Prevent blacklisting (and ghosting of the defined roles)": "防止黑名单(和指定角色的幽灵化)",
    "Prevent whitelisting (of roles 'friend' or 'public')": "防止白名单('朋友'或'公共'角色)",
    "Forbid the antiblind command (BCX's .antiblind command)": "禁止反盲命令(BCX的 .antiblind 指令)",
    "Forbid changing difficulty (multiplayer difficulty preference)": "禁止更改难度(多人游戏的难度偏好)",
    "Prevent usage of all activities (any action buttons such as kissing or groping)":
        "防止使用所有活动(如亲吻或触摸等任何动作按钮)",
    "Forbid mainhall maid services (to get out of any restraints)": "禁止主厅女仆服务(以摆脱任何约束)",
    "Forbid the action command (BCX's .action/.a chat command)": "禁止行动指令(BCX的 .action/.a 聊天指令)",
    "Forbid looking at room admin UI (while blindfolded)": "禁止查看房间管理UI(戴眼罩时)",
    "Forbid using GGTS (training by GGTS is forbidden)": "禁止使用GGTS(GGTS的培训是禁止的)",
    "Prevent working as club slave (the task from the mistress room)": "防止成为俱乐部奴隶(女王室的任务)",
    "Prevent using items of others (items not bought)": "防止使用他人的物品(未购买的物品)",
    "Force-hide UI elements (e.g., icons, bars, or names)": "强制隐藏UI元素(例如图标、条形、或名称)",
    "Control ability to orgasm (adjustable: only-edge, only-ruin, no-resist)":
        "控制达到性高潮的能力(可调节: 仅限边缘,仅限毁灭,无抵抗)",
    "Secret orgasm progress (unable to see the own arousal meter)": "秘密性高潮进度(无法看到自己的高潮条)",
    "Room admin transfer (give admin to defined roles)": "房间管理员转让(将管理员权限赋予指定角色)",
    "Limit bound admin power (restrict room admin powers while restrained)":
        "限制被束缚玩家的管理员权限(在被束缚时限制房间管理员权限)",
    "Always carry a suitcase (from the kidnappers league multiplayer game)": "始终携带手提箱(来自绑匪联盟多人游戏)",
    "Hide online friends if blind (also preventing beeps from the friendlist - exceptions settable)":
        "如果失明,则隐藏在线好友(同时阻止来自好友列表的提示声音 - 可设置例外)",
    "Force 'Prevent random NPC events' (from BCX's Misc module)": "强制 '阻止随机NPC事件'(来自BCX的Misc模块)",
    "Forbid club owner changes (getting or leaving owner)": "禁止更改俱乐部主人(获得或离开主人)",
    "Forbid taking new submissives (by offering them an ownership trial)":
        "禁止接收新的顺从者(通过为他们提供所有权试用期)",
    "Allow specific sounds only (such as an animal sound)": "只允许特定的声音(如动物声音)",
    "Garble whispers while gagged (same as normal messages)": "在堵嘴时混肴私语(与普通消息相同)",
    "Block OOC chat while gagged (no more misuse of OOC for normal chatting while gagged)":
        "在被堵嘴时阻止OOC聊天(防止在被堵嘴时滥用OOC进行正常聊天)",
    "Block OOC chat (blocks use of OOC in messages)": "阻止OOC聊天(阻止在消息中使用OOC)",
    "Doll talk (allows only short sentences with simple words)": "娃娃聊天(只允许简单词汇的短句)",
    "Forbid saying certain words in chat (based on a configurable blacklist)":
        "禁止在聊天中说某些词(基于可配置的黑名单)",
    "Forbid saying certain words in emotes (based on a configurable blacklist)":
        "禁止在表情中说某些词(基于可配置的黑名单)",
    "Forbid talking openly (in a chat room)": "禁止在聊天室里公开谈话",
    "Limit talking openly (only allow a set number of chat messages per minute)":
        "限制公开聊天(每分钟只允许设定数量的聊天消息)",
    "Forbid using emotes (in a chat room)": "禁止在聊天室使用表情",
    "Limit using emotes (only allow a set number of emotes per minute)": "限制使用表情(每分钟只允许设定数量的表情)",
    "Restrict sending whispers (except to defined roles)": "限制发送私语(除了指定的角色)",
    "Restrict receiving whispers (except from defined roles)": "限制接收私语(除了指定的角色)",
    "Restrict sending beep messages (except to selected members)": "限制发送私聊/蜂鸣消息(仅限于选定的成员)",
    "Restrict receiving beeps (and beep messages, except from selected members)":
        "限制接收私聊/蜂鸣声(和蜂鸣消息,除非来自选定的成员)",
    "Order to greet club (when entering it through the login portal)": "命令打招呼俱乐部(通过登录门户进入时)",
    "Forbid the antigarble option (BCX's .antigarble command)": "禁止防乱码选项(BCX的 .antigarble 命令)",
    "Force to retype (if sending a message in chat is rejected by BCX due to a rule violation)":
        "强制重新输入(如果违反规则而BCX将拒绝在聊天中发送消息)",
    "Order to greet room (with a settable sentence when entering it newly)":
        "命令向房间打招呼(新进入房间时用设置的句子打招呼)",
    "Greet new guests (when they join the current room)": "欢迎新客人(当他们加入当前房间时)",
    "Establish mandatory words (of which at least one needs to always be included when speaking)":
        "建立强制词汇(说话时必须包含至少一个)",
    "Establish mandatory words in emotes (of which at least one needs to always be included)":
        "在表情中建立强制词汇(发送表情时必须包含至少一个)",
    "Partial hearing (of muffled speech - random & word list based)": "部分听力(受到沉闷言语的影响 - 基于随机和词汇表)",
    "Track rule effect time (counts the time this rule's trigger conditions were fulfilled)":
        "追踪规则生效时间(计算此规则的触发条件得到满足的时间)",
    "Log money changes (spending and/or getting money)": "记录金钱变动(支出和/或获得金钱)",
    "Edit rules permissions": "编辑规则权限",
    "Leave permission mode": "离开权限修改模式",
    "Change global curses config": "更改全局诅咒配置",
    "Add new curse": "添加新诅咒",
    "Lift all curses": "解除所有诅咒",
    "Place new curses on body, items or clothes": "在身体、物品或衣物上施加新的诅咒",
    "Remove all curses on body, items or clothes": "移除身体、物品或衣物上的所有诅咒",
    "Existing curses set to global curses config are also changed": "全局诅咒配置中已存在的诅咒也会被更改",
    "Activate only global config curses": "仅激活全局配置的诅咒",
    "Switch all added curses to inactive": "将所有已添加诅咒切换为非活动状态",
    "Switch all added curses to active": "将所有已添加诅咒切换为活动状态",
    "Deactivate only global config curses": "仅停用全局配置的诅咒",
    "Curse occupied": "诅咒已占用",
    "Curse all": "全部诅咒",
    "Lower Leg": "小腿",
    "Upper Leg": "大腿",
    "Nipple Piercing": "乳头穿孔",
    "Collar Addon": "项圈附加件",
    "Collar Restraint": "项圈拘束",
    "Mouth (1)": "嘴巴 (1)",
    "Mouth (2)": "嘴巴 (2)",
    "Mouth (3)": "嘴巴 (3)",
    "Hood": "头套",
    "Devices": "设备",
    "General Addon": "通用附属物",
    "Feet": "脚",
    "Ears Accessory": "耳朵饰品",
    "Nothing": "无",
    "Curse all occupied slots at once": "一次性诅咒所有已占用的插槽",
    "Curse all slots at once": "一次性诅咒所有插槽",
    "Edit curse slot permissions": "编辑诅咒插槽权限",
    "Character Height": "角色身高",
    "Mouth Style": "嘴巴样式",
    "Pussy Style": "阴部样式",
    "Toggle alphabetical sorting": "切换字母排序",
    "Toggle availability-based sorting": "切换基于可用性的排序",
    "You don't have permission to use this rule": "您没有使用此规则的权限",
    "Show remaining time (Remaining time of keyhold, asylum stay, or GGTS training)":
        "显示剩余时间 (持钥匙时间、收容所逗留时间或 GGTS 训练)",
    "Edit commands permissions": "编辑命令权限",
    "Add": "添加",
    "Authority - Permissions": "权限 - 权限",
    "Behaviour Log - Configuration": "行为日志 - 配置",
    "Curses - Limits": "诅咒 - 限制",
    "Rules - Limits": "规则 - 限制",
    "Commands - Limits": "指令 - 限制",
    "Export": "导出",
    "Import": "导入",
    "Export current config": "导出当前配置",
    "Try to import a previously exported config": "尝试导入先前导出的配置",
    "Enable timer": "启用定时器",
    "Always in effect": "始终生效",
    "in": "在",
    "public": "公共",
    "-1d": "-1天",
    "-1h": "-1小时",
    "-5m": "-5分钟",
    "+5m": "+5分钟",
    "+1h": "+1小时",
    "+1d": "+1天",
    "Removes rule instead of only deactivating it": "删除规则而不仅仅是停用它",
    "Overwrites current trigger conditions": "覆盖当前触发条件",
    "All selected below": "下面全部选中",
    "not in": "不在",
    "private": "私有",
    "[unknown],": "[未知],",
    "Mistress ↑": "女主人 ↑",
    "Whitelist ↑": "白名单 ↑",
    "Friend ↑": "朋友 ↑",
    "Public ↑": "公共 ↑",
    "Owner ↑": "所有者 ↑",
    "Lover ↑": "恋人 ↑",
    "Go back without saving": "返回而不保存",
    "Save all changes and go back": "保存所有更改并返回",
    "Many": "许多",
    "Default": "默认",
    "Exclude body parts": "排除身体部位",
    "Include items/restraints": "包括物品/限制",
    "Copied to clipboard!": "已复制到剪贴板!",
    "Clothes": "衣服",
    "Select individually": "单独选择",
    "Cosplay items": "角色扮演道具",
    "Restraints/items": "限制/物品",
    "Collar": "项圈",
    "Piercings": "穿孔",
    "Locks": "锁",
    "Color help": "颜色帮助",
    "<<< Back": "<<< 返回",
    "[EMPTY]": "[空]",
    "Global configuration is not possible on others": "无法在其他角色上进行全局配置",
    "Please select the new lowest role that should still have this permission.":
        "请选择新的最低角色权限等级以保持此权限.",
    "All roles to the left of the selected one will also automatically get access.":
        "所选角色左侧的所有角色也将自动获得访问权限.",
    "WARNING: If you confirm, all permitted roles can remove your access to this and all other permissions!":
        "警告: 如果您确认,所有被允许的角色都可以撤销您对此和所有其他权限的访问权限!",
    '- Authority: Changing minimum access to permission "Allow granting Mistress status" -':
        '- 权限: 更改对 "允许授予女主身份" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allow granting Owner status" -':
        '- 权限: 更改对 "允许授予所有者身份" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allow granting self access" -':
        '- 权限: 更改对 "允许授予自己访问权限" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allow lowest access modification" -':
        '- 权限: 更改对 "允许最低访问级别修改" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allow revoking Mistress status" -':
        '- 权限: 更改对 "允许撤销女主身份" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allow revoking Owner status" -':
        '- 权限: 更改对 "允许撤销所有者身份" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allow viewing list of owners/mistresses" -':
        '- 权限: 更改对 "允许查看所有者/女主列表" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allow deleting log entries" -':
        '- 权限: 更改对 "允许删除日志条目" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allow to attach notes to the body" -':
        '- 权限: 更改对 "允许在身体上添加注释" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allow to configure what is logged" -':
        '- 权限: 更改对 "允许配置记录的内容" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allow to praise or scold" -':
        '- 权限: 更改对 "允许表扬或责备" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allow to see normal log entries" -':
        '- 权限: 更改对 "允许查看普通日志条目" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allow to see protected log entries" -':
        '- 权限: 更改对 "允许查看受保护的日志条目" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allow changing colors of cursed objects" -':
        '- 权限: 更改对 "允许更改被诅咒物品的颜色" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allow to view who added the curse originally" -':
        '- 权限: 更改对 "允许查看最初添加诅咒的人" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allows handling curses on limited object slots" -':
        '- 权限: 更改对 "允许在限制的对象槽上处理诅咒" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allows handling curses on non-limited object slots" -':
        '- 权限: 更改对 "允许在非限制的对象槽上处理诅咒" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allows to limit/block individual curse object slots" -':
        '- 权限: 更改对 "允许限制/阻止个别诅咒对象槽" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allow to view who added the rule originally" -':
        '- 权限: 更改对 "允许查看最初添加规则的人" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allows controlling limited rules" -':
        '- 权限: 更改对 "允许控制限制规则" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allows controlling non-limited rules" -':
        '- 权限: 更改对 "允许控制非限制规则" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allows editing the global rules configuration" -':
        '- 权限: 更改对 "允许编辑全局规则配置" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allows to limit/block specific rules" -':
        '- 权限: 更改对 "允许限制/阻止特定规则" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allows controlling non-limited commands" -':
        '- 权限: 更改对 "允许控制非限制命令" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allows to limit/block specific commands" -':
        '- 权限: 更改对 "允许限制/阻止特定命令" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allow changing relationship config for herself" -':
        '- 权限: 更改对 "允许为自己更改关系配置" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allow changing relationship config for others" -':
        '- 权限: 更改对 "允许为别人更改关系配置" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allow viewing others in relationship list" -':
        '- 权限: 更改对 "允许查看别人的关系列表" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allow exporting BCX module configurations" -':
        '- 权限: 更改对 "允许导出BCX模块配置" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allow importing items using wardrobe" -':
        '- 权限: 更改对 "允许使用衣柜导入物品" 权限的最低访问级别 -',
    '- Authority: Changing minimum access to permission "Allow using the allowactivities command on this player" -':
        '- 权限: 更改对 "允许在此玩家上使用 allowactivities 命令" 权限的最低访问级别 -',
    "Forbid using remotes on others": "禁止对别人使用遥控器",
    "Forbid using remotes on self": "禁止对自己使用遥控器",
    "Forbid using keys on others": "禁止对别人使用遥控器",
    "Forbid using keys on self": "禁止对自己使用钥匙",
    "Forbid tying up others": "禁止捆绑别人",
    "Prevent blacklisting": "禁止增加黑名单",
    "Forbid freeing self": "禁止自己解开自己的拘束",
    "Forbid creating new rooms": "禁止创建新房间",
    "Restrict allowed body poses": "限制允许的身体姿势",
    "Forbid using locks on self": "禁止对自己使用锁",
    "Forbid picking locks on self": "禁止自己的撬自己的锁",
    "Forbid wardrobe use on self": "禁止更换自己的服装",
    "Forbid picking locks on others": "禁止撬别人的锁",
    "Forbid using locks on others": "禁止对别人使用锁",
    "Forbid wardrobe use on others": "禁止更换别人的服装",
    "Restrict entering rooms": "限制进入房间",
    "Prevent leaving the room": "禁止离开房间",
    "Forbid the antiblind command": "禁止使用反盲指令",
    "Prevent usage of all activities": "禁止使用所有交互动作",
    "Forbid mainhall maid services": "禁止大厅女仆的解绑服务",
    "Forbid changing difficulty": "禁止改变难度",
    "Prevent whitelisting": "禁止增加白名单",
    "Forbid the action command": "禁止bcx的动作指令(.a)",
    "Prevent using BCX permissions": "禁止使用 BCX 权限",
    "Forbid looking at room admin UI": "禁止查看房间管理界面",
    "Forbid using GGTS": "禁止使用 GGTS",
    "Prevent working as club slave": "禁止成为俱乐部的奴隶",
    "Prevent using items of others": "禁止使用别人的物品",
    "Prevent changing own emoticon": "禁止更改自己的表情符号",
    "Force-hide UI elements": "强制隐藏 UI 元素",
    "Sensory deprivation: Sound": "感官剥夺: 听觉",
    "Hearing whitelist": "听觉白名单",
    "Sensory deprivation: Sight": "感官剥夺: 视觉",
    "Seeing whitelist": "视觉白名单",
    "Fully blind when eyes are closed": "闭眼时时完全看不见",
    "Field of vision for eyes": "眼睛的视野",
    "Fully blind when blindfolded": "蒙眼时完全看不见",
    "Always leave rooms slowly": "总是缓慢离开房间",
    "Set slowed leave time": "设置缓慢离开的时间",
    "Control ability to orgasm": "控制高潮",
    "Secret orgasm progress": "对自己隐藏高潮条",
    "Room admin transfer": "转移房间管理权限",
    "Limit bound admin power": "限制被束缚时管理员的权限",
    "Control profile online description": "控制bio/在线个人简介",
    "Control nickname": "控制昵称",
    "Always carry a suitcase": "总是携带一个手提箱",
    "Restrict being leashed by others": "限制被别人牵引",
    "Hide online friends if blind": "失明时隐藏好友列表",
    "Ready to be summoned": "准备好被召唤",
    "Allow changing the whole appearance": "允许改变整体外观",
    "Item permission": "物品权限",
    "Locks on you can't be picked": "锁在你身上无法被撬开",
    "Cannot enter single-player rooms when restrained": "当被束缚时不能进入单人房间",
    "Allow safeword use": "是否允许安全词",
    "Arousal meter": "高潮条",
    "Block advanced vibrator modes": "屏蔽高级震动器模式",
    "Arousal speech stuttering": "兴奋时口吃",
    "Show AFK bubble": "显示 AFK 气泡",
    "Allow others to alter your whole appearance": "允许别人改变你的整体外观",
    "Prevent others from changing cosplay items": "禁止别人更换你的角色扮演道具",
    "Sensory deprivation setting": "感官剥夺设置",
    "Hide non-adjacent players while partially blind": "在部分失明时隐藏非相邻玩家",
    "Garble chatroom names and descriptions while blind": "失明时混淆聊天室的名称和描述",
    "Keep all restraints when relogging": "重新登录时保存所有束缚和道具",
    "Players can drag you to rooms when leashed": "当被牵住时, 玩家可以把你拖到其他房间",
    "Return to chatrooms on relog": "重新登录时返回聊天室",
    "Events while plugged or vibed": "插着或振动时发生事件",
    "Allow item tint effects": "允许物品染色效果",
    "Allow item blur effects": "允许物品模糊效果",
    "Flip room vertically when upside-down": "倒立时房间垂直翻转",
    "Prevent random NPC events": "阻止随机 NPC 事件",
    "Forbid club owner changes": "禁止更换俱乐部主人",
    "Forbid getting new lovers": "禁止交新的恋人",
    "Forbid breaking up with lovers": "禁止与恋人分手",
    "Forbid taking new submissives": "禁止接收新的顺从者",
    "Forbid disowning submissives": "禁止放弃顺从者",
    "Allow specific sounds only": "仅允许特定声音",
    "Garble whispers while gagged": "被堵嘴时混淆耳语",
    "Block OOC chat while gagged": "被堵嘴时阻止 OOC 聊天",
    "Block OOC chat": "阻止 OOC 聊天",
    "Doll talk": "玩偶言语",
    "Forbid saying certain words in chat": "禁止在公屏和私语中说某些词",
    "Forbid saying certain words in emotes": "禁止在表情中说某些词",
    "Forbid talking openly": "禁止公屏聊天",
    "Limit talking openly": "限制公屏聊天频率",
    "Forbid using emotes": "禁止使用表情(*)",
    "Limit using emotes": "限制使用表情(*)频率",
    "Restrict sending whispers": "限制发送耳语",
    "Restrict receiving whispers": "限制接收耳语",
    "Restrict sending beep messages": "限制发送私聊/蜂鸣消息",
    "Restrict receiving beeps": "限制接收私聊/蜂鸣",
    "Order to greet club": "登录时自动发私聊问候",
    "Forbid the antigarble option": "禁止反语言混淆选项",
    "Force to retype": "强制重新输入",
    "Order to greet room": "进房间时自动发送的问候语",
    "Greet new guests": "问候新客人",
    "Enforce faltering speech": "强制断句说话",
    "Establish mandatory words": "建立必用的词汇",
    "Establish mandatory words in emotes": "在表情中建立必用的词汇",
    "Partial hearing": "部分听觉",
    "Force garbled speech": "强制失真聊天",
    "Forbid going afk": "禁止 AFK",
    "Track rule effect time": "追踪规则生效时间",
    "Listen to my voice": "听我的声音(洗脑语音)",
    "Log money changes": "记录货币变动",
    "Track BCX activation": "追踪 BCX 激活情况",
    "Miscellaneous module configuration is not possible on others": "无法在他人身上进行杂项模块配置",
    "Module is deactivated": "模块已停用",
    "Members numbers allowed to summon:": "允许召唤的成员编号:",
    "The text used for summoning:": "用于召唤的文本:",
    "Time in seconds before enforcing summon:": "强制召唤前的时间(秒):",
    "Minimum role that is allowed to leash:": "允许牵引的最低角色:",
    "Members numbers still heard while hearing impaired:": "听觉受损时仍然可听到的成员编号:",
    "Also understand if those are speech impaired": "是否同时理解言语障碍",
    "New leave time in seconds:": "新的离开时间(秒):",
    "Set this player's nickname:": "设置此玩家的昵称:",
    "Restore the previous nickname at rule end": "在规则结束时恢复先前的昵称",
    "Set the allowed sounds:": "设置允许的声音:",
    "All forbidden words:": "所有禁止的词语:",
    "Amount of minutes, before being considered inactive:": "被视为不活跃之前的分钟数:",
    "Also log getting money": "也记录获取金钱",
    "Still allow unlocking owner locks or items": "仍然允许解锁主人锁或物品",
    "Still allow unlocking lover locks or items": "仍然允许解锁恋人锁或物品",
    "Minimum role able to request counted time:": "能够请求计时的最低角色:",
    "The sentences that will be shown at random:": "将随机显示的句子:",
    "Frequency of a sentence being shown (in minutes):": "句子显示的频率(分钟):",
    "Everyone, no exceptions": "所有人,无例外",
    "BCX: Rule changed your 'Item permission' setting": "BCX: 规则更改了您的'物品权限'设置",
    "Everyone, except blacklist": "所有人,除了黑名单",
    "Owner, Lovers, whitelist & Dominants": "主人,恋人,白名单和支配者",
    "Owner, Lovers and whitelist only": "仅主人,恋人和白名单",
    "BCX: Rule changed your 'Locks on you can't be picked' setting": "BCX: 规则更改了您的'不能撬开您身上的锁'设置",
    "Hearing impairment:": "听觉受损:",
    "Light": "轻度",
    "Medium": "中度",
    "Heavy": "重度",
    "Eyesight impairment:": "视觉受损:",
    "Player sees the effect also on herself": "玩家也能在自己身上看到效果",
    "Hide names and icons during the effect": "在效果期间隐藏名字和图标",
    "Orgasm attempts will be fixed to:": "尝试高潮将被固定为:",
    "Edge": "边缘",
    "Ruin": "毁灭",
    "Prevent resisting": "防止抵抗",
    "Minimum role that gets admin:": "获得管理员权限的最低角色:",
    "Player loses admin afterwards": "玩家在之后失去管理员权限",
    "Edit this player's profile description:": "编辑此玩家的个人描述:",
    "Members numbers that can always be seen:": "始终可见的成员编号:",
    "Mark poses as being allowed or forbidden:": "将姿势标记为允许或禁止:",
    "Only joining rooms with these names is allowed:": "只允许加入具有这些名称的房间:",
    "Minimum role preventing room leaving:": "阻止离开房间的最低角色:",
    "Favorite: Listed first in overview": "收藏: 在概览中首先列出",
    "Still allow removing low difficulty items": "仍然允许移除低难度物品",
    "Only forbid tying people with higher dominance": "仅禁止对更高支配值的玩家进行绑缚",
    "Minimum role forbidden to blacklist:": "被禁止添加到黑名单的最低角色:",
    "The level of forced garbling": "强制性的语音失真程度",
    "Words that can always be understood:": "始终可以理解的单词:",
    "Some words are randomly understood": "一些单词将随机理解",
    "Can also understand gagged persons": "也能理解被塞口球的玩家",
    "At least one of these words always needs to be used:": "这些单词中至少需要始终使用一个:",
    "Also affect whispered messages": "也影响私语消息",
    "Member numbers still allowed to send beeps:": "仍然允许发送蜂鸣消息的成员编号:",
    "Auto replies blocked sender with this:": "自动回复被屏蔽发件人使用此:",
    "Only in effect when unable to use hands": "仅在无法使用双手时生效",
    "Member numbers that will be greeted:": "将被问候的成员编号:",
    "The sentence that has to be used to greet any joined room:": "必须用于问候任何加入的房间的句子:",
    "Also forbid emote messages before greeting": "还禁止在问候之前发送表情消息",
    "The sentence that will be used to greet new guests:": "将用于问候新客人的句子:",
    "Usage blocked by BCX": "被BCX禁止使用",
    "Filter items": "过滤物品",
    "Select what shall be hidden:": "选择要隐藏的内容:",
    "Icons": "图标",
    "Also hide emoticons during the effect": "在生效期间也隐藏表情符号",
    "Icons/Bar": "图标/条",
    "Icons/Bar/Names": "图标/条/名称",
    "Minimum role that is allowed:": "允许的最低角色:",
    "Sexual activities - Activation": "性活动 - 激活",
    "Allow with a hybrid meter": "允许使用混合仪表",
    "Meter visibility": "仪表可见性",
    "Show arousal to everyone": "向所有人显示高潮条",
    "Show if they have access": "如果他们有权限则显示",
    "BCX: Rule changed your 'Arousal meter' setting": "BCX: 规则更改了你的'高潮条'设置",
    "Allow with a locked meter": "允许使用锁定的仪表",
    "Disable sexual activities": "禁用性活动",
    "Allow without a meter": "允许没有仪表",
    "Allow with a manual meter": "允许使用手动仪表",
    "Show to yourself only": "仅自己可见",
    "Speech stuttering": "语言结巴",
    "Aroused & vibrated": "激动和振动",
    "Never stutter": "永不结巴",
    "When you're aroused": "当你兴奋时",
    "When you're vibrated": "当你被振动时",
    "BCX: Rule changed your 'Show AFK bubble' setting": "BCX: 规则更改了你的'显示离开状态气泡'设置",
    "Disable examining when blind": "失明时禁用检查",
    "Hide others' messages": "隐藏他人的消息",
    "Hide names": "隐藏名称",
    "BCX: Rule changed your 'Sensory deprivation setting' setting": "BCX: 规则更改了你的'感官剥夺设置'设置",
    "Total": "总计",
    "Auto-remake rooms": "自动重新创建房间",
    "BCX: Rule changed your 'Return to chatrooms on relog' setting": "BCX: 规则更改了你的'重新登录时返回聊天室'设置",
    "BCX: Rule changed your 'Allow item blur effects' setting": "BCX: 规则更改了你的'允许物品模糊效果'设置",
    "BCX: Rule changed your 'Flip room vertically when upside-down' setting":
        "BCX: 规则更改了你的'倒置时垂直翻转房间'设置",
    "Max. character length of any word:": "任何单词的最大字符长度:",
    "Max. number of words per message:": "每条消息的最大单词数:",
    "Maximum allowed number of chat messages per minute (> 0):": "每分钟允许的最大聊天消息数 (> 0):",
    "Maximum allowed number of emotes per minute (> 0):": "每分钟允许的最大表情数 (> 0):",
    "Minimum role whispering is still allowed to:": "仍允许接收悄悄话的最低角色:",
    "Minimum role still allowed to send whisper:": "仍允许发送耳语的最低角色:",
    "Member numbers still allowed to be beeped:": "仍允许蜂鸣消息的玩家编号:",
    "BCX: You are not allowed to talk openly in chatrooms!": "BCX: 你不能在聊天室中公开说话!",
    "BCX: A BCX rule prevents you from using this while unable to see!":
        "BCX: 一个BCX规则阻止你在无法看到的情况下使用这个!",
    "Instant Messenger (Disabled by BCX)": "即时通讯(被BCX禁用)",
    "BCX: You are not allowed to use emotes in chatrooms!": "BCX: 不允许在聊天室使用表情!",
    "BCX: You are not allowed to change the emoticon!": "BCX: 不允许更改表情!",
    "Toggle Shared Crafts": "共享自制道具",
    "Modify layering priority": "修改图层优先级",
    "Adjust individual layers": "调整单独图层",
    "Set item priority": "设置物品优先级",
    "Choose clothing": "选择服装",
    "Choose body parts": "选择身体部位",
    "Choose cosplay items": "选择角色道具",
    "How does it work?": "它是如何操作的?",
    "If you are permitted, this screen enables you to view, add, or remove the BCX-only roles 'Owner' and 'Mistress', which expand the classic roles of BC such as Bondage Club's Owner and the Lovers. The hierarchy of all roles that can be used to set various things in BCX can be seen on the right. The higher up a role is, the more authority it has. For instance, if something applies or is permitted for a Mistress, it also always is for an Owner. Any number of Owners and Mistresses can be set. Check their current power over BCX with the button on the right.":
        "如果您获得许可, 此屏幕使您能够查看、添加或删除仅限 BCX 的角色“主人”和“女主人”, 这拓展了 BC 的经典角色, 如束缚俱乐部的主人和恋人.可用于在 BCX 中设置各种事项的所有角色的层级结构显示在右侧.角色位置越高, 其权限越大.例如, 如果某事适用于女主人或对其许可, 那么对主人也始终适用.可以设置任意数量的主人和女主人.使用右侧的按钮检查它们对 BCX 的当前权限.",
    "we are happy you are interested in our extension for the Bondage Club (BC) in which we invest a lot of our free time and love. If you have any questions, suggestions, or encounter any bugs, please feel free to get in touch with us on Discord. A button linking to it is in the main menu.":
        "我们很高兴您对我们为束缚俱乐部(BC)所做的扩展感兴趣, 我们在其中投入了大量的空闲时间和热爱.如果您有任何问题、建议或遇到任何错误, 请随时通过 Discord 与我们联系.主菜单中有一个指向它的按钮.",
    "The heart of BCX: Allows to configure the permissions to set up and use most of BCX. Default settings depend on the initial BCX setup preset selected. Self access is the checkbox next to every permission and the lowest access role is to its right. Example: If 'allow forbidding self access', 'allow granting self access', 'allow lowest access modification' have the checkbox removed and lowest role is 'Owner', then current and newly added BCX owners and the BC owner can get full control over any permissions they have access to. So careful with those three permissions!":
        "BCX 的核心：允许配置设置和使用 BCX 大部分内容的权限.默认设置取决于所选择的初始 BCX 设置预设.自访问是每个权限旁边的复选框, 最低访问角色在其右侧.例如：如果“允许禁止自访问”“允许授予自访问”“允许最低访问修改”的复选框被取消, 且最低角色是“主人”, 那么当前和新添加的 BCX 所有者以及 BC 所有者可以完全控制他们有权访问的任何权限.所以要小心这三个权限!",
    "This screen shows logs of important events. What is logged depends on the logging configuration, which can be viewed/edited via the button to the right. Log entries can have normal or protected visibility. Access to those as well as removing entries or the configuration is determined by the according authority module permission settings. The log can document the BCX's user's conduct, any rule violations, important changes made to BCX settings, curses or rules, and notes from other people.":
        "此界面展示重要事件的日志.所记录的内容取决于日志配置, 可通过右侧的按钮进行查看/编辑.日志条目可以有普通或受保护的可见性.对这些条目的访问以及条目的删除或配置由相应的权限模块权限设置决定.该日志可以记录 BCX 用户的行为、任何违规行为、对 BCX 设置的重要更改、诅咒或规则, 以及他人的注释.",
    "This screen determines what is logged in the behaviour log and what the visibility of each type of log messages is. 'Yes' means this log type has normal visibility, while 'protected' means only roles who have permission to view protected entries can view them. 'No' means that this log type is not logged at all. In the permission settings view of the authority module, the permissions of this log module can be configured.":
        "此界面决定了行为日志中记录的内容以及每种类型日志消息的可见性.“是”意味着此日志类型具有正常可见性, 而“受保护”意味着只有有权查看受保护条目的角色才能查看它们.“否”表示根本不记录此日志类型.在权限模块的权限设置视图中, 可以配置此日志模块的权限.",
    "This screen shows all active curses on the player, including many information, such as duration, if it is a cursed item/clothing/body slot or a blocked item or clothing slot that forces to stay unrestrained or naked there. Clicking on the button with the cog icon in the middle of each row moves you to a new screen that allows to configure the curse (if you have permission). When the cog icon has a blue aura, that means that the curse's conditions are the same as the global config. If permitted, you can remove single curses with the 'X' button.":
        "此界面展示了玩家身上所有生效的诅咒, 包含诸多信息, 比如持续时间、是被诅咒的物品/服装/身体槽位, 还是强制保持不受限制或赤裸的被封锁物品或服装槽位.点击每行中间带有齿轮图标的按钮, 会将您转到一个新的界面, 允许您配置该诅咒(如果您有权限).当齿轮图标带有蓝色光环时, 意味着该诅咒的条件与全局配置相同.如果允许, 您可以使用“X”按钮删除单个诅咒..",
    "The settings on this page are the global/default settings for all newly added curses. Changes to the trigger conditions are also applied to existing curses that are (still) set to global curses configuration, though. Exception is if a timer is set here. Such a timer only applies to newly created curses.":
        "此页面上的设置是所有新添加诅咒的全局/默认设置.对触发条件的更改也适用于(仍然)设置为全局诅咒配置的现有诅咒, 不过, 如果在此处设置了计时器则是个例外.这样的计时器仅适用于新创建的诅咒.",
    "Here, you can add a curse to any empty slot (white) which will keep it empty or on any worn item (gold) which will prevent removal. You add the curse by simply clicking the slot which then becomes purple to indicate that it is now cursed. Grey slots indicate that you have no access to them, due to them being blocked or due to your permission settings. Slots can be limited/blocked via the settings button on the very right. The screen has a second page for the character's body slots.":
        "在此, 您可以向任何空槽(白色)添加诅咒, 使其保持为空, 或者向任何已佩戴的物品(金色)添加诅咒, 使其无法被移除.您只需点击槽位即可添加诅咒, 随后该槽位会变为紫色, 表示已被诅咒.灰色槽位表示由于它们被封锁或您的权限设置, 您无法访问它们.可以通过最右侧的设置按钮来限制/封锁槽位.此屏幕针对角色的身体槽位还有第二页.",
    "This screen shows all active rules for the player, including many information, such as duration, the rule type and little status icons that show if the rule is enforced and/or transgressions are logged. Clicking on the button with the cog icon in the middle of each row moves you to a new screen that allows to configure the rule (if you have permission). When the cog icon has a blue aura, then that means that the rule's conditions are the same as the global config. If permitted, you can remove single rules with the 'X' button.":
        "此屏幕展示了玩家的所有生效规则, 包含诸多信息, 例如持续时间、规则类型以及显示规则是否正在执行和/或是否记录了违规行为的小状态图标.点击每行中间带有齿轮图标的按钮, 会将您转到一个新的屏幕, 允许您配置该规则(如果您有权限).当齿轮图标带有蓝色光环时, 意味着该规则的条件与全局配置相同.如果允许, 您可以使用“X”按钮删除单个规则.",
    "On this screen you can see the available commands for the player. Clicking on one shows a more detailed description of it. Greyed out commands indicate that you have no access to them due to being blocked or due to your permission settings. Commands can be limited/blocked via the settings button on the very right. Commands will be used in the chat room's chat by whispering them with a '!' before the command to another player. Note: SOME of the commands can also be used on yourself with a leading '.' instead of '!' (e.g. '.eyes close')":
        "在这个屏幕上, 您可以看到玩家可用的命令.点击其中一个命令会显示其更详细的描述.呈灰色的命令表示由于被阻止或权限设置, 您无法访问它们.可以通过最右侧的设置按钮来限制/封锁命令.在聊天室的聊天中, 通过在向其他玩家发送的命令前加上“!”来使用这些命令进行私语交流.注意：某些命令也可以在自己身上使用, 用“.”而不是“!”作为前缀(例如“.eyes close”)",
    "Here you can cycle commands between being not limited, limited and blocked. Blocked means no one can use this command, while limited means only roles that have the permission to use limited commands can trigger them in that chat. There is no need to save changes as they are instantly in effect.":
        "在这里, 您可以在“不受限制”“受限制”和“被阻止”之间切换命令.“被阻止”意味着无人能够使用此命令, 而“受限制”意味着只有拥有使用受限命令权限的角色才能在该聊天中触发它们.无需保存更改, 因为它们会立即生效.",
    "This screen lets you add custom nicknames for other club members. The set custom name replaces the added character's real name / BC-nickname in this player's chat, except within chat commands, which are considered OOC. You can also enforce the custom name so that the player is blocked from sending a chat message / whisper that use the character's name / BC-nickname while with her. The player cannot have multiple custom names set for a single character. A character who has a custom name set on this screen can always see their own set custom name in this list.":
        "此界面可让您为其他俱乐部成员添加自定义昵称.所设置的自定义名称会在该玩家的聊天中取代所添加角色的真实姓名/BC 昵称, 但在被视为脱离角色(OOC)的聊天命令中除外.您还可以强制使用自定义名称, 以阻止玩家发送使用该角色姓名/BC 昵称的聊天消息/私语.对于单个角色, 玩家不能设置多个自定义名称.在该屏幕上设置了自定义名称的角色始终可以在此列表中看到自己所设置的自定义名称.",
    "Please select the module feature you want to backup or import from a previous export. After storing the exported texts, you can later on use them again, e.g. for switching between cursed outfits or different rule sets. These exports are compatible between different BCX users and can be used by everyone with BCX who is permitted to make changes to the according module. For instance, if an owner has the permission to control limited AND non-limited rules on the sub, she is with that also allowed to import previously exported rules that are not blocked.":
        "请选择您想要备份或从先前的导出中导入的模块功能.在存储导出的文本之后, 您日后可以再次使用它们, 例如在受诅咒的服装之间切换或不同的规则集之间切换.这些导出在不同的 BCX 用户之间是兼容的, 并且可以由拥有更改相应模块权限的每个 BCX 用户使用.例如, 如果所有者有权控制子项的有限和非有限规则, 那么她也被允许导入先前未被阻止的导出规则.",
    "This screen offers various settings to configure your Bondage Club experience in general, such as enabling/disabling the typing indicator that shows other BCX users an icon when you are currently typing something to public chat or whispering something to only them. The cheats are only temporarily active as long as they are set; items that were only given via a cheat are then also gone again.":
        "此界面提供了多种通用设置来配置您在 Bondage Club 的体验, 例如启用/禁用打字指示器, 当您正在公共聊天中输入内容或仅向他们私语时, 该指示器会向其他 BCX 用户显示一个图标.作弊仅在设置期间暂时有效；仅通过作弊获得的物品随后也会再次消失.",
    "On this screen you can establish new rules for the player by simply clicking any rule template. After clicking on it, you can edit the rule's configuration. Purple rule templates indicate, that they are already in use; greyed out ones, that you have no access to them due to being blocked or due to your permission settings. Rule templates can be limited/blocked via the settings button on the very right. Note: If you want to be able to log rule violations, this type of log entry may need to be allowed in the configuration page of the behavior log module.":
        "在这个界面上, 您只需点击任何规则模板即可为玩家制定新规则.点击后, 您可以编辑规则的配置.紫色的规则模板表示它们已在使用中；灰色的规则模板表示由于被阻止或您的权限设置, 您无法访问它们.通过最右侧的设置按钮可以限制/阻止规则模板.注意：如果您希望能够记录规则违规情况, 可能需要在行为日志模块的配置页面中允许这种类型的日志条目.",
    "Here you can switch the curse on/off, set a timer for activating/deactivating/deleting the curse and define when it can trigger, such as either always or based on where the player is and with whom. The small green/red bars next to the checkboxes indicate whether a condition is true at present or not and the big bar whether this means that the curse is in effect, if active. On the right side, you can curse the usage/alteration of an item such as fixing cuffs behind the back. Lastly, in the bottom right you can set the trigger conditions of this curse to the global curses config.":
        "在这里, 您可以打开/关闭诅咒, 为激活/停用/删除诅咒设置计时器, 并定义其触发条件, 例如始终触发或基于玩家所在位置以及与谁在一起.复选框旁边的小绿/红条表示当前条件是否为真, 而大条表示如果处于激活状态, 该诅咒是否生效.在右侧, 您可以对诸如在背后固定袖口等物品的使用/更改进行诅咒.最后, 在右下角, 您可以将此诅咒的触发条件设置为全局诅咒配置.",
    "More": "更多",
    "More options [BCX]": "更多选项 [BCX]",
    "Standardize your room description so the room's purpose is clear and it can easily be filtered:":
        "标准化您的房间描述, 以便清晰显示房间的用途, 并且可以轻松进行过滤: ",
    "Create a theme room": "创建一个主题房间",
    "Templates for storing / overwriting current room information & settings (press a name to toggle auto-apply)":
        "用于存储/覆盖当前房间信息和设置的模板(按名称切换自动应用)",
    "- empty template slot -": "- 空模板槽 -",
    "Load": "加载",
    "    Save": "    保存",
    "1. Select the room type:": "1. 选择房间类型: ",
    "2. Optionally, select one room setting:": "2. 可选地, 选择一个房间设置: ",
    "3. Optionally, select limits for the room:": "3. 可选地, 选择房间的限制: ",
    "4. Optionally, write a room introduction message/greeting that everyone joining will see as emote:":
        "4. 可选地, 编写一个房间介绍消息/欢迎词, 所有加入的人都会看到其作为表情. ",
    "AFK/Storage": "AFK/存储",
    "Chill/Chat": "休闲/聊天",
    "Tying all up": "全部捆绑",
    "Game": "游戏",
    "Roleplaying": "角色扮演",
    "Kidnap/Danger": "绑架/危险",
    "Market/Auction": "市场/拍卖",
    "Undefined": "未定义",
    "Adventure": "冒险",
    "Historic": "历史",
    "Romantic": "浪漫",
    "SciFi": "科幻",
    "Fantasy": "奇幻",
    "Modern": "现代",
    "School": "学校",
    "no-anal": "无屁眼交易",
    "no-animals": "无动物",
    "no-fantasy": "无幻想",
    "no-limits": "无限制",
    "no-males": "无男性",
    "no-sexual": "无性行为",
    "no-tentacles": "无触手",
    "Blocked items:": "已屏蔽的物品:",
    "OK": "确定",
    "Import everything onscreen": "导入界面上的所有内容",
    "Export everything onscreen": "导出界面上的所有内容",
    "Hierachy of roles": "角色权限结构",
    "[Log message deleted]": "[日志消息已删除]",
    "删除 all log entries": "删除所有日志条目",
};

/**
 * 翻译BCX菜单文本
 * @param {string} key
 * @returns {string | undefined} 如果翻译成功则返回翻译后的文本，否则返回undefined
 */
export function translateMenuText(key) {
    if (CurrentScreen !== "InformationSheet") return undefined;
    if (!BCXenabled()) return undefined;
    if (translation[key]) return translation[key];
    for (const { regex, replacement } of regexTranslations) {
        if (regex.test(key)) {
            return key.replace(regex, replacement);
        }
    }
    return undefined;
}
