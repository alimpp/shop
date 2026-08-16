import type { ControllerResponse, ServerResponse } from "~/types/common";
import { BaseController } from "~/core/BaseController";
import { BannersDS } from "../data/index.store";
import { BannersService } from "../services/index.service";
import type { TBanner, TBannerPayload } from "../types/index.type";

class BannersController extends BaseController<BannersService> {
  constructor() {
    super(new BannersService());
  }

  private readonly bannersDS = BannersDS.getInstance();

  public async getBanners(): Promise<ControllerResponse<TBanner[]>> {
    this.bannersDS.setLoading(true);

    const response: ServerResponse<TBanner[]> = await this.service.getBanners();

    if (response.success) {
      this.bannersDS.setBanners(response.data);
    }

    this.bannersDS.setLoading(false);
    return this.handleResponse(response);
  }

  public async createBanner(payload: TBannerPayload): Promise<ControllerResponse<TBanner>> {
    this.bannersDS.setSubmitting(true);

    const response: ServerResponse<TBanner> = await this.service.createBanner(payload);

    if (response.success) {
      this.bannersDS.upsertBanner(response.data);
    }

    this.bannersDS.setSubmitting(false);
    return this.handleResponse(response);
  }

  public async updateBanner(id: string, payload: TBannerPayload): Promise<ControllerResponse<TBanner>> {
    this.bannersDS.setSubmitting(true);

    const response: ServerResponse<TBanner> = await this.service.updateBanner(id, payload);

    if (response.success) {
      this.bannersDS.upsertBanner(response.data);
      this.bannersDS.setSelectedBanner(response.data);
    }

    this.bannersDS.setSubmitting(false);
    return this.handleResponse(response);
  }

  public async deleteBanner(id: string): Promise<ControllerResponse<{ id: string }>> {
    this.bannersDS.setSubmitting(true);

    const response: ServerResponse<{ id: string }> = await this.service.deleteBanner(id);

    if (response.success) {
      this.bannersDS.removeBanner(id);
      if (this.bannersDS.getSelectedBanner?.id === id) {
        this.bannersDS.setSelectedBanner(null);
      }
    }

    this.bannersDS.setSubmitting(false);
    return this.handleResponse(response);
  }
}

export const bannersController = new BannersController();
