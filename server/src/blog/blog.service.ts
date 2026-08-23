import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { In, Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { ProductStatus } from '../product/enums/product-status.enum';
import { CreateBlogDto } from './dto/create-blog.dto';
import { QueryBlogDto } from './dto/query-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogSection } from './entities/blog-section.entity';
import { Blog } from './entities/blog.entity';
import { BlogStatus } from './enums/blog-status.enum';

@Injectable()
export class BlogService {
  private readonly sortableFields = new Set([
    'createdAt',
    'updatedAt',
    'publishedAt',
    'title',
    'viewCount',
  ]);

  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,

    @InjectRepository(BlogSection)
    private readonly blogSectionRepository: Repository<BlogSection>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(dto: CreateBlogDto): Promise<Blog> {
    const slug = await this.ensureUniqueSlug(dto.slug ?? dto.title);

    const { sections = [], productIds, ...blogData } = dto;

    const products = await this.ensureProductsExist(productIds);

    const savedBlog = await this.blogRepository.manager.transaction(
      async (manager) => {
        const blog = manager.create(Blog, {
          ...blogData,
          slug,
        });

        if (products.length > 0) {
          blog.products = products;
        }

        const createdBlog = await manager.save(Blog, blog);

        await this.replaceSections(
          createdBlog.id,
          sections,
          manager.getRepository(BlogSection),
        );

        return createdBlog;
      },
    );

    return this.findOne(savedBlog.id);
  }

  async findAll(query: QueryBlogDto) {
    const { search, status, productIds } = query;

    const isActive = this.parseBoolean(query.isActive, 'isActive');
    const isFeatured = this.parseBoolean(query.isFeatured, 'isFeatured');
    const page = this.parseNumber(query.page ?? 1, 'page', 1) ?? 1;
    const limit = this.parseNumber(query.limit ?? 20, 'limit', 1, 100) ?? 20;
    const safeSortBy = this.normalizeSortBy(query.sortBy);
    const safeSortOrder = this.normalizeSortOrder(query.sortOrder);

    const qb = this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.sections', 'sections')
      .leftJoinAndSelect('blog.products', 'products')
      .where('blog.deletedAt IS NULL');

    if (search) {
      qb.andWhere(
        `
        blog.title ILIKE :search
        OR blog.summary ILIKE :search
        `,
        {
          search: `%${search}%`,
        },
      );
    }

    if (status) {
      qb.andWhere('blog.status = :status', {
        status,
      });
    }

    if (typeof isActive !== 'undefined') {
      qb.andWhere('blog.isActive = :isActive', {
        isActive,
      });
    }

    if (typeof isFeatured !== 'undefined') {
      qb.andWhere('blog.isFeatured = :isFeatured', {
        isFeatured,
      });
    }

    if (productIds && productIds.length > 0) {
      const uniqueProductIds = Array.from(new Set(productIds.filter(Boolean)));

      if (uniqueProductIds.length > 0) {
        await this.ensureProductsExist(uniqueProductIds);

        qb.andWhere(
          (subQb) => {
            const subQuery = subQb
              .subQuery()
              .select('1')
              .from('blog_products', 'bp_filter')
              .where('bp_filter.blogId = blog.id')
              .andWhere('bp_filter.productId IN (:...productIds)')
              .getQuery();

            return `EXISTS ${subQuery}`;
          },
          {
            productIds: uniqueProductIds,
          },
        );
      }
    }

    qb.orderBy(`blog.${safeSortBy}`, safeSortOrder);
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllPublic(query: QueryBlogDto) {
    return this.findAll({
      ...query,
      status: BlogStatus.PUBLISHED,
      isActive: true,
      sortBy: query.sortBy ?? 'publishedAt',
      sortOrder: query.sortOrder ?? 'DESC',
    });
  }

  async findBySlug(slug: string) {
    const blog = await this.blogRepository.findOne({
      where: {
        slug,
        status: BlogStatus.PUBLISHED,
        isActive: true,
      },
      relations: {
        sections: true,
        products: {
          medias: true,
          brand: true,
          category: true,
        },
      },
    });

    if (!blog) {
      throw new NotFoundException('بلاگ یافت نشد');
    }

    blog.sections = (blog.sections ?? []).sort(
      (left, right) => left.sortOrder - right.sortOrder,
    );

    blog.viewCount += 1;
    await this.blogRepository.save(blog);

    const products = await this.enrichBlogProducts(blog);
    const relatedBlogs = await this.findRelatedBlogs(blog.id, 4);

    return {
      blog: this.mapPublicBlogDetail(blog, products),
      relatedBlogs: relatedBlogs.map((item) => this.mapPublicBlogCard(item)),
    };
  }

  private async findRelatedBlogs(excludeId: string, limit = 4) {
    return this.blogRepository
      .createQueryBuilder('blog')
      .where('blog.deletedAt IS NULL')
      .andWhere('blog.status = :status', { status: BlogStatus.PUBLISHED })
      .andWhere('blog.isActive = true')
      .andWhere('blog.id != :excludeId', { excludeId })
      .orderBy('RANDOM()')
      .take(limit)
      .getMany();
  }

  private async enrichBlogProducts(blog: Blog): Promise<Product[]> {
    const linked = (blog.products ?? []).filter((product) => !product.deletedAt);
    const targetCount = 4;

    if (linked.length >= targetCount) {
      return linked.slice(0, targetCount);
    }

    const excludeIds = linked.map((product) => product.id);
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.medias', 'medias')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.deletedAt IS NULL')
      .andWhere('product.status = :status', {
        status: ProductStatus.PUBLISHED,
      })
      .andWhere('product.isActive = true');

    if (excludeIds.length > 0) {
      qb.andWhere('product.id NOT IN (:...excludeIds)', { excludeIds });
    }

    const extra = await qb.orderBy('RANDOM()').take(targetCount - linked.length).getMany();

    return [...linked, ...extra];
  }

  private mapPublicBlogCard(blog: Blog) {
    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      summary: blog.summary,
      coverImage: blog.coverImage,
      isFeatured: blog.isFeatured,
      viewCount: blog.viewCount,
      publishedAt: blog.publishedAt,
      readingMinutes: this.estimateReadingMinutes(blog),
    };
  }

  private mapPublicBlogDetail(blog: Blog, products: Product[]) {
    return {
      ...this.mapPublicBlogCard(blog),
      metaTitle: blog.metaTitle,
      metaDescription: blog.metaDescription,
      keywords: blog.keywords,
      canonical: blog.canonical,
      ogImage: blog.ogImage,
      sections: (blog.sections ?? []).map((section) => ({
        id: section.id,
        title: section.title,
        description: section.description,
        imageUrl: section.imageUrl ?? null,
        sortOrder: section.sortOrder,
      })),
      products: products.map((product) => this.mapPublicBlogProduct(product)),
    };
  }

  private mapPublicBlogProduct(product: Product) {
    const thumbnail =
      product.medias?.find((media) => media.isThumbnail) ?? product.medias?.[0];

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      salePrice:
        product.salePrice === null || typeof product.salePrice === 'undefined'
          ? null
          : Number(product.salePrice),
      image: thumbnail?.url ?? null,
      brand: product.brand
        ? {
            id: product.brand.id,
            name: product.brand.name,
            slug: product.brand.slug,
          }
        : null,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
          }
        : null,
    };
  }

  private estimateReadingMinutes(blog: Blog): number {
    const sectionsText = (blog.sections ?? [])
      .map((section) => `${section.title} ${section.description}`)
      .join(' ');
    const words = `${blog.title} ${blog.summary} ${sectionsText}`
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    return Math.max(3, Math.ceil(words / 180));
  }

  async findOne(id: string) {
    const blog = await this.blogRepository.findOne({
      where: {
        id,
      },
      relations: {
        sections: true,
        products: true,
      },
    });

    if (!blog) {
      throw new NotFoundException('بلاگ یافت نشد');
    }

    blog.sections = (blog.sections ?? []).sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );

    return blog;
  }

  async update(id: string, dto: UpdateBlogDto) {
    const existingBlog = await this.blogRepository.findOne({
      where: { id },
    });

    if (!existingBlog) {
      throw new NotFoundException('بلاگ یافت نشد');
    }

    if (dto.slug) {
      dto.slug = await this.ensureUniqueSlug(dto.slug, id);
    }

    const { sections, productIds, ...blogData } = dto;

    let products: Product[] | undefined;

    if (typeof productIds !== 'undefined') {
      products = await this.ensureProductsExist(productIds);
    }

    await this.blogRepository.manager.transaction(async (manager) => {
      if (Object.keys(blogData).length > 0) {
        await manager.update(Blog, id, blogData);
      }

      if (typeof sections !== 'undefined') {
        await this.replaceSections(
          id,
          sections,
          manager.getRepository(BlogSection),
        );
      }

      if (typeof products !== 'undefined') {
        const blog = await manager.findOne(Blog, {
          where: { id },
          relations: { products: true },
        });

        if (blog) {
          blog.products = products;
          await manager.save(Blog, blog);
        }
      }
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    const blog = await this.findOne(id);

    await this.blogRepository.softRemove(blog);

    return {
      message: 'بلاگ با موفقیت حذف شد',
    };
  }

  async restore(id: string) {
    const blog = await this.blogRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!blog) {
      throw new NotFoundException('بلاگ یافت نشد');
    }

    await this.blogRepository.restore(id);

    return {
      message: 'بلاگ با موفقیت بازیابی شد',
    };
  }

  async changeStatus(id: string, status: BlogStatus) {
    const blog = await this.findOne(id);

    blog.status = status;

    if (status === BlogStatus.PUBLISHED && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }

    return this.blogRepository.save(blog);
  }

  async incrementViewCount(id: string) {
    const blog = await this.blogRepository.findOne({
      where: { id },
    });

    if (!blog) {
      throw new NotFoundException('بلاگ یافت نشد');
    }

    blog.viewCount += 1;

    return this.blogRepository.save(blog);
  }

  private async ensureUniqueSlug(
    value: string,
    ignoreBlogId?: string,
  ): Promise<string> {
    const slug = slugify(value, {
      lower: true,
      strict: true,
      trim: true,
    });

    if (!slug) {
      throw new BadRequestException('اسلاگ بلاگ نامعتبر است');
    }

    const existingBlog = await this.blogRepository.findOne({
      where: { slug },
      withDeleted: true,
    });

    if (existingBlog && existingBlog.id !== ignoreBlogId) {
      throw new BadRequestException('اسلاگ بلاگ قبلاً استفاده شده است');
    }

    return slug;
  }

  private async ensureProductsExist(productIds?: string[]): Promise<Product[]> {
    const uniqueIds = Array.from(new Set((productIds ?? []).filter(Boolean)));

    if (uniqueIds.length === 0) {
      return [];
    }

    const products = await this.productRepository.find({
      where: {
        id: In(uniqueIds),
      },
    });

    if (products.length !== uniqueIds.length) {
      throw new NotFoundException('یکی از محصولات انتخاب‌شده یافت نشد');
    }

    return products;
  }

  private async replaceSections(
    blogId: string,
    sections: CreateBlogDto['sections'],
    sectionRepository: Repository<BlogSection>,
  ): Promise<void> {
    await sectionRepository.delete({ blogId });

    if (!sections || sections.length === 0) {
      return;
    }

    const createdSections = sections.map((section, index) =>
      sectionRepository.create({
        ...section,
        sortOrder: index,
        blogId,
      }),
    );

    await sectionRepository.save(createdSections);
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
    sortOrder?: QueryBlogDto['sortOrder'],
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
}
