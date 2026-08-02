import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { DataSource, Repository, TreeRepository } from 'typeorm';
import { CreateCategoryDto } from './dto/create.dto';
import { UpdateCategoryDto } from './dto/update.dto';
import { Category } from './entities/categories.entity';

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  parentId?: string;
  children: CategoryNode[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class CategoriesService {
  private readonly treeRepository: TreeRepository<Category>;

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    this.treeRepository = this.dataSource.getTreeRepository(Category);
  }

  async create(dto: CreateCategoryDto) {
    const slug = await this.generateSlug(dto.name);

    let parent: Category | null = null;
    if (dto.parentId) {
      parent = await this.categoryRepository.findOne({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('دسته‌بندی والد پیدا نشد');
      }
    }

    const { parentId, ...rest } = dto;
    const category = this.categoryRepository.create({
      ...rest,
      slug,
    });
    category.parent = parent;
    const savedCategory = await this.categoryRepository.save(category);
    const createdTree = await this.treeRepository.findDescendantsTree(savedCategory);

    return this.serializeCategory(createdTree, parent?.id);
  }

  async findAll() {
    const trees = await this.treeRepository.findTrees();
    const serializedTrees = trees.map((tree) => this.serializeCategory(tree));
    const items = this.flattenCategories(serializedTrees);

    return {
      items,
      total: items.length,
    };
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const [ancestorsChain, descendantsTree] = await Promise.all([
      this.treeRepository.findAncestorsTree(category),
      this.treeRepository.findDescendantsTree(category),
    ]);

    return {
      ...this.serializeCategory(descendantsTree),
      ancestors: this.flattenAncestors(ancestorsChain).map((ancestor) =>
        this.serializeCategory(ancestor),
      ),
    };
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('یک دسته‌بندی نمی‌تواند والد خودش باشد');
      }

      const parent = await this.categoryRepository.findOne({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('دسته‌بندی والد پیدا نشد');
      }

      const descendants = await this.treeRepository.findDescendants(category);
      if (descendants.some((d) => d.id === parent.id)) {
        throw new BadRequestException(
          'دسته‌بندی والد نمی‌تواند یکی از زیرمجموعه‌های همین دسته‌بندی باشد',
        );
      }

      category.parent = parent;
      category.parentId = parent.id;
    } else if (dto.parentId === undefined) {
      category.parent = category.parent ?? null;
    } else {
      category.parent = null;
      category.parentId = undefined;
    }

    if (dto.name) {
      category.slug = await this.generateSlug(dto.name);
    }

    const { parentId, ...rest } = dto;
    Object.assign(category, rest);

    const updatedCategory = await this.categoryRepository.save(category);
    const updatedTree =
      await this.treeRepository.findDescendantsTree(updatedCategory);

    return this.serializeCategory(updatedTree, updatedCategory.parentId);
  }

  async remove(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const descendantsCount =
      await this.treeRepository.countDescendants(category);
    if (descendantsCount > 1) {
      throw new BadRequestException(
        'این دسته‌بندی دارای زیرمجموعه است و قابل حذف نیست',
      );
    }

    await this.categoryRepository.remove(category);
    return {
      message: 'Category deleted successfully',
    };
  }

  private flattenAncestors(node: Category): Category[] {
    const chain: Category[] = [];
    let current = node.parent;
    while (current) {
      chain.unshift(current);
      current = current.parent;
    }
    return chain;
  }

  private serializeCategory(
    category: Category,
    parentId?: string | null,
  ): CategoryNode {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      parentId: (parentId ?? category.parentId) || undefined,
      children: (category.children ?? []).map((child) =>
        this.serializeCategory(child, category.id),
      ),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  private flattenCategories(categories: CategoryNode[]): CategoryNode[] {
    return categories.flatMap((category) => [
      category,
      ...this.flattenCategories(category.children),
    ]);
  }

  private async generateSlug(name: string): Promise<string> {
    const baseSlug = slugify(name, {
      lower: true,
      strict: true,
      trim: true,
    });
    let slug = baseSlug;
    let counter = 1;
    while (
      await this.categoryRepository.exists({
        where: { slug },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    return slug;
  }
}
