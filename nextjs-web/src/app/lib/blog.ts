import { BlogsResponse, BlogResponse } from '@/app/types/blog'

export async function getAllBlogs(): Promise<BlogsResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`);
    const data = await response.json();
    return {
      blogs: data.data,
      total: data.total
    };
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return {
      blogs: [],
      total: 0
    };;
  }
}

export async function getBlogBySlug(slug: string): Promise<BlogResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${slug}`);
    const data = await response.json();
    return {
      blog: data
    };
  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    return {
      blog: {
        id: '',
        title: '',
        slug: '',
        content: '',
        published: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        author: ''
      }
    };
  }
}

// 格式化日期的工具函数
export function formatDate(date: Date | string): string {
  if (!date) {
    return ''
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date

  // 检查日期是否有效
  if (isNaN(dateObj.getTime())) {
    return '无效日期'
  }

  return dateObj.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}