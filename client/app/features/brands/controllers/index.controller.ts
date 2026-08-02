import type { ControllerResponse, ServerResponse } from "~/types/common";
import { BaseController } from "~/core/BaseController";
import { BrandsDS } from "../data/index.store";
import { BrandsService } from "../services/index.service";
import type { TBrand, TBrandPayload } from "../types/index.type";

class BrandsController extends BaseController<BrandsService> {
  constructor() {
    super(new BrandsService());
  }

  private readonly brandsDS = BrandsDS.getInstance();

  public async getBrands(): Promise<ControllerResponse<TBrand[]>> {
    this.brandsDS.setLoading(true);

    const response: ServerResponse<TBrand[]> = await this.service.getBrands();

    if (response.success) {
      this.brandsDS.setBrands(response.data);
    }

    this.brandsDS.setLoading(false);
    return this.handleResponse(response);
  }

  public async createBrand(payload: TBrandPayload): Promise<ControllerResponse<TBrand>> {
    this.brandsDS.setSubmitting(true);

    const response: ServerResponse<TBrand> = await this.service.createBrand(payload);

    if (response.success) {
      this.brandsDS.upsertBrand(response.data);
    }

    this.brandsDS.setSubmitting(false);
    return this.handleResponse(response);
  }

  public async updateBrand(id: string, payload: TBrandPayload): Promise<ControllerResponse<TBrand>> {
    this.brandsDS.setSubmitting(true);

    const response: ServerResponse<TBrand> = await this.service.updateBrand(id, payload);

    if (response.success) {
      this.brandsDS.upsertBrand(response.data);
      this.brandsDS.setSelectedBrand(response.data);
    }

    this.brandsDS.setSubmitting(false);
    return this.handleResponse(response);
  }

  public async deleteBrand(id: string): Promise<ControllerResponse<{ id: string }>> {
    this.brandsDS.setSubmitting(true);

    const response: ServerResponse<{ id: string }> = await this.service.deleteBrand(id);

    if (response.success) {
      this.brandsDS.removeBrand(id);
      if (this.brandsDS.getSelectedBrand?.id === id) {
        this.brandsDS.setSelectedBrand(null);
      }
    }

    this.brandsDS.setSubmitting(false);
    return this.handleResponse(response);
  }
}

export const brandsController = new BrandsController();

