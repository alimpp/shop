import type { TCategory } from "../types/index.type";

export class CategoryModel implements TCategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  children?: CategoryModel[];
  createdAt?: string;
  updatedAt?: string;

  constructor(data?: Partial<TCategory>) {
    this.id = data?.id ?? "";
    this.name = data?.name ?? "";
    this.slug = data?.slug ?? "";
    this.description = data?.description ?? "";
    this.image = data?.image ?? "";
    this.parentId = data?.parentId ?? "";
    this.isActive = data?.isActive ?? true;
    this.sortOrder = data?.sortOrder ?? 0;
    this.children = data?.children?.map((child) => new CategoryModel(child)) ?? [];
    this.createdAt = data?.createdAt ?? "";
    this.updatedAt = data?.updatedAt ?? "";
  }

  static empty(): CategoryModel {
    return new CategoryModel();
  }
}
