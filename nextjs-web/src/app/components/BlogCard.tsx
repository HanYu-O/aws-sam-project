import Link from "next/link";
import { BlogSummary } from "@/app/types/blog";
import { formatDate } from "@/app/lib/blog";

interface BlogCardProps {
  blog: BlogSummary;
  showAuthor?: boolean;
  showTags?: boolean;
  className?: string;
}

export default function BlogCard({
  blog,
  showAuthor = true,
  showTags = true,
  className,
}: BlogCardProps) {
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
      {/* 博客标题 */}
      <h2 className="text-xl font-semibold mb-3 leading-tight">
        <Link
          href={`/blog/${blog.slug}`}
          className="text-gray-900 hover:text-blue-600 transition-colors"
        >
          {blog.title}
        </Link>
      </h2>

      {/* 博客摘要 */}
      <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
        {blog.excerpt}
      </p>

      {/* 标签 */}
      {showTags && Array.isArray(blog.tags) && blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="
                px-2 py-1 
                bg-gray-100 hover:bg-gray-200
                text-gray-700 text-xs 
                rounded-md
                transition-colors
              "
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 底部信息 */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <time className="flex items-center gap-1">
            <span>📅</span>
            <span>{formatDate(blog.createdAt)}</span>
          </time>
          {showAuthor && blog.author && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span>✍️</span>
                <span>{blog.author}</span>
              </span>
            </>
          )}
        </div>

        <Link
          href={`/blog/${blog.slug}`}
          className="
            text-blue-600 hover:text-blue-800 
            text-sm font-medium
            flex items-center gap-1
            transition-colors
          "
        >
          <span>阅读全文</span>
          <span>→</span>
        </Link>
      </div>
    </article>
  );
}
