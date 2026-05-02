import type { Item } from "./types";

export const items: Item[] = [
  {
    id: 1,
    name: "一枚不认命的铜钱",
    tier: 1,
    price: { tan: 2 },
    description: "一枚旧铜钱，买不来好命，只能证明你还想翻盘。",
    lore: "钱面磨平，背后还留着一个不肯认输的指印。适合送给总说算了的人。",
    sideEffects: { tan: 1 },
    hiddenFlavor: "你以为会过日子，其实只是舍不得输。"
  },
  {
    id: 2,
    name: "半句咽回的话",
    tier: 1,
    price: { chen: 3 },
    description: "只够说前半句，后半句留给夜里反复演。",
    lore: "掌柜说，这话若当年说完，今日便卖不出这个价。",
    sideEffects: { chen: -1, wang: 2 },
    hiddenFlavor: "你少了一点火气，多了一点夜里翻身。"
  },
  {
    id: 3,
    name: "别人家的灯火",
    tier: 1,
    price: { tan: 4 },
    description: "小盏里映着别人家的饭香，暖得很不像你。",
    lore: "灯芯不长，却最会照见人心里那句凭什么不是我。",
    sideEffects: { tan: 2, wang: 1 },
    hiddenFlavor: "看久了会暖，也会想问自己差在哪。"
  },
  {
    id: 4,
    name: "一声假底气",
    tier: 1,
    price: { chen: 2 },
    description: "咳一声，可打断别人，也骗过自己半刻。",
    lore: "常被摆在柜台最外头，买的人都说只是随便看看。",
    sideEffects: { chen: 1 },
    hiddenFlavor: "铺子里最好卖的，是假装不在乎。"
  },
  {
    id: 5,
    name: "一勺不醒雨",
    tier: 2,
    price: { wang: 7 },
    description: "青瓷小勺，舀着你最不敢醒的那场雨。",
    lore: "雨水不凉，凉的是醒来以后，屋里什么都没变。",
    sideEffects: { wang: 1 },
    hiddenFlavor: "放在枕边，睡得更深，醒得更空。"
  },
  {
    id: 6,
    name: "一页不黄的旧账",
    tier: 2,
    price: { chen: 8 },
    description: "泛黄纸条，记着你早忘了由头的那口气。",
    lore: "账页边角卷起，像有人反复翻到这里，又反复合上。",
    sideEffects: { chen: -3, hui: 2 },
    hiddenFlavor: "账清了，心未必清。但至少少咬自己一口。"
  },
  {
    id: 7,
    name: "没说出口的话",
    tier: 2,
    price: { chi: 9 },
    description: "木盒打开是空的，空处全是当年没说出口。",
    lore: "盒盖内侧刻着一句小字：越没说出口，越会替你活很久。",
    sideEffects: { chi: -2 },
    hiddenFlavor: "你终于承认，沉默也会欠债。"
  },
  {
    id: 8,
    name: "三钱清醒",
    tier: 2,
    price: { tan: 6, chi: 2 },
    description: "一撮白雾，能照见路，也照见路边那个你。",
    lore: "服下后不会变聪明，只会少一个继续装睡的理由。",
    sideEffects: { hui: 5 },
    hiddenFlavor: "清醒不是答案，只是不给自己装睡。"
  },
  {
    id: 9,
    name: "旧称呼里的月光",
    tier: 3,
    price: { hui: 13, wang: 5 },
    description: "挖自二十年前的夏夜，一凉就像有人喊你。",
    lore: "月光用旧称呼封存，打开时不要答应得太快。",
    sideEffects: { chi: 3 },
    hiddenFlavor: "你以为忘了，其实只是没人点灯。"
  },
  {
    id: 10,
    name: "半生借来的胆",
    tier: 3,
    price: { chen: 12, tan: 6 },
    description: "一只旧护心镜，铁锈里藏着一句算了。",
    lore: "胆不是天生的，多半是怕过以后，还愿意再站一回。",
    sideEffects: { chen: -3, chi: 2 },
    hiddenFlavor: "怕的事可以做一次，做完才知道怕得有理。"
  },
  {
    id: 11,
    name: "不必赴的约",
    tier: 3,
    price: { chi: 15 },
    description: "请柬上写着不用去，也无人等你解释。",
    lore: "最难推掉的约，往往不是别人下的，是旧日的你下的。",
    sideEffects: { chi: -5, hui: 3 },
    hiddenFlavor: "你缺的不是借口，是准许自己缺席。"
  },
  {
    id: 12,
    name: "他乡未开的春",
    tier: 3,
    price: { tan: 18 },
    description: "一枝未开的春，从你没去成的远方折来。",
    lore: "花骨朵一直不肯开，像那条你反复说以后再走的路。",
    sideEffects: { tan: 3, wang: 2 },
    hiddenFlavor: "闻一闻，明天会起得来，也会更想走。"
  },
  {
    id: 13,
    name: "三声晚钟",
    tier: 4,
    price: { hui: 25, chi: 5 },
    description: "庙里来的，敲三声。第一声忘怨，第二声忘人，第三声忘那个等答案的你。",
    lore: "钟声很轻，轻到只有心里还没放过的人听得见。",
    sideEffects: { chen: -5, wang: -3 },
    hiddenFlavor: "夜里不再翻身，只是心里少了一间屋。"
  },
  {
    id: 14,
    name: "错过的回信",
    tier: 4,
    price: { chi: 30 },
    description: "封口粘着当年的胆小，拆开才知道迟不迟。",
    lore: "信不是给那个人的，是给后来一直替自己辩解的你。",
    sideEffects: { chi: -10, hui: 5 },
    hiddenFlavor: "拆开后你才知道，等信的人早换了姓名。"
  },
  {
    id: 15,
    name: "一夜安睡",
    tier: 4,
    price: { tan: 22, wang: 8 },
    description: "装在青布袋里，上头绣着一个忘字，针脚细得发疼。",
    lore: "此物不治明日，只管今夜。能睡着，已经算一笔大生意。",
    sideEffects: { hui: 3 },
    hiddenFlavor: "明日仍是今日。但今夜终于肯过去。"
  },
  {
    id: 16,
    name: "不动声色的笑",
    tier: 4,
    price: { chen: 28 },
    description: "一面薄铜镜，镜里的人在笑，像终于学会不解释。",
    lore: "笑意极淡，却能挡住许多不值得认真回答的问题。",
    sideEffects: { chen: -8, hui: 5 },
    hiddenFlavor: "你少受半生气，也少露半颗心。"
  },
  {
    id: 17,
    name: "未圆的梦",
    tier: 5,
    price: { tan: 30, wang: 18 },
    description: "盒盖刻着未醒，里面躺着年轻时不肯认输的你。",
    lore: "梦没有坏，只是放太久了，边缘开始长出成年人的灰。",
    sideEffects: { tan: 10, wang: 5 },
    hiddenFlavor: "醒来会更空，因为你终于想起自己也曾这样亮过。"
  },
  {
    id: 18,
    name: "替谁掉的眼泪",
    tier: 5,
    price: { chi: 45 },
    description: "一颗淡盐水，封在水晶里。不是你的泪，却像替你流过。",
    lore: "传说它会替人哭一次，哭完以后，那个人的名字会淡一点。",
    sideEffects: { chi: -15, hui: 10 },
    hiddenFlavor: "那个人未必值得，但你为他疼过，这事值钱。"
  },
  {
    id: 19,
    name: "三两清白",
    tier: 5,
    price: { chen: 50 },
    description: "一卷旧状纸，只剩实属冤枉四字还不肯褪。",
    lore: "买它的人不一定要翻案，多半只是想先把自己从心里放出来。",
    sideEffects: { chen: -20, hui: 10 },
    hiddenFlavor: "清白不一定有人还你，但你可以先不罚自己。"
  },
  {
    id: 20,
    name: "不再想念的能力",
    tier: 6,
    price: { chi: 70 },
    description: "瓷瓶封蜡。喝下去，不是忘记，是那个人不再有回声。",
    lore: "瓶底贴着旧名，不看也罢。真喝下去，连梦都少一个入口。",
    sideEffects: { chi: -30, hui: 5 },
    hiddenFlavor: "从此不再想起。代价是，后来的人都像隔着雾。"
  },
  {
    id: 21,
    name: "一身是胆",
    tier: 6,
    price: { chen: 60, tan: 15 },
    description: "一件薄褂，穿上能闯。脱下时，旧怕还在门口。",
    lore: "胆可借，不可久租。天亮以前，你得决定它到底是谁的。",
    sideEffects: { chen: 10, wang: -5 },
    hiddenFlavor: "胆子借你一夜，明日还不还，看你自己。"
  },
  {
    id: 22,
    name: "一句迟到的对不起",
    tier: 7,
    price: { chi: 50, chen: 35 },
    description: "从你嘴里说出，飘进那人耳里。多年以后，仍算一笔。",
    lore: "迟到的话也有路，只是到达时，门口站着另一个你。",
    sideEffects: { chi: -25, chen: -15, hui: 20 },
    hiddenFlavor: "听不听见看那人，说不说得出看你。"
  },
  {
    id: 23,
    name: "半世没人催的清欢",
    tier: 7,
    price: { hui: 50, chi: 20, tan: 15 },
    description: "一卷山水，画着你没经历过，却一直假装不想要的半生。",
    lore: "画上没有大成大败，只有一盏热茶和没人催你的下午。",
    sideEffects: { tan: -10, wang: -10 },
    hiddenFlavor: "往后日子会轻一些，也会少一点大声活着。"
  },
  {
    id: 24,
    name: "一夜回到从前",
    tier: 99,
    price: { chi: 20, chen: 20, tan: 20, wang: 20, hui: 19 },
    description: "可回任一旧夜，不可改一字一句，只许重新看清。",
    lore: "镇店之物。掌柜不劝人买，因为买它的人从不是真的想回去。",
    sideEffects: { chi: 10, wang: 10, hui: -10 },
    hiddenFlavor: "你买到的不是从前，是终于承认它回不来。",
    isLegendary: true,
    legendaryFarewell: "天亮前记得回来，别把现在的自己丢在旧夜。",
    legendaryEnding: "今夜走过一趟"
  }
];
