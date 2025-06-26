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

    // 获取并执行主处理器
    const server = await bootstrap();
    return server(event, context, callback);

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