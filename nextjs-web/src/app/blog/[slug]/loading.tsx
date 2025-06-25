export default function BlogPostLoading() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-8">
        {/* 导航骨架屏 */}
        <div className="mb-8">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>

        {/* 文章头部骨架屏 */}
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-6 animate-pulse"></div>
          <div className="flex gap-4 mb-6">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div>
          </div>
        </div>

        {/* 文章内容骨架屏 */}
        <div className="space-y-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
              {index % 3 === 0 && (
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
