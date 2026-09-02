export type TNotificationType =
  | "message"
  | "transaction"
  | "order_registered"
  | "order_confirmed"
  | "order_preparing"
  | "order_shipping"
  | "order_completed"
  | "order_cancelled"
  | "order_returned";

export interface TNotification {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: TNotificationType;
  seen: boolean;
  link?: string | null;
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
  link?: string;
}

export const NOTIFICATION_TYPE_LABELS: Record<TNotificationType, string> = {
  message: "پیام",
  transaction: "تراکنش",
  order_registered: "ثبت سفارش",
  order_confirmed: "تایید سفارش",
  order_preparing: "سفارش در حال آماده‌سازی",
  order_shipping: "ارسال سفارش",
  order_completed: "تکمیل سفارش",
  order_cancelled: "لغو سفارش",
  order_returned: "مرجوع سفارش",
};
