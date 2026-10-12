import type { ServerResponse } from '~/types/common'
import { BaseApp } from '~/core/BaseApp'
import type {
  TFaq,
  TFaqListData,
  TFaqListQuery,
  TFaqPayload
} from '../types/index.type'

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export class FaqsService extends BaseApp<{ id: string }> {
  constructor() {
    super('faqs')
  }

  private normalizeList(response: ServerResponse<any>): ServerResponse<TFaqListData> {
    const payload = response.data ?? {}
    const items = Array.isArray(payload)
      ? payload
      : Array.isArray(payload.items)
        ? payload.items
        : Array.isArray(payload.data)
          ? payload.data
          : []
    const meta = (!Array.isArray(payload) ? payload.meta : {}) ?? {}

    return {
      ...response,
      data: {
        items,
        meta: {
          total: toNumber(meta.total, items.length),
          page: toNumber(meta.page, 1),
          limit: toNumber(meta.limit, 50),
          totalPages: toNumber(meta.totalPages, 1)
        }
      }
    }
  }

  public async getFaqs(
    query?: TFaqListQuery
  ): Promise<ServerResponse<TFaqListData>> {
    return this.executeRequest<TFaqListData>(async () => {
      const response = await this.Get<ServerResponse<any>>(
        '/faqs',
        query as Record<string, unknown>
      )
      return this.normalizeList(response)
    })
  }

  public async getPublicFaqs(
    query?: TFaqListQuery
  ): Promise<ServerResponse<TFaqListData>> {
    return this.executeRequest<TFaqListData>(async () => {
      const response = await this.Get<ServerResponse<any>>(
        '/faqs/public',
        query as Record<string, unknown>
      )
      return this.normalizeList(response)
    })
  }

  public async createFaq(payload: TFaqPayload): Promise<ServerResponse<TFaq>> {
    return this.executeRequest<TFaq>(async () => {
      return this.Post<ServerResponse<TFaq>>('/faqs', payload)
    })
  }

  public async updateFaq(
    id: string,
    payload: TFaqPayload
  ): Promise<ServerResponse<TFaq>> {
    return this.executeRequest<TFaq>(async () => {
      return this.Patch<ServerResponse<TFaq>>(`/faqs/${id}`, payload)
    })
  }

  public async deleteFaq(
    id: string
  ): Promise<ServerResponse<{ id: string, deleted: boolean }>> {
    return this.executeRequest<{ id: string, deleted: boolean }>(async () => {
      return this.Delete<ServerResponse<{ id: string, deleted: boolean }>>(
        `/faqs/${id}`
      )
    })
  }
}
