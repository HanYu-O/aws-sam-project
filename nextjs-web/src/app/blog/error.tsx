"use client"; // 🔥 客户端组件

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BlogError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 可以在这里记录错误日志
    console.error("博客页面错误:", error);
  }, [error]);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="text-red-500 text-6xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          出现了一些问题
        </h1>
        <p className="text-gray-600 mb-6">
          抱歉，加载博客内容时发生错误。请稍后重试。
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="
              px-6 py-2 
              bg-blue-600 hover:bg-blue-700 
              text-white rounded-lg 
              transition-colors
            "
          >
            重试
          </button>
          <Link
            href="/blog"
            className="
              px-6 py-2 
              bg-gray-200 hover:bg-gray-300 
              text-gray-800 rounded-lg 
              transition-colors
            "
          >
            返回博客列表
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-gray-500 mb-2">
              开发模式 - 查看错误详情
            </summary>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
