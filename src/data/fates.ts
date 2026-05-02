import type { FateName, ResourceKey } from "./types";

export const resourceLabels: Record<ResourceKey, string> = {
  chi: "痴",
  chen: "嗔",
  tan: "贪",
  wang: "惘",
  hui: "慧"
};

export const resourceOrder: ResourceKey[] = ["chi", "chen", "tan", "wang", "hui"];

export const singleFates: Record<ResourceKey, FateName[]> = {
  chi: [
    { name: "执念客", category: "single", primary: "chi", judgments: ["你不是放不下，是不甘心白疼一场。", "那件事早过了，只是你还在替它守门。"] },
    { name: "长情人", category: "single", primary: "chi", judgments: ["你把长情修成了刑期，还说是本分。", "你最会等人，也最会耽误自己。"] },
    { name: "不归客", category: "single", primary: "chi", judgments: ["归处早没了，你只是舍不得承认。", "你一直在路上，却只看旧方向。"] },
    { name: "痴上人", category: "single", primary: "chi", judgments: ["你为一人一事，把万物都看轻了。", "心有所系，连自由都像亏欠。"] },
    { name: "刻骨者", category: "single", primary: "chi", judgments: ["伤口会合，记性不会。", "你早不疼了，只是还想证明疼过。"] },
    { name: "问月人", category: "single", primary: "chi", judgments: ["月亮不回你，你便替它沉默多年。", "问得太久，答案也怕见你。"] },
    { name: "夜半客", category: "single", primary: "chi", judgments: ["白日你无事，夜里旧人开门。", "你不是失眠，是旧事不肯睡。"] },
    { name: "心系客", category: "single", primary: "chi", judgments: ["你把那人放在心上，把自己放在门外。", "心系一处，八方皆盲。"] },
    { name: "停泊人", category: "single", primary: "chi", judgments: ["船早靠岸，你还等风替你道别。", "你不是不走，是怕走了就真结束。"] },
    { name: "记忆者", category: "single", primary: "chi", judgments: ["你身上挂着一整座旧屋，还说轻装。", "回忆太会收租，你一直在付。"] }
  ],
  chen: [
    { name: "不甘人", category: "single", primary: "chen", judgments: ["凭什么三个字，压了你好多年。", "你咽下的不是气，是没赢回来的自己。"] },
    { name: "未平客", category: "single", primary: "chen", judgments: ["你笑着过去，心里还在开庭。", "事早散场，你还想等一句公道。"] },
    { name: "刺骨者", category: "single", primary: "chen", judgments: ["刺不深，是你日日替它上供。", "那根刺小得很，偏偏你替它长大。"] },
    { name: "烈火心", category: "single", primary: "chen", judgments: ["你不发作时，火烧得最旺。", "这火照不亮路，只照见旧账。"] },
    { name: "积怨人", category: "single", primary: "chen", judgments: ["怨攒久了，债主就换成自己。", "你记得太清楚，所以过得不清白。"] },
    { name: "寒露客", category: "single", primary: "chen", judgments: ["心冷过一回，后来谁靠近都像借火。", "你不是冷淡，是热过头。"] },
    { name: "咬牙人", category: "single", primary: "chen", judgments: ["你撑过来了，却没放自己过去。", "那口牙咬住的，常是自己。"] },
    { name: "断剑客", category: "single", primary: "chen", judgments: ["剑断了，你还想赢最后一个字。", "刃没了，意还硬。最伤手。"] },
    { name: "夜雨人", category: "single", primary: "chen", judgments: ["你的委屈落地无声，却淹了半生。", "雨下了一夜，你只说没事。"] },
    { name: "未渡者", category: "single", primary: "chen", judgments: ["桥一直在，你等对岸先认输。", "你不肯渡，是怕渡过去还想回头。"] }
  ],
  tan: [
    { name: "未足客", category: "single", primary: "tan", judgments: ["你已经不少，只差一句我配得。", "想要太多的人，最怕承认其实够了。"] },
    { name: "欲海人", category: "single", primary: "tan", judgments: ["海看不见底，你偏把它叫前程。", "你越追越远，还说那是上进。"] },
    { name: "未尽者", category: "single", primary: "tan", judgments: ["还差一点，最会冒充命运。", "未完之事最会假装成命运。"] },
    { name: "永饥客", category: "single", primary: "tan", judgments: ["你吃了很多，饿的是那句认可。", "喂不饱的心，最会挑好名字。"] },
    { name: "求圆人", category: "single", primary: "tan", judgments: ["你凡事求圆，圆了又怕缺。", "圆满两个字，最会把人困住。"] },
    { name: "追光客", category: "single", primary: "tan", judgments: ["光在前面，你把影子也跑丢了。", "你追的不是光，是不肯输的自己。"] },
    { name: "收藏家", category: "single", primary: "tan", judgments: ["你什么都留住，唯独留不住轻松。", "得到以后不肯放，是另一种穷。"] },
    { name: "未醒人", category: "single", primary: "tan", judgments: ["梦里得过一次，醒来便不肯认命。", "你不是没醒，是醒了还想续梦。"] },
    { name: "贪春客", category: "single", primary: "tan", judgments: ["你最贪的，是那年春天里的自己。", "春早走了，你还替它占座。"] },
    { name: "慕远者", category: "single", primary: "tan", judgments: ["近处都不入眼，远方才好骗你。", "你想去远方，其实是想换一个自己。"] }
  ],
  wang: [
    { name: "迷途人", category: "single", primary: "wang", judgments: ["路在脚下，你却一直问雾。", "你不是迷路，是不敢选路。"] },
    { name: "问路客", category: "single", primary: "wang", judgments: ["你问了一路，其实怕答案落地。", "最缺的不是方向，是敢停下。"] },
    { name: "雾中人", category: "single", primary: "wang", judgments: ["雾里每一步都像前进，也像原地。", "看不清时，最容易把拖延叫等待。"] },
    { name: "不知客", category: "single", primary: "wang", judgments: ["你心里有数，只是不肯替自己作证。", "不知是假，怕知是真。"] },
    { name: "四面风", category: "single", primary: "wang", judgments: ["样样都有，样样不深，最像过日子。", "风从哪边来，你就往哪边不像自己。"] },
    { name: "寻光客", category: "single", primary: "wang", judgments: ["你寻的光，多半是想被照见。", "找到光的人，往往先承认黑。"] },
    { name: "空舟人", category: "single", primary: "wang", judgments: ["你的舟很轻，轻到没人敢坐进来。", "自由是真自由，空也是真空。"] },
    { name: "过雾者", category: "single", primary: "wang", judgments: ["你穿过雾，眼里却还雾着。", "出了雾的人，也会怀念看不清。"] },
    { name: "问津客", category: "single", primary: "wang", judgments: ["地图旧了，问路的人也旧了。", "你问渡口，其实还没想好上岸。"] },
    { name: "远行人", category: "single", primary: "wang", judgments: ["出门太久，你把归处也过成远方。", "你走得越远，越像在躲近处那个人。"] }
  ],
  hui: [
    { name: "素心客", category: "single", primary: "hui", judgments: ["你看得开，只是人间还想考你一次。", "心已澄明，旧事还会来敲门。"] },
    { name: "明镜人", category: "single", primary: "hui", judgments: ["你照得清别人，最怕自己入镜。", "看透世人容易，看轻自己很难。"] },
    { name: "过来者", category: "single", primary: "hui", judgments: ["坎都过了，人也淡了三分。", "你说无所谓，是因为很有所谓过。"] },
    { name: "无挂客", category: "single", primary: "hui", judgments: ["心里没挂的人，走得稳，也走得远。", "你少有牵挂，也少有人敢留你。"] },
    { name: "知止人", category: "single", primary: "hui", judgments: ["你知道何时停，这比赢更难。", "知止不是不想要，是不再被要挟。"] },
    { name: "看透客", category: "single", primary: "hui", judgments: ["看透了倒不失望，失望是还盼着。", "结局你早知道，只是不肯提前难过。"] },
    { name: "清醒者", category: "single", primary: "hui", judgments: ["清醒太久，连热闹都刺耳。", "你今夜的清醒，像一盏不肯灭的灯。"] },
    { name: "岸上人", category: "single", primary: "hui", judgments: ["你早在岸上，却还替水里的人着急。", "岸上看船，最怕看见当年的自己。"] },
    { name: "止水客", category: "single", primary: "hui", judgments: ["心如止水，便也无波澜可借口。", "水止能照人，也能照出空。"] },
    { name: "解脱者", category: "single", primary: "hui", judgments: ["你走得轻，轻到旧事追不上。", "放下了。只是人间还没学会放过你。"] }
  ]
};

