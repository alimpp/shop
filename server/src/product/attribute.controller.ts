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

import { CreateAttributeDto } from './dto/create-attribute.dto';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';
import { AttributeValue } from './entities/attribute-value.entity';
import { Attribute } from './entities/attribute.entity';

@Controller('attributes')
export class AttributeController {
  constructor(
    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,

    @InjectRepository(AttributeValue)
    private readonly attributeValueRepository: Repository<AttributeValue>,
  ) {}

  @Get()
  async findAll(
    @Query('includeValues') includeValues?: string,
  ) {
    const withValues = includeValues !== '0' && includeValues !== 'false';

    if (!withValues) {
      return this.attributeRepository.find({
        where: { deletedAt: IsNull() },
        order: { sortOrder: 'ASC', createdAt: 'DESC' },
      });
    }

    const attributes = await this.attributeRepository.find({
      where: { deletedAt: IsNull() },
      relations: {
        values: true,
      },
      order: {
        sortOrder: 'ASC',
        createdAt: 'DESC',
      },
    });

    return attributes.map((attribute) => ({
      ...attribute,
      values: (attribute.values ?? [])
        .filter((value) => !value.deletedAt)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    }));
  }

  @Post()
  async create(
    @Body() dto: CreateAttributeDto,
  ) {
    const slugSource = dto.slug?.trim() || dto.name;
    const slug = slugify(slugSource, { lower: true, strict: true, trim: true });

    if (!slug) {
      throw new BadRequestException('اسلاگ نامعتبر است');
    }

    const existing = await this.attributeRepository.findOne({
      where: { slug },
      withDeleted: true,
    });

    if (existing && !existing.deletedAt) {
      return existing;
    }

    const created = this.attributeRepository.create({
      name: dto.name.trim(),
      slug,
      isFilterable: typeof dto.isFilterable === 'boolean' ? dto.isFilterable : true,
      sortOrder: typeof dto.sortOrder === 'number' ? dto.sortOrder : 0,
    });

    return this.attributeRepository.save(created);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAttributeDto,
  ) {
    const attribute = await this.attributeRepository.findOne({
      where: { id },
    });

    if (!attribute) {
      throw new NotFoundException('ویژگی یافت نشد');
    }

    if (typeof dto.name === 'string') {
      attribute.name = dto.name.trim();
    }

    if (typeof dto.slug === 'string') {
      const slug = slugify(dto.slug, { lower: true, strict: true, trim: true });
      if (!slug) {
        throw new BadRequestException('اسلاگ نامعتبر است');
      }

      const existing = await this.attributeRepository.findOne({
        where: { slug },
        withDeleted: true,
      });

      if (existing && existing.id !== attribute.id && !existing.deletedAt) {
        throw new BadRequestException('اسلاگ ویژگی تکراری است');
      }

      attribute.slug = slug;
    }

    if (typeof dto.isFilterable === 'boolean') {
      attribute.isFilterable = dto.isFilterable;
    }

    if (typeof dto.sortOrder === 'number') {
      attribute.sortOrder = dto.sortOrder;
    }

    return this.attributeRepository.save(attribute);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const attribute = await this.attributeRepository.findOne({
      where: { id },
    });

    if (!attribute) {
      throw new NotFoundException('ویژگی یافت نشد');
    }

    await this.attributeRepository.softRemove(attribute);
    return {
      message: 'ویژگی با موفقیت حذف شد',
      data: { id },
    };
  }

  @Post(':id/values')
  async createValue(
    @Param('id', ParseUUIDPipe) attributeId: string,
    @Body() dto: CreateAttributeValueDto,
  ) {
    const attribute = await this.attributeRepository.findOne({
      where: { id: attributeId },
    });

    if (!attribute) {
      throw new NotFoundException('ویژگی یافت نشد');
    }

    const slugSource = dto.slug?.trim() || dto.value;
    const slug = slugify(slugSource, { lower: true, strict: true, trim: true });

    if (!slug) {
      throw new BadRequestException('اسلاگ مقدار نامعتبر است');
    }

    const created = this.attributeValueRepository.create({
      attributeId,
      value: dto.value.trim(),
      slug,
      sortOrder: typeof dto.sortOrder === 'number' ? dto.sortOrder : 0,
    });

    return this.attributeValueRepository.save(created);
  }

  @Patch('values/:valueId')
  async updateValue(
    @Param('valueId', ParseUUIDPipe) valueId: string,
    @Body() dto: UpdateAttributeValueDto,
  ) {
    const value = await this.attributeValueRepository.findOne({
      where: { id: valueId },
    });

    if (!value) {
      throw new NotFoundException('مقدار ویژگی یافت نشد');
    }

    if (typeof dto.value === 'string') {
      value.value = dto.value.trim();
    }

    if (typeof dto.slug === 'string') {
      const slug = slugify(dto.slug, { lower: true, strict: true, trim: true });
      if (!slug) {
        throw new BadRequestException('اسلاگ مقدار نامعتبر است');
      }
      value.slug = slug;
    }

    if (typeof dto.sortOrder === 'number') {
      value.sortOrder = dto.sortOrder;
    }

    return this.attributeValueRepository.save(value);
  }

  @Delete('values/:valueId')
  async removeValue(
    @Param('valueId', ParseUUIDPipe) valueId: string,
  ) {
    const value = await this.attributeValueRepository.findOne({
      where: { id: valueId },
    });

    if (!value) {
      throw new NotFoundException('مقدار ویژگی یافت نشد');
    }

    await this.attributeValueRepository.softRemove(value);
    return {
      message: 'مقدار ویژگی با موفقیت حذف شد',
      data: { id: valueId },
    };
  }
}
