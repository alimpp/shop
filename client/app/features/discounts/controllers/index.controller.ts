import type { ControllerResponse, ServerResponse } from '~/types/common'
import { BaseController } from '~/core/BaseController'
import { DiscountsService } from '../services/index.service'
import type {
  TDiscountCode,
  TDiscountListData,
  TDiscountListQuery,
  TDiscountPayload,
  TDiscountUsageDetail,
  TDiscountUsageReport,
  TValidateDiscountPayload,
  TValidateDiscountResult
} from '../types/index.type'

class DiscountsController extends BaseController<DiscountsService> {
  constructor() {
    super(new DiscountsService())
  }

  public async validate(
    payload: TValidateDiscountPayload
  ): Promise<ControllerResponse<TValidateDiscountResult>> {
    return this.handleResponse(await this.service.validate(payload))
  }

  public async getDiscounts(
    query?: TDiscountListQuery
  ): Promise<ControllerResponse<TDiscountListData>> {
    const response: ServerResponse<TDiscountListData>
      = await this.service.getDiscounts(query)
    return this.handleResponse(response)
  }

  public async getUsageReport(): Promise<ControllerResponse<TDiscountUsageReport>> {
    return this.handleResponse(await this.service.getUsageReport())
  }

  public async getUsageDetail(
    id: string
  ): Promise<ControllerResponse<TDiscountUsageDetail>> {
    return this.handleResponse(await this.service.getUsageDetail(id))
  }

  public async createDiscount(
    payload: TDiscountPayload
  ): Promise<ControllerResponse<TDiscountCode>> {
    return this.handleResponse(await this.service.createDiscount(payload))
  }

  public async updateDiscount(
    id: string,
    payload: TDiscountPayload
  ): Promise<ControllerResponse<TDiscountCode>> {
    return this.handleResponse(await this.service.updateDiscount(id, payload))
  }

  public async deleteDiscount(
    id: string
  ): Promise<ControllerResponse<{ id: string; deleted: boolean }>> {
    return this.handleResponse(await this.service.deleteDiscount(id))
  }
}

export const discountsController = new DiscountsController()
