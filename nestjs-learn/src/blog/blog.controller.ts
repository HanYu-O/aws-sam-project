import { Controller, Get, Param, Query, HttpStatus, HttpException } from '@nestjs/common';
import { BlogService } from './blog.service';
import { GetBlogsQueryDto, BlogResponseDto, BlogListResponseDto } from './dto/blog.dto';

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) { }

  @Get()
  async findAll(@Query() query: GetBlogsQueryDto): Promise<BlogListResponseDto> {
    try {
      return await this.blogService.findAll(query);
    } catch {
      throw new HttpException(
        '获取博客列表失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BlogResponseDto> {
    if (!id || id.trim() === '') {
      throw new HttpException(
        '博客ID不能为空',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.blogService.findOne(id);
  }
} 