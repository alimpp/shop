export type TNotificationType =
  | "message"
  | "transaction"
  | "order_registered"
  | "order_preparing"
  | "order_shipping"
  | "order_cancelled";

export interface TNotification {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: TNotificationType;
  seen: boolean;
  created_at: string;
}

export interface TNotificationListQuery {
  page?: number;
  limit?: number;
  seen?: boolean;
  type?: TNotificationType;
}

export interface TNotificationListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export interface TNotificationListData {
  items: TNotification[];
  meta: TNotificationListMeta;
}

export interface TCreateNotificationPayload {
  userId: string;
  title: string;
  description: string;
  type: TNotificationType;
}

export const NOTIFICATION_TYPE_LABELS: Record<TNotificationType, string> = {
  message: "پیام",
  transaction: "تراکنش",
  order_registered: "سفارش ثبت شده",
  order_preparing: "سفارش در حال آماده‌سازی",
  order_shipping: "سفارش در حال ارسال",
  order_cancelled: "سفارش لغو شده",
};
