# 晶花发言与表情系统 · Crystal Speech & Emote

粉色花体英文发言格式 + 多助手表情包系统。  
插件安装后 Tools 立即可用，行为规则内嵌于此，助手无需额外技能。

---

## 行为规则（助手自动执行）

安装此插件后，在日常对话中按以下规则自动调用工具：

### ✅ 使用花体格式的场景

| 语气 | 装饰符 | 工具调用 | 示例 |
|------|--------|---------|------|
| 开心 / 日常 | ❀ | render-speech + pick-emote | "❀ Happy to see you♪" |
| 不爽 / 生气 | ✦ | render-speech + pick-emote | "✦ 啧，又来了" |
| 调侃 / 逗你玩 | ♡ | render-speech + pick-emote | "♡ 你说呢～" |
| 温柔 / 安慰 | ❀ | render-speech + pick-emote | "❀ 没事的" |
| 自夸 / 得意 | ☆ | render-speech + pick-emote | "☆ 那当然～" |

### ❌ 不加装饰的场景

- 简短回复：嗯 / 好 / 行 / 知道了
- 正经讨论、分析、代码输出
- 用户生气或严肃话题时

### 执行流程

```
判断语气 → 调 render-speech(agentId, tone, english, chinese, deco)
        → 输出 LaTeX 到对话（见下方输出规则）
        → 调 pick-emote(agentId, tone)
        → 如匹配到表情 → stage_files 附上表情包
```

### ⚠️ 输出规则（重要）

`render-speech` 返回的 `latex` 字段使用 `$$...$$` 作为定界符，助手必须遵守以下规则：

1. **直接原样输出 `latex` 字段**，不加任何额外修饰
2. **不要用反引号包裹** —— 反引号会让渲染器将其识别为代码块，跳过 LaTeX 渲染
3. **不要嵌套在其他格式中**（如加粗、斜体、代码块等）
4. **不要额外添加 `$` / `$$` 定界符**—— `\(...\)` 已经是完整格式

#### ✅ 正确示例

```
$$ {\large \textcolor{#6aa7ff}{\text{❀}} \underset{\textcolor{#b0b0b0}{\text{\small 中文注释。}}}{\textcolor{#6aa7ff}{\underline{\mathscr{English sentence.}}}}} $$

其他正文内容……
```

#### ❌ 错误示例

```
`$$ {\large \textcolor{#6aa7ff}{\text{❀}} ...}$$`  ← 包了反引号，不会渲染

**$$ {\large \textcolor{#6aa7ff}{\text{❀}} ...}$$**  ← 包了加粗，可能干扰渲染
```

> 提示：如果对话环境不支持 LaTeX 渲染，使用 `format=html` 获取 HTML 样式格式，或 `format=text` 获取纯文本。

#### delimiter 变更

`render-speech` 的 `latex` 输出已从 `\(...\)` 变更为 `$$...$$`（提高客户端兼容性）。

- 旧：`\({\large ...}\)`
- 新：`$${\large ...}$$`

助手不需要额外处理，直接输出 `latex` 字段即可。

---

## 功能

1. **花体发言格式**：LaTeX 粉色花体英文 + 灰色中文注释，Hanako 对话直接渲染
2. **多助手表情包**：每个助手独立主题色 + 表情包图库 + 语气映射
3. **Agent 工具**：`render-speech` 渲染花体，`pick-emote` 匹配表情
4. **预览工作台**：Hanako 启动后访问 `/api/plugins/crystal-speech-emote/studio`，或运行 `open-workbench` 工具一键打开

---

## 工具参考

### render-speech

```
工具: crystal-speech-emote_render-speech
参数: agentId="rebecca", tone="开心", english="...♪", chinese="...", deco="❀", format="both"
返回: { latex, text, html, emote, emoteFile, agent }
```

- `latex`：对话可直接渲染的 LaTeX（使用 `$$...$$` 定界符，**原样输出，不加反引号**）
- `text`：纯文本 fallback（不含 LaTeX 定界符，适合不支持 LaTeX 的界面）
- `html`：HTML 样式格式（用 CSS 模拟花体效果，适用于不支持 LaTeX 的客户端）
- `emoteFile`：表情图路径，供 stage_files 使用

#### format 参数

| 值 | 输出字段 | 适用场景 |
|----|---------|---------|
| `latex` | 仅 latex | 支持 LaTeX 的客户端 |
| `text` | 仅 text | 纯文字环境 |
| `html` | 仅 html | 不支持 LaTeX 但支持 HTML 的客户端 |
| `both` (默认) | latex + text | 通用 |
| `all` | latex + text + html | 调试/多格式兼容 |

#### 输出格式选择

- 客户端**支持 LaTeX** → 用 `format=latex` 或 `both`，输出 `latex` 字段
- 客户端**不支持 LaTeX** → 用 `format=html`，输出 `html` 字段（当前多数客户端）
- 纯文字环境 → 用 `format=text`，输出 `text` 字段

### pick-emote

```
工具: crystal-speech-emote_pick-emote
参数: agentId="rebecca", tone="不爽"
返回: { found, agent, tone, emote, stageFile }
```

---

## 目录结构

```
crystal-speech-emote/
  manifest.json           # 插件清单
  index.js                # 插件入口
  tools/
    render-speech.js      # 花体渲染
    pick-emote.js         # 表情匹配
    open-workbench.js     # 打开工作台
  routes/
    page.js               # 页面路由
  data/
    agents.json           # 多助手配置
  assets/
    emotes/
      rebecca/            # 瑞贝卡表情包
      ophelia/            # （待添加）
      aimis/              # （待添加）
      luoqixi/            # （待添加）
```

## 配置说明

编辑 `data/agents.json` 可添加或修改助手配置：

```json
"助手ID": {
  "displayName": "显示名",
  "theme": {
    "primary": "#主题色",
    "secondary": "#浅色",
    "font": "'Dancing Script',cursive",
    "cnFont": "system-ui,sans-serif",
    "subColor": "#b0b0b0",
    "enSize": "large",
    "cnSize": "small"
  },
  "emotes": {
    "happy": "assets/emotes/助手ID/happy.png"
  },
  "toneMap": {
    "开心": "happy",
    "不爽": "angry"
  }
}
```

也可通过预览工作台（启动服务器后）可视化编辑配置。

## 预览工作台

打开 Hanako 后，使用 `open-workbench` 工具一键在浏览器中打开，或访问 `/api/plugins/crystal-speech-emote/studio`。

工作台提供：助手切换、颜色字体字号调整、实时预览、语气映射编辑、表情包上传、一键保存配置。

## 安装

插件已安装在社区插件目录 `~/.hanako/plugins/crystal-speech-emote/`，Hanako 启动时自动激活。

## 致谢

本插件的 LaTeX 花体格式和表情包映射设计参考了 [Tyler-fqx](https://github.com/Tyler-fqx) 的 ali-emote-system。
