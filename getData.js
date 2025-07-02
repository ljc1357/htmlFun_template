import _ from "lodash";
import axios from "axios";
axios.defaults.baseURL = "http://new.sp.com/xxxxx";
axios.defaults.timeout = 1000 * 60 * 60;

export async function init() {
  //初始化操作,在获取页面数据前执行
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
