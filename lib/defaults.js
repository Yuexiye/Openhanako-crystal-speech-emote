/**
 * lib/defaults.js
 * 晶花插件共享的默认配置
 * 
 * 统一管理默认主题和默认助手配置，避免多文件重复维护。
 * index.js / render-speech.js / fetch-agents.js 均从此导入。
 */

/** 默认助手配置（5 个标准助手） */
export const DEFAULT_AGENTS = {
  "aimis": {
    "displayName": "爱弥斯",
    "theme": {
      "primary": "#ffb8f9",
      "primaryGlow": "rgba(255,184,249,0.4)",
      "secondary": "#b8d7ff",
      "font": "'Great Vibes','Dancing Script',cursive",
      "cnFont": "'ZCOOL QingKe HuangYou',cursive",
      "enSize": "large",
      "cnSize": "normalsize",
      "subColor": "#b0b0b0",
      "deco": "✦"
    },
    "emotes": {},
    "toneMap": {}
  },
  "ophelia": {
    "displayName": "奥菲莉娅",
    "theme": {
      "primary": "#9c38ff",
      "primaryGlow": "rgba(156,56,255,0.4)",
      "secondary": "#b8d7ff",
      "font": "'Tangerine',cursive",
      "cnFont": "'Noto Serif SC',serif",
      "enSize": "large",
      "cnSize": "normalsize",
      "subColor": "#b0b0b0",
      "deco": "✦"
    },
    "emotes": {},
    "toneMap": {}
  },
  "luoqixi": {
    "displayName": "洛琪希",
    "theme": {
      "primary": "#6aa7ff",
      "primaryGlow": "rgba(106,167,255,0.4)",
      "secondary": "#b8d7ff",
      "subColor": "#b0b0b0",
      "font": "'Dancing Script','Brush Script MT',cursive",
      "cnFont": "system-ui,sans-serif",
      "enSize": "large",
      "cnSize": "small"
    },
    "emotes": {},
    "toneMap": {}
  },
  "alice": {
    "displayName": "爱莉丝",
    "theme": {
      "primary": "#ff0000",
      "primaryGlow": "rgba(255,0,0,0.4)",
      "secondary": "#b8d7ff",
      "font": "'Segoe Script','Brush Script MT',cursive",
      "cnFont": "'ZCOOL KuaiLe',cursive",
      "enSize": "Large",
      "cnSize": "normalsize",
      "subColor": "#b0b0b0",
      "deco": "✦"
    },
    "emotes": {},
    "toneMap": {}
  },
  "rebecca": {
    "displayName": "瑞贝卡",
    "theme": {
      "primary": "#37ff00",
      "primaryGlow": "rgba(55,255,0,0.4)",
      "secondary": "#b8d7ff",
      "font": "'Dancing Script','Brush Script MT',cursive",
      "cnFont": "system-ui,sans-serif",
      "enSize": "large",
      "cnSize": "small",
      "subColor": "#b0b0b0",
      "deco": "♡"
    },
    "emotes": {},
    "toneMap": {}
  }
};

/**
 * 获取通用默认主题（不绑定具体助手）
 */
export function getDefaultTheme() {
  return {
    primary: '#6aa7ff',
    primaryGlow: 'rgba(106,167,255,0.4)',
    secondary: '#b8d7ff',
    subColor: '#b0b0b0',
    font: "'Dancing Script','Brush Script MT',cursive",
    cnFont: 'system-ui,sans-serif',
    enSize: 'large',
    cnSize: 'small',
    deco: '❀'
  };
}

/**
 * 根据 id 返回包含默认主题的 fallback agent 对象
 */
export function getDefaultAgent(id) {
  return {
    displayName: id,
    theme: getDefaultTheme(),
    emotes: {},
    toneMap: {}
  };
}