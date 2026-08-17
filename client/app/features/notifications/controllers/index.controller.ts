import type { ControllerResponse, ServerResponse } from '~/types/common'

import { BaseController } from '~/core/BaseController'
import { NotificationsDS } from '../data/index.store'
import { NotificationService } from '../services/index.service'

import type {
  TCreateNotificationPayload,
  TNotification,
  TNotificationListData,
  TNotificationListQuery
} from '../types/index.type'

class NotificationController extends BaseController<NotificationService> {
  constructor() {
    super(new NotificationService())
  }

  private readonly notificationsDS = NotificationsDS.getInstance()

  public async getNotifications(
    query?: TNotificationListQuery
  ): Promise<ControllerResponse<TNotificationListData>> {
    this.notificationsDS.setLoading(true)

    const response: ServerResponse<TNotificationListData>
      = await this.service.getNotifications(query)

    if (response.success && response.data) {
      this.notificationsDS.setNotifications(response.data)
    }

    this.notificationsDS.setLoading(false)
    return this.handleResponse(response)
  }

  public async getUnreadCount(): Promise<
    ControllerResponse<{ count: number }>
  > {
    const response = await this.service.getUnreadCount()

    if (response.success && response.data) {
      this.notificationsDS.setUnreadCount(response.data.count)
    }

    return this.handleResponse(response)
  }

  public async markAsSeen(
    id: string
  ): Promise<ControllerResponse<TNotification>> {
    this.notificationsDS.setSubmitting(true)

    const response = await this.service.markAsSeen(id)

    if (response.success) {
      this.notificationsDS.markSeen(id)
      if (response.data) {
        this.notificationsDS.upsertNotification(response.data)
      }
    }

    this.notificationsDS.setSubmitting(false)
    return this.handleResponse(response)
  }

  public async markAllAsSeen(): Promise<
    ControllerResponse<{ message: string }>
  > {
    this.notificationsDS.setSubmitting(true)

    const response = await this.service.markAllAsSeen()

    if (response.success) {
      this.notificationsDS.markAllSeen()
    }

    this.notificationsDS.setSubmitting(false)
    return this.handleResponse(response)
  }

  public async createNotification(
    payload: TCreateNotificationPayload
  ): Promise<ControllerResponse<TNotification>> {
    this.notificationsDS.setSubmitting(true)

    const response = await this.service.createNotification(payload)

    if (response.success && response.data) {
      this.notificationsDS.upsertNotification(response.data)
    }

    this.notificationsDS.setSubmitting(false)
    return this.handleResponse(response)
  }

  public async getUsers(): Promise<
    ControllerResponse<
      Array<{
        id: string
        fristname: string
        lastname: string
        phone: string
      }>
    >
  > {
    this.notificationsDS.setUsersLoading(true)

    const response = await this.service.getUsers()

    if (response.success && response.data) {
      this.notificationsDS.setUsers(response.data)
    }

    this.notificationsDS.setUsersLoading(false)
    return this.handleResponse(response)
  }
}

export const notificationController = new NotificationController()
