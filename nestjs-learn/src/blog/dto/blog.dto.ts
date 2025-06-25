import { IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

// 查询博客列表的参数
export class GetBlogsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsString()
  author?: string;
}

// 博客列表项DTO (不包含content字段)
export class BlogListItemDto {
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

// 博客详情响应DTO (包含完整content字段)
export class BlogResponseDto {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  author?: string;
  tags: string[];
}

// 博客列表响应DTO
export class BlogListResponseDto {
  data: BlogListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 