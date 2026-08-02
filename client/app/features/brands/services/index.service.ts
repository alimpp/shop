import type { ServerResponse } from "~/types/common";
import { BaseApp } from "~/core/BaseApp";
import type { TBrand, TBrandPayload } from "../types/index.type";

type TRawBrand = Record<string, any>;

export class BrandsService extends BaseApp<TBrand> {
  constructor() {
    super("brands");
  }

  private normalizeBrand(item: TRawBrand): TBrand {
    return {
      id: item.id ?? "",
      name: item.name ?? "",
      slug: item.slug ?? "",
      logo: item.logo ?? "",
      description: item.description ?? "",
      isActive: item.isActive ?? true,
      createdAt: item.createdAt ?? "",
      updatedAt: item.updatedAt ?? ""
    };
  }

  public async getBrands(): Promise<ServerResponse<TBrand[]>> {
    return this.executeRequest<TBrand[]>(async () => {
      const response = await this.Get<ServerResponse<TRawBrand[]>>("/brands");

      return {
        ...response,
        data: Array.isArray(response.data)
          ? response.data.map((item) => this.normalizeBrand(item))
          : []
      };
    });
  }

  public async createBrand(payload: TBrandPayload): Promise<ServerResponse<TBrand>> {
    return this.executeRequest<TBrand>(async () => {
      const response = await this.Post<ServerResponse<TRawBrand>>("/brands", payload);

      return {
        ...response,
        data: this.normalizeBrand(response.data)
      };
    });
  }

  public async updateBrand(id: string, payload: TBrandPayload): Promise<ServerResponse<TBrand>> {
    return this.executeRequest<TBrand>(async () => {
      const response = await this.Patch<ServerResponse<TRawBrand>>(`/brands/${id}`, payload);

      return {
        ...response,
        data: this.normalizeBrand(response.data)
      };
    });
  }

  public async deleteBrand(id: string): Promise<ServerResponse<{ id: string }>> {
    return this.executeRequest<{ id: string }>(async () => {
      const response = await this.Delete<ServerResponse<Record<string, unknown>>>(`/brands/${id}`);

      return {
        ...response,
        data: { id }
      };
    });
  }
}

