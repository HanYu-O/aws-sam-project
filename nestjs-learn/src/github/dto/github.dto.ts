import { IsOptional, IsString, IsNumber, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class GetReposQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsIn(['all', 'public', 'private'])
  type?: string = 'public';

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  @IsIn(['created', 'updated', 'pushed', 'full_name'])
  sort?: string = 'updated';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  direction?: string = 'desc';
}

export class RepoItemDto {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  starCount: number;
  forkCount: number;
  watcherCount: number;
  isPrivate: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  htmlUrl: string;
  cloneUrl: string;
  defaultBranch: string;
  size: number;
  topics: string[];
}

export class RepoListResponseDto {
  data: RepoItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  username: string;
}

export class GitHubErrorDto {
  message: string;
  documentation_url?: string;
} 