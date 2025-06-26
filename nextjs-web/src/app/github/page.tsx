"use client";

import { useState } from "react";
import Navigation from "@/app/components/Navigation";
import GitHubSearch from "@/app/components/GitHubSearch";
import GitHubList from "@/app/components/GitHubList";
import { getGitHubRepositories } from "@/app/lib/github";
import { GitHubRepository } from "@/app/types/github";

export default function GitHubPage() {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [username, setUsername] = useState("");

  const handleSearch = async (searchUsername: string) => {
    setLoading(true);
    setError(null);
    setUsername(searchUsername);

    try {
      const result = await getGitHubRepositories({
        username: searchUsername,
        limit: 10, // 只显示前10个仓库
      });

      setRepositories(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error("搜索失败:", err);
      setError(err instanceof Error ? err.message : "搜索失败，请稍后重试");
      setRepositories([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <Navigation
          title="GitHub 仓库列表"
          backLink={{
            href: "/",
            text: "返回首页",
          }}
        />

        {/* 搜索区域 */}
        <GitHubSearch onSearch={handleSearch} loading={loading} />

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <span>❌</span>
              <span className="font-medium">搜索失败</span>
            </div>
            <p className="text-red-600 mt-1 text-sm">{error}</p>
          </div>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 text-gray-600">
              <span className="animate-spin text-2xl">⏳</span>
              <span className="text-lg">正在搜索 {username} 的仓库...</span>
            </div>
          </div>
        )}

        {/* 仓库列表 */}
        {!loading && (
          <GitHubList
            repositories={repositories}
            total={total}
            username={username}
            showStats={true}
          />
        )}
      </div>
    </div>
  );
}
