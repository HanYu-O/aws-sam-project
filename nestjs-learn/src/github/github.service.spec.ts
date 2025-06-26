import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GitHubService } from './github.service';
import { GetReposQueryDto } from './dto/github.dto';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GitHubService', () => {
  let service: GitHubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GitHubService],
    }).compile();

    service = module.get<GitHubService>(GitHubService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserRepos', () => {
    const mockGitHubApiResponse = {
      data: [
        {
          id: 1,
          name: 'test-repo',
          full_name: 'testuser/test-repo',
          description: 'Test repository',
          language: 'TypeScript',
          stargazers_count: 10,
          forks_count: 5,
          watchers_count: 8,
          private: false,
          archived: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
          pushed_at: '2024-01-15T00:00:00Z',
          html_url: 'https://github.com/testuser/test-repo',
          clone_url: 'https://github.com/testuser/test-repo.git',
          default_branch: 'main',
          size: 1024,
          topics: ['javascript', 'nodejs'],
        },
      ],
    };

    it('should fetch user repos successfully', async () => {
      mockedAxios.get.mockResolvedValue(mockGitHubApiResponse);

      const query: GetReposQueryDto = { page: 1, limit: 10 };
      const result = await service.getUserRepos('testuser', query);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('username', 'testuser');
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('name', 'test-repo');
      expect(result.data[0]).toHaveProperty('fullName', 'testuser/test-repo');
    });

    it('should handle 404 error (user not found)', async () => {
      mockedAxios.get.mockRejectedValue({
        isAxiosError: true,
        response: { status: 404 },
      });
      mockedAxios.isAxiosError.mockReturnValue(true);

      const query: GetReposQueryDto = {};

      await expect(service.getUserRepos('nonexistentuser', query)).rejects.toThrow(
        new HttpException("用户 'nonexistentuser' 不存在或没有公开仓库", HttpStatus.NOT_FOUND)
      );
    });

    it('should handle 403 error (rate limit)', async () => {
      mockedAxios.get.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 403,
          data: { message: 'API rate limit exceeded' }
        },
      });
      mockedAxios.isAxiosError.mockReturnValue(true);

      const query: GetReposQueryDto = {};

      await expect(service.getUserRepos('testuser', query)).rejects.toThrow(
        new HttpException('GitHub API 访问受限: API rate limit exceeded', HttpStatus.FORBIDDEN)
      );
    });

    it('should handle timeout error', async () => {
      mockedAxios.get.mockRejectedValue({
        isAxiosError: true,
        code: 'ECONNABORTED',
      });
      mockedAxios.isAxiosError.mockReturnValue(true);

      const query: GetReposQueryDto = {};

      await expect(service.getUserRepos('testuser', query)).rejects.toThrow(
        new HttpException('GitHub API 请求超时，请稍后重试', HttpStatus.REQUEST_TIMEOUT)
      );
    });

    it('should filter repos by language', async () => {
      const mockResponseWithMultipleLanguages = {
        data: [
          { ...mockGitHubApiResponse.data[0], language: 'TypeScript' },
          { ...mockGitHubApiResponse.data[0], id: 2, name: 'python-repo', language: 'Python' },
        ],
      };

      mockedAxios.get.mockResolvedValue(mockResponseWithMultipleLanguages);

      const query: GetReposQueryDto = { language: 'TypeScript' };
      const result = await service.getUserRepos('testuser', query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].language).toBe('TypeScript');
    });
  });

  describe('clearCache', () => {
    it('should clear cache', () => {
      expect(() => service.clearCache()).not.toThrow();
    });
  });
}); 