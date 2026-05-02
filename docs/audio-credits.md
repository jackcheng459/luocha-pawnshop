# 音频素材来源

## 背景音乐

- 当前使用文件：`public/audio/bgm/a-really-dark-alley.mp3`
- 曲目：`A really dark alley`
- 作者：Loyalty Freak Music
- 来源：Wikimedia Commons / Free Music Archive
- 许可：Creative Commons CC0 1.0 Universal Public Domain Dedication
- 页面：https://commons.wikimedia.org/wiki/File:Loyalty_Freak_Music_-_07_-_A_really_dark_alley.ogg

## 未纳入开源仓库的本地素材

- 文件：`public/audio/bgm/luocha.mp3`
- 来源：项目本地提供素材
- 处理：该文件已从公开仓库排除，避免授权边界不清影响开源分发。若后续确认授权，可自行恢复引用。

## 程序化音效

项目内的按钮声、纸页声、落印声、典当入柜声、取物铃声和风声由 `src/services/audioEngine.ts` 通过 Web Audio API 实时生成，没有使用外部音效文件。
