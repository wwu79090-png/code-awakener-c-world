# 情绪关系与学习反馈设计

## 目标

本轮将《代码觉醒者》的下一阶段体验聚焦在两件事：

1. 让导师 NPC 更像一个会记住玩家的朋友，而不是任务发布器。
2. 让学习成功的瞬间更像“灵感与掌握”，而不是普通 UI 提示。

终局礼物、空房间和开发者最终信暂不进入本轮实现，只保留数据与事件接口，避免当前 C 世界主流程过早膨胀。

## 范围

### 1. 导师亲密值

新增 `MentorAffinitySystem`，状态存入 `gameState.progress.npcMemory.mentor.affinity`。

触发规则：

- 每次与导师 NPC 交互，亲密值 +1。
- 每个阶段只首次触发新语气，避免重复刷屏。
- 清存档时亲密值归零。

语气阶段：

- `0-2`：正式教学语气。
- `3-5`：亲切提示，例如“你今天看起来状态不错。”。
- `6+`：解锁导师个人小故事，只触发一次。

实现方式：

- 不改 NPC 数据结构的大方向，只在 `interactWithMentor()` 前后调用亲密值系统。
- 对话依然使用现有 NPC 头顶灵动岛窗口。
- 亲密值变化通过 `eventBus.emit("mentor:affinityChanged")` 通知其他系统。

### 2. 任务完成的视觉诗

新增 `MemoryFlashSystem`，在关键任务完成时播放短暂“回忆杀”。

触发规则：

- 只在主线任务或关键学习节点触发。
- 普通支线不触发，避免疲劳。
- 如果动画强度为 `off`，降级为一行诗性代码注释。

视觉表现：

- 屏幕短暂出现老电视模糊/扫描感。
- 闪过 1-2 个极短片段：灯塔、背影、代码行、打开的门。
- 总时长控制在 1.2 秒以内，不阻断操作太久。

实现方式：

- 使用 DOM overlay，不新增外部图片资源。
- 复用现有 `memoryReadOverlay` 或新增轻量 `memoryFlashOverlay`。
- 由 `showQuestReward(task)` 触发，内部判断任务是否关键。

### 3. 代码灵感机制

新增 `CodeInspirationSystem`，在编辑器打开时低概率显示半透明提示。

触发规则：

- 每次打开编辑器时判断一次。
- 基础概率较低，玩家连续错误或停留过久时概率提高。
- 每个章节的灵感文案来自配置表，不直接给答案。

示例：

- 循环章节：`// 也许你需要一种重复的力量。`
- 数组章节：`// 下标从 0 开始，像第一盏灯。`
- 指针章节：`// 有些值不在这里，但地址会记得。`

实现方式：

- 在 `openEditor(chapterId)` 结束时调用。
- 以编辑器内半透明注释浮层出现，2-3 秒后淡出。
- 不修改玩家代码，不插入答案。

### 4. for 循环学习里程碑

当玩家第一次通过 `loops` 章节挑战时，触发一次祝福动画。

视觉表现：

- 柔和金色光圈从屏幕中心扩散。
- 玩家头顶或屏幕中央出现文字：`你掌握了一种创造重复的力量。`
- 记录到代码日志，后续不重复触发。

实现方式：

- 在 `markCleared("loops")` 或通关成功逻辑里检测。
- 状态存入 `gameState.progress.milestones.loopBlessingSeen`。
- 清存档时归零。

## 数据结构

扩展 `defaultProgress`：

```js
npcMemory: {
  mentor: {
    affinity: 0,
    storyUnlocked: false,
    lastToneStage: "formal"
  }
},
milestones: {
  loopBlessingSeen: false
}
```

为了兼容旧存档，读取时必须通过现有 `repairSaveData()` 和显式默认值兜底。

## 事件流

```text
玩家与导师交互
-> MentorAffinitySystem.increment("mentor")
-> 更新 NPC 语气
-> eventBus.emit("mentor:affinityChanged")

玩家完成关键任务
-> showQuestReward(task)
-> MemoryFlashSystem.play(task)
-> 任务奖励 toast

玩家打开编辑器
-> openEditor(chapterId)
-> CodeInspirationSystem.maybeShow(chapterId)

玩家首次通过 loops
-> markCleared("loops")
-> playLoopBlessing()
-> 写入代码日志
```

## 非目标

本轮不做：

- 终局空房间。
- 开发者最终信。
- 全息背包整体重做。
- 路径随机纪念物。
- 区域生态永久改造。

这些内容可在本轮系统稳定后复用同一套事件总线和记忆状态继续扩展。

## 验收标准

- 与导师交互会增加隐藏亲密值，并在不同阈值出现不同语气。
- 亲密值达到上限后只触发一次导师个人小故事。
- 主线关键任务完成时出现短暂回忆杀视觉，动画关闭时有静态替代反馈。
- 编辑器打开时有低概率出现代码灵感提示，不写入玩家代码。
- 第一次通过 for 循环章节时播放祝福动画，并记录里程碑避免重复。
- 清存档后亲密值、导师故事、学习里程碑全部归零。
- 现有 `npm.cmd test`、`npm.cmd run audit:static`、`npm.cmd run build` 仍通过。

