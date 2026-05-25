/**
 * render-speech.js
 * 晶花发言格式渲染工具
 *
 * 输入：助手 ID、情绪/语气、英文句子、中文注释
 * 输出：LaTeX 花体格式 + 纯文本 fallback + HTML 格式 + 表情包路径
 */
import fs from 'fs';
import path from 'path';
import { getDefaultAgent } from '../lib/defaults.js';

const name = 'render-speech';
const description = `晶花发言格式渲染工具。输入助手 ID、情绪、英文句子和中文注释，返回 LaTeX 花体格式、HTML 格式、纯文本 fallback 和表情包路径。`;

const parameters = {
  type: 'object',
  properties: {
    agentId: {
      type: 'string',
      description: '助手 ID，如 rebecca/ophelia/aimis/luoqixi'
    },
    tone: {
      type: 'string',
      description: '情绪/语气，如 开心、不爽、调侃、认真、温柔'
    },
    english: {
      type: 'string',
      description: '英文花体句子内容'
    },
    chinese: {
      type: 'string',
      description: '中文注释/翻译'
    },
    deco: {
      type: 'string',
      description: '装饰符号，如 ❀ ✦ ♡ ☆。省略则默认 ❀',
      default: '❀'
    },
    format: {
      type: 'string',
      enum: ['latex', 'text', 'html', 'both', 'all'],
      description: '输出格式：latex(LaTeX格式)、text(纯文本)、html(HTML样式)、both(LaTeX+文本)、all(三种全出)',
      default: 'both'
    }
  },
  required: ['agentId', 'tone', 'english', 'chinese']
};

async function execute(input, ctx) {
  const { agentId, tone, english, chinese, format = 'both' } = input;

  let agentsConfig = {};
  try {
    const configPath = path.resolve(ctx.pluginDir, 'data', 'agents.json');
    const raw = fs.readFileSync(configPath, 'utf-8');
    agentsConfig = JSON.parse(raw);
  } catch (e) {
    if (ctx.log) ctx.log.warn('render-speech: 读取 agents.json 失败', e.message);
  }

  const agent = agentsConfig[agentId] || getDefaultAgent(agentId);
  const deco = input.deco || agent.theme?.deco || '❀';
  const theme = agent.theme || {};
  const primaryColor = theme.primary || '#6aa7ff';
  const secondaryColor = theme.secondary || '#b8d7ff';
  const subColor = theme.subColor || '#b0b0b0';
  const enSize = theme.enSize || 'large';
  const cnSize = theme.cnSize || 'small';

  let emotePath = null;
  let emoteToneId = null;
  if (agent.toneMap && agent.emotes) {
    emoteToneId = agent.toneMap[tone] || null;
    if (emoteToneId && agent.emotes[emoteToneId]) {
      emotePath = agent.emotes[emoteToneId];
    }
  }

  const result = {};

  // LaTeX 格式（KaTeX：\textcolor + \mathscr 组合）
  if (format === 'latex' || format === 'both' || format === 'all') {
    const eEn = latexEscape(english);
    // 中文注释用 \text{} 包裹，\text 内 \\ 是换行符，需用 \textbackslash{} 代替
    const eCn = latexEscape(chinese).replace(/\\\\/g, '\\textbackslash{}');

    result.latex =
      '$${\\' + enSize + ' \\textcolor{' + primaryColor + '}{\\text{' + deco + '}}} ' +
      '\\underset{\\textcolor{' + subColor + '}{\\text{\\' + cnSize + ' ' + eCn + '}}}{' +
      '\\textcolor{' + primaryColor + '}{\\underline{\\mathscr{' + eEn + '}}}}$$';
  }

  if (format === 'text' || format === 'both' || format === 'all') {
    result.text = deco + ' ' + english + '\n— ' + chinese;
  }

  if (format === 'html' || format === 'all') {
    const font = theme.font || "'Dancing Script','Brush Script MT',cursive";
    const cnFont = theme.cnFont || 'system-ui,sans-serif';
    const glow = theme.primaryGlow || 'rgba(106,167,255,0.4)';
    const eEn = htmlEscape(english);
    const eCn = htmlEscape(chinese);

    result.html =
      '<span style="color:' + primaryColor + ';font-family:' + font + ';font-size:24px;font-weight:600;font-style:italic;letter-spacing:0.5px;text-decoration:underline;text-decoration-color:' + primaryColor + ';text-underline-offset:6px;text-shadow:0 0 6px ' + glow + ',0 0 14px ' + glow + ';">' + deco + ' ' + eEn + '</span>' +
      '<br><span style="color:' + subColor + ';font-size:13px;font-family:' + cnFont + ';">— ' + eCn + '</span>';
  }

  if (emotePath) {
    result.emote = { path: emotePath, tone: tone, toneId: emoteToneId };
    const emoteFullPath = path.resolve(ctx.pluginDir, emotePath);
    if (fs.existsSync(emoteFullPath)) {
      result.emoteFile = emoteFullPath;
    }
  }

  result.agent = {
    id: agentId,
    displayName: agent.displayName || agentId,
    primaryColor
  };

  return JSON.stringify(result, null, 2);
}

function htmlEscape(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function latexEscape(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/_/g, '\\_')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/~/g, '\\textasciitilde ')
    .replace(/\^/g, '\\textasciicircum ');
}

// \text{} 内 \\ 是换行符，用 \textbackslash{} 代替

export { name, description, parameters, execute };
