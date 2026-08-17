import type { ServerResponse } from "~/types/common";
import { BaseApp } from "~/core/BaseApp";
import type {
  TCreateNotificationPayload,
  TNotification,
  TNotificationListData,
  TNotificationListQuery,
} from "../types/index.type";

export class NotificationService extends BaseApp<TNotification> {
  constructor() {
    super("notification");
  }

  public async getNotifications(
    query?: TNotificationListQuery
  ): Promise<ServerResponse<TNotificationListData>> {
    return this.executeRequest<TNotificationListData>(async () => {
      const response = await this.Get<ServerResponse<any>>(
        "/notifications",
        query as Record<string, any>
      );

      return {
        ...response,
        data: {
          items: Array.isArray(response.data?.items) ? response.data.items : [],
          meta: {
            total: response.data?.total ?? 0,
            page: response.data?.page ?? 1,
            limit: response.data?.limit ?? 20,
            totalPages: response.data?.totalPages ?? 1,
            unreadCount: response.data?.unreadCount ?? 0,
          },
        },
      };
    });
  }

  public async getUnreadCount(): Promise<ServerResponse<{ count: number }>> {
    return this.executeRequest<{ count: number }>(async () => {
      return await this.Get<ServerResponse<{ count: number }>>(
        "/notifications/unread-count"
      );
    });
  }

  public async markAsSeen(
    id: string
  ): Promise<ServerResponse<TNotification>> {
    return this.executeRequest<TNotification>(async () => {
      return await this.Patch<ServerResponse<TNotification>>(
        `/notifications/${id}/seen`,
        {}
      );
    });
  }

  public async markAllAsSeen(): Promise<
    ServerResponse<{ message: string }>
  > {
    return this.executeRequest<{ message: string }>(async () => {
      return await this.Patch<ServerResponse<{ message: string }>>(
        "/notifications/seen-all",
        {}
      );
    });
  }

  public async createNotification(
    payload: TCreateNotificationPayload
  ): Promise<ServerResponse<TNotification>> {
    return this.executeRequest<TNotification>(async () => {
      return await this.Post<ServerResponse<TNotification>>(
        "/notifications",
        payload
      );
    });
  }

  public async getUsers(): Promise<
    ServerResponse<
      Array<{
        id: string;
        fristname: string;
        lastname: string;
        phone: string;
      }>
    >
  > {
    return this.executeRequest(async () => {
      const response = await this.Get<ServerResponse<any[]>>("/users/all");
      const users = Array.isArray(response.data) ? response.data : [];

      return {
        ...response,
        data: users.map((user) => ({
          id: user.id,
          fristname: user.fristname ?? "",
          lastname: user.lastname ?? "",
          phone: user.phone ?? "",
        })),
      };
    });
  }
}
