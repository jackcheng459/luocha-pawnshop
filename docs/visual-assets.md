# 《罗刹当铺》视觉资产清单

> 状态：已审阅并进入执行。
> 用途：按《罗刹当铺-Codex视觉升级执行文档》第一步要求，先明确资产分工、尺寸、prompt、后处理和优先级。审完本清单后再进入生成与集成。

## 执行原则

- 4:3 比赛展示图、开场远景、店内主场景、掌柜剪影是 P0，优先保证评委第一眼和核心流程仪式感。
- 复杂氛围与笔触走 AI 位图；可交互、可动画、需动态文字的元素走 SVG / CSS。
- 所有位图目标压缩到 `< 200KB`，保留原图和压缩图的生成记录。
- 所有图片集成时必须接入 `onError` fallback，失败时回落到 CSS / SVG 版本。
- 颜色统一为深褐、暖棕、宣纸、朱砂、烛光，禁用蓝紫冷调、霓虹、塑料按钮、现代通用图标。

## 资产总表

| # | 资产名 | 用途 | 技术 | 尺寸 | 透明 | 后处理 | Prompt | 优先级 |
|---|--------|------|------|------|------|--------|--------|--------|
| 1 | `luocha-pawnshop-poster-4x3.jpg` | 比赛提交 4:3 横版主视觉，也作为 `/showcase` 的位图主资产 | AI 生图 | 1600x1200 | 否 | 选 1/8，裁切到 4:3，压缩 `<200KB`，前端叠加标题文字 | 见 Prompt A | P0 |
| 2 | `shop-facade-mist.jpg` | 开场“雾散见铺”的远景当铺 | AI 生图 | 1920x1080 | 否 | 选 1/6，底部加暗雾渐变，压缩 `<200KB` | 见 Prompt B | P0 |
| 3 | `shop-interior-main.jpg` | 入店后主背景，承载签筒、货架、交易 UI | AI 生图 | 1600x1200 | 否 | 选 1/6，压暗边缘，中部留 UI 空间，压缩 `<200KB` | 见 Prompt C | P0 |
| 4 | `shopkeeper-silhouette.webp` | 掌柜对话半身剪影，随台词升起 | AI 生图 + 抠图 + WebP 压缩 | 608x760 | 是 | 绿幕抠图后转 WebP，CSS 简笔剪影兜底 | 见 Prompt D | P0 |
| 5 | `LotTube.tsx` / `.lot-tube` | 摇签求命核心道具，可摇晃动画 | React + CSS | responsive | 是 | 代码生成旧竹木签筒，材质与店内背景统一，筒内签与弹出签共用样式 | 见道具规格 E | P0 |
| 6 | `fate-stick.svg` | 从签筒弹出的签，可展开为命牌 | SVG | 80x360 | 是 | 手写 SVG，支持 spring 弹出和旋转 | 见 SVG 规格 F | P0 |
| 7 | `cinnabar-seal.svg` | 命格朱印、当票朱印、物品获得“已得” | SVG + CSS | 240x240 | 是 | 动态文字由组件渲染，盖落动画用 CSS / Framer Motion | 见 SVG 规格 G | P1 |
| 8 | `red-lantern.svg` | 开场、店内、展示图局部装饰 | SVG | 180x260 | 是 | 手写 SVG，灯芯可做 opacity 呼吸 | 见 SVG 规格 H | P1 |
| 9 | `paper-noise.svg` | 宣纸纹理，分享卡、当票、命格卡通用 | SVG / CSS noise | 512x512 | 否 | 可平铺，低透明度 multiply | 见纹理规格 I | P1 |
| 10 | `mist-layer.css` | 开场和全局雾气三层漂移 | CSS | viewport | 是 | `radial-gradient` + `transform`，不触发布局 | 见 CSS 规格 J | P1 |
| 11 | `door-transition.css` | 点击“推门入店”后的推进与模糊过渡 | CSS / Framer Motion | viewport | 是 | `scale` + `filter: blur()` + `opacity` | 见 CSS 规格 K | P1 |
| 12 | `item-obtain-overlay.tsx` | 购买商品后小高潮：卡片飘起、朱印盖落、副作用浮现 | React + Framer Motion + CountUp | viewport | 是 | 组件级动画，不新增位图 | 见组件规格 L | P1 |
| 13 | `receipt-assemble.tsx` | 当票拼合收尾动画 | React + Framer Motion | 3:4 卡片 | 是 | scale 展开、交易记录 stagger、朱印落下 | 见组件规格 M | P1 |
| 14 | `fallback-pawnshop.svg` | 远景图加载失败时的 CSS/SVG 当铺兜底 | SVG | 960x540 | 是 | 手写极简剪影，颜色走项目色板 | 见 SVG 规格 N | P1 |
| 15 | `fallback-shopkeeper.svg` | 掌柜剪影加载失败兜底 | SVG | 400x600 | 是 | 手写皮影轮廓 | 见 SVG 规格 O | P1 |
| 16 | `tier-ornaments.css` | 货架按档位分级：低档轻、上品暗金、镇店朱砂边 | CSS | component | 是 | 仅改边框、纸纹、角标，不扩大 UI 复杂度 | 见 CSS 规格 P | P2 |

