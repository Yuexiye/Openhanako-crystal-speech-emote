/**
 * lib/fetch-agents.js
 * 从 Hanako API 动态拉取助手列表，合并本地保存的主题/表情/语气映射
 *
 * 工作流程：
 *   1. 读取 ~/.hanako/server-info.json 获取 port + token
 *   2. 调用 Hanako API `/api/agents` 获取当前用户的完整助手列表
 *   3. 读取本地 data/agents.json（保存的主题/表情/语气映射）
 *   4. 合并：API 数据为主体，本地配置为覆盖（主题/表情/语气映射从本地取）
 *   5. 返回合并后的 agents 配置
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { getDefaultTheme } from './defaults.js';

const SERVER_INFO_PATH = path.join(os.homedir(), '.hanako', 'server-info.json');

/**
 * 获取合并后的助手配置
 * @param {string} pluginDir - 插件目录路径
 * @returns {Promise<Object>} { id: { displayName, theme, emotes, toneMap } }
 */
export async function fetchAgents(pluginDir, log) {
  const hanakoAgents = await fetchFromHanakoAPI(log);
  const localConfig = readLocalConfig(pluginDir, log);
  return mergeAgents(hanakoAgents, localConfig);
}

/**
 * 从 Hanako API 拉取助手列表
 * @returns {Promise<Array|null>} [{ id, name, ... }] 或 null
 */
async function fetchFromHanakoAPI(log) {
  try {
    if (!fs.existsSync(SERVER_INFO_PATH)) return null;

    const info = JSON.parse(fs.readFileSync(SERVER_INFO_PATH, 'utf-8'));
    const { port, token } = info;
    if (!port || !token) return null;

    const url = `http://localhost:${port}/api/agents`;

    const resp = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: AbortSignal.timeout(3000)
    });
    if (!resp.ok) return null;

    const data = await resp.json();
    if (data && data.agents && Array.isArray(data.agents)) {
      return data.agents;
    }
    return null;
  } catch (e) {
    if (log) log.warn('fetch-agents: Hanako API 调用失败:', e.message);
    return null;
  }
}

/**
 * 读取本地 agents.json
 */
function readLocalConfig(pluginDir, log) {
  try {
    const configPath = path.join(pluginDir, 'data', 'agents.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (e) {
    if (log) log.warn('fetch-agents: 读取本地 agents.json 失败:', e.message);
    return {};
  }
}

/**
 * 合并 Hanako API 和本地配置
 * API 数据为骨架（id + displayName），本地配置为覆盖（theme/emotes/toneMap）
 */
function mergeAgents(hanakoAgents, localConfig) {
  const merged = {};

  if (hanakoAgents && Array.isArray(hanakoAgents)) {
    for (const agent of hanakoAgents) {
      const id = agent.id;
      const local = localConfig[id] || {};
      merged[id] = {
        displayName: agent.name || id,
        theme: local.theme || getDefaultTheme(),
        emotes: local.emotes || {},
        toneMap: local.toneMap || {}
      };
    }
  }

  // 补入本地有但 Hanako API 中不存在的助手（如工作台自定义添加的）
  for (const [id, config] of Object.entries(localConfig)) {
    if (!merged[id]) {
      merged[id] = config;
    }
  }

  return merged;
}

export { mergeAgents, readLocalConfig };
