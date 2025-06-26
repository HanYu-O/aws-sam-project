// GitHub 仓库信息接口
export interface GitHubRepository {
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

// GitHub API 响应接口
export interface GitHubApiResponse {
  data: GitHubRepository[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  username: string;
}

// GitHub 搜索参数接口
export interface GitHubSearchParams {
  username: string;
  page?: number;
  limit?: number;
  type?: 'all' | 'public' | 'private';
  language?: string;
  sort?: 'created' | 'updated' | 'pushed' | 'full_name';
  direction?: 'asc' | 'desc';
}
