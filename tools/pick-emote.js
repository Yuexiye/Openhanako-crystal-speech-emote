/**
 * pick-emote.js
 * 表情包匹配工具
 *
 * 输入：助手 ID、情绪/语气
 * 输出：匹配的表情包文件路径和stageFiles所需数据
 */
import fs from 'fs';
import path from 'path';

const name = 'pick-emote';
const description = `表情包匹配工具。输入助手 ID 和语气，返回该助手对应情绪的表情包文件路径。`;

const parameters = {
  type: 'object',
  properties: {
    agentId: {
      type: 'string',
      description: '助手 ID，如 rebecca/ophelia/aimis/luoqixi'
    },
    tone: {
      type: 'string',
      description: '情绪/语气关键词，如 开心、不爽、调侃、认真、温柔。可模糊匹配'
    }
  },
  required: ['agentId', 'tone']
};

async function execute(input, ctx) {
  const { agentId, tone } = input;

  // 加载助手配置
  let agentsConfig = {};
  try {
    const configPath = path.resolve(ctx.pluginDir, 'data', 'agents.json');
    const raw = fs.readFileSync(configPath, 'utf-8');
    agentsConfig = JSON.parse(raw);
  } catch (e) {
    return JSON.stringify({ found: false, reason: '缺失 agents.json 配置' });
  }

  const agent = agentsConfig[agentId];
  if (!agent) {
    return JSON.stringify({ found: false, reason: `未找到助手: ${agentId}` });
  }

  if (!agent.toneMap || !agent.emotes) {
    return JSON.stringify({ found: false, reason: `助手 ${agent.displayName || agentId} 还未配置表情包` });
  }

  // 语气匹配：精确 → 部分 → 含糊
  let emoteId = null;
  const toneMap = agent.toneMap;

  // 1. 精确匹配
  if (toneMap[tone]) {
    emoteId = toneMap[tone];
  } else {
    // 2. 部分匹配（tone 被 key 包含，或 key 被 tone 包含）
    // 优先匹配更短的 key（更精确）
    const candidates = Object.entries(toneMap)
      .filter(([key]) => key.includes(tone) || tone.includes(key))
      .sort((a, b) => a[0].length - b[0].length);
    if (candidates.length > 0) {
      emoteId = candidates[0][1];
    }
  }

  if (!emoteId) {
    return JSON.stringify({
      found: false,
      reason: `未找到匹配语气: ${tone}`,
      available: Object.keys(toneMap),
      suggestion: Object.keys(toneMap)[0] || null
    });
  }

  const emoteRelPath = agent.emotes[emoteId];
  if (!emoteRelPath) {
    return JSON.stringify({ found: false, reason: `表情 ${emoteId} 未配置在助手 ${agent.displayName} 的 emotes 中` });
  }

  const emoteFullPath = path.resolve(ctx.pluginDir, emoteRelPath);
  if (!fs.existsSync(emoteFullPath)) {
    return JSON.stringify({ found: false, reason: `表情包文件不存在: ${emoteRelPath}` });
  }

  return JSON.stringify({
    found: true,
    agent: {
      id: agentId,
      displayName: agent.displayName || agentId
    },
    tone: {
      input: tone,
      matched: emoteId
    },
    emote: {
      path: emoteRelPath,
      fullPath: emoteFullPath,
      id: emoteId
    },
    stageFile: {
      filePath: emoteFullPath,
      label: `${agent.displayName} - ${emoteId}`
    }
  }, null, 2);
}

export { name, description, parameters, execute };
