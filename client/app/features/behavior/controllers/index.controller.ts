import type { ControllerResponse, ServerResponse } from '~/types/common'
import { BaseController } from '~/core/BaseController'
import type { TProduct } from '~/features/products/types/index.type'
import { BehaviorService } from '../services/index.service'
import type {
  TAdminUserBehaviorData,
  TTrackBehaviorPayload
} from '../types/index.type'

class BehaviorController extends BaseController<BehaviorService> {
  constructor() {
    super(new BehaviorService())
  }

  public async trackEvent(
    payload: TTrackBehaviorPayload
  ): Promise<ControllerResponse<{ id: string }>> {
    const response = await this.service.trackEvent(payload)
    return this.handleResponse(response)
  }

  public async getRecent(query?: {
    sessionId?: string
    limit?: number
  }): Promise<ControllerResponse<TProduct[]>> {
    const response: ServerResponse<TProduct[]> =
      await this.service.getRecent(query)
    return this.handleResponse(response)
  }

  public async getRecommendations(query?: {
    sessionId?: string
    limit?: number
  }): Promise<ControllerResponse<TProduct[]>> {
    const response: ServerResponse<TProduct[]> =
      await this.service.getRecommendations(query)
    return this.handleResponse(response)
  }

  public async getAdminUserBehavior(
    userId: string,
    query?: { page?: number; limit?: number }
  ): Promise<ControllerResponse<TAdminUserBehaviorData>> {
    const response = await this.service.getAdminUserBehavior(userId, query)
    return this.handleResponse(response)
  }
}

export const behaviorController = new BehaviorController()
