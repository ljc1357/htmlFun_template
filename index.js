import { pugSiteCore } from "pug-site-core";
import { initializeGlobalConfig } from './configManager.js';

const {
  startDevServer,
  generateGetDataFn,
  compilePagesPugToFn,
  fetchDataToJsonFile,
  buildFn,
  buildStatic,
  translateLanguageData,
  processImagemin
} = pugSiteCore;
let curCmd = process.env.npm_lifecycle_event;
const args = process.argv.slice(2);
try {
  // 在执行任何命令之前，先初始化全局配置
  // 这会直接修改config对象，确保所有模块都能获得更新后的配置
  await initializeGlobalConfig();
  switch (curCmd) {
    case "getFun":
      await generateGetDataFn();
      break;
    case "getData":
      await generateGetDataFn();
      await fetchDataToJsonFile(args);
      break;
    case "dev":
      startDevServer();
      break;
    case "compileFn":
      await compilePagesPugToFn();
      break;
    case "buildFn":
      await buildFn();
      break;
    case "buildStatic":
      await buildStatic();
      break;      
    case "lang":
      await translateLanguageData();
      break;
    case "imagemin":
      await processImagemin(args);
      break;
    case "debug":
      await createDebugTemplate();
      break;
    default:
      console.log(`未知的命令: ${curCmd}`);
  }
} catch (error) {
  console.error(`执行命令 ${curCmd} 时发生错误:`, error);
  process.exit(1);
}
