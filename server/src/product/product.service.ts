import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { Category } from '../categories/entities/categories.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AttributeValue } from './entities/attribute-value.entity';
import { Attribute } from './entities/attribute.entity';
import { Brand } from './entities/brand.entity';
import { ProductMedia } from './entities/product-media.entity';
import { ProductOptionValue } from './entities/product-option-value.entity';
import { ProductOption } from './entities/product-option.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Product } from './entities/product.entity';
import { MediaType } from './enums/media-type.enum';
import { ProductStatus } from './enums/product-status.enum';

@Injectable()
export class ProductService {
  private readonly sortableFields = new Set([
    'createdAt',
    'updatedAt',
    'name',
    'price',
    'status',
    'stock',
    'soldCount',
    'viewCount',
  ]);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,

    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,

    @InjectRepository(AttributeValue)
    private readonly attributeValueRepository: Repository<AttributeValue>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    await this.ensureCategoryExists(dto.categoryId);
    await this.ensureBrandExists(dto.brandId);
    this.ensureValidSalePrice(dto.price, dto.salePrice, 'محصول');
    this.ensureValidVariantSalePrices(dto.variants);

    const slug = await this.ensureUniqueSlug(dto.slug);
    await this.ensureUniqueSku(dto.sku);
    await this.ensureUniqueVariantSkus(dto.variants);

    const { medias = [], variants = [], options = [], ...productData } = dto;

    const savedProduct = await this.productRepository.manager.transaction(
      async (manager) => {
        const product = manager.create(Product, {
          ...productData,
          slug,
        });

        const createdProduct = await manager.save(Product, product);

        await this.replaceProductMedias(
          createdProduct.id,
          medias,
          manager.getRepository(ProductMedia),
        );

        await this.replaceProductVariants(
          createdProduct.id,
          variants,
          manager.getRepository(ProductVariant),
        );

        await this.replaceProductOptions(
          createdProduct.id,
          options,
          manager.getRepository(ProductOption),
          manager.getRepository(ProductOptionValue),
        );

        return createdProduct;
      },
    );

