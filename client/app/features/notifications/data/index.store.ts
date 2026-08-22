import { BaseStore } from '~/core/BaseStore'
import { StoreManager } from '~/core/StoreManager'
import {
  NotificationModel,
  NotificationUserModel
} from '../models/index.model'

import type {
  TNotification,
  TNotificationListData,
  TNotificationListMeta
} from '../types/index.type'

interface INotificationsState {
  items: NotificationModel[]
  selected: NotificationModel | null
  users: NotificationUserModel[]
  meta: TNotificationListMeta
  unreadCount: number
  loading: boolean
  submitting: boolean
  usersLoading: boolean
}

const emptyMeta = (): TNotificationListMeta => ({
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  unreadCount: 0
})

export class NotificationsDS extends BaseStore<INotificationsState> {
  private static _instance: NotificationsDS

  public static getInstance(): NotificationsDS {
    if (!NotificationsDS._instance) {
      NotificationsDS._instance = new NotificationsDS()
    }
    return NotificationsDS._instance
  }

  private constructor() {
    super('notifications', {
      items: [],
      selected: null,
      users: [],
      meta: emptyMeta(),
      unreadCount: 0,
      loading: false,
      submitting: false,
      usersLoading: false
    })
    StoreManager.register(this)
  }

  public get getItems(): NotificationModel[] {
    return this._state.items
  }

  public get getSelected(): NotificationModel | null {
    return this._state.selected
  }

  public getById(id: string): NotificationModel | undefined {
    return this._state.items.find(notification => notification.id === id)
  }

  public get getUsers(): NotificationUserModel[] {
    return this._state.users
  }

  public get getMeta(): TNotificationListMeta {
    return this._state.meta
  }

  public get getUnreadCount(): number {
    return this._state.unreadCount
  }

  public get getLoading(): boolean {
    return this._state.loading
  }

  public get getSubmitting(): boolean {
    return this._state.submitting
  }

  public get getUsersLoading(): boolean {
    return this._state.usersLoading
  }

  public setLoading(loading: boolean): void {
    this._state.loading = loading
  }

  public setSubmitting(submitting: boolean): void {
    this._state.submitting = submitting
  }

  public setUsersLoading(loading: boolean): void {
    this._state.usersLoading = loading
  }

  public setNotifications(data: TNotificationListData): void {
    this._state.items = (data.items ?? []).map(
      item => new NotificationModel(item)
    )
    this._state.meta = { ...emptyMeta(), ...(data.meta ?? {}) }
    this._state.unreadCount = data.meta?.unreadCount ?? 0
  }

  public setSelected(notification: TNotification | null): void {
    this._state.selected = notification
      ? new NotificationModel(notification)
      : null
  }

  public setUnreadCount(count: number): void {
    this._state.unreadCount = count
    this._state.meta.unreadCount = count
  }

  public setUsers(
    users: Array<{
      id: string
      fristname: string
      lastname: string
      phone: string
    }>
  ): void {
    this._state.users = users.map(user => new NotificationUserModel(user))
  }

  public markSeen(id: string): void {
    const item = this._state.items.find(notification => notification.id === id)
    if (!item || item.seen) return

    item.seen = true
    this._state.unreadCount = Math.max(0, this._state.unreadCount - 1)
    this._state.meta.unreadCount = this._state.unreadCount
  }

  public markAllSeen(): void {
    this._state.items = this._state.items.map(
      item => new NotificationModel({ ...item, seen: true })
    )
    this._state.unreadCount = 0
    this._state.meta.unreadCount = 0
  }

  public upsertNotification(notification: TNotification): void {
    const model = new NotificationModel(notification)
    const index = this._state.items.findIndex(item => item.id === model.id)

    if (index === -1) {
      this._state.items = [model, ...this._state.items]
    } else {
      this._state.items.splice(index, 1, model)
    }

    if (this._state.selected?.id === model.id) {
      this._state.selected = model
    }
  }

  public reset(): void {
    this._state.items = []
    this._state.selected = null
    this._state.users = []
    this._state.meta = emptyMeta()
    this._state.unreadCount = 0
    this._state.loading = false
    this._state.submitting = false
    this._state.usersLoading = false
  }
}

export const useNotificationsDS = () => NotificationsDS.getInstance()
