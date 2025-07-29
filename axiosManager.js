import fse from "fs-extra";
import axios from "axios";
import _ from "lodash";
import { getUrlProcessor } from './getData.js';

const CACHE_DIR = './api_cache';

// 存储正在进行的请求，避免并发重复请求
// 注意：pending状态永不清除，相同URL永远复用第一次请求的结果
const pendingRequests = new Map();

// 缓存目录初始化标志
let cacheDirectoryInitialized = false;

// 日志颜色常量
const LOG_COLORS = {
  CACHED: '\x1b[32m%s\x1b[0m',    // 绿色 - 缓存命中
  NEW_CACHE: '\x1b[33m%s\x1b[0m', // 黄色 - 新缓存写入
  PENDING: '\x1b[36m%s\x1b[0m',   // 青色 - 等待并发请求
  RESET: '\x1b[0m'
};

const axiosInstance = axios.create({
  timeout: 1000 * 60 * 60,
})

// 封装请求函数
// 设计理念：pending状态永不清除，相同URL的请求永远复用第一次的结果
// 这样可以完全避免重复HTTP请求，特别适合数据获取这种一次性任务场景
export async function axiosGet(url, useCache = false) {
  //#region 特殊URL处理
  // 创建URL对象
  const urlObj = new URL(url);
  
  // 获取并应用URL处理器
  const processor = getUrlProcessor(url);
  if (processor) {
    processor(urlObj);
  }
  url = urlObj.toString();
  
  // console.log(url);
  //#endregion

  // 检查文件缓存
  if (useCache) {
    const cachedData = await readCacheIfExists(url);
    if (cachedData !== null) {
      return cachedData;
    }
  }

  // 检查是否有正在进行的相同请求
  if (pendingRequests.has(url)) {
    console.log(LOG_COLORS.PENDING, `[Cache] Waiting for pending request: ${url}`);
    const result = await pendingRequests.get(url);
    console.log(LOG_COLORS.CACHED, `[Cache] Got shared result for: ${url}`);
    // 对等待的并发请求结果做深拷贝，避免数据共享修改问题
    return _.cloneDeep(result);
  }

  // 创建新的请求Promise
  const requestPromise = (async () => {
    try {
      const { data: detailRes } = await axiosInstance.get(url);

      let content = null;
      // if ((detailRes?.code === 200 || detailRes?.api_code === 200) &&
      //   detailRes.result != null &&
      //   // 既不是空数组也不是空对象
      //   ((Array.isArray(detailRes.result) &&
      //     detailRes.result.length > 0) ||
      //     (typeof detailRes.result === 'object' &&
      //       !Array.isArray(detailRes.result) &&
      //       Object.keys(detailRes.result).length > 0))) {
      if ((detailRes?.code === 200 || detailRes?.api_code === 200) &&
        detailRes.result != null) {
        content = detailRes.result;

      } else if (Array.isArray(detailRes)) {
        content = detailRes;

      } else {
        throw new Error(`${url} 接口错误 ${JSON.stringify(detailRes)}`);
      }

      if (useCache) {
        // 存入缓存（仅在不存在时）
        await writeCacheIfNotExists(url, content);
      }

      // HTTP请求返回的数据本身就是新对象，无需深拷贝
      return content;

    } catch (error) {
      console.error(`Request failed for ${url}:`, error);
      throw error;
      
    }
    // 不再清除 pending 状态，让相同 URL 永远复用第一次的请求结果
  })();

  // 存储正在进行的请求
  pendingRequests.set(url, requestPromise);
  
  return await requestPromise;
}

// URL转文件名函数（纯字符替换方案）
function urlToFilename(url) {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase() + '.json';
}

// 获取缓存文件路径
function getCacheFilePath(url) {
  return `${CACHE_DIR}/${urlToFilename(url)}`;
}

// 确保缓存目录存在
async function ensureCacheDirectory() {
  if (!cacheDirectoryInitialized) {
    try {
      await fse.ensureDir(CACHE_DIR);
      cacheDirectoryInitialized = true;
    } catch (error) {
      console.error('Error creating cache directory:', error);
      throw error;
    }
  }
}

// 优化的缓存检查和读取函数
async function readCacheIfExists(url) {
  try {
    const filePath = getCacheFilePath(url);
    
    // 使用 readJson 直接读取，如果文件不存在会抛出错误
    const cacheData = await fse.readJson(filePath);
    console.log(LOG_COLORS.CACHED, `[Cache] Using cached data for: ${url}`);
    return cacheData.data;
  } catch (error) {
    // 文件不存在或读取失败都返回 null
    if (error.code !== 'ENOENT') {
      console.error(`Error reading cache for ${url}:`, error);
    }
    return null;
  }
}

// 写入缓存（仅在不存在时写入）
async function writeCacheIfNotExists(url, data) {
  const filePath = getCacheFilePath(url);

  try {
    // 确保缓存目录存在
    await ensureCacheDirectory();
    
    // 检查文件是否已存在
    if (!await fse.pathExists(filePath)) {
      await fse.writeJson(filePath, {
        data,
        timestamp: Date.now(),
        url // 存储原始URL便于识别
      }, { spaces: 2 });
      console.log(LOG_COLORS.NEW_CACHE, `[Cache] Cached data for: ${url}`);
      return true; // 表示写入了新缓存
    }
    console.log(`[Cache] Cache already exists for: ${url}`);
    return false; // 表示未写入（已存在）
  } catch (error) {
    console.error(`Error writing cache for ${url}:`, error);
    return false;
  }
}

// 清除单个URL缓存
export async function clearUrlCache(url) {
  try {
    const filePath = getCacheFilePath(url);
    if (await fse.pathExists(filePath)) {
      await fse.remove(filePath);
      console.log(`[Cache] Cleared cache for: ${url}`);
    }
  } catch (error) {
    console.error(`Error clearing cache for ${url}:`, error);
  }
}

// 清除所有缓存
export async function clearAllCache() {
  try {
    await fse.emptyDir(CACHE_DIR);
    console.log('[Cache] All cache files cleared');
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
}

// 获取当前pending状态统计（调试用）
export function getPendingStats() {
  const stats = {
    total: pendingRequests.size,
    urls: []
  };
  
  for (const [url] of pendingRequests) {
    stats.urls.push(url);
  }
  
  return stats;
}