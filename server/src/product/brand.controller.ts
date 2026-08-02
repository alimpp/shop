import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { IsNull, Repository } from 'typeorm';

import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand } from './entities/brand.entity';

@Controller('brands')
export class BrandController {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  @Get()
  async findAll(
    @Query('active') active?: string,
  ) {
    const where: Record<string, any> = {
      deletedAt: IsNull(),
    };

    if (typeof active !== 'undefined') {
      where.isActive = active === 'true' || active === '1';
    }

    return this.brandRepository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  @Post()
  async create(
    @Body() dto: CreateBrandDto,
  ) {
    const slugSource = dto.slug?.trim() || dto.name;
    const slug = slugify(slugSource, { lower: true, strict: true, trim: true });

    if (!slug) {
      throw new BadRequestException('اسلاگ نامعتبر است');
    }

    const existing = await this.brandRepository.findOne({
      where: { slug },
      withDeleted: true,
    });

    if (existing && !existing.deletedAt) {
      return existing;
    }

    const created = this.brandRepository.create({
      name: dto.name.trim(),
      slug,
      logo: dto.logo?.trim() || undefined,
      description: dto.description?.trim() || undefined,
      isActive: typeof dto.isActive === 'boolean' ? dto.isActive : true,
    });

    return this.brandRepository.save(created);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBrandDto,
  ) {
    const brand = await this.brandRepository.findOne({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException('برند یافت نشد');
    }

    if (typeof dto.name === 'string') {
      brand.name = dto.name.trim();
    }

    if (typeof dto.slug === 'string') {
      const slug = slugify(dto.slug, { lower: true, strict: true, trim: true });
      if (!slug) {
        throw new BadRequestException('اسلاگ نامعتبر است');
      }

      const existing = await this.brandRepository.findOne({
        where: { slug },
        withDeleted: true,
      });

      if (existing && existing.id !== brand.id && !existing.deletedAt) {
        throw new BadRequestException('اسلاگ برند تکراری است');
      }

      brand.slug = slug;
    }

    if (typeof dto.logo === 'string') {
      brand.logo = dto.logo.trim() || undefined;
    }

    if (typeof dto.description === 'string') {
      brand.description = dto.description.trim() || undefined;
    }

    if (typeof dto.isActive === 'boolean') {
      brand.isActive = dto.isActive;
    }

    return this.brandRepository.save(brand);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const brand = await this.brandRepository.findOne({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException('برند یافت نشد');
    }

    await this.brandRepository.softRemove(brand);
    return {
      message: 'برند با موفقیت حذف شد',
      data: { id },
    };
  }
}
