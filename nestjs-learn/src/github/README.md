# GitHub模块

该模块提供与GitHub API集成的功能，允许查询GitHub用户的仓库信息。

## 功能特性

- 获取GitHub用户的公共仓库列表
- 支持分页查询
- 支持按语言筛选仓库
- 支持多种排序方式
- 内置缓存机制(5分钟TTL)
- 完善的错误处理
- 输入参数验证

## API接口

### 获取用户仓库

```
GET /github/repos/:username
```

#### 请求参数

| 参数名    | 类型   | 必需 | 默认值  | 说明                                       |
| --------- | ------ | ---- | ------- | ------------------------------------------ |
| username  | string | 是   | -       | GitHub用户名                               |
| page      | number | 否   | 1       | 页码                                       |
| limit     | number | 否   | 10      | 每页数量(1-100)                            |
| type      | string | 否   | public  | 仓库类型(all/public/private)               |
| language  | string | 否   | -       | 按编程语言筛选                             |
| sort      | string | 否   | updated | 排序方式(created/updated/pushed/full_name) |
| direction | string | 否   | desc    | 排序方向(asc/desc)                         |

#### 响应示例

```json
{
  "data": [
    {
      "id": 12345,
      "name": "awesome-project",
      "fullName": "username/awesome-project",
      "description": "An awesome project",
      "language": "TypeScript",
      "starCount": 100,
      "forkCount": 20,
      "watcherCount": 85,
      "isPrivate": false,
      "isArchived": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z",
      "pushedAt": "2024-01-15T00:00:00Z",
      "htmlUrl": "https://github.com/username/awesome-project",
      "cloneUrl": "https://github.com/username/awesome-project.git",
      "defaultBranch": "main",
      "size": 1024,
      "topics": ["typescript", "nestjs"]
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5,
  "username": "username"
}
```

### 清空缓存

```
GET /github/cache/clear
```

#### 响应示例

```json
{
  "message": "GitHub API 缓存已清空"
}
```

## 使用示例

### 基本查询

```bash
curl "http://localhost:3000/github/repos/octocat"
```

### 分页查询

```bash
curl "http://localhost:3000/github/repos/octocat?page=2&limit=5"
```

### 按语言筛选

```bash
curl "http://localhost:3000/github/repos/octocat?language=JavaScript"
```

### 组合查询

```bash
curl "http://localhost:3000/github/repos/octocat?page=1&limit=10&language=TypeScript&sort=created&direction=desc"
```

## 错误处理

| 状态码 | 错误类型        | 说明                         |
| ------ | --------------- | ---------------------------- |
| 400    | BAD_REQUEST     | 请求参数错误                 |
| 404    | NOT_FOUND       | 用户不存在或没有公开仓库     |
| 403    | FORBIDDEN       | GitHub API访问受限(速率限制) |
| 408    | REQUEST_TIMEOUT | 请求超时                     |
| 500    | INTERNAL_SERVER | 服务器内部错误               |

## 架构设计

- **Controller**: 处理HTTP请求，参数验证
- **Service**: 业务逻辑，GitHub API调用
- **DTO**: 数据传输对象，类型安全
- **Cache**: 内存缓存，提升性能
- **Tests**: 单元测试和E2E测试

## 注意事项

1. GitHub API有速率限制，建议适度使用
2. 缓存时间为5分钟，可在Service中调整
3. 仅支持获取公开仓库(除非提供认证)
4. 大量并发请求可能触发GitHub的速率限制
