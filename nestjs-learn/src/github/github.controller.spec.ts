import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GitHubController } from './github.controller';
import { GitHubService } from './github.service';
import { GetReposQueryDto, RepoListResponseDto } from './dto/github.dto';

describe('GitHubController', () => {
  let controller: GitHubController;
  let service: GitHubService;

  const mockGitHubService = {
    getUserRepos: jest.fn(),
    clearCache: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GitHubController],
      providers: [
        {
          provide: GitHubService,
          useValue: mockGitHubService,
        },
      ],
    }).compile();

    controller = module.get<GitHubController>(GitHubController);
    service = module.get<GitHubService>(GitHubService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserRepos', () => {
    const mockRepoResponse: RepoListResponseDto = {
      data: [
        {
          id: 1,
          name: 'test-repo',
          fullName: 'testuser/test-repo',
          description: 'Test repository',
          language: 'TypeScript',
          starCount: 10,
          forkCount: 5,
          watcherCount: 8,
          isPrivate: false,
          isArchived: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
          pushedAt: '2024-01-15T00:00:00Z',
          htmlUrl: 'https://github.com/testuser/test-repo',
          cloneUrl: 'https://github.com/testuser/test-repo.git',
          defaultBranch: 'main',
          size: 1024,
          topics: ['javascript', 'nodejs'],
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
      username: 'testuser',
    };

    it('should return user repos successfully', async () => {
      const query: GetReposQueryDto = { page: 1, limit: 10 };
      mockGitHubService.getUserRepos.mockResolvedValue(mockRepoResponse);

      const result = await controller.getUserRepos('testuser', query);

      expect(result).toEqual(mockRepoResponse);
      expect(service.getUserRepos).toHaveBeenCalledWith('testuser', query);
    });

    it('should throw error for empty username', async () => {
      const query: GetReposQueryDto = {};

      await expect(controller.getUserRepos('', query)).rejects.toThrow(
        new HttpException('GitHub用户名不能为空', HttpStatus.BAD_REQUEST)
      );
    });

    it('should throw error for invalid username format', async () => {
      const query: GetReposQueryDto = {};

      await expect(controller.getUserRepos('invalid-username-', query)).rejects.toThrow(
        new HttpException('GitHub用户名格式不正确', HttpStatus.BAD_REQUEST)
      );
    });

    it('should handle service errors', async () => {
      const query: GetReposQueryDto = {};
      mockGitHubService.getUserRepos.mockRejectedValue(new Error('Service error'));

      await expect(controller.getUserRepos('testuser', query)).rejects.toThrow(
        new HttpException('获取仓库信息失败', HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });
  });

  describe('clearCache', () => {
    it('should clear cache successfully', () => {
      const result = controller.clearCache();

      expect(result).toEqual({ message: 'GitHub API 缓存已清空' });
      expect(service.clearCache).toHaveBeenCalled();
    });
  });
}); 