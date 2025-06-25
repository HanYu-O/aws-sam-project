import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { GetBlogsQueryDto } from './dto/blog.dto';

describe('BlogController', () => {
  let controller: BlogController;
  let service: jest.Mocked<BlogService>;

  const mockBlogListResponse = {
    data: [
      {
        id: 'test-id-1',
        title: '测试博客',
        slug: 'test-blog',
        excerpt: '测试摘要',
        published: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        author: '作者',
        tags: ['test'],
      },
    ],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const mockBlogDetailResponse = {
    id: 'test-id-1',
    title: '测试博客',
    slug: 'test-blog',
    content: '完整内容',
    excerpt: '测试摘要',
    published: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    author: '作者',
    tags: ['test'],
  };

  beforeEach(async () => {
    const mockService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogController],
      providers: [
        {
          provide: BlogService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<BlogController>(BlogController);
    service = module.get(BlogService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return blog list', async () => {
      const query: GetBlogsQueryDto = { page: 1, limit: 10 };
      service.findAll.mockResolvedValue(mockBlogListResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockBlogListResponse);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should handle service errors', async () => {
      const query: GetBlogsQueryDto = {};
      service.findAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll(query)).rejects.toThrow(HttpException);
      await expect(controller.findAll(query)).rejects.toThrow('获取博客列表失败');
    });
  });

  describe('findOne', () => {
    it('should return blog detail', async () => {
      service.findOne.mockResolvedValue(mockBlogDetailResponse);

      const result = await controller.findOne('test-id-1');

      expect(result).toEqual(mockBlogDetailResponse);
      expect(service.findOne).toHaveBeenCalledWith('test-id-1');
    });

    it('should throw error for empty id', async () => {
      await expect(controller.findOne('')).rejects.toThrow(HttpException);
      await expect(controller.findOne('  ')).rejects.toThrow(HttpException);
      await expect(controller.findOne('  ')).rejects.toThrow('博客ID不能为空');
    });

    it('should propagate NotFoundException from service', async () => {
      service.findOne.mockRejectedValue(new Error('Not found'));

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(Error);
    });
  });
}); 