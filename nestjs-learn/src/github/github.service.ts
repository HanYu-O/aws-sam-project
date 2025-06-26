import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { GetReposQueryDto, RepoListResponseDto, RepoItemDto, GitHubErrorDto } from './dto/github.dto';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  private: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  html_url: string;
  clone_url: string;
  default_branch: string;
  size: number;
  topics: string[];
}

@Injectable()
export class GitHubService {
  private readonly logger = new Logger(GitHubService.name);
  private readonly GITHUB_API_BASE = 'https://api.github.com';
  private readonly cache = new Map<string, { data: RepoListResponseDto; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

  async getUserRepos(username: string, query: GetReposQueryDto): Promise<RepoListResponseDto> {
    const cacheKey = `${username}_${JSON.stringify(query)}`;

    // 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.log(`从缓存获取用户 ${username} 的仓库信息`);
      return cached.data;
    }

    try {
      const { page = 1, limit = 10, type = 'public', sort = 'updated', direction = 'desc' } = query;

      // 构建GitHub API URL
      const url = `${this.GITHUB_API_BASE}/users/${username}/repos`;
      const params: any = {
        type,
        sort,
        direction,
        per_page: limit,
        page,
      };

      this.logger.log(`正在获取用户 ${username} 的仓库信息...`);

      const response: AxiosResponse<GitHubRepo[]> = await axios.get(url, {
        params,
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'NestJS-GitHub-Client'
        },
        timeout: 10000, // 10秒超时
      });

      const repos = response.data;

      // 如果指定了语言过滤
      let filteredRepos = repos;
      if (query.language) {
        filteredRepos = repos.filter(repo =>
          repo.language && repo.language.toLowerCase() === query.language!.toLowerCase()
        );
      }

      // 转换数据格式
      const data = filteredRepos.map(repo => this.mapToRepoItemDto(repo));

      // 获取总数（这里简化处理，实际情况可能需要额外的API调用获取准确总数）
      const total = filteredRepos.length;
      const totalPages = Math.ceil(total / limit);

      const result: RepoListResponseDto = {
        data,
        total,
        page,
        limit,
        totalPages,
        username,
      };

      // 更新缓存
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

      // 清理过期缓存
      this.cleanExpiredCache();

      this.logger.log(`成功获取用户 ${username} 的 ${data.length} 个仓库`);
      return result;

    } catch (error) {
      this.logger.error(`获取用户 ${username} 仓库信息失败:`, error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new HttpException(
            `用户 '${username}' 不存在或没有公开仓库`,
            HttpStatus.NOT_FOUND,
          );
        } else if (error.response?.status === 403) {
          const errorData = error.response.data as GitHubErrorDto;
          throw new HttpException(
            `GitHub API 访问受限: ${errorData.message || 'API rate limit exceeded'}`,
            HttpStatus.FORBIDDEN,
          );
        } else if (error.code === 'ECONNABORTED') {
          throw new HttpException(
            'GitHub API 请求超时，请稍后重试',
            HttpStatus.REQUEST_TIMEOUT,
          );
        }
      }

      throw new HttpException(
        '获取GitHub仓库信息失败，请稍后重试',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private mapToRepoItemDto(repo: GitHubRepo): RepoItemDto {
    return {
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      language: repo.language,
      starCount: repo.stargazers_count,
      forkCount: repo.forks_count,
      watcherCount: repo.watchers_count,
      isPrivate: repo.private,
      isArchived: repo.archived,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,
      htmlUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      defaultBranch: repo.default_branch,
      size: repo.size,
      topics: repo.topics || [],
    };
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  // 清空缓存的方法，便于测试和手动刷新
  clearCache(): void {
    this.cache.clear();
    this.logger.log('GitHub API 缓存已清空');
  }
} 