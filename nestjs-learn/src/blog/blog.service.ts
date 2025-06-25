import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetBlogsQueryDto, BlogResponseDto, BlogListResponseDto, BlogListItemDto } from './dto/blog.dto';
import { Prisma } from '@prisma/custom-client';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(query: GetBlogsQueryDto): Promise<BlogListResponseDto> {
    const { page = 1, limit = 10, search, published, author } = query;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: Prisma.PostWhereInput = {};

    if (published !== undefined) {
      where.published = published;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (author) {
      where.author = { contains: author, mode: 'insensitive' };
    }

    // 并行查询数据和总数
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          published: true,
          createdAt: true,
          updatedAt: true,
          author: true,
          tags: true,
          // 注意: 这里不选择 content 字段，提升性能
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: posts.map((post) => this.mapToListItemDto(post)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(slug: string): Promise<BlogResponseDto> {
    const post = await this.prisma.post.findUnique({
      where: { slug },
    });

    if (!post) {
      throw new NotFoundException(`博客文章未找到 (slug: ${slug})`);
    }

    return this.mapToResponseDto(post);
  }

  private mapToListItemDto(post: any): BlogListItemDto {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      published: post.published,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      tags: post.tags,
    };
  }

  private mapToResponseDto(post: any): BlogResponseDto {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      published: post.published,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      tags: post.tags,
    };
  }
} 