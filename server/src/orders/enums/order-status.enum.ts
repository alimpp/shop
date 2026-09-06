export enum OrderStatus {
  PENDING_CONFIRMATION = 'pending_confirmation',
  PROCESSING = 'processing',
  SHIPPING = 'shipping',
  SUCCESS = 'success',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_CONFIRMATION]: 'در انتظار تایید',
  [OrderStatus.PROCESSING]: 'در حال پردازش',
  [OrderStatus.SHIPPING]: 'در حال ارسال',
  [OrderStatus.SUCCESS]: 'تکمیل شده',
  [OrderStatus.CANCELLED]: 'لغو شده',
  [OrderStatus.RETURNED]: 'مرجوع شده',
};

export const ORDER_STATUS_GUIDANCE: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_CONFIRMATION]:
    'سفارش ثبت شده و منتظر تایید تیم فروشگاه است.',
  [OrderStatus.PROCESSING]:
    'سفارش تایید شده و در حال آماده‌سازی و پردازش است.',
  [OrderStatus.SHIPPING]:
    'سفارش بسته‌بندی شده و در مسیر ارسال به آدرس شماست.',
  [OrderStatus.SUCCESS]:
    'سفارش با موفقیت تکمیل شده و فرآیند تحویل انجام شده است.',
  [OrderStatus.CANCELLED]:
    'این سفارش لغو شده است؛ در صورت پرداخت، پیگیری عودت از پشتیبانی انجام می‌شود.',
  [OrderStatus.RETURNED]:
    'این سفارش مرجوع شده است و موضوع توسط پشتیبانی پیگیری می‌شود.',
};
