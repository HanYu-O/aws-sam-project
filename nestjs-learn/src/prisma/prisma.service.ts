import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/custom-client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      // 可以在这里添加Prisma客户端配置
      // log: ['query', 'info', 'warn', 'error'], // 开发环境可以启用日志
    });
  }

  async onModuleInit() {
    // 连接数据库
    await this.$connect();
  }

  async onModuleDestroy() {
    // 断开数据库连接
    await this.$disconnect();
  }
}
