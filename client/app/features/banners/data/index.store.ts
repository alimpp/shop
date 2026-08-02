import { BaseStore } from "~/core/BaseStore";
import { StoreManager } from "~/core/StoreManager";
import { BannerModel } from "../models/index.model";
import type { TBanner } from "../types/index.type";

interface IBannersState {
  banners: BannerModel[];
  selectedBanner: BannerModel | null;
  loading: boolean;
  submitting: boolean;
}

export class BannersDS extends BaseStore<IBannersState> {
  private static _instance: BannersDS;

  public static getInstance(): BannersDS {
    if (!BannersDS._instance) {
      BannersDS._instance = new BannersDS();
    }
    return BannersDS._instance;
  }

  private constructor() {
    super("banners", {
      banners: [],
      selectedBanner: null,
      loading: false,
      submitting: false
    });

    StoreManager.register(this);
  }

  public get getBanners(): BannerModel[] {
    return this._state.banners;
  }

  public get getSelectedBanner(): BannerModel | null {
    return this._state.selectedBanner;
  }

  public get getLoading(): boolean {
    return this._state.loading;
  }

  public get getSubmitting(): boolean {
    return this._state.submitting;
  }

  public setBanners(banners: TBanner[]): void {
    this._state.banners = banners.map((banner) => new BannerModel(banner));
  }

  public setSelectedBanner(banner: TBanner | null): void {
    this._state.selectedBanner = banner ? new BannerModel(banner) : null;
  }

  public setLoading(loading: boolean): void {
    this._state.loading = loading;
  }

  public setSubmitting(submitting: boolean): void {
    this._state.submitting = submitting;
  }

  public upsertBanner(banner: TBanner): void {
    const model = new BannerModel(banner);
    const index = this._state.banners.findIndex((item) => item.id === model.id);

    if (index === -1) {
      this._state.banners = [model, ...this._state.banners];
      return;
    }

    this._state.banners.splice(index, 1, model);
  }

  public removeBanner(id: string): void {
    this._state.banners = this._state.banners.filter((banner) => banner.id !== id);
  }

  public reset(): void {
    this._state.banners = [];
    this._state.selectedBanner = null;
    this._state.loading = false;
    this._state.submitting = false;
  }
}
