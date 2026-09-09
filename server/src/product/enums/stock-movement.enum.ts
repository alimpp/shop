export enum StockMovementReason {
  ORDER_PLACED = 'order_placed',
  ORDER_CANCELLED = 'order_cancelled',
  ORDER_RETURNED = 'order_returned',
  ORDER_RESTOCKED = 'order_restocked',
  ADMIN_UPDATE = 'admin_update',
  ADMIN_PRICING = 'admin_pricing',
}

export const STOCK_MOVEMENT_REASON_LABELS: Record<StockMovementReason, string> = {
  [StockMovementReason.ORDER_PLACED]: 'ثبت سفارش',
  [StockMovementReason.ORDER_CANCELLED]: 'لغو سفارش',
  [StockMovementReason.ORDER_RETURNED]: 'مرجوع سفارش',
  [StockMovementReason.ORDER_RESTOCKED]: 'بازگشت موجودی سفارش',
  [StockMovementReason.ADMIN_UPDATE]: 'ویرایش ادمین',
  [StockMovementReason.ADMIN_PRICING]: 'قیمت‌گذاری ادمین',
};

export enum StockMovementActorType {
  SYSTEM = 'system',
  ADMIN = 'admin',
  USER = 'user',
}

export const STOCK_MOVEMENT_ACTOR_LABELS: Record<
  StockMovementActorType,
  string
> = {
  [StockMovementActorType.SYSTEM]: 'سیستم',
  [StockMovementActorType.ADMIN]: 'ادمین',
  [StockMovementActorType.USER]: 'کاربر',
};