## Prompt A：4:3 比赛展示图

```text
聊斋志异风格的志怪当铺夜景，木桌上点着一盏油灯，桌上放着签筒和泛黄当票，桌后是模糊的老掌柜半身剪影，戴方巾蓄须，墙上挂着字画卷轴，窗外飘着朦胧红灯笼，雾气缭绕在脚边，深棕暗调，烛光暖色点缀，清代版画质感，丰子恺笔触感，左侧或右侧留出空白处可加“罗刹当铺”标题文字，4:3 横版构图，氛围沉郁神秘，适合作为网页 H5 小游戏比赛展示图。

negative: 现代元素、卡通圆头、扁平塑料、彩色霓虹、蓝色、紫色、写实摄影、人物面部清晰、3D 渲染、赛博朋克、科幻、二次元、纯黑、纯白、可读文字、水印
```

## Prompt B：开场远景当铺

```text
夜色中一座古代当铺的远景剪影，建筑深褐色暗调，屋檐微翘，门口挂着两只朦胧红灯笼并发出暖光，门头匾额隐约有“當”的形，不需要清晰可读，两扇朱红木门半掩，门内透出昏黄灯光，四周笼罩浅淡夜雾，雾气从地面升起，聊斋绣像本插画风格，清代版画质感，丰子恺笔触感，留出足够夜色空白便于叠加标题与按钮，16:9 比例，整体偏暗但手机屏可读。

negative: 现代元素、写实摄影、3D、赛博朋克、彩色霓虹、白天、蓝色、紫色、塑料感、清晰现代招牌、人物面部、水印
```

## Prompt C：店内主场景

```text
昏暗的志怪当铺内景，木质柜台一角占据画面下半部分，柜台上一盏摇曳的油灯散发暖黄色光晕，柜台上散落几张泛黄当票、一只签筒、一只旧算盘，柜台后挂着字画卷轴和字幅但字迹不清晰，墙角隐约有竹签筒和木架，雾气在柜台周围淡淡浮动，深棕暗调底色，烛光暖色重点照明，聊斋插图风格，清代版画质感，丰子恺笔触感，画面中央和上方留出空白便于摆放交易 UI，4:3 比例，氛围沉郁。

negative: 现代元素、塑料感、扁平、卡通、彩色、明亮、人物正脸、蓝色、紫色、霓虹、3D、写实摄影、水印
```

## Prompt D：掌柜半身剪影

```text
一位古代当铺老掌柜的半身侧影剪影，深褐色或墨黑剪影，背景完全透明，戴方巾，长须飘垂，神态沉静难辨，身穿长袍，姿态略前倾仿佛在打量客人，半身构图，从腰部以上至头顶，聊斋插图风格的人物剪影，类似皮影戏的简洁有力，没有面部细节，只有轮廓，PNG 透明背景。

negative: 面部表情、彩色、写实、3D、现代服饰、卡通、蓝色、紫色、复杂背景、水印
```

## SVG / CSS / 组件规格

### 道具规格 E：签筒 `LotTube.tsx`

- 形态：与店内背景同质感的旧竹木签筒，深褐木纹、暗金高光、朱砂符和旧竹签墨痕。
- 处理：不再裁切背景图；由 React 结构和 CSS 多层渐变生成，避免背景贴片感。
- 动画需求：点击后签筒整体摇晃，随后弹出一支与筒内竹签同质感的签，悬停时轻微上浮。

### SVG 规格 F：签 `fate-stick.svg`

- 形态：细长竹签，顶部朱砂点，签面不写真实可读字。
- 动画需求：从签筒中 `y: 100 → 0` 弹出，点击后 `rotateY + scale` 展开消失。

### SVG 规格 G：朱印 `cinnabar-seal.svg`

- 形态：不规则方印，边缘破损，朱砂红 `#8b1a1a`，内部文字由 React 叠加。
- 用途：命格名盖落、物品“已得”、当票“当”印。

### SVG 规格 H：灯笼 `red-lantern.svg`

- 形态：椭圆红灯笼，竹骨线条，暖色芯光。
- 动画需求：`opacity` 呼吸，不横向摆动太明显。

### 纹理规格 I：`paper-noise.svg`

