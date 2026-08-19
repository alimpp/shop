import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Blog } from '../blog/entities/blog.entity';
import { Product } from '../product/entities/product.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { LikeToggleDto } from './dto/like-toggle.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';
import { Comment } from './entities/comment.entity';
import { Like } from './entities/like.entity';
import { TargetType } from './enums/target-type.enum';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  async toggleLike(dto: LikeToggleDto, userId: string) {
    await this.ensureTargetExists(dto.entityType, dto.entityId);

    const existingLike = await this.likeRepository.findOne({
      where: {
        userId,
        entityType: dto.entityType,
        entityId: dto.entityId,
      },
    });

    if (existingLike) {
      await this.likeRepository.delete(existingLike.id);
      await this.decrementCount(dto.entityType, dto.entityId, 'likeCount');

      return {
        liked: false,
        likeCount: await this.getTargetCount(
          dto.entityType,
          dto.entityId,
          'likeCount',
        ),
      };
    }

    await this.likeRepository.save(
      this.likeRepository.create({
        userId,
        entityType: dto.entityType,
        entityId: dto.entityId,
      }),
    );

    await this.incrementCount(dto.entityType, dto.entityId, 'likeCount');

    return {
      liked: true,
      likeCount: await this.getTargetCount(
        dto.entityType,
        dto.entityId,
        'likeCount',
      ),
    };
  }

  async isLiked(
    entityType: TargetType,
    entityId: string,
    userId: string,
  ): Promise<boolean> {
    await this.ensureTargetExists(entityType, entityId);

    return (
      (await this.likeRepository.count({
        where: {
          userId,
          entityType,
          entityId,
        },
      })) > 0
    );
  }

  async findComments(query: QueryCommentsDto) {
    await this.ensureTargetExists(query.entityType, query.entityId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .addSelect([
        'user.id',
        'user.fristname',
        'user.lastname',
        'user.avatarUrl',
      ])
      .where('comment.entityType = :entityType', {
        entityType: query.entityType,
      })
      .andWhere('comment.entityId = :entityId', {
        entityId: query.entityId,
      })
      .orderBy('comment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      items: data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createComment(dto: CreateCommentDto, userId: string) {
    await this.ensureTargetExists(dto.entityType, dto.entityId);

    const comment = await this.commentRepository.save(
      this.commentRepository.create({
        userId,
        entityType: dto.entityType,
        entityId: dto.entityId,
        content: dto.content,
      }),
    );

    await this.incrementCount(dto.entityType, dto.entityId, 'commentCount');

    return comment;
  }

  async deleteComment(
    id: string,
    user: { sub: string | number; role?: string },
  ) {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('کامنت یافت نشد');
    }

    const isAdmin = user.role === 'admin';
    const isOwner = String(comment.userId) === String(user.sub);

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'شما فقط می‌توانید کامنت خودتان را حذف کنید',
      );
    }

    await this.commentRepository.softRemove(comment);
    await this.decrementCount(
      comment.entityType,
      comment.entityId,
      'commentCount',
    );

    return {
      message: 'کامنت با موفقیت حذف شد',
    };
  }

  async findLikesByUser(userId: string, page = 1, limit = 50) {
    const [likes, total] = await this.likeRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = await this.hydrateInteractionTargets(
      likes.map((like) => ({
        id: like.id,
        entityType: like.entityType,
        entityId: like.entityId,
        createdAt: like.createdAt,
      })),
    );

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findCommentsByUser(userId: string, page = 1, limit = 50) {
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const targets = await this.hydrateInteractionTargets(
      comments.map((comment) => ({
        id: comment.id,
        entityType: comment.entityType,
        entityId: comment.entityId,
        createdAt: comment.createdAt,
      })),
    );

    const targetMap = new Map(targets.map((item) => [item.id, item]));

    return {
      items: comments.map((comment) => {
        const target = targetMap.get(comment.id);
        return {
          id: comment.id,
          content: comment.content,
          entityType: comment.entityType,
          entityId: comment.entityId,
          createdAt: comment.createdAt,
          title: target?.title ?? 'مورد حذف‌شده',
          slug: target?.slug ?? '',
          image: target?.image ?? '',
          href: target?.href ?? '',
        };
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async countByUser(userId: string) {
    const [likes, comments] = await Promise.all([
      this.likeRepository.count({ where: { userId } }),
      this.commentRepository.count({ where: { userId } }),
    ]);

    return { likes, comments };
  }

  private async hydrateInteractionTargets(
    rows: Array<{
      id: string;
      entityType: TargetType;
      entityId: string;
      createdAt: Date;
    }>,
  ) {
    const productIds = [
      ...new Set(
        rows
          .filter((row) => row.entityType === TargetType.PRODUCT)
          .map((row) => row.entityId),
      ),
    ];
    const blogIds = [
      ...new Set(
        rows
          .filter((row) => row.entityType === TargetType.BLOG)
          .map((row) => row.entityId),
      ),
    ];

    const products: Product[] = productIds.length
      ? await this.productRepository.find({
          where: { id: In(productIds) },
          relations: { medias: true },
        })
      : [];
    const blogs: Blog[] = blogIds.length
      ? await this.blogRepository.find({
          where: { id: In(blogIds) },
        })
      : [];

    const productMap = new Map<string, Product>(
      products.map((item) => [item.id, item]),
    );
    const blogMap = new Map<string, Blog>(blogs.map((item) => [item.id, item]));

    return rows.map((row) => {
      if (row.entityType === TargetType.PRODUCT) {
        const product = productMap.get(row.entityId);
        const image =
          product?.medias?.find((media) => media.isThumbnail)?.url ||
          product?.medias?.[0]?.url ||
          '';
        return {
          id: row.id,
          entityType: row.entityType,
          entityId: row.entityId,
          createdAt: row.createdAt,
          title: product?.name ?? 'محصول حذف‌شده',
          slug: product?.slug ?? '',
          image,
          href: product?.slug ? `/products/${product.slug}` : '',
        };
      }

      const blog = blogMap.get(row.entityId);
      return {
        id: row.id,
        entityType: row.entityType,
        entityId: row.entityId,
        createdAt: row.createdAt,
        title: blog?.title ?? 'بلاگ حذف‌شده',
        slug: blog?.slug ?? '',
        image: blog?.coverImage ?? '',
        href: blog?.slug ? `/blog/${blog.slug}` : '',
      };
    });
  }

  private async ensureTargetExists(
    entityType: TargetType,
    entityId: string,
  ): Promise<void> {
    let exists = false;

    if (entityType === TargetType.PRODUCT) {
      exists =
        (await this.productRepository.count({ where: { id: entityId } })) > 0;
    } else {
      exists =
        (await this.blogRepository.count({ where: { id: entityId } })) > 0;
    }

    if (!exists) {
      throw new NotFoundException('محصول یا بلاگ موردنظر یافت نشد');
    }
  }

  private async getTargetCount(
    entityType: TargetType,
    entityId: string,
    field: 'likeCount' | 'commentCount',
  ): Promise<number> {
    const repository =
      entityType === TargetType.PRODUCT
        ? this.productRepository
        : this.blogRepository;

    const target = await repository.findOne({
      where: { id: entityId },
      select: {
        id: true,
        [field]: true,
      },
    });

    return target?.[field] ?? 0;
  }

  private async incrementCount(
    entityType: TargetType,
    entityId: string,
    field: 'likeCount' | 'commentCount',
  ): Promise<void> {
    const repository =
      entityType === TargetType.PRODUCT
        ? this.productRepository
        : this.blogRepository;

    await repository.increment({ id: entityId }, field, 1);
  }

  private async decrementCount(
    entityType: TargetType,
    entityId: string,
    field: 'likeCount' | 'commentCount',
  ): Promise<void> {
    const currentCount = await this.getTargetCount(entityType, entityId, field);

    if (currentCount <= 0) {
      return;
    }

    const repository =
      entityType === TargetType.PRODUCT
        ? this.productRepository
        : this.blogRepository;

    await repository.decrement({ id: entityId }, field, 1);
  }
}
