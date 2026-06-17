# 代码觉醒者测试报告 - 2026-06-15

## 自动化验证

- `npm.cmd test`
  - 结果：通过。
  - 覆盖：14 个 C 教学章节、质量系统、CSP/hash 自检、存档/安全/编辑器/世界系统静态断言。
- `node build-single-html.cjs`
  - 结果：通过。
  - 输出：`dist/index.html`、`dist/programming-rpg-c-basics.production.html`。

## 本轮重点用例

- 新玩家进入游戏：开场终端叙事已接入，完成后自动进入导师强制对话，并激活任务日志。
- 任务日志：右上任务追踪新增“修复世界一”摘要，显示基础碎片 0/3、当前石碑目标和步骤状态。
- 碎片收集：收集 int / return / printf 后会触发任务刷新；3/3 时播放基础结构重建终端提示。
- 创角完成：`return 0;` 后执行保存角色数据、验证存档、出生特效、2 秒加载、3 秒超时后备进入世界。
- 清空记忆碎片：新增独立按钮，二次确认后只清空碎片、印记和碎片计数，不删除角色/设置。
- 完成关卡：通过 `LevelManager.CompleteCurrentLevel` 统一更新 `completedLevels/currentLevel`、保存、节点状态和铺路动画。
- 实时解释：编辑器右侧新增导师解析面板，支持变量、条件、循环、函数、数组、指针、结构体、注释解释。
- 错误解释：缺分号等即时错误会在解释面板显示位置、原因、正确示例和当前对比。
- 悬浮解释：鼠标悬停 C 关键字会显示定义、示例和注意事项；低性能或超时会自动降级。

## 浏览器烟测

- 通过临时本地静态服务器打开：`http://127.0.0.1:8765/programming-rpg-c-basics.html?noAnims=true`
- 结果：页面标题正常，主页面可加载，不是白屏。
- 控制台剩余提示：
  - `frame-ancestors` 在 meta CSP 中被浏览器忽略：保留该文本以满足项目安全断言，同时安全层增加了运行时 iframe 脱离兜底。
  - Service Worker blob 注册在本地测试协议下降级：游戏继续按普通单页运行。
  - AudioContext 需要用户手势启动：符合浏览器自动播放策略，不影响首次点击后的音频恢复。
- 未观察到本轮新增代码导致的运行时崩溃。

## 性能与引导优化补充

- 性能模式：新增高/中/低三档与启动 5 秒基准，低帧会写入性能日志并自动降级。
- F1 仪表盘：显示 FPS、帧耗时、CPU/GPU 估算、Draw Call、粒子、内存、对象池和当前模式。
- 粒子与代码雨：按距离、玩家移动状态和性能档位动态裁剪；代码雨根据档位调整更新频率。
- NPC 更新：NPC 目光/AI 反馈改为每 8 帧更新，15 格外只保留轻待机恢复。
- 地面代码字符：改为每 5 帧双缓冲更新，中间使用 Lerp 平滑过渡。
- 错误恢复：全局异常写入本地错误日志，可导出 error_log.txt，并显示终端风格友好弹窗。
- 编辑器引导：支持完整/精简/无三种模式，首次打开自动弹出，Esc 或“我已掌握”关闭并持久化。
- 关卡完成特效：代码铺路按裂缝、字符流动、路径固化、全屏脉冲、终端宣告顺序播放。

## 本轮验证命令

- `npm.cmd test`
  - 结果：通过，输出 `validated 14 C tutorial chapters and quality systems`。
- `node build-single-html.cjs`
  - 结果：通过，输出 `dist/index.html` 与 `dist/programming-rpg-c-basics.production.html`。
- 浏览器烟测：通过本地静态服务器确认页面可加载、非白屏，并检查控制台无新增脚本崩溃。

## 追加修复验证

- 已更新自动断言：
  - 设置界面不再包含 `cinematicQualitySelect`。
  - 设置界面不再包含 `frameCapSelect`。
  - 渲染管线不再包含 `body[data-cinematic-quality="cinematic"]` 档。
  - `SafeExecute`、`SafeBehaviour`、`SafeLoadScene`、`ErrorLogManager` 均存在。
  - 碎片收集与编译执行入口已接入 `SafeExecute`。
  - 代码创世完成流程存在 `codeGenesisCompletionInFlight` 防重入锁。
- 本轮命令：
  - `npm.cmd test`：通过。
  - `node build-single-html.cjs`：通过。
- 备注：本轮 MCP 浏览器页句柄反复关闭，未完成新的交互烟测；未发现自动测试或构建层面的回归。

## 硬件长测说明

- 高配 RTX 3060 60fps、GTX 1060 45fps、集显 30fps、连续 2 小时内存无增长属于真机长时性能验收；当前本地自动环境没有这些 GPU 档位和长测浏览器会话，未伪造通过结果。
- 已交付自动降级、F1 性能仪表盘、性能日志与粒子/代码雨/NPC 降载机制，后续可用这些指标在目标设备上复测。