- 形态：低对比度噪声 + 细纸纤维。
- 使用：`background-blend-mode: multiply`，透明度 8%-18%。

### CSS 规格 J：`mist-layer.css`

- 三层雾：底部慢雾、两侧横雾、前景薄雾。
- 只使用 `transform` 和 `opacity`，支持点击跳过后快速 fade。

### CSS 规格 K：`door-transition.css`

- 当铺远景放大 `scale: 1 → 1.18`，边缘 `blur: 0 → 6px`，再切店内。
- 总时长 1.5s，点击任意处跳到店内终态。

### 组件规格 L：`ItemObtainOverlay`

- 输入：`item`、`beforeResources`、`afterResources`、`sideEffects`、`onDone`、`onSkip`。
- 动画：商品卡片飘起、朱印盖落、数值变化 CountUp、副作用小卡 stagger。
- fallback：禁用动画时直接显示“已得”与副作用摘要。

### 组件规格 M：`ReceiptAssemble`

- 输入：`player`、`onDone`、`onSkip`。
- 动画：纸张展开、命格名、交易记录、命数变化、临别赠言依次出现，最后朱印盖落。
- fallback：直接渲染当前 `ReceiptCard`。

### SVG 规格 N：远景图兜底 `fallback-pawnshop.svg`

- 极简当铺剪影，屋檐、门、灯笼、雾线。
- 用于 `shop-facade-mist.jpg` 加载失败时。

### SVG 规格 O：掌柜兜底 `fallback-shopkeeper.svg`

- 皮影式半身轮廓，方巾、长须、长袍。
- 用于 `shopkeeper-silhouette.png` 加载失败时。

### CSS 规格 P：货架视觉分级

- 一二档：宣纸浅边，轻量荒诞。
- 三四档：暖棕纸面，普通主力。
- 五六档：暗金边 + 更重阴影。
- 七档 / 顶档：朱砂边 + 旧纸裂纹，不用纯黑。

## 已确认决策

1. P0 位图走 AI 生图，SVG/CSS 负责动态与兜底。
2. 掌柜剪影采用“戴方巾蓄须”的半身剪影，但不呈现清晰面部。
3. 4:3 展示图采用“AI 背景 + 前端叠标题文字”，避免图片中文字不可控。
4. 引入 `framer-motion` 和 `react-countup`。

## 已执行记录

| 资产 | 输出路径 | 尺寸 | 体积 | 状态 | 备注 |
|------|----------|------|------|------|------|
| 4:3 比赛展示图 | `public/images/luocha-pawnshop-poster-4x3.jpg` | 1200x900 | 约 182KB | 已集成 | `/showcase` 使用 AI 位图 + 前端标题叠加 |
| 开场远景当铺 | `public/images/shop-facade-mist.jpg` | 1400x788 | 约 183KB | 已集成 | 开场和推门过渡共用 |
| 店内主场景 | `public/images/shop-interior-main.jpg` | 1200x900 | 约 179KB | 已集成 | 店内背景、摇签场景、侧栏场景共用 |
| 掌柜剪影 | `public/images/shopkeeper-silhouette.webp` | 608x760 | 约 26KB | 已集成 | 绿幕图经 chroma-key 抠图后转 WebP |
| 摇签签筒 | `src/components/LotTube.tsx` + `src/styles/index.css` | responsive | 代码生成 | 已集成 | 旧竹木签筒和弹出签共用同一套材质样式 |

## 已集成功能

- 字体系统：`Ma Shan Zheng`、`ZCOOL XiaoWei`、`Noto Serif SC`。
- 开场雾散见铺：AI 远景图 + 三层 CSS 雾气 + 标题淡入。
- 入店过渡：远景图 scale + blur + fade，点击可跳过。
- 摇签求命：旧竹木签筒居中摇晃、同质感竹签弹出、朱印盖落，双击或按钮可跳过。
- 掌柜剪影 + 打字机：透明 WebP 剪影，图片失败时回落 CSS 剪影。
- 物品获得：获得卡、朱印盖落、命数变化 CountUp。
- 当票拼合：当票展开后朱印盖落。
- 货架分级：按档位调整边框、光影和朱砂强调。
- 图片 fallback：远景、店内、掌柜、展示图均有 `onError` 兜底。

## 下一步执行顺序

1. 接入字体系统和新色板。
2. 安装 `framer-motion react-countup`。
3. 先生成并筛选 4:3 比赛展示图。
4. 生成开场远景、店内主场景、掌柜剪影。
5. 写 SVG 道具与 fallback。
6. 集成五幕过渡、跳过机制和图片 fallback。
7. 精修当票、货架和物品获得动画。
8. 构建、移动端检查、部署。
