import { BaseStore } from "~/core/BaseStore";
import { StoreManager } from "~/core/StoreManager";

import type { TCategory } from "../types/index.type";
import { CategoryModel } from "../models/index.model";

interface ICategoriesState {
  categories: CategoryModel[];
  selectedCategory: CategoryModel | null;
  loading: boolean;
  submitting: boolean;
}

export class CategoriesDS extends BaseStore<ICategoriesState> {
  private static _instance: CategoriesDS;

  public static getInstance(): CategoriesDS {
    if (!CategoriesDS._instance) {
      CategoriesDS._instance = new CategoriesDS();
    }
    return CategoriesDS._instance;
  }

  private constructor() {
    super("categories", {
      categories: [],
      selectedCategory: null,
      loading: false,
      submitting: false
    });

    StoreManager.register(this);
  }

  public get getCategories(): CategoryModel[] {
    return this._state.categories;
  }

  public get getSelectedCategory(): CategoryModel | null {
    return this._state.selectedCategory;
  }

  public get getLoading(): boolean {
    return this._state.loading;
  }

  public get getSubmitting(): boolean {
    return this._state.submitting;
  }

  public setCategories(categories: TCategory[]): void {
    this._state.categories = categories.map(
      (category) => new CategoryModel(category)
    );
  }

  public setSelectedCategory(category: TCategory | null): void {
    this._state.selectedCategory = category ? new CategoryModel(category) : null;
  }

  public setLoading(loading: boolean): void {
    this._state.loading = loading;
  }

  public setSubmitting(submitting: boolean): void {
    this._state.submitting = submitting;
  }

  public upsertCategory(category: TCategory): void {
    const model = new CategoryModel(category);
    const index = this._state.categories.findIndex((item) => item.id === model.id);

    if (index === -1) {
      this._state.categories = [model, ...this._state.categories];
      return;
    }

    this._state.categories.splice(index, 1, model);
  }

  public removeCategory(id: string): void {
    this._state.categories = this._state.categories.filter(
      (category) => category.id !== id
    );
  }

  public reset(): void {
    this._state.categories = [];
    this._state.selectedCategory = null;
    this._state.loading = false;
    this._state.submitting = false;
  }
}
