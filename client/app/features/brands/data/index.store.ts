import { BaseStore } from "~/core/BaseStore";
import { StoreManager } from "~/core/StoreManager";
import { BrandModel } from "../models/index.model";
import type { TBrand } from "../types/index.type";

interface IBrandsState {
  brands: BrandModel[];
  selectedBrand: BrandModel | null;
  loading: boolean;
  submitting: boolean;
}

export class BrandsDS extends BaseStore<IBrandsState> {
  private static _instance: BrandsDS;

  public static getInstance(): BrandsDS {
    if (!BrandsDS._instance) {
      BrandsDS._instance = new BrandsDS();
    }
    return BrandsDS._instance;
  }

  private constructor() {
    super("brands", {
      brands: [],
      selectedBrand: null,
      loading: false,
      submitting: false
    });

    StoreManager.register(this);
  }

  public get getBrands(): BrandModel[] {
    return this._state.brands;
  }

  public get getSelectedBrand(): BrandModel | null {
    return this._state.selectedBrand;
  }

  public get getLoading(): boolean {
    return this._state.loading;
  }

  public get getSubmitting(): boolean {
    return this._state.submitting;
  }

  public setBrands(brands: TBrand[]): void {
    this._state.brands = brands.map((brand) => new BrandModel(brand));
  }

  public setSelectedBrand(brand: TBrand | null): void {
    this._state.selectedBrand = brand ? new BrandModel(brand) : null;
  }

  public setLoading(loading: boolean): void {
    this._state.loading = loading;
  }

  public setSubmitting(submitting: boolean): void {
    this._state.submitting = submitting;
  }

  public upsertBrand(brand: TBrand): void {
    const model = new BrandModel(brand);
    const index = this._state.brands.findIndex((item) => item.id === model.id);

    if (index === -1) {
      this._state.brands = [model, ...this._state.brands];
      return;
    }

    this._state.brands.splice(index, 1, model);
  }

  public removeBrand(id: string): void {
    this._state.brands = this._state.brands.filter((brand) => brand.id !== id);
  }

  public reset(): void {
    this._state.brands = [];
    this._state.selectedBrand = null;
    this._state.loading = false;
    this._state.submitting = false;
  }
}

