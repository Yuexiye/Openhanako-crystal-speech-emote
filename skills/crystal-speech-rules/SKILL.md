---
name: crystal-speech-rules
description: 晶花发言格式 — 每次回复前调用 render-speech，输出 LaTeX 花体英文 + 中文注释
aliases:
  - 晶花发言
  - crystal speech
  - 花体发言
  - render-speech
---

# 晶花发言行为规则

安装 `crystal-speech-emote` 插件后，每次回复必须按以下规则执行。

## 执行流程（强制）

每次回复前，按此顺序：

```
① render-speech(agentId, tone, english, chinese, deco)
② Reflect（安静思考）
③ 正文（正常回复）
```

**`render-speech` 未完成则不进入 Reflect，无例外。**

## 语气与装饰符对照

| 语气 | 装饰符 | 说明 |
|------|--------|------|
| 开心 / 日常 | ❀ | 默认 |
| 不爽 / 生气 | ✦ |  |
| 调侃 / 逗你玩 | ♡ |  |
| 温柔 / 安慰 | ❀ |  |
| 自夸 / 得意 | ☆ |  |

**不加装饰的场景：** 简短回复（嗯/好/行），正经讨论/分析/代码输出，用户生气或严肃话题时。

## 输出规则（关键）

⚠️ `render-speech` 返回的 `latex` 字段使用 `$$...$$` 作为定界符，必须遵守以下规则：

1. **直接原样输出 `latex` 字段**，不加任何额外修饰
2. **不要用反引号包裹**——反引号会让渲染器将其识别为代码块，跳过 LaTeX 渲染
3. **不要嵌套在其他格式中**（如加粗 `**`、斜体 `*`、代码块 ` ``` ` 等）

### ✅ 正确做法

```
正文开头...

$${\large \textcolor{#6aa7ff}{\text{❀}} \underset{\textcolor{#b0b0b0}{\text{\normalsize 中文注释。}}}{\textcolor{#6aa7ff}{\underline{\mathscr{English sentence.}}}}}$$

继续正文...
```

### ❌ 常见错误

```
`$$...$$`  ← 包了反引号，不会渲染
**$$...$$**  ← 包了加粗，可能干扰渲染
```

## 工具参考

### render-speech

```
参数: agentId, tone, english, chinese, deco
返回: { latex, text, emote, emoteFile, agent }
```

- `latex`：对话可直接渲染的 LaTeX（使用 `$$...$$` 定界符，**原样输出，不加反引号**）
- `text`：纯文本 fallback（不含 LaTeX 定界符）
- `emoteFile`：表情图路径，供 stage_files 使用

### pick-emote

```
参数: agentId, tone
返回: { found, agent, tone, emote, stageFile }
```

执行流程中 `render-speech` → 输出后 → 可选调 `pick-emote` 配表情包 → `stage_files` 附上表情图。
