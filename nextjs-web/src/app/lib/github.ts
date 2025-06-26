import { GitHubApiResponse, GitHubSearchParams } from '@/app/types/github';

/**
 * 获取 GitHub 用户仓库
 * @param params 搜索参数
 * @returns GitHub 仓库数据
 */
export async function getGitHubRepositories(params: GitHubSearchParams): Promise<GitHubApiResponse> {
  const { username, page = 1, limit = 10, type = 'public', language, sort = 'updated', direction = 'desc' } = params;

  // 构建查询参数
  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    type,
    sort,
    direction,
  });

  // 添加可选参数
  if (language) {
    searchParams.append('language', language);
  }

  // 使用Next.js API路由，避免跨域问题
  const url = `/api/github/repos/${username}?${searchParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `请求失败: ${response.status}`);
    }

    const data: GitHubApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error('获取 GitHub 仓库失败:', error);
    throw error;
  }
}

/**
 * 格式化数字显示
 * @param num 数字
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * 格式化日期显示
 * @param dateString 日期字符串
 * @returns 格式化后的日期
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * 获取语言颜色
 * @param language 编程语言
 * @returns 颜色类名
 */
export function getLanguageColor(language: string | null): string {
  const colors: Record<string, string> = {
    JavaScript: 'bg-yellow-500',
    TypeScript: 'bg-blue-500',
    Python: 'bg-green-500',
    Java: 'bg-red-500',
    'C++': 'bg-pink-500',
    C: 'bg-gray-500',
    Go: 'bg-cyan-500',
    Rust: 'bg-orange-500',
    PHP: 'bg-purple-500',
    Swift: 'bg-orange-400',
    Kotlin: 'bg-purple-400',
    Dart: 'bg-blue-400',
    Ruby: 'bg-red-400',
    Shell: 'bg-green-400',
    HTML: 'bg-orange-300',
    CSS: 'bg-blue-300',
    Vue: 'bg-green-300',
    React: 'bg-blue-600',
  };

  return language ? colors[language] || 'bg-gray-400' : 'bg-gray-400';
}
