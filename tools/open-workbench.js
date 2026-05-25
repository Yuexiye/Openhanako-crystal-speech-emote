/**
 * tools/open-workbench.js
 * 打开晶花发言预览工作台
 */
import fs from 'fs';
import path from 'path';
import os from 'os';

const name = 'open-workbench';
const description = '在浏览器中打开晶花发言预览工作台。支持实时编辑、助手切换、一键复制 LaTeX。';

const parameters = {
  type: 'object',
  properties: {}
};

function getServerPort() {
  try {
    const infoPath = path.join(os.homedir(), '.hanako', 'server-info.json');
    const info = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
    return info.port || 14500;
  } catch {
    return 14500; // fallback
  }
}

async function execute(input, ctx) {
  const port = getServerPort();
  return JSON.stringify({
    message: '点击下方链接在浏览器中打开预览工作台',
    url: `http://localhost:${port}/api/plugins/crystal-speech-emote/studio`,
    localPath: path.join(ctx.pluginDir, '_crystal_workbench.html'),
    tip: '双击 localPath 文件也可直接打开，或使用 Hanako 侧栏工作台页面'
  }, null, 2);
}

export { name, description, parameters, execute };