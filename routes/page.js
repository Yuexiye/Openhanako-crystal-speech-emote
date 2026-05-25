/**
 * routes/page.js — 晶花发言工作台 + API
 * 需要 full-access 权限
 *
 * 助手列表获取流程（2026-05-19 修复）：
 *   1. 从 Hanako API 动态拉取当前用户的助手列表
 *   2. 合并本地保存的主题/表情/语气映射配置
 *   3. 返回合并结果
 *   这样用户看到的始终是自己的助手，而不是写死的 agents.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fetchAgents } from '../lib/fetch-agents.js';
import { DEFAULT_AGENTS } from '../lib/defaults.js';

export default function (app, ctx) {
  const pluginDir = ctx.pluginDir;

  // ── 工作台页面 ──
  app.get('/crystal-speech', async (c) => {
    const htmlPath = path.join(pluginDir, '_crystal_workbench.html');
    try {
      const theme = c.req.query('hana-theme') || 'dark';
      let html = fs.readFileSync(htmlPath, 'utf-8');
      html = html.replace('<body', `<body data-hana-theme="${theme.replace(/["\'`<>]/g,'')}" data-surface="page"`);
      return c.html(html);
    } catch {
      return c.html(`<!doctype html><html><body data-hana-theme="dark" data-surface="page" style="background:#1a1a2e;color:#6aa7ff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui"><h1>晶花发言台</h1><p style="color:#666;font-size:13px;text-align:center;margin-top:8px">工作台文件未找到<br>请检查 _crystal_workbench.html 是否存在</p></body></html>`);
    }
  });

  // ── 读取助手配置（动态拉取 + 合并本地配置） ──
  app.get('/api/agents', async (c) => {
    try {
      const agents = await fetchAgents(pluginDir, ctx.log);
      return c.json(agents);
    } catch (e) {
      ctx.log.warn('crystal-speech-emote: /api/agents 获取失败:', e.message);
      return c.json(DEFAULT_AGENTS);
    }
  });

  // ── 保存配置 ──
  app.post('/api/save-config', async (c) => {
    try {
      const body = await c.req.json();
      if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length === 0) {
        return c.json({ ok: false, error: '配置格式无效' }, 400);
      }
      const raw = JSON.stringify(body);
      if (raw.length > 1024 * 1024) {
        return c.json({ ok: false, error: '配置过大（超过 1MB）' }, 400);
      }
      const agentsPath = path.join(pluginDir, 'data', 'agents.json');
      fs.writeFileSync(agentsPath, raw, 'utf-8');
      return c.json({ ok: true });
    } catch (e) {
      return c.json({ ok: false, error: e.message }, 500);
    }
  });

  // ── 上传表情 ──
  app.post('/api/upload-emote', async (c) => {
    try {
      const fd = await c.req.formData();
      let agentId = fd.get('agentId');
      let toneId = fd.get('toneId');
      const file = fd.get('file');
      if (!agentId || !toneId || !file) {
        return c.json({ ok: false, error: 'agentId, toneId, file required' }, 400);
      }

      // 安全校验：agentId 和 toneId 只允许字母、数字、下划线、连字符
      const safeIdRegex = /^[a-zA-Z0-9_\-]+$/;
      if (!safeIdRegex.test(agentId)) {
        return c.json({ ok: false, error: 'agentId 只允许字母、数字、下划线和连字符' }, 400);
      }
      if (!safeIdRegex.test(toneId)) {
        return c.json({ ok: false, error: 'toneId 只允许字母、数字、下划线和连字符' }, 400);
      }

      // 安全校验：文件扩展名白名单
      const ext = path.extname(file.name).toLowerCase();
      const allowedExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
      if (!allowedExts.includes(ext)) {
        return c.json({ ok: false, error: `不支持的文件类型: ${ext}，仅允许 ${allowedExts.join(', ')}` }, 400);
      }

      // 安全校验：MIME 类型白名单
      const allowedMimes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
      if (!file.type || !allowedMimes.includes(file.type)) {
        return c.json({ ok: false, error: '不支持的文件格式，仅允许 PNG/JPG/GIF/WebP' }, 400);
      }

      const fileName = `${toneId}${ext}`;
      const assetsDir = path.join(pluginDir, 'assets', 'emotes', agentId);
      fs.mkdirSync(assetsDir, { recursive: true });
      const filePath = path.join(assetsDir, fileName);

      // 安全校验：确保最终路径在插件目录内（防路径穿越）
      const resolvedPath = path.resolve(filePath);
      const resolvedPluginDir = path.resolve(pluginDir);
      if (!resolvedPath.startsWith(resolvedPluginDir)) {
        return c.json({ ok: false, error: '非法路径' }, 400);
      }

      const buffer = await file.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));

      // 更新 agents.json
      const agentsPath = path.join(pluginDir, 'data', 'agents.json');
      let agents = {};
      try { agents = JSON.parse(fs.readFileSync(agentsPath, 'utf-8')); } catch {}
      if (!agents[agentId]) agents[agentId] = { displayName: agentId, theme: {}, emotes: {}, toneMap: {} };
      if (!agents[agentId].emotes) agents[agentId].emotes = {};
      agents[agentId].emotes[toneId] = `assets/emotes/${agentId}/${fileName}`;
      fs.writeFileSync(agentsPath, JSON.stringify(agents, null, 2), 'utf-8');

      return c.json({ ok: true, path: `assets/emotes/${agentId}/${fileName}` });
    } catch (e) {
      return c.json({ ok: false, error: e.message }, 500);
    }
  });
}
