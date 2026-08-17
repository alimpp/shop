import type { ControllerResponse, ServerResponse } from "~/types/common";
import { BaseController } from "~/core/BaseController";
import { NotificationService } from "../services/index.service";
import type {
  TCreateNotificationPayload,
  TNotification,
  TNotificationListData,
  TNotificationListQuery,
} from "../types/index.type";

class NotificationController extends BaseController<NotificationService> {
  constructor() {
    super(new NotificationService());
  }

  public async getNotifications(
    query?: TNotificationListQuery
  ): Promise<ControllerResponse<TNotificationListData>> {
    const response: ServerResponse<TNotificationListData> =
      await this.service.getNotifications(query);
    return this.handleResponse(response);
  }

  public async getUnreadCount(): Promise<
    ControllerResponse<{ count: number }>
  > {
    const response = await this.service.getUnreadCount();
    return this.handleResponse(response);
  }

  public async markAsSeen(
    id: string
  ): Promise<ControllerResponse<TNotification>> {
    const response = await this.service.markAsSeen(id);
    return this.handleResponse(response);
  }

  public async markAllAsSeen(): Promise<
    ControllerResponse<{ message: string }>
  > {
    const response = await this.service.markAllAsSeen();
    return this.handleResponse(response);
  }

  public async createNotification(
    payload: TCreateNotificationPayload
  ): Promise<ControllerResponse<TNotification>> {
    const response = await this.service.createNotification(payload);
    return this.handleResponse(response);
  }

  public async getUsers(): Promise<
    ControllerResponse<
      Array<{
        id: string;
        fristname: string;
        lastname: string;
        phone: string;
      }>
    >
  > {
    const response = await this.service.getUsers();
    return this.handleResponse(response);
  }
}

export const notificationController = new NotificationController();
