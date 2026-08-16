import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Banner } from './entities/banner.entity';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
  ) {}

  async create(dto: CreateBannerDto) {
    const banner = this.bannerRepository.create({
      title: dto.title.trim(),
      subtitle: dto.subtitle?.trim() || undefined,
      imageUrl: dto.imageUrl.trim(),
      link: dto.link?.trim() || undefined,
      description: dto.description?.trim() || undefined,
      isActive: typeof dto.isActive === 'boolean' ? dto.isActive : true,
    });

    return this.bannerRepository.save(banner);
  }

  async findAll(active?: string) {
    const where: Record<string, unknown> = {
      deletedAt: IsNull(),
    };

    if (typeof active !== 'undefined') {
      where.isActive = active === 'true' || active === '1';
    }

    return this.bannerRepository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const banner = await this.bannerRepository.findOne({
      where: { id },
    });

    if (!banner) {
      throw new NotFoundException('بنر یافت نشد');
    }

    return banner;
  }

  async update(id: string, dto: UpdateBannerDto) {
    const banner = await this.findOne(id);

    if (typeof dto.title === 'string') {
      banner.title = dto.title.trim();
    }

    if (typeof dto.subtitle === 'string') {
      banner.subtitle = dto.subtitle.trim() || undefined;
    }

    if (typeof dto.imageUrl === 'string') {
      banner.imageUrl = dto.imageUrl.trim();
    }

    if (typeof dto.link === 'string') {
      banner.link = dto.link.trim() || undefined;
    }

    if (typeof dto.description === 'string') {
      banner.description = dto.description.trim() || undefined;
    }

    if (typeof dto.isActive === 'boolean') {
      banner.isActive = dto.isActive;
    }

    return this.bannerRepository.save(banner);
  }

  async remove(id: string) {
    const banner = await this.findOne(id);

    await this.bannerRepository.softRemove(banner);

    return {
      message: 'بنر با موفقیت حذف شد',
      data: { id },
    };
  }
}
