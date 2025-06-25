import { getAllBlogs } from "@/app/lib/blog";
import Navigation from "@/app/components/Navigation";
import BlogList from "@/app/components/BlogList";
import { Metadata } from "next";

// 🔥 静态元数据
export const metadata: Metadata = {
  title: "博客列表 | 我的博客",
  description: "浏览所有博客文章，学习 Next.js、React 和 TypeScript",
  keywords: "Next.js, React, TypeScript, 博客, 前端开发",
};

export default async function BlogListPage() {
  // 使用数据获取函数
  const { blogs, total } = await getAllBlogs();

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <Navigation
          title="博客列表"
          backLink={{
            href: "/",
            text: "返回首页",
          }}
        />

        <BlogList
          blogs={blogs}
          total={total}
          showStats={true}
          showAuthor={true}
          showTags={true}
        />
      </div>
    </div>
  );
}
