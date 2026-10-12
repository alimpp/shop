import type { ControllerResponse } from '~/types/common'
import { BaseController } from '~/core/BaseController'
import { FaqsService } from '../services/index.service'
import type {
  TFaq,
  TFaqListData,
  TFaqListQuery,
  TFaqPayload
} from '../types/index.type'

class FaqsController extends BaseController<FaqsService> {
  constructor() {
    super(new FaqsService())
  }

  public async getFaqs(
    query?: TFaqListQuery
  ): Promise<ControllerResponse<TFaqListData>> {
    return this.handleResponse(await this.service.getFaqs(query))
  }

  public async getPublicFaqs(
    query?: TFaqListQuery
  ): Promise<ControllerResponse<TFaqListData>> {
    return this.handleResponse(await this.service.getPublicFaqs(query))
  }

  public async createFaq(
    payload: TFaqPayload
  ): Promise<ControllerResponse<TFaq>> {
    return this.handleResponse(await this.service.createFaq(payload))
  }

  public async updateFaq(
    id: string,
    payload: TFaqPayload
  ): Promise<ControllerResponse<TFaq>> {
    return this.handleResponse(await this.service.updateFaq(id, payload))
  }

  public async deleteFaq(
    id: string
  ): Promise<ControllerResponse<{ id: string, deleted: boolean }>> {
    return this.handleResponse(await this.service.deleteFaq(id))
  }
}

export const faqsController = new FaqsController()
