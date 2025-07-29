import _ from "lodash";
import { axiosGet, clearAllCache } from './axiosManager.js';

const site_baseURL = "http://api.sp.com/v1/game";
const games_baseURL = "http://new.sp.com/content/gen_router_common";
const movies_baseURL = "http://new.sp.com/content/gen_router_bu4";

// 需要重定向到us的语言列表
const REDIRECT_TO_US_LANGUAGES = new Set(['us2']);

const redirectToUS = (urlObj) => {
  const site = urlObj.searchParams.get('site');
  if (REDIRECT_TO_US_LANGUAGES.has(site)) {
    urlObj.searchParams.set('site', 'us');
  }
  return urlObj;
};  

// URL处理器配置
const urlProcessors = {
  [site_baseURL]: redirectToUS,
  // [games_baseURL]: redirectToUS,
  // [`${movies_baseURL}/movie_detail_data`]: (urlObj) => {
  //   urlObj.searchParams.set('lang', 'us');
  //   return urlObj;
  // }
};

// 导出URL处理器
export function getUrlProcessor(url) {
  for (const [baseUrl, processor] of Object.entries(urlProcessors)) {
    if (url.startsWith(baseUrl)) {
      return processor;
    }
  }
  return null;
}

export async function init() {
  //初始化操作,在获取页面数据前执行

  // 清除所有api缓存
  await clearAllCache();  
}

//pug文件中默认可以使用common.lang 去访问数据
export async function get_common_data(language) {
  return {};
}

//将会生成100个页面路由为/detail/1.html -> /detail/100.html在pug文件中可以通过data.a拿到的数据
export async function get_detail_index_data(language) {
  let data = [];
  for (let index = 1; index <= 100; index++) {
    let obj = { page_name: index, a: "detail_" + index };
    data.push(obj);
  }
  return data;
}

export async function get_index_data(language) {
  let data = { page_name: "" } || [{ page_name: "" }];
  return data;
}
