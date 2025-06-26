import Link from "next/link";
import { GitHubRepository } from "@/app/types/github";
import { formatNumber, formatDate, getLanguageColor } from "@/app/lib/github";

interface GitHubCardProps {
  repository: GitHubRepository;
  className?: string;
}

export default function GitHubCard({ repository, className }: GitHubCardProps) {
  return (
    <article
      className={`
        border border-gray-200 rounded-lg p-6 
        hover:shadow-lg hover:border-gray-300
        transition-all duration-200 ease-in-out
        bg-white
        ${className}
      `}
    >
      {/* 仓库标题 */}
      <h2 className="text-xl font-semibold mb-3 leading-tight">
        <Link
          href={repository.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-900 hover:text-blue-600 transition-colors"
        >
          {repository.name}
        </Link>
      </h2>

      {/* 仓库描述 */}
      <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3 min-h-[3rem]">
        {repository.description || "暂无描述"}
      </p>

      {/* 标签 */}
      {repository.topics && repository.topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {repository.topics.slice(0, 5).map((topic, index) => (
            <span
              key={`${topic}-${index}`}
              className="
                px-2 py-1 
                bg-gray-100 hover:bg-gray-200
                text-gray-700 text-xs 
                rounded-md
                transition-colors
              "
            >
              {topic}
            </span>
          ))}
          {repository.topics.length > 5 && (
            <span className="text-xs text-gray-500">
              +{repository.topics.length - 5} 更多
            </span>
          )}
        </div>
      )}

      {/* 统计信息 */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
        {repository.language && (
          <div className="flex items-center gap-1">
            <span
              className={`w-3 h-3 rounded-full ${getLanguageColor(
                repository.language
              )}`}
            ></span>
            <span>{repository.language}</span>
          </div>
        )}

        {repository.starCount > 0 && (
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span>{formatNumber(repository.starCount)}</span>
          </div>
        )}

        {repository.forkCount > 0 && (
          <div className="flex items-center gap-1">
            <span>🍴</span>
            <span>{formatNumber(repository.forkCount)}</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <span>📦</span>
          <span>{formatNumber(repository.size)} KB</span>
        </div>
      </div>

      {/* 底部信息 */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <time className="flex items-center gap-1">
            <span>🕒</span>
            <span>更新于 {formatDate(repository.updatedAt)}</span>
          </time>
          {repository.isArchived && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
              已归档
            </span>
          )}
          {repository.isPrivate && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
              私有
            </span>
          )}
        </div>

        <Link
          href={repository.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
            text-blue-600 hover:text-blue-800 
            text-sm font-medium
            flex items-center gap-1
            transition-colors
          "
        >
          <span>查看仓库</span>
          <span>↗</span>
        </Link>
      </div>
    </article>
  );
}
