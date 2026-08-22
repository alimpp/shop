import type { TNotificationType } from '../types/index.type'

export const NOTIFICATION_TYPE_META: Record<
  TNotificationType,
  { icon: string; color: string }
> = {
  message: { icon: 'i-lucide-message-circle', color: 'primary' },
  transaction: { icon: 'i-lucide-wallet', color: 'success' },
  order_registered: { icon: 'i-lucide-package-plus', color: 'info' },
  order_confirmed: { icon: 'i-lucide-badge-check', color: 'success' },
  order_preparing: { icon: 'i-lucide-package', color: 'warning' },
  order_shipping: { icon: 'i-lucide-truck', color: 'primary' },
  order_cancelled: { icon: 'i-lucide-package-x', color: 'error' },
  order_returned: { icon: 'i-lucide-undo-2', color: 'neutral' }
}
