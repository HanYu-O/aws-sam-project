import { Controller, Get, Param, Query, HttpStatus, HttpException } from '@nestjs/common';
import { GitHubService } from './github.service';
import { GetReposQueryDto, RepoListResponseDto } from './dto/github.dto';

@Controller('github')
export class GitHubController {
  constructor(private readonly gitHubService: GitHubService) { }

  @Get('repos/:username')
  async getUserRepos(
    @Param('username') username: string,
    @Query() query: GetReposQueryDto,
  ): Promise<RepoListResponseDto> {
    // 验证用户名
    if (!username || username.trim() === '') {
      throw new HttpException(
        'GitHub用户名不能为空',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 验证用户名格式 (GitHub用户名规则)
    const usernameRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
    if (!usernameRegex.test(username)) {
      throw new HttpException(
        'GitHub用户名格式不正确',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.gitHubService.getUserRepos(username, query);
    } catch (error) {
      // 如果是已知的HttpException，直接抛出
      if (error instanceof HttpException) {
        throw error;
      }

      // 未知错误，返回通用错误信息
      throw new HttpException(
        '获取仓库信息失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('cache/clear')
  clearCache(): { message: string } {
    this.gitHubService.clearCache();
    return { message: 'GitHub API 缓存已清空' };
  }
} 