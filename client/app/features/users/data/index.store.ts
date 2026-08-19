import { BaseStore } from '~/core/BaseStore'
import { StoreManager } from '~/core/StoreManager'
import { AddressModel } from '~/features/addresses/models/index.model'
import { CartItemModel } from '~/features/cart/models/index.model'
import { ChatModel } from '~/features/chat/models/index.model'
import { FavoriteProductModel } from '~/features/favorites/models/index.model'
import { OrderModel } from '~/features/orders/models/index.model'
import type { TAddress } from '~/features/addresses/types/index.type'
import type { TCartResponse } from '~/features/cart/types/index.type'
import type { TChat } from '~/features/chat/types/index.type'
import type { TFavoritesResponse } from '~/features/favorites/types/index.type'
import type { TOrderListData } from '~/features/orders/types/index.type'
import { AdminUserModel, AdminUserStatsModel } from '../models/index.model'
import type {
  TAdminUser,
  TAdminUserActivityItem,
  TAdminUserActivityList,
  TAdminUserListData,
  TAdminUserListMeta,
  TAdminUserOverview
} from '../types/index.type'

interface IUsersState {
  users: AdminUserModel[]
  selectedUser: AdminUserModel | null
  stats: AdminUserStatsModel
  meta: TAdminUserListMeta
  cartItems: CartItemModel[]
  cartTotalPrice: number
  cartTotalQuantity: number
  orders: OrderModel[]
  favorites: FavoriteProductModel[]
  likes: TAdminUserActivityItem[]
  comments: TAdminUserActivityItem[]
  addresses: AddressModel[]
  chat: ChatModel | null
  loading: boolean
  overviewLoading: boolean
  tabLoading: boolean
}

const emptyMeta = (): TAdminUserListMeta => ({
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0
})

export class UsersDS extends BaseStore<IUsersState> {
  private static _instance: UsersDS

  public static getInstance(): UsersDS {
    if (!UsersDS._instance) {
      UsersDS._instance = new UsersDS()
    }
    return UsersDS._instance
  }

  private constructor() {
    super('admin-users', {
      users: [],
      selectedUser: null,
      stats: new AdminUserStatsModel(),
      meta: emptyMeta(),
      cartItems: [],
      cartTotalPrice: 0,
      cartTotalQuantity: 0,
      orders: [],
      favorites: [],
      likes: [],
      comments: [],
      addresses: [],
      chat: null,
      loading: false,
      overviewLoading: false,
      tabLoading: false
    })
    StoreManager.register(this)
  }

  public get getUsers(): AdminUserModel[] {
    return this._state.users
  }

  public get getSelectedUser(): AdminUserModel | null {
    return this._state.selectedUser
  }

  public get getStats(): AdminUserStatsModel {
    return this._state.stats
  }

  public get getMeta(): TAdminUserListMeta {
    return this._state.meta
  }

  public get getCartItems(): CartItemModel[] {
    return this._state.cartItems
  }

  public get getCartTotalPrice(): number {
    return this._state.cartTotalPrice
  }

  public get getCartTotalQuantity(): number {
    return this._state.cartTotalQuantity
  }

  public get getOrders(): OrderModel[] {
    return this._state.orders
  }

  public get getFavorites(): FavoriteProductModel[] {
    return this._state.favorites
  }

  public get getLikes(): TAdminUserActivityItem[] {
    return this._state.likes
  }

  public get getComments(): TAdminUserActivityItem[] {
    return this._state.comments
  }

  public get getAddresses(): AddressModel[] {
    return this._state.addresses
  }

  public get getChat(): ChatModel | null {
    return this._state.chat
  }

  public get getLoading(): boolean {
    return this._state.loading
  }

  public get getOverviewLoading(): boolean {
    return this._state.overviewLoading
  }

  public get getTabLoading(): boolean {
    return this._state.tabLoading
  }

  public setLoading(loading: boolean): void {
    this._state.loading = loading
  }

  public setOverviewLoading(loading: boolean): void {
    this._state.overviewLoading = loading
  }

  public setTabLoading(loading: boolean): void {
    this._state.tabLoading = loading
  }

  public setUsers(data: TAdminUserListData): void {
    this._state.users = (data.items ?? []).map(item => new AdminUserModel(item))
    this._state.meta = { ...emptyMeta(), ...(data.meta ?? {}) }
  }

  public setOverview(data: TAdminUserOverview): void {
    this._state.selectedUser = new AdminUserModel(data.user)
    this._state.stats = new AdminUserStatsModel(data.stats)
  }

  public setSelectedUser(user: TAdminUser | null): void {
    this._state.selectedUser = user ? new AdminUserModel(user) : null
  }

  public setCart(data: TCartResponse): void {
    this._state.cartItems = (data.items ?? []).map(item => new CartItemModel(item))
    this._state.cartTotalPrice = data.totalPrice ?? 0
    this._state.cartTotalQuantity = data.totalQuantity ?? 0
  }

  public setOrders(data: TOrderListData): void {
    this._state.orders = (data.items ?? []).map(item => new OrderModel(item))
  }

  public setFavorites(data: TFavoritesResponse): void {
    this._state.favorites = (data.items ?? []).map(
      item => new FavoriteProductModel(item)
    )
  }

  public setLikes(data: TAdminUserActivityList): void {
    this._state.likes = data.items ?? []
  }

  public setComments(data: TAdminUserActivityList): void {
    this._state.comments = data.items ?? []
  }

  public setAddresses(items: TAddress[]): void {
    this._state.addresses = (items ?? []).map(item => new AddressModel(item))
  }

  public setChat(chat: TChat | null): void {
    this._state.chat = chat ? new ChatModel(chat) : null
  }

  public resetDetail(): void {
    this._state.selectedUser = null
    this._state.stats = new AdminUserStatsModel()
    this._state.cartItems = []
    this._state.cartTotalPrice = 0
    this._state.cartTotalQuantity = 0
    this._state.orders = []
    this._state.favorites = []
    this._state.likes = []
    this._state.comments = []
    this._state.addresses = []
    this._state.chat = null
    this._state.overviewLoading = false
    this._state.tabLoading = false
  }

  public reset(): void {
    this._state.users = []
    this._state.meta = emptyMeta()
    this._state.loading = false
    this.resetDetail()
  }
}

export const useUsersDS = () => UsersDS.getInstance()
