import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_AGENTS } from './lib/defaults.js';

/**
 * crystal-speech-emote 插件入口
 */
export default class CrystalSpeechEmotePlugin {
  async onload() {
    const { log, pluginDir } = this.ctx;
    log.info('crystal-speech-emote plugin loaded');

    // 初始化 data 目录和 agents.json
    initDataDir(pluginDir, log);

    this.register(() => {});
  }

  /**
   * 插件系统会自动调用 routes/ 下的 .js 文件
   * 导出函数签名: export default function(app, ctx)
   */
}

/**
 * 初始化 data 目录和 agents.json（默认配置）
 * 安装插件后首次加载时自动创建，避免 ENOENT 报错
 */
function initDataDir(pluginDir, log) {
  const dataDir = path.join(pluginDir, 'data');
  const agentsPath = path.join(dataDir, 'agents.json');

  if (fs.existsSync(agentsPath)) return;

  try {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(agentsPath, JSON.stringify(DEFAULT_AGENTS, null, 2), 'utf-8');
    log.info('crystal-speech-emote: 已初始化 data/agents.json');
  } catch (e) {
    log.warn('crystal-speech-emote: 初始化 agents.json 失败', e.message);
  }
}
