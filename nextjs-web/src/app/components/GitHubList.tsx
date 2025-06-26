import { GitHubRepository } from "@/app/types/github";
import GitHubCard from "./GitHubCard";

interface GitHubListProps {
  repositories: GitHubRepository[];
  total: number;
  username: string;
  showStats?: boolean;
  className?: string;
}

export default function GitHubList({
  repositories,
  total,
  username,
  showStats = true,
  className,
}: GitHubListProps) {
  if (repositories.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-500 text-lg mb-2">
          {username
            ? `用户 ${username} 没有找到公开的仓库`
            : "请输入用户名搜索仓库"}
        </div>
        <p className="text-gray-400 text-sm">
          {username
            ? "请检查用户名是否正确或该用户没有公开仓库"
            : "在上方输入框中输入 GitHub 用户名"}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* 统计信息 */}
      {showStats && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 flex items-center justify-between">
            <span>
              用户{" "}
              <span className="font-semibold text-gray-900">{username}</span>{" "}
              的仓库
            </span>
            <span>
              共找到{" "}
              <span className="font-semibold text-blue-600">{total}</span>{" "}
              个仓库
              {repositories.length < total && (
                <span className="text-gray-500 ml-1">
                  (显示前 {repositories.length} 个)
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* 仓库列表 */}
      <div className="space-y-6">
        {repositories.map((repository) => (
          <GitHubCard key={repository.id} repository={repository} />
        ))}
      </div>

      {/* 底部统计 */}
      {repositories.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            已显示 {repositories.length} 个仓库
            {repositories.length < total && (
              <span className="text-gray-400 ml-2">
                (还有 {total - repositories.length} 个仓库未显示)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
