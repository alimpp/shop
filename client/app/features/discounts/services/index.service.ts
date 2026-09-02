import type { ServerResponse } from '~/types/common'
import { BaseApp } from '~/core/BaseApp'
import type {
  TDiscountCode,
  TDiscountListData,
  TDiscountListQuery,
  TDiscountPayload,
  TValidateDiscountPayload,
  TValidateDiscountResult
} from '../types/index.type'

export class DiscountsService extends BaseApp<{ id: string }> {
  constructor() {
    super('discounts')
  }

  public async validate(
    payload: TValidateDiscountPayload
  ): Promise<ServerResponse<TValidateDiscountResult>> {
    return this.executeRequest<TValidateDiscountResult>(async () => {
      return this.Post<ServerResponse<TValidateDiscountResult>>(
        '/discounts/validate',
        payload
      )
    })
  }

  public async getDiscounts(
    query?: TDiscountListQuery
  ): Promise<ServerResponse<TDiscountListData>> {
    return this.executeRequest<TDiscountListData>(async () => {
      const response = await this.Get<ServerResponse<any>>(
        '/discounts',
        query as Record<string, unknown>
      )
      return {
        ...response,
        data: {
          items: Array.isArray(response.data?.items) ? response.data.items : [],
          meta: {
            total: response.data?.meta?.total ?? 0,
            page: response.data?.meta?.page ?? 1,
            limit: response.data?.meta?.limit ?? 20,
            totalPages: response.data?.meta?.totalPages ?? 1
          }
        }
      }
    })
  }

  public async createDiscount(
    payload: TDiscountPayload
  ): Promise<ServerResponse<TDiscountCode>> {
    return this.executeRequest<TDiscountCode>(async () => {
      return this.Post<ServerResponse<TDiscountCode>>('/discounts', payload)
    })
  }

  public async updateDiscount(
    id: string,
    payload: TDiscountPayload
  ): Promise<ServerResponse<TDiscountCode>> {
    return this.executeRequest<TDiscountCode>(async () => {
      return this.Patch<ServerResponse<TDiscountCode>>(
        `/discounts/${id}`,
        payload
      )
    })
  }

  public async deleteDiscount(
    id: string
  ): Promise<ServerResponse<{ id: string; deleted: boolean }>> {
    return this.executeRequest<{ id: string; deleted: boolean }>(async () => {
      return this.Delete<ServerResponse<{ id: string; deleted: boolean }>>(
        `/discounts/${id}`
      )
    })
  }
}
