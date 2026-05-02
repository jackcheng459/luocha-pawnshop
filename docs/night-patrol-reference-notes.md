# Night-Patrol 参考记录

参考仓库：https://github.com/op7418/Night-Patrol

## 许可边界

该仓库采用 CC BY-NC 4.0，并在 `LICENSE` 中明确说明不得将其代码、构建、视觉资产、音频、视频、截图或改作版本用于商业用途。当前项目只参考交互设计方法，不复制该仓库代码和素材。

## 参考到的设计方法

1. 屏幕级状态驱动
   `Night-Patrol` 使用 `screen` 管理 title、map、combat、cinematic、reward 等界面。当前项目对应强化了 `phase / introStage` 的屏幕切换，并加上 `TransitionVeil` 墨幕题词。

2. 音效由状态变化触发
   `Night-Patrol` 通过 `lastFx` 从规则层传给 UI 层。当前项目保留 React/useReducer 架构，在用户行为和关键 phase 切换处触发 `audioEngine` 音效。

3. 结算过场 fallback
   `Night-Patrol` 对视频过场提供静态 fallback。当前项目没有引入视频资产，改为墨幕、纸纹、卡片入场、取物弹层、当票落成等轻量过场，保证 H5 加载稳定。

4. 战斗反馈的“可信感”
   `Night-Patrol` 的受击震动、屏幕反馈和短音效是核心手感来源。当前项目把相同原则迁移到摇签、典当、取物、续签、离店等节点。

## 本次落地

- `src/components/TransitionVeil.tsx`：关键屏幕切换时显示墨幕和题词。
- `src/services/audioEngine.ts`：外部 BGM + Web Audio 程序化音效。
- `public/audio/bgm/a-really-dark-alley.mp3`：CC0 背景音乐。
- `docs/audio-credits.md` 和 `public/audio/NOTICE.txt`：音频来源与许可说明。
