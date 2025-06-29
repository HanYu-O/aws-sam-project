import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import { Handler, Context, APIGatewayProxyEvent } from 'aws-lambda';
import express from 'express';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

let cachedServer: Handler;
let nestApp: any;

async function bootstrap(): Promise<Handler> {
  if (!cachedServer) {
    console.log('Cold start - initializing NestJS application...');
    const startTime = Date.now();

    try {
      const expressApp = express();

      // 创建NestJS应用
      nestApp = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
        {
          logger: process.env.NODE_ENV === 'development' ? ['log', 'error', 'warn'] : ['error'],
        },
      );

      // 启用 CORS
      nestApp.enableCors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      });

      // 设置全局前缀（可选）
      // nestApp.setGlobalPrefix('api');

      // 初始化应用
      await nestApp.init();

      // 预热数据库连接
      try {
        const prismaService = nestApp.get(PrismaService);
        await prismaService.warmUp();
        console.log('Database connection pre-warmed');
      } catch (error) {
        console.error('Database warm-up failed during bootstrap:', error);
      }

      // 创建serverless handler
      cachedServer = serverlessExpress({
        app: expressApp as any,
        respondWithErrors: true,
      });

      const endTime = Date.now();
      console.log(`Cold start completed in ${endTime - startTime}ms`);
    } catch (error) {
      console.error('Error during bootstrap:', error);
      throw error;
    }
  }

  return cachedServer;
}

