import { BlogSummary } from "@/app/types/blog";
import BlogCard from "./BlogCard";

interface BlogListProps {
  blogs: BlogSummary[];
  total?: number;
  showStats?: boolean;
  showAuthor?: boolean;
  showTags?: boolean;
  className?: string;
}

export default function BlogList({
  blogs,
  total,
  showStats = true,
  showAuthor = true,
  showTags = true,
  className = "",
}: BlogListProps) {
  if (blogs.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无博客文章</h3>
        <p className="text-gray-500">请稍后再来查看</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* 统计信息 */}
      {showStats && total && (
        <div className="mb-6 text-gray-600">
          <p>
            共找到 <span className="font-semibold text-gray-900">{total}</span>{" "}
            篇文章
          </p>
        </div>
      )}

      {/* 博客列表 */}
      <div className="space-y-6">
        {blogs.map((blog, index) => (
          <BlogCard
            key={blog.id}
            blog={blog}
            showAuthor={showAuthor}
            showTags={showTags}
            className={`
              transform transition-all duration-200
              hover:scale-[1.01]
              ${index % 2 === 0 ? "md:mr-2" : "md:ml-2"}
            `}
          />
        ))}
      </div>
    </div>
  );
}
