import type { TBanner } from "../types/index.type";

export class BannerModel implements TBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  link?: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;

  constructor(data?: Partial<TBanner>) {
    this.id = data?.id ?? "";
    this.title = data?.title ?? "";
    this.subtitle = data?.subtitle ?? "";
    this.imageUrl = data?.imageUrl ?? "";
    this.link = data?.link ?? "";
    this.description = data?.description ?? "";
    this.isActive = data?.isActive ?? true;
    this.createdAt = data?.createdAt ?? "";
    this.updatedAt = data?.updatedAt ?? "";
  }
}
