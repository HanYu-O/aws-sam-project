import { notFound } from "next/navigation";
import { getBlogBySlug, getAllBlogs } from "@/app/lib/blog";
import Navigation from "@/app/components/Navigation";
import BlogHeader from "@/app/components/BlogHeader";
import BlogContent from "@/app/components/BlogContent";
import BlogActions from "@/app/components/BlogActions";

// 定义页面参数类型
interface PageProps {
  params: Promise<{ slug: string }>;
}

// 🔥 静态生成配置
export const dynamicParams = true; // 允许动态参数
export const revalidate = false; // 静态生成，不重新验证

// 🔥 静态生成：预生成所有博客页面
export async function generateStaticParams() {
  try {
    const { blogs } = await getAllBlogs();
    console.log(
      "预生成路径:",
      blogs.map((b) => b.slug)
    );

    return blogs.map((blog) => ({
      slug: blog.slug,
    }));
  } catch (error) {
    console.error("生成静态参数时出错:", error);
    return [];
  }
}

// 🔥 动态元数据：SEO 优化
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const { blog } = await getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "文章未找到",
      description: "抱歉，您访问的文章不存在",
    };
  }

  return {
    title: `${blog.title} | 我的博客`,
    description: blog.excerpt,
    keywords: blog.tags?.join(", "),
    authors: blog.author ? [{ name: blog.author }] : undefined,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: "article",
      publishedTime: blog.createdAt,
      authors: blog.author ? [blog.author] : undefined,
      tags: blog.tags,
    },
  };
}

export default async function BlogPost({ params }: PageProps) {
  // 使用类型安全的数据获取
  const { slug } = await params;
  const { blog } = await getBlogBySlug(slug);

  // 如果没找到博客，显示 404
  if (!blog) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <Navigation
          backLink={{
            href: "/blog",
            text: "返回博客列表",
          }}
        />

        <BlogHeader blog={blog} showTags={true} />

        <BlogContent content={blog.content ?? ""} />

        {/* 🔥 客户端交互组件 */}
        <BlogActions blogId={blog.id} title={blog.title} />
      </div>
    </div>
  );
}
