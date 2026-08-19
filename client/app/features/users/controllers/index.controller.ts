import type { ControllerResponse, ServerResponse } from '~/types/common'
import { BaseController } from '~/core/BaseController'
import { UsersDS } from '../data/index.store'
import { UsersService } from '../services/index.service'
import type {
  TAdminUserListData,
  TAdminUserListQuery,
  TAdminUserOverview
} from '../types/index.type'
import type { TCartResponse } from '~/features/cart/types/index.type'
import type { TChat } from '~/features/chat/types/index.type'
import type { TFavoritesResponse } from '~/features/favorites/types/index.type'
import type { TAddress } from '~/features/addresses/types/index.type'
import type { TOrderListData } from '~/features/orders/types/index.type'
import type { TAdminUserActivityList } from '../types/index.type'

class UsersController extends BaseController<UsersService> {
  constructor() {
    super(new UsersService())
  }

  private readonly usersDS = UsersDS.getInstance()

  public async getUsers(
    query?: TAdminUserListQuery
  ): Promise<ControllerResponse<TAdminUserListData>> {
    this.usersDS.setLoading(true)
    const response = await this.service.getUsers(query)
    if (response.success && response.data) {
      this.usersDS.setUsers(response.data)
    }
    this.usersDS.setLoading(false)
    return this.handleResponse(response)
  }

  public async getOverview(
    id: string
  ): Promise<ControllerResponse<TAdminUserOverview>> {
    this.usersDS.setOverviewLoading(true)
    const response = await this.service.getOverview(id)
    if (response.success && response.data) {
      this.usersDS.setOverview(response.data)
    }
    this.usersDS.setOverviewLoading(false)
    return this.handleResponse(response)
  }

  public async getCart(id: string): Promise<ControllerResponse<TCartResponse>> {
    this.usersDS.setTabLoading(true)
    const response: ServerResponse<TCartResponse> = await this.service.getCart(id)
    if (response.success && response.data) {
      this.usersDS.setCart(response.data)
    }
    this.usersDS.setTabLoading(false)
    return this.handleResponse(response)
  }

  public async getOrders(id: string): Promise<ControllerResponse<TOrderListData>> {
    this.usersDS.setTabLoading(true)
    const response = await this.service.getOrders(id)
    if (response.success && response.data) {
      this.usersDS.setOrders(response.data)
    }
    this.usersDS.setTabLoading(false)
    return this.handleResponse(response)
  }

  public async getFavorites(
    id: string
  ): Promise<ControllerResponse<TFavoritesResponse>> {
    this.usersDS.setTabLoading(true)
    const response = await this.service.getFavorites(id)
    if (response.success && response.data) {
      this.usersDS.setFavorites(response.data)
    }
    this.usersDS.setTabLoading(false)
    return this.handleResponse(response)
  }

  public async getLikes(
    id: string
  ): Promise<ControllerResponse<TAdminUserActivityList>> {
    this.usersDS.setTabLoading(true)
    const response = await this.service.getLikes(id)
    if (response.success && response.data) {
      this.usersDS.setLikes(response.data)
    }
    this.usersDS.setTabLoading(false)
    return this.handleResponse(response)
  }

  public async getComments(
    id: string
  ): Promise<ControllerResponse<TAdminUserActivityList>> {
    this.usersDS.setTabLoading(true)
    const response = await this.service.getComments(id)
    if (response.success && response.data) {
      this.usersDS.setComments(response.data)
    }
    this.usersDS.setTabLoading(false)
    return this.handleResponse(response)
  }

  public async getAddresses(
    id: string
  ): Promise<ControllerResponse<TAddress[]>> {
    this.usersDS.setTabLoading(true)
    const response = await this.service.getAddresses(id)
    if (response.success && response.data) {
      this.usersDS.setAddresses(response.data)
    }
    this.usersDS.setTabLoading(false)
    return this.handleResponse(response)
  }

  public async getOrCreateChat(
    id: string
  ): Promise<ControllerResponse<TChat>> {
    this.usersDS.setTabLoading(true)
    const response = await this.service.getOrCreateChat(id)
    if (response.success && response.data) {
      this.usersDS.setChat(response.data)
    }
    this.usersDS.setTabLoading(false)
    return this.handleResponse(response)
  }
}

export const usersController = new UsersController()
