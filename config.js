export const config = {
  //开发环境的配置
  devServer: {
    //开发服务器的端口
    port: 80,
    // Pug调试功能配置
    isDebug: false,
    proxy: {
    },
    // abtest功能配置
    abtest: {
      enabled: false,
      // 当前测试组 o或者不配置为原版
      curVariant: "o",
    },
  },
  //配置getData.js中自动生成的函数模版
  getDataFnTemplate: function template(language) {
    let data = { page_name: "" } || [{ page_name: "" }];
    return data;
  },
  //配置的国家数组将会遍历参数传递给getData.js中的函数并且影响翻译时默认将会翻译到的语言以及打包时候将会打包哪些国家的数据内容 数组的第一个国家将会是开发环境下默认访问到的国家的数据
  languageList: ["us"],
  //所有国家模版中都会用到的数据pug文件中可以使用common对象去访问
  commonData: {
    version: "1.0.0",
  },
  //pug打包成生成函数的根目录名字
  fnOutput: "sites",
  //pug打包成html的根目录名字
  staticOutput: "staticSites",
  //打包会打包/template/static/的哪些文件夹参数为空数组或者undefined则全打包(有些js、css文件将会嵌入pug中你可以区分不打包进去)
  buildStaticDirArr: [],
  //自定义打包的数据
  customBuildData: [],
  //自定义打包的html文件
  customBuildHtml: [],
  //getData下载数据的时候会并发多少个(如果下载的时候socket断了可以把这个改低点)
  fetchDataConcurrencyLimit: 6,
  //是否监听语言文件变化重新获取_common.json的数据
  changeUpdateCommon: true,
  //是否混淆js文件
  obfuscateJavaScript: true,
  //是否开启样式作用域隔离处理
  isScopeIsolation: false,
  //是否压缩HTML文件 (buildStatic打包时生效,开启后打包时间会增加大约2倍)
  minifyHtml: true,
};
