import { BlogPost } from "@/app/types/blog";
import { formatDate } from "@/app/lib/blog";

interface BlogHeaderProps {
  blog: BlogPost;
  showTags?: boolean;
  className?: string;
}

export default function BlogHeader({
  blog,
  showTags = true,
  className = "",
}: BlogHeaderProps) {
  return (
    <header className={`mb-8 ${className}`}>
      {/* 标题 */}
      <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
        {blog.title}
      </h1>

      {/* 元信息 */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
        <div className="flex items-center gap-2">
          <span>📅</span>
          <time>{formatDate(blog.createdAt)}</time>
        </div>

        {blog.author && (
          <div className="flex items-center gap-2">
            <span>✍️</span>
            <span>作者：{blog.author}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span>📖</span>
          <span>
            阅读时间约 {Math.ceil((blog.content?.length ?? 0) / 500)} 分钟
          </span>
        </div>
      </div>

      {/* 标签 */}
      {showTags && blog.tags && blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-6 border-b border-gray-200">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="
                px-3 py-1 
                bg-blue-100 hover:bg-blue-200
                text-blue-700 text-sm 
                rounded-full
                transition-colors
                cursor-default
              "
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
