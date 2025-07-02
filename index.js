import { pugSiteCore } from "pug-site-core";
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
