import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { Story } from './entities/story.entity';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class StoryService {
  constructor(
    @InjectRepository(Story)
    private readonly storyRepository: Repository<Story>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(dto: CreateStoryDto) {
    const story = this.storyRepository.create({
      imageUrl: dto.imageUrl.trim(),
      duration: dto.duration,
      isActive: typeof dto.isActive === 'boolean' ? dto.isActive : true,
      visitors: [],
    });

    return this.storyRepository.save(story);
  }

  async findAll(active?: string) {
    const where: Record<string, unknown> = {
      deletedAt: IsNull(),
    };

    if (typeof active !== 'undefined') {
      where.isActive = active === 'true' || active === '1';
    }

    return this.storyRepository.find({
      where,
      relations: ['visitors'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const story = await this.storyRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['visitors'],
    });

    if (!story) {
      throw new NotFoundException('استوری یافت نشد');
    }

    return story;
  }

  async update(id: string, dto: UpdateStoryDto) {
    const story = await this.findOne(id);

    if (typeof dto.imageUrl === 'string') {
      story.imageUrl = dto.imageUrl.trim();
    }

    if (typeof dto.duration === 'number') {
      story.duration = dto.duration;
    }

    if (typeof dto.isActive === 'boolean') {
      story.isActive = dto.isActive;
    }

    return this.storyRepository.save(story);
  }

  async remove(id: string) {
    const story = await this.findOne(id);

    await this.storyRepository.softRemove(story);

    return {
      message: 'استوری با موفقیت حذف شد',
      data: { id },
    };
  }

  async addVisitor(storyId: string, userId: string) {
    const story = await this.findOne(storyId);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    story.visitors = story.visitors ?? [];
    const exists = story.visitors.some((visitor) => visitor.id === user.id);

    if (!exists) {
      story.visitors.push(user);
    }

    return this.storyRepository.save(story);
  }
}
