import { BaseStore } from "~/core/BaseStore";
import { StoreManager } from "~/core/StoreManager";

import type { TProduct } from "../types/index.type";
import { ProductModel } from "../models/index.model";

interface IProductsState {
  products: ProductModel[];
  selectedProduct: ProductModel | null;
  loading: boolean;
  submitting: boolean;
}

export class ProductsDS extends BaseStore<IProductsState> {
  private static _instance: ProductsDS;

  public static getInstance(): ProductsDS {
    if (!ProductsDS._instance) {
      ProductsDS._instance = new ProductsDS();
    }
    return ProductsDS._instance;
  }

  private constructor() {
    super("products", {
      products: [],
      selectedProduct: null,
      loading: false,
      submitting: false
    });

    StoreManager.register(this);
  }

  public get getProducts(): ProductModel[] {
    return this._state.products;
  }

  public get getSelectedProduct(): ProductModel | null {
    return this._state.selectedProduct;
  }

  public get getLoading(): boolean {
    return this._state.loading;
  }

  public get getSubmitting(): boolean {
    return this._state.submitting;
  }

  public setProducts(products: TProduct[]): void {
    this._state.products = products.map((product) => new ProductModel(product));
  }

  public setSelectedProduct(product: TProduct | null): void {
    this._state.selectedProduct = product ? new ProductModel(product) : null;
  }

  public setLoading(loading: boolean): void {
    this._state.loading = loading;
  }

  public setSubmitting(submitting: boolean): void {
    this._state.submitting = submitting;
  }

  public upsertProduct(product: TProduct): void {
    const model = new ProductModel(product);
    const index = this._state.products.findIndex((item) => item.id === model.id);

    if (index === -1) {
      this._state.products = [model, ...this._state.products];
      return;
    }

    this._state.products.splice(index, 1, model);
  }

  public removeProduct(id: string): void {
    this._state.products = this._state.products.filter((product) => product.id !== id);
  }

  public reset(): void {
    this._state.products = [];
    this._state.selectedProduct = null;
    this._state.loading = false;
    this._state.submitting = false;
  }
}
