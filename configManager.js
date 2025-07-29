import axios from "axios";

// 配置选项
const API_CONFIG = {
  // 后端接口地址 - 当前指向本地Mock服务器，正式环境时请修改为实际接口地址
  languageListUrl: "http://localhost:3001/api/languages",
  timeout: 10000,
  // 接口失败时的默认语言列表
  fallbackLanguageList: ["us"]
};

/**
 * 从接口获取语言列表
 */
async function fetchLanguageListFromAPI() {
  try {
    console.log('正在从接口获取语言列表...');
    
    const response = await axios.get(API_CONFIG.languageListUrl, {
      timeout: API_CONFIG.timeout
    });
    
    if (response.data && response.data.success && response.data.code === 200 && Array.isArray(response.data.result)) {
      const languageList = response.data.result;
      console.log('成功获取语言列表:', languageList);
      return languageList;
    } else {
      throw new Error('接口返回数据格式不正确');
    }
  } catch (error) {
    console.error('从接口获取语言列表失败:', error.message);
    console.warn('使用默认语言列表:', API_CONFIG.fallbackLanguageList);
    return API_CONFIG.fallbackLanguageList;
  }
}

/**
 * 初始化并更新全局配置
 * 直接修改config对象的属性，确保所有导入config的模块都能获得更新
 */
export async function initializeGlobalConfig() {
  // 动态导入config，避免循环依赖
  const { config } = await import('./config.js');
  
  // 获取动态语言列表
  const languageList = await fetchLanguageListFromAPI();
  
  // 直接修改config对象的languageList属性
  config.languageList = languageList;
  
  console.log('全局配置已更新，languageList:', config.languageList);
  return config;
}

/**
 * 更新API配置
 */
export function updateAPIConfig(newConfig) {
  Object.assign(API_CONFIG, newConfig);
  console.log('API配置已更新:', API_CONFIG);
} 