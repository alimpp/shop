import type { ServerResponse } from "~/types/common";

import { BaseApp } from "~/core/BaseApp";

import type {
  TCategory,
  TCategoryListData,
  TCategoryListQuery,
  TCategoryPayload
} from "../types/index.type";

type TRawCategory = Record<string, any> & {
  children?: TRawCategory[];
};

type TCategoryApiPayload =
  | TRawCategory[]
  | {
      data?: TRawCategory[] | { data?: TRawCategory[]; items?: TRawCategory[] };
      items?: TRawCategory[];
      meta?: { total?: number };
      total?: number;
    };

export class CategoriesService extends BaseApp<TCategory> {
  constructor() {
    super("categories");
  }

  public getCachedCategories(): TCategoryListData | null {
    if (!this.hasData()) {
      return null;
    }

    const items = this.getData();
    return {
      items,
      total: items.length
    };
  }

  public saveCategoriesCache(categories: TCategory[]): void {
    this.saveData(categories);
  }

  private normalizeCategory(item: TRawCategory): TCategory {
    return {
      id: item.id ?? "",
      name: item.name ?? "",
      slug: item.slug ?? "",
      description: item.description ?? "",
      image: item.image ?? "",
      parentId: item.parentId ?? item.parent_id ?? "",
      isActive: item.isActive ?? item.is_active ?? true,
      sortOrder: item.sortOrder ?? item.sort_order ?? 0,
      children: Array.isArray(item.children)
        ? item.children.map((child) => this.normalizeCategory(child))
        : [],
      createdAt: item.createdAt ?? item.created_at ?? "",
      updatedAt: item.updatedAt ?? item.updated_at ?? ""
    };
  }

  private flattenCategories(categories: TCategory[]): TCategory[] {
    const uniqueById = new Map<string, TCategory>();

    const visit = (list: TCategory[]) => {
      for (const category of list) {
        if (!uniqueById.has(category.id)) {
          uniqueById.set(category.id, category);
        }

        const children = category.children ?? [];
        if (children.length) {
          visit(children);
        }
      }
    };

    visit(categories);

    return Array.from(uniqueById.values());
  }

  private normalizeCategoriesResponse(response: TCategoryApiPayload): TCategoryListData {
    const rawItems = Array.isArray(response)
      ? response
      : Array.isArray(response.items)
        ? response.items
        : Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : Array.isArray(response.data?.items)
              ? response.data.items
              : [];

    const normalizedTrees = rawItems.map((item) => this.normalizeCategory(item));
    const items = this.flattenCategories(normalizedTrees);

    return {
      items,
      total: Array.isArray(response)
        ? items.length
        : response.meta?.total ?? response.total ?? items.length
    };
  }

  public async getCategories(
    query?: TCategoryListQuery
  ): Promise<ServerResponse<TCategoryListData>> {
    const response = await this.executeRequest<TCategoryListData>(async () => {
      const response = await this.Get<ServerResponse<TCategoryApiPayload>>(
        "/categories",
        query
      );

      return {
        ...response,
        data: this.normalizeCategoriesResponse(response.data)
      };
    });

    if (response.success) {
      this.saveCategoriesCache(response.data.items);
    }

    return response;
  }

  public async createCategory(
    payload: TCategoryPayload
  ): Promise<ServerResponse<TCategory>> {
    return this.executeRequest<TCategory>(async () => {
      const response = await this.Post<ServerResponse<TRawCategory>>(
        "/categories",
        payload
      );

      return {
        ...response,
        data: this.normalizeCategory(response.data)
      };
    });
  }

  public async updateCategory(
    id: string,
    payload: TCategoryPayload
  ): Promise<ServerResponse<TCategory>> {
    return this.executeRequest<TCategory>(async () => {
      const response = await this.Patch<ServerResponse<TRawCategory>>(
        `/categories/${id}`,
        payload
      );

      return {
        ...response,
        data: this.normalizeCategory(response.data)
      };
    });
  }

  public async deleteCategory(id: string): Promise<ServerResponse<{ id: string }>> {
    return this.executeRequest<{ id: string }>(async () => {
      const response = await this.Delete<ServerResponse<Record<string, unknown>>>(
        `/categories/${id}`
      );

      return {
        ...response,
        data: { id }
      };
    });
  }
}
