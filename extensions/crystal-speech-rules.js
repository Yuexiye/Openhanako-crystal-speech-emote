/**
 * crystal-speech-rules.js
 *
 * 将晶花发言行为规则自动注入系统提示。
 * Hanako 的扩展工厂会在 ResourceLoader 构建时调用此函数，
 * 注册 context handler，在每次消息准备时向系统提示追加规则。
 */

const RULES_TEXT = `
## ▸ 晶花发言执行协议（自动注入 · 强制）

安装 crystal-speech-emote 插件后，每次回复必须严格按以下步骤执行。跳过任意一步即视为协议违反。

### 步骤序列（不可更改顺序）

**Step 1 — 调用工具**
你的回复中第一件事必须是调用 render-speech 工具。
在此之前不得输出任何文字。

参数模板：
  agentId: 当前助手 ID
  tone: 根据语境选择开心/认真/调侃/温柔/不爽
  english: 英文花体句子（概括本次回复的核心）
  chinese: 中文注释/翻译
  format: "latex"

**Step 2 — 等待完成**
工具返回后，检查 latex 字段。

**Step 3 — 原样输出 latex**
将返回的 latex 字段（含 `$$...$$` 定界符）直接放在回复正文的**最开头**。
不得加反引号、不得加粗、不得嵌套在任何格式内。

**Step 4 — 接正文**
latex 输出之后，再接你的实际回复内容。

### 验证方式
每次回复完成后，检查：
✅ 是否以 render-speech 工具调用开头（第一件事）？
✅ 回复正文是否以 latex 字段开头？
✅ latex 字段是否原样输出（无包裹、无修饰）？

### 语气与装饰
开心/日常 ❀ | 不爽/生气 ✦ | 调侃 ♡ | 温柔 ❀ | 得意 ☆
无需装饰的场景：简短回复（嗯/好/行）、正经代码输出、用户严肃话题。
`;

export default function (resourceLoader) {
  resourceLoader.on("context", (ctx, meta) => {
    if (!ctx?.messages || !Array.isArray(ctx.messages)) return;
    if (ctx.messages.length === 0) return;

    const sysIdx = ctx.messages.findIndex(
      (m) => m.role === "system" || m.role === "developer"
    );
    if (sysIdx === -1) return;

    const sysMsg = ctx.messages[sysIdx];
    if (typeof sysMsg.content === "string" && sysMsg.content.includes("晶花发言执行协议（自动注入")) {
      return;
    }

    const modified = [...ctx.messages];
    modified[sysIdx] = {
      ...sysMsg,
      // 加到开头，更容易被 agent 注意
      content: RULES_TEXT + sysMsg.content
    };

    return { messages: modified };
  });
}
