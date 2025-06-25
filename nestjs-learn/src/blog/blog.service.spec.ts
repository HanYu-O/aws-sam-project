import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BlogService } from './blog.service';
import { PrismaService } from '../prisma/prisma.service';
import { GetBlogsQueryDto } from './dto/blog.dto';

describe('BlogService', () => {
  let service: BlogService;
  let prismaService: jest.Mocked<PrismaService>;

  // 模拟数据
  const mockPost = {
    id: 'test-id-1',
    title: '测试博客标题',
    slug: 'test-blog-slug',
    content: '这是完整的博客内容...',
    excerpt: '这是博客摘要',
    published: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    author: '测试作者',
    tags: ['nestjs', 'testing'],
  };

  const mockPostWithoutContent = {
    id: 'test-id-1',
    title: '测试博客标题',
    slug: 'test-blog-slug',
    excerpt: '这是博客摘要',
    published: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    author: '测试作者',
    tags: ['nestjs', 'testing'],
  };

  beforeEach(async () => {
    const mockPrismaService = {
      post: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated blog list without content', async () => {
      const query: GetBlogsQueryDto = { page: 1, limit: 10 };

      (prismaService.post.findMany as any).mockResolvedValue([mockPostWithoutContent]);
      (prismaService.post.count as any).mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result).toEqual({
        data: [
          {
            id: 'test-id-1',
            title: '测试博客标题',
            slug: 'test-blog-slug',
            excerpt: '这是博客摘要',
            published: true,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            author: '测试作者',
            tags: ['nestjs', 'testing'],
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      // 验证数据库查询参数
      expect(prismaService.post.findMany).toHaveBeenCalledWith({
        where: {},
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          published: true,
          createdAt: true,
          updatedAt: true,
          author: true,
          tags: true,
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle search parameter', async () => {
      const query: GetBlogsQueryDto = { search: 'nestjs' };

      (prismaService.post.findMany as any).mockResolvedValue([]);
      (prismaService.post.count as any).mockResolvedValue(0);

      await service.findAll(query);

      expect(prismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { title: { contains: 'nestjs', mode: 'insensitive' } },
              { content: { contains: 'nestjs', mode: 'insensitive' } },
              { excerpt: { contains: 'nestjs', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should handle published filter', async () => {
      const query: GetBlogsQueryDto = { published: true };

      (prismaService.post.findMany as any).mockResolvedValue([]);
      (prismaService.post.count as any).mockResolvedValue(0);

      await service.findAll(query);

      expect(prismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { published: true },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return blog detail with content', async () => {
      (prismaService.post.findUnique as any).mockResolvedValue(mockPost);

      const result = await service.findOne('test-id-1');

      expect(result).toEqual({
        id: 'test-id-1',
        title: '测试博客标题',
        slug: 'test-blog-slug',
        content: '这是完整的博客内容...',
        excerpt: '这是博客摘要',
        published: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        author: '测试作者',
        tags: ['nestjs', 'testing'],
      });

      expect(prismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
      });
    });

    it('should throw NotFoundException when blog not found', async () => {
      (prismaService.post.findUnique as any).mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        '博客文章未找到 (ID: non-existent-id)',
      );
    });
  });
}); 