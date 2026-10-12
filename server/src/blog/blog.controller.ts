import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { AdminAuth } from '../common/decorators/admin-auth.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { QueryBlogDto } from './dto/query-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogStatus } from './enums/blog-status.enum';

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @AdminAuth('blogs', 'create')
  @Post()
  async create(@Body() dto: CreateBlogDto) {
    return await this.blogService.create(dto);
  }

  @Get()
  async findAll(@Query() query: QueryBlogDto) {
    return await this.blogService.findAll(query);
  }

  @Get('public')
  async findAllPublic(@Query() query: QueryBlogDto) {
    return await this.blogService.findAllPublic(query);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return await this.blogService.findBySlug(slug);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.blogService.findOne(id);
  }

  @AdminAuth('blogs', 'edit')
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBlogDto,
  ) {
    return await this.blogService.update(id, dto);
  }

  @AdminAuth('blogs', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.blogService.remove(id);
  }

  @AdminAuth('blogs', 'edit')
  @Patch(':id/restore')
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    return await this.blogService.restore(id);
  }

  @AdminAuth('blogs', 'edit')
  @Patch(':id/status')
  async changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: BlogStatus },
  ) {
    return await this.blogService.changeStatus(id, body.status);
  }

  @Patch(':id/view')
  async incrementViewCount(@Param('id', ParseUUIDPipe) id: string) {
    return await this.blogService.incrementViewCount(id);
  }
}
