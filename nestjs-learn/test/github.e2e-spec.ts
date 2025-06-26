import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('GitHubController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/github/repos/:username (GET)', () => {
    it('should return 400 for empty username', () => {
      return request(app.getHttpServer())
        .get('/github/repos/')
        .expect(404); // NestJS会返回404因为路由不匹配
    });

    it('should return 400 for invalid username format', () => {
      return request(app.getHttpServer())
        .get('/github/repos/invalid-username-')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('GitHub用户名格式不正确');
        });
    });

    it('should handle pagination parameters', () => {
      return request(app.getHttpServer())
        .get('/github/repos/octocat?page=1&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page', 1);
          expect(res.body).toHaveProperty('limit', 5);
          expect(res.body).toHaveProperty('username', 'octocat');
        });
    });

    it('should handle type filter', () => {
      return request(app.getHttpServer())
        .get('/github/repos/octocat?type=public')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should handle language filter', () => {
      return request(app.getHttpServer())
        .get('/github/repos/octocat?language=JavaScript')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          if (res.body.data.length > 0) {
            expect(res.body.data.every((repo: any) => repo.language === 'JavaScript')).toBe(true);
          }
        });
    });
  });

  describe('/github/cache/clear (GET)', () => {
    it('should clear cache successfully', () => {
      return request(app.getHttpServer())
        .get('/github/cache/clear')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({ message: 'GitHub API 缓存已清空' });
        });
    });
  });
}); 