import type { ServerResponse } from "~/types/common";
import { BaseApp } from "~/core/BaseApp";
import type { TBanner, TBannerPayload } from "../types/index.type";

type TRawBanner = Record<string, any>;

export class BannersService extends BaseApp<TBanner> {
  constructor() {
    super("banners");
  }

  private normalizeBanner(item: TRawBanner): TBanner {
    return {
      id: item.id ?? "",
      title: item.title ?? "",
      subtitle: item.subtitle ?? "",
      imageUrl: item.imageUrl ?? "",
      link: item.link ?? "",
      description: item.description ?? "",
      isActive: item.isActive ?? true,
      createdAt: item.createdAt ?? "",
      updatedAt: item.updatedAt ?? ""
    };
  }

  public async getBanners(): Promise<ServerResponse<TBanner[]>> {
    return this.executeRequest<TBanner[]>(async () => {
      const response = await this.Get<ServerResponse<TRawBanner[]>>("/banners");

      return {
        ...response,
        data: Array.isArray(response.data)
          ? response.data.map((item) => this.normalizeBanner(item))
          : []
      };
    });
  }

  public async createBanner(payload: TBannerPayload): Promise<ServerResponse<TBanner>> {
    return this.executeRequest<TBanner>(async () => {
      const response = await this.Post<ServerResponse<TRawBanner>>("/banners", payload);

      return {
        ...response,
        data: this.normalizeBanner(response.data)
      };
    });
  }

  public async updateBanner(id: string, payload: TBannerPayload): Promise<ServerResponse<TBanner>> {
    return this.executeRequest<TBanner>(async () => {
      const response = await this.Patch<ServerResponse<TRawBanner>>(`/banners/${id}`, payload);

      return {
        ...response,
        data: this.normalizeBanner(response.data)
      };
    });
  }

  public async deleteBanner(id: string): Promise<ServerResponse<{ id: string }>> {
    return this.executeRequest<{ id: string }>(async () => {
      const response = await this.Delete<ServerResponse<Record<string, unknown>>>(`/banners/${id}`);

      return {
        ...response,
        data: { id }
      };
    });
  }
}
