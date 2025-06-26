"use client";

import { useState } from "react";

interface GitHubSearchProps {
  onSearch: (username: string) => void;
  loading?: boolean;
  placeholder?: string;
  className?: string;
}

export default function GitHubSearch({
  onSearch,
  loading = false,
  placeholder = "请输入 GitHub 用户名",
  className,
}: GitHubSearchProps) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    if (trimmedUsername) {
      onSearch(trimmedUsername);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className={`mb-8 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={username}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={loading}
            className="
              w-full px-4 py-3 
              border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              text-gray-900 placeholder-gray-500
              transition-colors
            "
          />
        </div>
        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="
            px-6 py-3
            bg-blue-600 hover:bg-blue-700 
            disabled:bg-gray-400 disabled:cursor-not-allowed
            text-white font-medium rounded-lg
            transition-colors
            flex items-center justify-center gap-2
            min-w-[120px]
          "
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>搜索中...</span>
            </>
          ) : (
            <>
              <span>🔍</span>
              <span>搜索仓库</span>
            </>
          )}
        </button>
      </div>

      {/* 搜索提示 */}
      <div className="mt-3 text-sm text-gray-500">
        <p>💡 输入 GitHub 用户名，例如：octocat、torvalds、gaearon</p>
      </div>
    </form>
  );
}
