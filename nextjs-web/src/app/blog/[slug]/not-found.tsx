import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="text-gray-400 text-6xl mb-6">📄</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">文章未找到</h1>
        <p className="text-gray-600 mb-6">
          抱歉，您访问的博客文章不存在或已被删除。
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/blog"
            className="
              px-6 py-2 
              bg-blue-600 hover:bg-blue-700 
              text-white rounded-lg 
              transition-colors
            "
          >
            浏览所有文章
          </Link>
          <Link
            href="/"
            className="
              px-6 py-2 
              bg-gray-200 hover:bg-gray-300 
              text-gray-800 rounded-lg 
              transition-colors
            "
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
