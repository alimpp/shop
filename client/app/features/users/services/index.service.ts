import type { ServerResponse } from '~/types/common'
import { BaseApp } from '~/core/BaseApp'
import type { TAddress } from '~/features/addresses/types/index.type'
import type { TCartResponse } from '~/features/cart/types/index.type'
import type { TChat } from '~/features/chat/types/index.type'
import type { TFavoritesResponse } from '~/features/favorites/types/index.type'
import type { TOrderListData } from '~/features/orders/types/index.type'
import type {
  TAdminUser,
  TAdminUserActivityList,
  TAdminUserListData,
  TAdminUserListQuery,
  TAdminUserOverview
} from '../types/index.type'

export class UsersService extends BaseApp<TAdminUser> {
  constructor() {
    super('admin-users')
  }

  public async getUsers(
    query?: TAdminUserListQuery
  ): Promise<ServerResponse<TAdminUserListData>> {
    return this.executeRequest<TAdminUserListData>(async () => {
      const response = await this.Get<ServerResponse<any>>(
        '/users/admin',
        query
      )
      const items = Array.isArray(response.data?.items)
        ? response.data.items
        : []

      return {
        ...response,
        data: {
          items: items.map((item: TAdminUser) => this.normalizeUser(item)),
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

  public async getOverview(
    id: string
  ): Promise<ServerResponse<TAdminUserOverview>> {
    return this.executeRequest<TAdminUserOverview>(async () => {
      const response = await this.Get<ServerResponse<any>>(`/users/admin/${id}`)
      return {
        ...response,
        data: {
          user: this.normalizeUser(response.data?.user ?? {}),
          stats: {
            orders: Number(response.data?.stats?.orders ?? 0),
            cartItems: Number(response.data?.stats?.cartItems ?? 0),
            favorites: Number(response.data?.stats?.favorites ?? 0),
            likes: Number(response.data?.stats?.likes ?? 0),
            comments: Number(response.data?.stats?.comments ?? 0),
            addresses: Number(response.data?.stats?.addresses ?? 0)
          }
        }
      }
    })
  }

  public async getCart(id: string): Promise<ServerResponse<TCartResponse>> {
    return this.executeRequest<TCartResponse>(async () => {
      return await this.Get<ServerResponse<TCartResponse>>(
        `/users/admin/${id}/cart`
      )
    })
  }

  public async getOrders(id: string): Promise<ServerResponse<TOrderListData>> {
    return this.executeRequest<TOrderListData>(async () => {
      const response = await this.Get<ServerResponse<any>>(
        `/users/admin/${id}/orders`,
        { page: 1, limit: 50 }
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

  public async getFavorites(
    id: string
  ): Promise<ServerResponse<TFavoritesResponse>> {
    return this.executeRequest<TFavoritesResponse>(async () => {
      return await this.Get<ServerResponse<TFavoritesResponse>>(
        `/users/admin/${id}/favorites`,
        { page: 1, limit: 50 }
      )
    })
  }

  public async getLikes(
    id: string
  ): Promise<ServerResponse<TAdminUserActivityList>> {
    return this.executeRequest<TAdminUserActivityList>(async () => {
      return await this.Get<ServerResponse<TAdminUserActivityList>>(
        `/users/admin/${id}/likes`,
        { page: 1, limit: 50 }
      )
    })
  }

  public async getComments(
    id: string
  ): Promise<ServerResponse<TAdminUserActivityList>> {
    return this.executeRequest<TAdminUserActivityList>(async () => {
      return await this.Get<ServerResponse<TAdminUserActivityList>>(
        `/users/admin/${id}/comments`,
        { page: 1, limit: 50 }
      )
    })
  }

  public async getAddresses(id: string): Promise<ServerResponse<TAddress[]>> {
    return this.executeRequest<TAddress[]>(async () => {
      const response = await this.Get<ServerResponse<TAddress[]>>(
        `/users/admin/${id}/addresses`
      )
      return {
        ...response,
        data: Array.isArray(response.data) ? response.data : []
      }
    })
  }

  public async getOrCreateChat(id: string): Promise<ServerResponse<TChat>> {
    return this.executeRequest<TChat>(async () => {
      const response = await this.Post<ServerResponse<any>>(
        `/users/admin/${id}/chat`,
        {}
      )
      return {
        ...response,
        data: {
          id: response.data?.id ?? '',
          subject: response.data?.subject,
          status: response.data?.status ?? 'open',
          created_at: response.data?.created_at ?? '',
          user: response.data?.user ?? null,
          unseenCount: Number(response.data?.unseenCount) || 0,
          hasUnseen: Boolean(response.data?.hasUnseen)
        }
      }
    })
  }

  private normalizeUser(item: Partial<TAdminUser>): TAdminUser {
    return {
      id: String(item.id ?? ''),
      fristname: String(item.fristname ?? ''),
      lastname: String(item.lastname ?? ''),
      email: String(item.email ?? ''),
      avatarUrl: String(item.avatarUrl ?? ''),
      phone: String(item.phone ?? ''),
      created_at: String(item.created_at ?? '')
    }
  }
}
