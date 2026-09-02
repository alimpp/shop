import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { ProductStatus } from '../product/enums/product-status.enum';
import { ProductVisibility } from '../product/enums/product-visibility.enum';
import { Product } from '../product/entities/product.entity';
import { TrackBehaviorEventDto } from './dto/track-event.dto';
import { QueryBehaviorDto } from './dto/query-behavior.dto';
import { UserProductEvent } from './entities/user-product-event.entity';
import { UserProductInterest } from './entities/user-product-interest.entity';
import {
  BEHAVIOR_SCORE_WEIGHTS,
  BehaviorEventType,
} from './enums/behavior-event-type.enum';

@Injectable()
export class BehaviorService {
  constructor(
    @InjectRepository(UserProductEvent)
    private readonly eventRepository: Repository<UserProductEvent>,
    @InjectRepository(UserProductInterest)
    private readonly interestRepository: Repository<UserProductInterest>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async trackEvent(dto: TrackBehaviorEventDto, userId?: string | null) {
    const sessionId = dto.sessionId?.trim() || null;
    if (!userId && !sessionId) {
      throw new BadRequestException('برای ثبت رفتار، ورود یا sessionId لازم است');
    }

    if (
      dto.eventType !== BehaviorEventType.FILTER &&
      !dto.productId
    ) {
      throw new BadRequestException('شناسه محصول برای این رویداد الزامی است');
    }

    if (dto.productId) {
      const exists = await this.productRepository.exist({
        where: { id: dto.productId },
      });
      if (!exists) {
        throw new BadRequestException('محصول یافت نشد');
      }
    }

    const scoreDelta = BEHAVIOR_SCORE_WEIGHTS[dto.eventType] ?? 0;

    const event = await this.eventRepository.save(
      this.eventRepository.create({
        userId: userId ?? null,
        sessionId,
        productId: dto.productId ?? null,
        eventType: dto.eventType,
        scoreDelta,
        metadata: dto.metadata ?? null,
      }),
    );

    if (dto.productId) {
      await this.upsertInterest({
        userId: userId ?? null,
        sessionId,
        productId: dto.productId,
        eventType: dto.eventType,
        scoreDelta,
      });
    }

    return {
      id: event.id,
      eventType: event.eventType,
      productId: event.productId,
      scoreDelta: event.scoreDelta,
      createdAt: event.createdAt,
    };
  }

  async getRecentViews(query: QueryBehaviorDto, userId?: string | null) {
    const limit = query.limit ?? 12;
    if (!userId && !query.sessionId?.trim()) {
      return [];
    }

    const actor = this.resolveActor(userId, query.sessionId);

    const qb = this.eventRepository
      .createQueryBuilder('event')
      .where('event.eventType = :type', {
        type: BehaviorEventType.PRODUCT_VIEW,
      })
      .andWhere('event.productId IS NOT NULL')
      .orderBy('event.createdAt', 'DESC')
      .take(limit * 4);

    this.applyActorFilter(qb, 'event', actor);

    const events = await qb.getMany();
    const productIds = [
      ...new Set(
        events
          .map((event) => event.productId)
          .filter((id): id is string => Boolean(id)),
      ),
    ].slice(0, limit);

    return this.loadPublicProductsByIds(productIds);
  }

  async getRecommendations(query: QueryBehaviorDto, userId?: string | null) {
    const limit = query.limit ?? 12;
    if (!userId && !query.sessionId?.trim()) {
      return [];
    }

    const actor = this.resolveActor(userId, query.sessionId);

    const interestQb = this.interestRepository
      .createQueryBuilder('interest')
      .orderBy('interest.score', 'DESC')
      .addOrderBy('interest.lastInteractedAt', 'DESC')
      .take(20);

    this.applyActorFilter(interestQb, 'interest', actor);

    const interests = await interestQb.getMany();
    const seedIds = interests
      .filter((item) => item.score > 0)
      .map((item) => item.productId);

    if (!seedIds.length) {
      return this.getRecentViews(query, userId);
    }

    const seeds = await this.productRepository.find({
      where: { id: In(seedIds) },
      select: ['id', 'categoryId', 'brandId'],
    });

    const categoryIds = [
      ...new Set(seeds.map((item) => item.categoryId).filter(Boolean)),
    ];
    const brandIds = [
      ...new Set(
        seeds
          .map((item) => item.brandId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const filterPrefs = await this.collectFilterPreferences(actor);

    const recommendedQb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.medias', 'medias')
      .leftJoinAndSelect('product.variants', 'variants')
      .where('product.deletedAt IS NULL')
      .andWhere('product.isActive = true')
      .andWhere('product.status = :status', {
        status: ProductStatus.PUBLISHED,
      })
      .andWhere('product.visibility = :visibility', {
        visibility: ProductVisibility.PUBLIC,
      })
      .andWhere('product.id NOT IN (:...seedIds)', { seedIds })
      .take(limit * 2);

    if (categoryIds.length || brandIds.length) {
      recommendedQb.andWhere(
        '(product.categoryId IN (:...categoryIds) OR product.brandId IN (:...brandIds))',
        {
          categoryIds: categoryIds.length ? categoryIds : ['00000000-0000-0000-0000-000000000000'],
          brandIds: brandIds.length ? brandIds : ['00000000-0000-0000-0000-000000000000'],
        },
      );
    }

    if (filterPrefs.categoryId) {
      recommendedQb.addOrderBy(
        `CASE WHEN product.categoryId = :prefCategory THEN 0 ELSE 1 END`,
        'ASC',
      );
      recommendedQb.setParameter('prefCategory', filterPrefs.categoryId);
    }

    if (filterPrefs.brandId) {
      recommendedQb.addOrderBy(
        `CASE WHEN product.brandId = :prefBrand THEN 0 ELSE 1 END`,
        'ASC',
      );
      recommendedQb.setParameter('prefBrand', filterPrefs.brandId);
    }

    recommendedQb
      .addOrderBy('product.soldCount', 'DESC')
      .addOrderBy('product.createdAt', 'DESC');

    const candidates = await recommendedQb.getMany();
    const preferred = this.rankByAttributeAffinity(
      candidates,
      filterPrefs.attributeValueIds,
    ).slice(0, limit);

    if (preferred.length >= Math.min(4, limit)) {
      return preferred;
    }

    const recent = await this.getRecentViews({ ...query, limit }, userId);
    const merged = [...preferred];
    for (const product of recent) {
      if (merged.length >= limit) break;
      if (!merged.some((item) => item.id === product.id)) {
        merged.push(product);
      }
    }

    return merged;
  }

  async getAdminUserBehavior(userId: string, query: QueryBehaviorDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [events, totalEvents, interests, filterEvents] = await Promise.all([
      this.eventRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.eventRepository.count({ where: { userId } }),
      this.interestRepository.find({
        where: { userId },
        order: { score: 'DESC' },
        take: 20,
      }),
      this.eventRepository.find({
        where: { userId, eventType: BehaviorEventType.FILTER },
        order: { createdAt: 'DESC' },
        take: 30,
      }),
    ]);

    const productIds = [
      ...new Set(
        [
          ...events.map((item) => item.productId),
          ...interests.map((item) => item.productId),
        ].filter((id): id is string => Boolean(id)),
      ),
    ];

    const products = productIds.length
      ? await this.productRepository.find({
          where: { id: In(productIds) },
          relations: { medias: true, category: true, brand: true },
        })
      : [];

    const productMap = new Map(products.map((product) => [product.id, product]));

    const eventTypeCounts = await this.eventRepository
      .createQueryBuilder('event')
      .select('event.eventType', 'eventType')
      .addSelect('COUNT(*)', 'count')
      .where('event.userId = :userId', { userId })
      .groupBy('event.eventType')
      .getRawMany<{ eventType: BehaviorEventType; count: string }>();

    return {
      summary: {
        totalEvents,
        eventTypeCounts: eventTypeCounts.map((row) => ({
          eventType: row.eventType,
          count: Number(row.count) || 0,
        })),
        topInterests: interests.map((interest) => {
          const product = productMap.get(interest.productId);
          return {
            productId: interest.productId,
            score: interest.score,
            viewCount: interest.viewCount,
            galleryViewCount: interest.galleryViewCount,
            likeCount: interest.likeCount,
            commentCount: interest.commentCount,
            favoriteCount: interest.favoriteCount,
            cartCount: interest.cartCount,
            lastInteractedAt: interest.lastInteractedAt,
            product: product
              ? {
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  image:
                    product.medias?.find((media) => media.isThumbnail)?.url ||
                    product.medias?.[0]?.url ||
                    '',
                  category: product.category?.name ?? null,
                  brand: product.brand?.name ?? null,
                }
              : null,
          };
        }),
      },
      filters: filterEvents.map((event) => ({
        id: event.id,
        createdAt: event.createdAt,
        metadata: event.metadata ?? {},
      })),
      events: events.map((event) => {
        const product = event.productId
          ? productMap.get(event.productId)
          : null;
        return {
          id: event.id,
          eventType: event.eventType,
          scoreDelta: event.scoreDelta,
          metadata: event.metadata ?? null,
          createdAt: event.createdAt,
          product: product
            ? {
                id: product.id,
                name: product.name,
                slug: product.slug,
                image:
                  product.medias?.find((media) => media.isThumbnail)?.url ||
                  product.medias?.[0]?.url ||
                  '',
              }
            : null,
        };
      }),
      meta: {
        total: totalEvents,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(totalEvents / limit)),
      },
    };
  }

  private async upsertInterest(input: {
    userId: string | null;
    sessionId: string | null;
    productId: string;
    eventType: BehaviorEventType;
    scoreDelta: number;
  }) {
    let interest = await this.findInterest(
      input.userId,
      input.sessionId,
      input.productId,
    );

    if (!interest) {
      interest = this.interestRepository.create({
        userId: input.userId,
        sessionId: input.userId ? null : input.sessionId,
        productId: input.productId,
        score: 0,
        viewCount: 0,
        galleryViewCount: 0,
        likeCount: 0,
        commentCount: 0,
        favoriteCount: 0,
        cartCount: 0,
      });
    }

    interest.score = Math.max(0, Number(interest.score) + input.scoreDelta);
    interest.lastInteractedAt = new Date();

    switch (input.eventType) {
      case BehaviorEventType.PRODUCT_VIEW:
        interest.viewCount += 1;
        break;
      case BehaviorEventType.GALLERY_VIEW:
        interest.galleryViewCount += 1;
        break;
      case BehaviorEventType.LIKE:
        interest.likeCount += 1;
        break;
      case BehaviorEventType.UNLIKE:
        interest.likeCount = Math.max(0, interest.likeCount - 1);
        break;
      case BehaviorEventType.COMMENT:
        interest.commentCount += 1;
        break;
      case BehaviorEventType.FAVORITE:
        interest.favoriteCount += 1;
        break;
      case BehaviorEventType.UNFAVORITE:
        interest.favoriteCount = Math.max(0, interest.favoriteCount - 1);
        break;
      case BehaviorEventType.ADD_TO_CART:
        interest.cartCount += 1;
        break;
      default:
        break;
    }

    await this.interestRepository.save(interest);
  }

  private async findInterest(
    userId: string | null,
    sessionId: string | null,
    productId: string,
  ) {
    if (userId) {
      return this.interestRepository.findOne({
        where: { userId, productId },
      });
    }

    if (sessionId) {
      return this.interestRepository.findOne({
        where: { sessionId, productId, userId: IsNull() },
      });
    }

    return null;
  }

  private resolveActor(userId?: string | null, sessionId?: string) {
    const normalizedSession = sessionId?.trim() || null;
    if (!userId && !normalizedSession) {
      throw new BadRequestException('ورود یا sessionId لازم است');
    }
    return {
      userId: userId ?? null,
      sessionId: normalizedSession,
    };
  }

  private applyActorFilter(
    qb: { andWhere: (sql: string, params?: Record<string, unknown>) => unknown },
    alias: string,
    actor: { userId: string | null; sessionId: string | null },
  ) {
    if (actor.userId) {
      qb.andWhere(`${alias}.userId = :userId`, { userId: actor.userId });
      return;
    }

    qb.andWhere(`${alias}.sessionId = :sessionId`, {
      sessionId: actor.sessionId,
    });
  }

  private async collectFilterPreferences(actor: {
    userId: string | null;
    sessionId: string | null;
  }) {
    const qb = this.eventRepository
      .createQueryBuilder('event')
      .where('event.eventType = :type', { type: BehaviorEventType.FILTER })
      .orderBy('event.createdAt', 'DESC')
      .take(40);

    this.applyActorFilter(qb, 'event', actor);
    const events = await qb.getMany();

    const categoryCounts = new Map<string, number>();
    const brandCounts = new Map<string, number>();
    const attributeCounts = new Map<string, number>();

    for (const event of events) {
      const meta = event.metadata ?? {};
      const categoryId = typeof meta.categoryId === 'string' ? meta.categoryId : '';
      const brandId = typeof meta.brandId === 'string' ? meta.brandId : '';
      const attributeValueIds = Array.isArray(meta.attributeValueIds)
        ? meta.attributeValueIds.filter(
            (id): id is string => typeof id === 'string',
          )
        : [];

      if (categoryId) {
        categoryCounts.set(categoryId, (categoryCounts.get(categoryId) ?? 0) + 1);
      }
      if (brandId) {
        brandCounts.set(brandId, (brandCounts.get(brandId) ?? 0) + 1);
      }
      for (const id of attributeValueIds) {
        attributeCounts.set(id, (attributeCounts.get(id) ?? 0) + 1);
      }
    }

    return {
      categoryId: this.topKey(categoryCounts),
      brandId: this.topKey(brandCounts),
      attributeValueIds: [...attributeCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([id]) => id),
    };
  }

  private topKey(map: Map<string, number>): string | null {
    let best: string | null = null;
    let bestCount = 0;
    for (const [key, count] of map.entries()) {
      if (count > bestCount) {
        best = key;
        bestCount = count;
      }
    }
    return best;
  }

  private rankByAttributeAffinity(
    products: Product[],
    attributeValueIds: string[],
  ) {
    if (!attributeValueIds.length) return products;

    const preferred = new Set(attributeValueIds);
    return [...products].sort((a, b) => {
      const scoreA = this.productAttributeScore(a, preferred);
      const scoreB = this.productAttributeScore(b, preferred);
      return scoreB - scoreA;
    });
  }

  private productAttributeScore(product: Product, preferred: Set<string>) {
    const values =
      product.variants?.flatMap(
        (variant) =>
          variant.values?.map((value) => value.attributeValueId) ?? [],
      ) ?? [];
    return values.reduce(
      (sum, id) => sum + (preferred.has(id) ? 1 : 0),
      0,
    );
  }

  private async loadPublicProductsByIds(productIds: string[]) {
    if (!productIds.length) return [];

    const products = await this.productRepository.find({
      where: {
        id: In(productIds),
        isActive: true,
        status: ProductStatus.PUBLISHED,
        visibility: ProductVisibility.PUBLIC,
      },
      relations: {
        category: true,
        brand: true,
        medias: true,
        variants: true,
      },
    });

    const map = new Map(products.map((product) => [product.id, product]));
    return productIds
      .map((id) => map.get(id))
      .filter((product): product is Product => Boolean(product));
  }
}