export const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback?: any,
) => {
  // Lambda优化：设置callbackWaitsForEmptyEventLoop为false
  // 这允许Lambda在响应后立即返回，而不等待事件循环清空
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // 记录请求信息
    console.log('Lambda invocation:', {
      requestId: context.awsRequestId,
      path: event.path,
      method: event.httpMethod,
      remainingTime: context.getRemainingTimeInMillis(),
    });

    // 检查是否为warmup请求 (CloudWatch Events)
    if (event.headers && event.headers['User-Agent'] === 'Amazon CloudWatch Events Rule') {
      console.log('Warmup request received');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Warmup successful' }),
      };
    }

    // 🔧 统一确保NestJS应用已初始化（对所有请求都适用）
    if (!nestApp) {
      await bootstrap();
    }

    // 数据库初始化端点
    if (event.path === '/init-db' && event.httpMethod === 'POST') {
      try {
        if (nestApp) {
          const prismaService = nestApp.get(PrismaService);
          console.log('Starting database initialization...');

          // 简化方案：使用Prisma内置方法验证连接并创建表
          try {
            // 验证数据库连接
            await prismaService.$queryRaw`SELECT 1 as test`;
            console.log('Database connection verified');

            // 使用Prisma的迁移语句（根据schema.prisma生成）
            await prismaService.$executeRaw`
              CREATE TABLE IF NOT EXISTS "posts" (
                "id" TEXT NOT NULL,
                "title" TEXT NOT NULL,
                "slug" TEXT NOT NULL UNIQUE,
                "content" TEXT,
                "excerpt" TEXT,
                "published" BOOLEAN DEFAULT true,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "author" TEXT,
                "tags" TEXT[] DEFAULT '{}',
                PRIMARY KEY ("id")
              );
            `;
          } catch (dbError) {
            console.error('Database operation failed:', dbError);
            throw new Error(`Database initialization failed: ${dbError.message}`);
          }

          console.log('Database initialization completed');

          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'success',
              message: 'Database initialized successfully',
              tables: ['posts', 'transactions'],
              timestamp: new Date().toISOString(),
              requestId: context.awsRequestId,
            }),
          };
        }

        throw new Error('NestJS app not initialized');
      } catch (error) {
        console.error('Database initialization failed:', error);
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString(),
            requestId: context.awsRequestId,
          }),
        };
      }
    }

    // 种子数据端点
    if (event.path === '/seed' && event.httpMethod === 'POST') {
      try {
        if (nestApp) {
          const prismaService = nestApp.get(PrismaService);
          console.log('Starting seed data insertion...');

          // 创建博客文章（使用seed.ts中的数据）
          const posts = await Promise.all([
            prismaService.post.upsert({
              where: { slug: 'nextjs-routing' },
              update: {},
              create: {
                title: 'Next.js 路由系统学习',
                slug: 'nextjs-routing',
                excerpt: '学习 Next.js App Router 的基础概念和文件系统路由',
                content: `# Next.js 路由系统

Next.js 13+ 的 App Router 使用文件系统路由，这意味着：

## 文件系统路由
- \`page.tsx\` 文件定义一个路由
- 文件夹名称决定 URL 路径
- \`[slug]\` 表示动态路由参数

## 基础路由示例
- \`app/page.tsx\` → \`/\`
- \`app/blog/page.tsx\` → \`/blog\`
- \`app/blog/[slug]/page.tsx\` → \`/blog/任意路径\`

这是 Next.js 强大而直观的路由系统！`,
                published: true,
                createdAt: new Date('2024-01-15'),
                author: '张三',
                tags: ['Next.js', 'React', '路由'],
              },
            }),
            prismaService.post.upsert({
              where: { slug: 'react-components' },
              update: {},
              create: {
                title: 'React 组件设计原则',
                slug: 'react-components',
                excerpt: '了解如何设计可复用和可维护的 React 组件',
                content: `# React 组件设计原则

编写可维护的 React 组件的几个重要原则：

## 1. 单一职责原则
每个组件应该只负责一个功能。

## 2. 可复用性
通过 props 让组件变得灵活可复用。

## 3. 组合优于继承
使用组合模式来构建复杂组件。

## 4. Props 接口设计
明确定义组件的输入和输出。`,
                published: true,
                createdAt: new Date('2024-01-10'),
                author: '李四',
                tags: ['React', '组件', '设计模式'],
              },
            }),
            prismaService.post.upsert({
              where: { slug: 'typescript-basics' },
              update: {},
              create: {
                title: 'TypeScript 基础入门',
                slug: 'typescript-basics',
                excerpt: '从零开始学习 TypeScript 的类型系统',
                content: `# TypeScript 基础

TypeScript 为 JavaScript 添加了类型系统：

## 基础类型
- string, number, boolean
- Array, Object
- interface, type

## 高级特性
- 泛型 (Generics)
- 联合类型 (Union Types)
- 类型守卫 (Type Guards)

## 优势
- 编译时错误检查
- 更好的开发体验
- 代码更易维护`,
                published: true,
                createdAt: new Date('2024-01-05'),
                author: '王五',
                tags: ['TypeScript', 'JavaScript', '类型系统'],
              },
            }),
          ]);

          console.log('Seed data insertion completed');

          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'success',
              message: 'Seed data inserted successfully',
              posts: posts.map(p => ({ id: p.id, title: p.title, slug: p.slug })),
              count: posts.length,
              timestamp: new Date().toISOString(),
              requestId: context.awsRequestId,
            }),
          };
        }

        throw new Error('NestJS app not initialized');
      } catch (error) {
        console.error('Seed data insertion failed:', error);
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString(),
            requestId: context.awsRequestId,
          }),
        };
      }
    }

    // 健康检查端点
    if (event.path === '/health' && event.httpMethod === 'GET') {
      try {
        let dbStatus = 'unknown';
        if (nestApp) {
          const prismaService = nestApp.get(PrismaService);
          const isHealthy = await prismaService.healthCheck();
          dbStatus = isHealthy ? 'healthy' : 'unhealthy';
        }

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'healthy',
            database: dbStatus,
            timestamp: new Date().toISOString(),
            requestId: context.awsRequestId,
          }),
        };
      } catch (error) {
        console.error('Health check failed:', error);
        return {
          statusCode: 503,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString(),
            requestId: context.awsRequestId,
          }),
        };
      }
    }

    // 获取并执行主处理器（已在顶部初始化）
    return cachedServer(event, context, callback);

  } catch (error) {
    console.error('Lambda handler error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        requestId: context.awsRequestId,
      }),
    };
  }
};