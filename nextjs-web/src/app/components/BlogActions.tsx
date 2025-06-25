"use client"; // 🔥 客户端组件

import { useState } from "react";

interface BlogActionsProps {
  blogId: string;
  title: string;
}

export default function BlogActions({ blogId, title }: BlogActionsProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    Math.floor(Math.random() * 50) + 10
  );

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: window.location.href,
        });
      } catch (error) {
        console.log("分享取消或失败");
        console.error(error);
      }
    } else {
      // 回退方案：复制链接
      await navigator.clipboard.writeText(window.location.href);
      alert("链接已复制到剪贴板！");
    }
  };

  return (
    <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
      <button
        onClick={handleLike}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg transition-all
          ${
            liked
              ? "bg-red-100 text-red-600 hover:bg-red-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }
        `}
      >
        <span className={liked ? "❤️" : "🤍"}></span>
        <span>点赞</span>
        <span className="text-sm">({likeCount})</span>
      </button>

      <button
        onClick={handleShare}
        className="
          flex items-center gap-2 px-4 py-2 
          bg-gray-100 text-gray-600 rounded-lg 
          hover:bg-gray-200 transition-colors
        "
      >
        <span>🔗</span>
        <span>分享</span>
      </button>

      <div className="text-sm text-gray-500 ml-auto">文章 ID: {blogId}</div>
    </div>
  );
}
