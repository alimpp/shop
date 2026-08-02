import type { TBrand } from "../types/index.type";

export class BrandModel implements TBrand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;

  constructor(data?: Partial<TBrand>) {
    this.id = data?.id ?? "";
    this.name = data?.name ?? "";
    this.slug = data?.slug ?? "";
    this.logo = data?.logo ?? "";
    this.description = data?.description ?? "";
    this.isActive = data?.isActive ?? true;
    this.createdAt = data?.createdAt ?? "";
    this.updatedAt = data?.updatedAt ?? "";
  }
}

