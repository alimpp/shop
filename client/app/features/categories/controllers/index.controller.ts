import type { ControllerResponse, ServerResponse } from "~/types/common";

import { BaseController } from "~/core/BaseController";
import { CategoriesDS } from "../data/index.store";

import { CategoriesService } from "../services/index.service";

import type {
  TCategory,
  TCategoryListData,
  TCategoryListQuery,
  TCategoryPayload
} from "../types/index.type";

class CategoriesController extends BaseController<CategoriesService> {
  constructor() {
    super(new CategoriesService());
  }

  private readonly categoriesDS = CategoriesDS.getInstance();

  public async getCategories(
    query?: TCategoryListQuery
  ): Promise<ControllerResponse<TCategoryListData>> {
    this.categoriesDS.setLoading(true);

    const cachedCategories = this.service.getCachedCategories();
    if (cachedCategories) {
      this.categoriesDS.setCategories(cachedCategories.items);
    }

    const response: ServerResponse<TCategoryListData> =
      await this.service.getCategories(query);

    if (response.success) {
      this.categoriesDS.setCategories(response.data.items);
    }

    this.categoriesDS.setLoading(false);

    return this.handleResponse(response);
  }

  public async createCategory(
    payload: TCategoryPayload
  ): Promise<ControllerResponse<TCategory>> {
    this.categoriesDS.setSubmitting(true);

    const response: ServerResponse<TCategory> =
      await this.service.createCategory(payload);

    if (response.success) {
      this.categoriesDS.upsertCategory(response.data);
      this.service.saveCategoriesCache(this.categoriesDS.getCategories);
    }

    this.categoriesDS.setSubmitting(false);

    return this.handleResponse(response);
  }

  public async updateCategory(
    id: string,
    payload: TCategoryPayload
  ): Promise<ControllerResponse<TCategory>> {
    this.categoriesDS.setSubmitting(true);

    const response: ServerResponse<TCategory> =
      await this.service.updateCategory(id, payload);

    if (response.success) {
      this.categoriesDS.upsertCategory(response.data);
      this.categoriesDS.setSelectedCategory(response.data);
      this.service.saveCategoriesCache(this.categoriesDS.getCategories);
    }

    this.categoriesDS.setSubmitting(false);

    return this.handleResponse(response);
  }

  public async deleteCategory(
    id: string
  ): Promise<ControllerResponse<{ id: string }>> {
    this.categoriesDS.setSubmitting(true);

    const response: ServerResponse<{ id: string }> =
      await this.service.deleteCategory(id);

    if (response.success) {
      this.categoriesDS.removeCategory(id);
      if (this.categoriesDS.getSelectedCategory?.id === id) {
        this.categoriesDS.setSelectedCategory(null);
      }
      this.service.saveCategoriesCache(this.categoriesDS.getCategories);
    }

    this.categoriesDS.setSubmitting(false);

    return this.handleResponse(response);
  }
}

export const categoriesController = new CategoriesController();
