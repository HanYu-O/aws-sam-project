export type BlogSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  author?: string;
  tags: string[];
}

export interface BlogsResponse {
  blogs: BlogSummary[];
  total: number;
}

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  author?: string;
  tags: string[];
}

export interface BlogResponse {
  blog: BlogPost;
}