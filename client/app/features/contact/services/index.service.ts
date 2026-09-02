import type { ServerResponse } from '~/types/common'
import { BaseApp } from '~/core/BaseApp'
import type {
  TContactListData,
  TContactListQuery,
  TContactMessage,
  TCreateContactPayload
} from '../types/index.type'

export class ContactService extends BaseApp<{ id: string }> {
  constructor() {
    super('contact')
  }

  public async createMessage(
    payload: TCreateContactPayload
  ): Promise<ServerResponse<{ id: string; createdAt: string }>> {
    return this.executeRequest<{ id: string; createdAt: string }>(async () => {
      return this.Post<ServerResponse<{ id: string; createdAt: string }>>(
        '/contact',
        payload
      )
    })
  }

  public async getMessages(
    query?: TContactListQuery
  ): Promise<ServerResponse<TContactListData>> {
    return this.executeRequest<TContactListData>(async () => {
      const response = await this.Get<ServerResponse<any>>(
        '/contact',
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
            totalPages: response.data?.meta?.totalPages ?? 1,
            unreadCount: response.data?.meta?.unreadCount ?? 0
          }
        }
      }
    })
  }

  public async getMessage(
    id: string
  ): Promise<ServerResponse<TContactMessage>> {
    return this.executeRequest<TContactMessage>(async () => {
      return this.Get<ServerResponse<TContactMessage>>(`/contact/${id}`)
    })
  }

  public async markAsRead(
    id: string
  ): Promise<ServerResponse<TContactMessage>> {
    return this.executeRequest<TContactMessage>(async () => {
      return this.Patch<ServerResponse<TContactMessage>>(
        `/contact/${id}/read`,
        {}
      )
    })
  }

  public async deleteMessage(
    id: string
  ): Promise<ServerResponse<{ id: string; deleted: boolean }>> {
    return this.executeRequest<{ id: string; deleted: boolean }>(async () => {
      return this.Delete<ServerResponse<{ id: string; deleted: boolean }>>(
        `/contact/${id}`
      )
    })
  }
}
