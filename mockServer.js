import http from 'http';
import url from 'url';

// 模拟的语言列表数据 - 你可以修改这里来测试不同的语言组合
const mockLanguageData = {
  // 正常情况的响应
  success: {
    message: "自定义成功返回",
    code: 200,
    success: true,
    result: ["us", "jp", "fr", "de", "cn", "kr"]
  },
  // 可以模拟错误情况
  error: {
    message: "服务器内部错误",
    code: 500,
    success: false,
    result: null
  }
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // 设置CORS头，允许跨域请求
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  console.log(`📨 收到请求: ${req.method} ${req.url}`);
  
  // 模拟语言列表接口
  if (parsedUrl.pathname === '/api/languages' && req.method === 'GET') {
    
    // 可以通过查询参数控制返回成功或错误
    const shouldError = parsedUrl.query.error === 'true';
    
    if (shouldError) {
      console.log('🔴 模拟返回错误响应');
      res.writeHead(500);
      res.end(JSON.stringify(mockLanguageData.error, null, 2));
    } else {
      console.log('✅ 模拟返回成功响应');
      console.log('📋 返回的语言列表:', mockLanguageData.success.result);
      res.writeHead(200);
      res.end(JSON.stringify(mockLanguageData.success, null, 2));
    }
    return;
  }
  
  // 404处理
  res.writeHead(404);
  res.end(JSON.stringify({ 
    message: "接口不存在", 
    code: 404, 
    success: false 
  }));
});

const PORT = 3001;

server.listen(PORT, () => {
  console.log(`🚀 Mock服务器已启动！`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`🔗 语言列表接口: http://localhost:${PORT}/api/languages`);
  console.log(`❌ 测试错误情况: http://localhost:${PORT}/api/languages?error=true`);
  console.log(`\n💡 使用说明:`);
  console.log(`1. 修改 configManager.js 中的接口地址为: http://localhost:${PORT}/api/languages`);
  console.log(`2. 运行你的项目进行测试`);
  console.log(`3. 按 Ctrl+C 停止Mock服务器\n`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 Mock服务器已停止');
  server.close();
  process.exit(0);
}); 