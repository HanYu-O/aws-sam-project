import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Blog (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
    }));

    prisma = app.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // 清理测试数据
    await prisma.post.deleteMany();
  });

  describe('/blogs (GET)', () => {
    it('should return empty list when no blogs exist', () => {
      return request(app.getHttpServer())
        .get('/blogs')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            data: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          });
        });
    });

    it('should return blog list without content', async () => {
      // 创建测试数据
      await prisma.post.create({
        data: {
          title: '测试博客标题',
          slug: 'test-blog-slug',
          content: '这是完整的博客内容，在列表中不应该返回',
          excerpt: '这是博客摘要',
          published: true,
          author: '测试作者',
          tags: ['nestjs', 'testing'],
        },
      });

      return request(app.getHttpServer())
        .get('/blogs')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0]).toEqual(
            expect.objectContaining({
              title: '测试博客标题',
              slug: 'test-blog-slug',
              excerpt: '这是博客摘要',
              published: true,
              author: '测试作者',
              tags: ['nestjs', 'testing'],
            })
          );
          // 验证不包含content字段
          expect(res.body.data[0]).not.toHaveProperty('content');
          expect(res.body.total).toBe(1);
        });
    });

    it('should handle pagination parameters', async () => {
      // 创建多个测试数据
      for (let i = 1; i <= 15; i++) {
        await prisma.post.create({
          data: {
            title: `博客标题 ${i}`,
            slug: `blog-slug-${i}`,
            content: `内容 ${i}`,
            excerpt: `摘要 ${i}`,
            published: true,
          },
        });
      }

      return request(app.getHttpServer())
        .get('/blogs?page=2&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(5);
          expect(res.body.page).toBe(2);
          expect(res.body.limit).toBe(5);
          expect(res.body.total).toBe(15);
          expect(res.body.totalPages).toBe(3);
        });
    });

    it('should handle search parameter', async () => {
      await prisma.post.createMany({
        data: [
          {
            title: 'NestJS学习笔记',
            slug: 'nestjs-learning',
            content: '关于NestJS的学习内容',
            excerpt: '学习摘要',
            published: true,
          },
          {
            title: 'React开发指南',
            slug: 'react-guide',
            content: '关于React的开发指南',
            excerpt: 'React摘要',
            published: true,
          },
        ],
      });

      return request(app.getHttpServer())
        .get('/blogs?search=NestJS')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].title).toBe('NestJS学习笔记');
        });
    });

    it('should validate query parameters', () => {
      return request(app.getHttpServer())
        .get('/blogs?page=0&limit=-1')
        .expect(400); // 验证失败
    });
  });

  describe('/blogs/:id (GET)', () => {
    it('should return blog detail with content', async () => {
      const blog = await prisma.post.create({
        data: {
          title: '详情测试博客',
          slug: 'detail-test-blog',
          content: '这是完整的博客内容，在详情页应该返回',
          excerpt: '详情页摘要',
          published: true,
          author: '详情作者',
          tags: ['detail', 'test'],
        },
      });

      return request(app.getHttpServer())
        .get(`/blogs/${blog.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({
              id: blog.id,
              title: '详情测试博客',
              slug: 'detail-test-blog',
              content: '这是完整的博客内容，在详情页应该返回',
              excerpt: '详情页摘要',
              published: true,
              author: '详情作者',
              tags: ['detail', 'test'],
            })
          );
        });
    });

    it('should return 404 when blog not found', () => {
      return request(app.getHttpServer())
        .get('/blogs/non-existent-id')
        .expect(404);
    });

    it('should return 400 for empty id', () => {
      return request(app.getHttpServer())
        .get('/blogs/ ')
        .expect(400);
    });
  });
}); 