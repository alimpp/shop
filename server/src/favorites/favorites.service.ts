import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async toggle(productId: string, userId: string) {
    await this.ensureProductExists(productId);

    const existing = await this.favoriteRepository.findOne({
      where: {
        userId,
        productId,
      },
    });

    if (existing) {
      await this.favoriteRepository.delete(existing.id);

      return {
        favorited: false,
      };
    }

    await this.favoriteRepository.save(
      this.favoriteRepository.create({
        userId,
        productId,
      }),
    );

    return {
      favorited: true,
    };
  }

  async isFavorited(productId: string, userId: string): Promise<boolean> {
    await this.ensureProductExists(productId);

    return (
      (await this.favoriteRepository.count({
        where: {
          userId,
          productId,
        },
      })) > 0
    );
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.favoriteRepository.findAndCount({
      where: {
        userId,
      },
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const productIds = data.map((favorite) => favorite.productId);

    const products =
      productIds.length > 0
        ? await this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.brand', 'brand')
            .leftJoinAndSelect('product.medias', 'medias')
            .leftJoinAndSelect('product.variants', 'variants')
            .where('product.deletedAt IS NULL')
            .andWhere('product.id IN (:...productIds)', { productIds })
            .getMany()
        : [];

    const favoriteMap = new Map(
      data.map((favorite) => [favorite.productId, favorite.createdAt]),
    );

    const items = productIds
      .map((productId) => {
        const product = products.find((item) => item.id === productId);

        if (!product) {
          return null;
        }

        return {
          ...product,
          favoritedAt: favoriteMap.get(productId),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async ensureProductExists(productId: string): Promise<void> {
    const exists =
      (await this.productRepository.count({
        where: { id: productId },
      })) > 0;

    if (!exists) {
      throw new NotFoundException('محصول موردنظر یافت نشد');
    }
  }
}