export const doubleFates: FateName[] = [
  { name: "红尘骨", category: "double", primary: "chi", secondary: "chen", judgments: ["情深亦怨深，你把爱过也活成证词。"] },
  { name: "求而不得者", category: "double", primary: "chi", secondary: "tan", judgments: ["你求是真求，得不到也是真舍不得。"] },
  { name: "迷恋客", category: "double", primary: "chi", secondary: "wang", judgments: ["明知是雾，你还怕它散得太快。"] },
  { name: "刚烈客", category: "double", primary: "chen", secondary: "tan", judgments: ["咽不下，又放不下，硬骨最会为难自己。"] },
  { name: "苦海人", category: "double", primary: "chen", secondary: "wang", judgments: ["恨在心里翻，路在脚下沉。"] },
  { name: "浮生客", category: "double", primary: "tan", secondary: "wang", judgments: ["漂着也是过，只是不知哪天才算上岸。"] },
  { name: "半渡人", category: "double", primary: "hui", secondary: "chi", judgments: ["过去没全过去，明白也没全明白。"] },
  { name: "持剑者", category: "double", primary: "hui", secondary: "chen", judgments: ["心中有剑，只是不知该护谁。"] },
  { name: "知足客", category: "double", primary: "hui", secondary: "tan", judgments: ["你想得不多，但样样都不能少。"] },
  { name: "观潮人", category: "double", primary: "hui", secondary: "wang", judgments: ["潮起潮落都看过，你仍不肯下场。"] }
];

export const balancedFates: FateName[] = [
  { name: "四面风", category: "balanced", judgments: ["样样都有，样样不深，最像大半人生。"] },
  { name: "平常心", category: "balanced", judgments: ["没有大彻大悟，只有明天还要照常。"] },
  { name: "无名客", category: "balanced", judgments: ["来去无名，偏偏每一笔都像你。"] }
];

export const extremeFates: Record<ResourceKey, FateName> = {
  chi: { name: "困者", category: "extreme", primary: "chi", judgments: ["心被一物绑住，钥匙还在你手里。"] },
  chen: { name: "怨者", category: "extreme", primary: "chen", judgments: ["怨字养久，先烧自己的灯。"] },
  tan: { name: "饕餮", category: "extreme", primary: "tan", judgments: ["欲望无底，你却把它叫目标。"] },
  wang: { name: "迷者", category: "extreme", primary: "wang", judgments: ["连迷茫都迷了，往前也是答案。"] },
  hui: { name: "觉者", category: "extreme", primary: "hui", judgments: ["看得太清，人间反而难走。"] }
};