    return this.findOne(savedProduct.id);
  }

  async findAll(query: QueryProductDto) {
    const {
      search,
      categoryId,
      brandId,
      attributeValueIds = [],
      status,
      sortBy,
      sortOrder,
    } = query;

    const minPrice = this.parseNumber(query.minPrice, 'minPrice');
    const maxPrice = this.parseNumber(query.maxPrice, 'maxPrice');
    const isActive = this.parseBoolean(query.isActive, 'isActive');
    const isFeatured = this.parseBoolean(query.isFeatured, 'isFeatured');
    const page = this.parseNumber(query.page ?? 1, 'page', 1) ?? 1;
    const limit = this.parseNumber(query.limit ?? 20, 'limit', 1, 100) ?? 20;
    const safeSortBy = this.normalizeSortBy(sortBy);
    const safeSortOrder = this.normalizeSortOrder(sortOrder);

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.medias', 'medias')
      .leftJoinAndSelect('product.variants', 'variants')
      .where('product.deletedAt IS NULL');

    if (search) {
      qb.andWhere(
        `
        product.name ILIKE :search
        OR product.sku ILIKE :search
        `,
        {
          search: `%${search}%`,
        },
      );
    }

    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId,
      });
    }

    if (brandId) {
      qb.andWhere('product.brandId = :brandId', {
        brandId,
      });
    }

    if (status) {
      qb.andWhere('product.status = :status', {
        status,
      });
    }

    if (typeof isActive !== 'undefined') {
      qb.andWhere('product.isActive = :isActive', {
        isActive,
      });
    }

    if (typeof isFeatured !== 'undefined') {
      qb.andWhere('product.isFeatured = :isFeatured', {
        isFeatured,
      });
    }

    if (typeof minPrice !== 'undefined') {
      qb.andWhere('product.price >= :minPrice', {
        minPrice,
      });
    }

    if (typeof maxPrice !== 'undefined') {
      qb.andWhere('product.price <= :maxPrice', {
        maxPrice,
      });
    }

    await this.applyAttributeValueFilters(qb, 'product', attributeValueIds);

    qb.orderBy(`product.${safeSortBy}`, safeSortOrder);
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      items: data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getFilters(query: QueryProductDto) {
    const {
      search,
      categoryId,
      brandId,
      attributeValueIds = [],
      status,
    } = query;

    const minPrice = this.parseNumber(query.minPrice, 'minPrice');
    const maxPrice = this.parseNumber(query.maxPrice, 'maxPrice');
    const isActive = this.parseBoolean(query.isActive, 'isActive');
    const isFeatured = this.parseBoolean(query.isFeatured, 'isFeatured');

    const qb = this.attributeRepository
      .createQueryBuilder('attribute')
      .innerJoin('attribute.values', 'value', 'value.deletedAt IS NULL')
      .innerJoin(ProductOption, 'po', 'po.attributeId = attribute.id')
      .innerJoin(
        ProductOptionValue,
        'pov',
        'pov.productOptionId = po.id AND pov.attributeValueId = value.id',
      )
      .innerJoin(Product, 'product', 'product.id = po.productId')
      .where('attribute.deletedAt IS NULL')
      .andWhere('product.deletedAt IS NULL')
      .distinct(true);

    if (search) {
      qb.andWhere(
        `
        product.name ILIKE :search
        OR product.sku ILIKE :search
        `,
        {
          search: `%${search}%`,
        },
      );
    }

    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId,
      });
    }

    if (brandId) {
      qb.andWhere('product.brandId = :brandId', {
        brandId,
      });
    }

    if (status) {
      qb.andWhere('product.status = :status', {
        status,
      });
    }

    if (typeof isActive !== 'undefined') {
      qb.andWhere('product.isActive = :isActive', {
        isActive,
      });
    }

    if (typeof isFeatured !== 'undefined') {
      qb.andWhere('product.isFeatured = :isFeatured', {
        isFeatured,
      });
    }

    if (typeof minPrice !== 'undefined') {
      qb.andWhere('product.price >= :minPrice', {
        minPrice,
      });
    }

    if (typeof maxPrice !== 'undefined') {
      qb.andWhere('product.price <= :maxPrice', {
        maxPrice,
      });
    }

    await this.applyAttributeValueFilters(qb, 'product', attributeValueIds);

    qb.select([
      'attribute.id AS "attributeId"',
      'attribute.name AS "attributeName"',
      'attribute.slug AS "attributeSlug"',
      'attribute.isFilterable AS "attributeIsFilterable"',
      'attribute.sortOrder AS "attributeSortOrder"',
      'value.id AS "valueId"',
      'value.attributeId AS "valueAttributeId"',
      'value.value AS "valueValue"',
      'value.slug AS "valueSlug"',
      'value.sortOrder AS "valueSortOrder"',
    ]);

    qb.orderBy('attribute.sortOrder', 'ASC');
    qb.addOrderBy('value.sortOrder', 'ASC');
    const rows = await qb.getRawMany<{
      attributeId: string;
      attributeName: string;
      attributeSlug: string;
      attributeIsFilterable: boolean;
      attributeSortOrder: number;
      valueId: string;
      valueAttributeId: string;
      valueValue: string;
      valueSlug: string;
      valueSortOrder: number;
    }>();

    const map = new Map<
      string,
      {
        id: string;
        name: string;
        slug: string;
        isFilterable: boolean;
        sortOrder: number;
        values: Array<{
          id: string;
          attributeId: string;
          value: string;
          slug: string;
          sortOrder: number;
        }>;
      }
    >();

    for (const row of rows) {
      if (!row.attributeId || !row.valueId) {
        continue;
      }

      const existing = map.get(row.attributeId);
      if (!existing) {
        map.set(row.attributeId, {
          id: row.attributeId,
          name: row.attributeName ?? '',
          slug: row.attributeSlug ?? '',
          isFilterable: Boolean(row.attributeIsFilterable),
          sortOrder: Number(row.attributeSortOrder ?? 0) || 0,
          values: [
            {
              id: row.valueId,
              attributeId: row.valueAttributeId ?? row.attributeId,
              value: row.valueValue ?? '',
              slug: row.valueSlug ?? '',
              sortOrder: Number(row.valueSortOrder ?? 0) || 0,
            },
          ],
        });
        continue;
      }

      if (existing.values.some((value) => value.id === row.valueId)) {
        continue;
      }

      existing.values.push({
        id: row.valueId,
        attributeId: row.valueAttributeId ?? row.attributeId,
        value: row.valueValue ?? '',
        slug: row.valueSlug ?? '',
        sortOrder: Number(row.valueSortOrder ?? 0) || 0,
      });
    }

    const data = Array.from(map.values())
      .filter((attribute) => attribute.values.length > 0)
      .map((attribute) => ({
        ...attribute,
        values: attribute.values.sort(
          (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
        ),
      }))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    return {
      data,
    };
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: {
        id,
      },
      relations: {
        category: true,
        brand: true,
        medias: true,
        variants: {
          values: {
            attributeValue: {
              attribute: true,
            },
          },
        },
        options: {
          attribute: true,
          values: {
            attributeValue: true,
          },
        },
        productTags: {
          tag: true,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.productRepository.findOne({
      where: {
        slug,
      },
      relations: {
        category: true,
        brand: true,
        medias: true,
        variants: {
          values: {
            attributeValue: {
              attribute: true,
            },
          },
        },
        options: {
          attribute: true,
          values: {
            attributeValue: true,
          },
        },
        productTags: {
          tag: true,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const existingProduct = await this.productRepository.findOne({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    if (typeof dto.brandId !== 'undefined') {
      await this.ensureBrandExists(dto.brandId);
    }

    if (dto.slug) {
      dto.slug = await this.ensureUniqueSlug(dto.slug, id);
    }

    if (dto.sku) {
      await this.ensureUniqueSku(dto.sku, id);
    }

    this.ensureValidSalePrice(
      dto.price ?? Number(existingProduct.price),
      typeof dto.salePrice === 'undefined'
        ? existingProduct.salePrice
        : dto.salePrice,
      'محصول',
    );
    this.ensureValidVariantSalePrices(dto.variants);

    await this.ensureUniqueVariantSkus(dto.variants, id);

    const { medias, variants, options, ...productData } = dto;

    await this.productRepository.manager.transaction(async (manager) => {
      if (Object.keys(productData).length > 0) {
        await manager.update(Product, id, productData);
      }

      if (typeof medias !== 'undefined') {
        await this.replaceProductMedias(
          id,
          medias,
          manager.getRepository(ProductMedia),
        );
      }

      if (typeof variants !== 'undefined') {
        await this.replaceProductVariants(
          id,
          variants,
          manager.getRepository(ProductVariant),
        );
      }

      if (typeof options !== 'undefined') {
        await this.replaceProductOptions(
          id,
          options,
          manager.getRepository(ProductOption),
          manager.getRepository(ProductOptionValue),
        );
      }
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    await this.productRepository.softRemove(product);

    return {
      message: 'Product deleted successfully',
    };
  }

  async restore(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.restore(id);

    return {
      message: 'Product restored successfully',
    };
  }

  async changeStatus(id: string, status: ProductStatus) {
    const product = await this.findOne(id);

    product.status = status;

    if (status === ProductStatus.PUBLISHED && !product.publishedAt) {
      product.publishedAt = new Date();
    }

    return this.productRepository.save(product);
  }

  private async ensureCategoryExists(categoryId: string): Promise<void> {
    const exists = await this.categoryRepository.exists({
      where: { id: categoryId },
    });

    if (!exists) {
      throw new NotFoundException('Category not found');
    }
  }

  private async ensureBrandExists(brandId?: string): Promise<void> {
    if (!brandId) {
      return;
    }

    const exists = await this.brandRepository.exists({
      where: { id: brandId },
    });

    if (!exists) {
      throw new NotFoundException('Brand not found');
    }
  }

  private async ensureUniqueSlug(
    value: string,
    ignoreProductId?: string,
  ): Promise<string> {
    const slug = slugify(value, {
      lower: true,
      strict: true,
      trim: true,
    });

    if (!slug) {
      throw new BadRequestException('Product slug is invalid');
    }

    const existingProduct = await this.productRepository.findOne({
      where: { slug },
      withDeleted: true,
    });

    if (existingProduct && existingProduct.id !== ignoreProductId) {
      throw new BadRequestException('Product slug already exists');
    }

    return slug;
  }

  private async ensureUniqueSku(
    sku: string,
    ignoreProductId?: string,
  ): Promise<void> {
    const existingProduct = await this.productRepository.findOne({
      where: { sku },
      withDeleted: true,
    });

    if (existingProduct && existingProduct.id !== ignoreProductId) {
      throw new BadRequestException('Product sku already exists');
    }
  }

  private async ensureUniqueVariantSkus(
    variants?: UpdateProductDto['variants'],
    productId?: string,
  ): Promise<void> {
    if (!variants || variants.length === 0) {
      return;
    }

    const seenSkus = new Set<string>();

    for (const variant of variants) {
      if (seenSkus.has(variant.sku)) {
        throw new BadRequestException(`Duplicate variant sku: ${variant.sku}`);
      }

      seenSkus.add(variant.sku);
    }

    const existingVariants = await this.productVariantRepository.find({
      where: variants.map((variant) => ({
        sku: variant.sku,
      })),
      withDeleted: true,
    });

    const conflictingVariant = existingVariants.find(
      (variant) => variant.productId !== productId,
    );

    if (conflictingVariant) {
      throw new BadRequestException(
        `Variant sku already exists: ${conflictingVariant.sku}`,
      );
    }
  }

  private async replaceProductMedias(
    productId: string,
    medias: CreateProductDto['medias'],
    mediaRepository: Repository<ProductMedia>,
  ): Promise<void> {
    await mediaRepository.delete({ productId });

    if (!medias || medias.length === 0) {
      return;
    }

    const createdMedias = medias.map((url, index) =>
      mediaRepository.create({
        type: MediaType.IMAGE,
        url,
        isThumbnail: index === 0,
        sortOrder: index,
        productId,
      }),
    );

    await mediaRepository.save(createdMedias);
  }

  private async replaceProductVariants(
    productId: string,
    variants: CreateProductDto['variants'],
    variantRepository: Repository<ProductVariant>,
  ): Promise<void> {
    await variantRepository.delete({ productId });

    if (!variants || variants.length === 0) {
      return;
    }

    const defaultVariantCount = variants.filter(
      (variant) => variant.isDefault === true,
    ).length;

    if (defaultVariantCount > 1) {
      throw new BadRequestException('Only one default variant is allowed');
    }

    this.ensureValidVariantSalePrices(variants);

    const hasExplicitDefault = variants.some(
      (variant) => variant.isDefault === true,
    );
    const createdVariants = variants.map((variant, index) =>
      variantRepository.create({
        ...variant,
        isDefault:
          typeof variant.isDefault === 'boolean'
            ? variant.isDefault
            : !hasExplicitDefault && index === 0,
        productId,
      }),
    );

    await variantRepository.save(createdVariants);
  }

  private async replaceProductOptions(
    productId: string,
    options: CreateProductDto['options'],
    optionRepository: Repository<ProductOption>,
    optionValueRepository: Repository<ProductOptionValue>,
  ): Promise<void> {
    await optionRepository.delete({ productId });

    if (!options || options.length === 0) {
      return;
    }

    for (const option of options) {
      const attributeExists = await this.attributeRepository.exists({
        where: { id: option.attributeId },
      });

      if (!attributeExists) {
        throw new NotFoundException('ویژگی انتخاب‌شده یافت نشد');
      }

      const uniqueValueIds = Array.from(
        new Set((option.valueIds ?? []).filter(Boolean)),
      );

      if (uniqueValueIds.length === 0) {
        continue;
      }

      const attributeValues = await this.attributeValueRepository.find({
        where: {
          id: In(uniqueValueIds),
        },
      });

      if (attributeValues.length !== uniqueValueIds.length) {
        throw new BadRequestException('مقادیر ویژگی انتخاب‌شده معتبر نیستند');
      }

      const belongsToAttribute = attributeValues.every(
        (value) => value.attributeId === option.attributeId,
      );

      if (!belongsToAttribute) {
        throw new BadRequestException(
          'مقادیر ویژگی با ویژگی انتخاب‌شده همخوانی ندارند',
        );
      }
    }

    const createdOptions = options
      .map((option, index) => {
        const uniqueValueIds = Array.from(
          new Set((option.valueIds ?? []).filter(Boolean)),
        );

        if (!option.attributeId || uniqueValueIds.length === 0) {
          return null;
        }

        return optionRepository.create({
          productId,
          attributeId: option.attributeId,
          sortOrder: index,
          values: uniqueValueIds.map((valueId) =>
            optionValueRepository.create({
              attributeValueId: valueId,
            }),
          ),
        });
      })
      .filter((item): item is ProductOption => Boolean(item));

    if (createdOptions.length === 0) {
      return;
    }

    await optionRepository.save(createdOptions);
  }

  private parseBoolean(value: unknown, fieldName: string): boolean | undefined {
    if (typeof value === 'undefined') {
      return undefined;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      if (value === 'true') {
        return true;
      }

      if (value === 'false') {
        return false;
      }
    }

    throw new BadRequestException(`${fieldName} must be true or false`);
  }

  private async applyAttributeValueFilters(
    qb: SelectQueryBuilder<any>,
    productAlias: string,
    attributeValueIds?: string[],
  ): Promise<void> {
    const uniqueIds = Array.from(
      new Set((attributeValueIds ?? []).filter(Boolean)),
    );

    if (uniqueIds.length === 0) {
      return;
    }

    const values = await this.attributeValueRepository.find({
      where: {
        id: In(uniqueIds),
      },
    });

    if (values.length !== uniqueIds.length) {
      throw new BadRequestException('مقادیر ویژگی انتخاب‌شده معتبر نیستند');
    }

    const groupedByAttribute = new Map<string, string[]>();
    for (const value of values) {
      const list = groupedByAttribute.get(value.attributeId) ?? [];
      list.push(value.id);
      groupedByAttribute.set(value.attributeId, list);
    }

    let index = 0;
    for (const [attributeId, valueIds] of groupedByAttribute) {
      const attributeParam = `attributeId_${index}`;
      const valueIdsParam = `attributeValueIds_${index}`;

      qb.andWhere(
        (subQb) => {
          const subQuery = subQb
            .subQuery()
            .select('1')
            .from(ProductOption, 'po_filter')
            .innerJoin(
              ProductOptionValue,
              'pov_filter',
              'pov_filter.productOptionId = po_filter.id',
            )
            .where(`po_filter.productId = ${productAlias}.id`)
            .andWhere(`po_filter.attributeId = :${attributeParam}`)
            .andWhere(`pov_filter.attributeValueId IN (:...${valueIdsParam})`)
            .getQuery();

          return `EXISTS ${subQuery}`;
        },
        {
          [attributeParam]: attributeId,
          [valueIdsParam]: valueIds,
        },
      );

      index += 1;
    }
  }

  private parseNumber(
    value: unknown,
    fieldName: string,
    min?: number,
    max?: number,
  ): number | undefined {
    if (typeof value === 'undefined') {
      return undefined;
    }

    const parsedValue = typeof value === 'number' ? value : Number(value);

    if (Number.isNaN(parsedValue)) {
      throw new BadRequestException(`${fieldName} must be a valid number`);
    }

    if (typeof min !== 'undefined' && parsedValue < min) {
      throw new BadRequestException(
        `${fieldName} must be greater than or equal to ${min}`,
      );
    }

    if (typeof max !== 'undefined' && parsedValue > max) {
      throw new BadRequestException(
        `${fieldName} must be less than or equal to ${max}`,
      );
    }

    return parsedValue;
  }

  private normalizeSortBy(sortBy?: string): string {
    if (!sortBy) {
      return 'createdAt';
    }

    if (!this.sortableFields.has(sortBy)) {
      throw new BadRequestException('sortBy is invalid');
    }

    return sortBy;
  }

  private normalizeSortOrder(
    sortOrder?: QueryProductDto['sortOrder'],
  ): 'ASC' | 'DESC' {
    if (!sortOrder) {
      return 'DESC';
    }

    const normalizedSortOrder = sortOrder.toUpperCase();

    if (normalizedSortOrder !== 'ASC' && normalizedSortOrder !== 'DESC') {
      throw new BadRequestException('sortOrder is invalid');
    }

    return normalizedSortOrder;
  }

  private ensureValidSalePrice(
    price?: number,
    salePrice?: number,
    subject = 'آیتم',
  ): void {
    if (
      typeof price === 'number' &&
      typeof salePrice === 'number' &&
      salePrice > price
    ) {
      throw new BadRequestException(
        `قیمت تخفیف ${subject} نمی‌تواند بیشتر از قیمت اصلی باشد`,
      );
    }
  }

  private ensureValidVariantSalePrices(
    variants?: CreateProductDto['variants'],
  ): void {
    if (!variants?.length) {
      return;
    }

    for (const variant of variants) {
      this.ensureValidSalePrice(
        variant.price,
        variant.salePrice,
        `واریانت "${variant.name}"`,
      );
    }
  }
}
