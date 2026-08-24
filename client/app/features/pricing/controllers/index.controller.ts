import type { ControllerResponse, ServerResponse } from '~/types/common'
import { BaseController } from '~/core/BaseController'
import { PricingDS } from '../data/index.store'
import { PricingService } from '../services/index.service'
import type {
  TPricingListData,
  TPricingListQuery,
  TPricingProduct,
  TUpdateProductPricingPayload
} from '../types/index.type'

class PricingController extends BaseController<PricingService> {
  constructor() {
    super(new PricingService())
  }

  private readonly pricingDS = PricingDS.getInstance()
  private listRequestId = 0

  public async getPricingProducts(
    query?: TPricingListQuery
  ): Promise<ControllerResponse<TPricingListData>> {
    const requestId = ++this.listRequestId

    this.pricingDS.setLoading(true)

    const response = await this.service.getPricingProducts(query)

    if (requestId !== this.listRequestId) {
      return {
        success: true,
        message: '',
        data: null
      }
    }

    if (response.success && response.data) {
      this.pricingDS.setItems(response.data.items, response.data.meta)
    }

    this.pricingDS.setLoading(false)
    return this.handleResponse(response)
  }

  public async updateProductPricing(
    id: string,
    payload: TUpdateProductPricingPayload
  ): Promise<ControllerResponse<TPricingProduct>> {
    this.pricingDS.setSaving(id, true)

    const response: ServerResponse<TPricingProduct> =
      await this.service.updateProductPricing(id, payload)

    if (response.success && response.data) {
      this.pricingDS.upsertItem(response.data)
    }

    this.pricingDS.setSaving(id, false)
    return this.handleResponse(response)
  }
}

export const pricingController = new PricingController()
