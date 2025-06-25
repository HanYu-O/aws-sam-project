import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="text-center space-y-8">
        <h1 className="text-4xl font-bold">欢迎来到我的博客</h1>
        <p className="text-lg text-gray-600">通过 Next.js 学习博客开发</p>

        <div className="space-y-4">
          <Link
            href="/blog"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            查看博客列表
          </Link>
        </div>
      </main>
    </div>
  );
}
