# GitHub 功能配置说明

## 跨域问题解决方案

为了解决客户端组件调用后端 API 时的跨域问题，我们采用了 Next.js API 路由作为代理层的解决方案。

## 架构说明

```
客户端组件 → Next.js API路由 → 后端GitHub API服务
```

### 数据流程

1. **客户端**: 用户在页面输入 GitHub 用户名
2. **API 路由**: 客户端调用 `/api/github/repos/[username]`
3. **代理转发**: API 路由转发请求到后端服务
4. **响应返回**: 后端数据通过 API 路由返回给客户端

## 环境变量配置

在项目根目录创建 `.env.local` 文件：

```bash
# 后端API服务的地址
BACKEND_API_URL=http://localhost:3000
```

### 不同环境的配置

- **开发环境**: `BACKEND_API_URL=http://localhost:3000`
- **生产环境**: `BACKEND_API_URL=https://your-backend-api.com`

## 文件结构

```
src/app/
├── api/
│   └── github/
│       └── repos/
│           └── [username]/
│               └── route.ts          # API代理路由
├── components/
│   ├── GitHubCard.tsx               # 仓库卡片组件
│   ├── GitHubList.tsx               # 仓库列表组件
│   └── GitHubSearch.tsx             # 搜索组件
├── github/
│   └── page.tsx                     # GitHub页面
├── lib/
│   └── github.ts                    # GitHub API客户端
└── types/
    └── github.ts                    # 类型定义
```

## 功能特性

✅ **跨域安全**: 通过 Next.js API 路由避免跨域问题  
✅ **错误处理**: 完整的错误处理和用户提示  
✅ **类型安全**: 完整的 TypeScript 类型定义  
✅ **响应式设计**: 适配移动端和桌面端  
✅ **缓存优化**: 合理的数据缓存策略

## 使用方式

1. 确保后端 GitHub API 服务正在运行
2. 配置正确的 `BACKEND_API_URL` 环境变量
3. 访问 `/github` 页面
4. 输入 GitHub 用户名进行搜索

## 故障排除

### 常见问题

1. **502 Bad Gateway**: 检查后端服务是否启动
2. **CORS 错误**: 确认使用了 API 路由而不是直接调用
3. **404 错误**: 检查环境变量配置和 API 路径

### 调试技巧

- 查看浏览器开发者工具的 Network 面板
- 检查服务器控制台的错误日志
- 验证环境变量是否正确加载
