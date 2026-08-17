import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { ProductVariant } from '../product/entities/product-variant.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItem } from './entities/cart-item.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getCart(userId: string) {
    const items = await this.cartItemRepository.find({
      where: { userId },
      order: { updated_at: 'DESC' },
    });

    return this.buildCartResponse(items);
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const product = await this.findActiveProduct(dto.productId);
    const variant = await this.resolveVariantForAdd(product, dto.variantId);
    const lineKey = this.buildLineKey(product.id, variant?.id ?? null);
    const nextQuantity = dto.quantity;

    const existing = await this.cartItemRepository.findOne({
      where: { userId, lineKey },
    });

    const targetQuantity = existing
      ? existing.quantity + nextQuantity
      : nextQuantity;

    if (variant) {
      this.ensureVariantStock(variant, targetQuantity);
    } else {
      this.ensureProductStock(product, targetQuantity);
    }

    if (existing) {
      existing.quantity = targetQuantity;
      await this.cartItemRepository.save(existing);
    } else {
      await this.cartItemRepository.save(
        this.cartItemRepository.create({
          userId,
          productId: product.id,
          variantId: variant?.id ?? null,
          lineKey,
          quantity: nextQuantity,
        }),
      );
    }

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const item = await this.getOwnedItem(userId, itemId);

    if (item.variantId) {
      const variant = await this.findActiveVariant(item.variantId);
      this.ensureVariantStock(variant, dto.quantity);
    } else {
      const product = await this.findActiveProduct(item.productId);
      this.ensureProductStock(product, dto.quantity);
    }

    item.quantity = dto.quantity;
    await this.cartItemRepository.save(item);

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.getOwnedItem(userId, itemId);
    await this.cartItemRepository.delete(item.id);
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    await this.cartItemRepository.delete({ userId });
    return {
      items: [],
      totalQuantity: 0,
      totalPrice: 0,
      itemCount: 0,
    };
  }

  private buildLineKey(productId: string, variantId: string | null): string {
    return variantId ?? `p:${productId}`;
  }

  private async getOwnedItem(userId: string, itemId: string) {
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('آیتم سبد خرید یافت نشد');
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('دسترسی به این آیتم مجاز نیست');
    }

    return item;
  }

  private async findActiveProduct(productId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: {
        variants: true,
        medias: true,
      },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException('محصول موردنظر یافت نشد');
    }

    if (!product.isActive) {
      throw new BadRequestException('این محصول غیرفعال است');
    }

    return product;
  }

  private async resolveVariantForAdd(
    product: Product,
    variantId?: string,
  ): Promise<ProductVariant | null> {
    const activeVariants = (product.variants || []).filter(
      (variant) => variant.isActive && !variant.deletedAt,
    );

    if (!activeVariants.length) {
      if (variantId) {
        throw new BadRequestException('این محصول وریانت فعالی ندارد');
      }
      return null;
    }

    if (variantId) {
      const matched = activeVariants.find((variant) => variant.id === variantId);
      if (!matched) {
        throw new BadRequestException('وریانت متعلق به این محصول نیست');
      }
      return this.findActiveVariant(matched.id);
    }

    const defaultVariant =
      activeVariants.find((variant) => variant.isDefault) ?? activeVariants[0];

    return this.findActiveVariant(defaultVariant.id);
  }

  private async findActiveVariant(variantId: string) {
    const variant = await this.variantRepository.findOne({
      where: { id: variantId },
      relations: {
        product: true,
        values: {
          attributeValue: {
            attribute: true,
          },
        },
      },
    });

    if (!variant || variant.deletedAt) {
      throw new NotFoundException('وریانت موردنظر یافت نشد');
    }

    if (!variant.isActive) {
      throw new BadRequestException('این وریانت غیرفعال است');
    }

    if (!variant.product || variant.product.deletedAt) {
      throw new NotFoundException('محصول مربوط به این وریانت یافت نشد');
    }

    return variant;
  }

  private ensureVariantStock(variant: ProductVariant, quantity: number) {
    if (!variant.manageStock || variant.allowBackorder) {
      return;
    }

    if (quantity > variant.stock) {
      throw new BadRequestException(
        `موجودی کافی نیست. حداکثر قابل سفارش: ${variant.stock}`,
      );
    }
  }

  private ensureProductStock(product: Product, quantity: number) {
    if (!product.manageStock || product.allowBackorder) {
      return;
    }

    if (quantity > product.stock) {
      throw new BadRequestException(
        `موجودی کافی نیست. حداکثر قابل سفارش: ${product.stock}`,
      );
    }
  }

  private async buildCartResponse(items: CartItem[]) {
    if (!items.length) {
      return {
        items: [],
        totalQuantity: 0,
        totalPrice: 0,
        itemCount: 0,
      };
    }

    const variantIds = [
      ...new Set(
        items
          .map((item) => item.variantId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const productIds = [...new Set(items.map((item) => item.productId))];

    const variants = variantIds.length
      ? await this.variantRepository
          .createQueryBuilder('variant')
          .leftJoinAndSelect('variant.values', 'values')
          .leftJoinAndSelect('values.attributeValue', 'attributeValue')
          .leftJoinAndSelect('attributeValue.attribute', 'attribute')
          .where('variant.id IN (:...variantIds)', { variantIds })
          .getMany()
      : [];

    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.medias', 'medias')
      .where('product.id IN (:...productIds)', { productIds })
      .orderBy('medias.sortOrder', 'ASC')
      .getMany();

    const variantMap = new Map(variants.map((variant) => [variant.id, variant]));
    const productMap = new Map(products.map((product) => [product.id, product]));

    let totalQuantity = 0;
    let totalPrice = 0;

    const mappedItems = items
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product) {
          return null;
        }

        const variant = item.variantId
          ? variantMap.get(item.variantId)
          : undefined;

        if (item.variantId && !variant) {
          return null;
        }

        const unitPrice = variant
          ? this.toNumber(variant.salePrice ?? variant.price)
          : this.toNumber(product.salePrice ?? product.price);
        const lineTotal = unitPrice * item.quantity;

        totalQuantity += item.quantity;
        totalPrice += lineTotal;

        const thumbnail =
          variant?.image ||
          product.medias?.find((media) => media.isThumbnail)?.url ||
          product.medias?.[0]?.url ||
          '';

        return {
          id: item.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice,
          lineTotal,
          created_at: item.created_at,
          updated_at: item.updated_at,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            image: thumbnail,
          },
          variant: variant
            ? {
                id: variant.id,
                name: variant.name,
                sku: variant.sku,
                price: this.toNumber(variant.price),
                salePrice:
                  variant.salePrice != null
                    ? this.toNumber(variant.salePrice)
                    : null,
                stock: variant.stock,
                image: variant.image || null,
                options: (variant.values || []).map((value) => ({
                  attributeId: value.attributeValue?.attributeId,
                  attributeName: value.attributeValue?.attribute?.name ?? '',
                  valueId: value.attributeValueId,
                  value: value.attributeValue?.value ?? '',
                })),
              }
            : null,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return {
      items: mappedItems,
      totalQuantity,
      totalPrice: Number(totalPrice.toFixed(2)),
      itemCount: mappedItems.length,
    };
  }

  private toNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
