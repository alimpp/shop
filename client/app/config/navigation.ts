import type { NavigationMenuItem } from '@nuxt/ui'
import type { TPermissionResource } from '~/features/permissions/types/index.type'

export interface AppNavigationItem extends NavigationMenuItem {
  permissionResource?: TPermissionResource
  children?: AppNavigationItem[]
}

export const navigation: AppNavigationItem[][] = [
  [
    {
      label: 'داشبورد',
      icon: 'solar:chart-linear',
      to: '/admin/dashboard',
      permissionResource: 'dashboard'
    },
    {
      label: 'دسته‌بندی‌ها',
      icon: 'iconamoon:category-light',
      to: '/admin/categories',
      permissionResource: 'categories'
    },
    {
      label: 'محصولات',
      icon: 'lucide:package-2',
      to: '/admin/products',
      permissionResource: 'products'
    },
    {
      label: 'قیمت‌گذاری',
      icon: 'i-lucide-tags',
      to: '/admin/pricing',
      permissionResource: 'pricing'
    },
    {
      label: 'هشدار موجودی',
      icon: 'i-lucide-triangle-alert',
      to: '/admin/stock',
      permissionResource: 'stock'
    },
    {
      label: 'تاریخچه موجودی',
      icon: 'i-lucide-history',
      to: '/admin/stock-history',
      permissionResource: 'stock_history'
    },
    {
      label: 'بنرها',
      icon: 'i-lucide-images',
      to: '/admin/banners',
      permissionResource: 'banners'
    },
    {
      label: 'استوری‌ها',
      icon: 'i-lucide-book-open',
      to: '/admin/stories',
      permissionResource: 'stories'
    },
    {
      label: 'بلاگ‌ها',
      icon: 'i-lucide-newspaper',
      to: '/admin/blogs',
      permissionResource: 'blogs'
    },
    {
      label: 'سوالات متداول',
      icon: 'i-lucide-circle-help',
      to: '/admin/faqs',
      permissionResource: 'faqs'
    },
    {
      label: 'برندها',
      icon: 'i-lucide-badge-percent',
      to: '/admin/brands',
      permissionResource: 'brands'
    },
    {
      label: 'ویژگی‌ها',
      icon: 'i-lucide-sliders-horizontal',
      to: '/admin/attributes',
      permissionResource: 'attributes'
    },
    {
      label: 'فایل‌ها',
      icon: 'lucide:files',
      to: '/admin/files',
      permissionResource: 'files'
    },
    {
      label: 'چت پشتیبانی',
      icon: 'i-lucide-message-circle',
      to: '/admin/chat',
      permissionResource: 'chat'
    },
    {
      label: 'پیام‌های تماس',
      icon: 'i-lucide-mail',
      to: '/admin/contact',
      permissionResource: 'contact'
    },
    {
      label: 'کاربران',
      icon: 'i-lucide-users',
      to: '/admin/users',
      permissionResource: 'users'
    },
    {
      label: 'سفارش‌ها',
      icon: 'i-lucide-shopping-bag',
      to: '/admin/orders',
      permissionResource: 'orders'
    },
    {
      label: 'تراکنش‌های پرداخت',
      icon: 'i-lucide-credit-card',
      to: '/admin/payments',
      permissionResource: 'payments'
    },
    {
      label: 'کدهای تخفیف',
      icon: 'i-lucide-ticket-percent',
      to: '/admin/discounts',
      permissionResource: 'discounts'
    },
    {
      label: 'اعلان‌ها',
      icon: 'i-lucide-bell',
      to: '/admin/notifications',
      permissionResource: 'notifications'
    },
    {
      label: 'ادمین‌ها',
      icon: 'i-lucide-shield-check',
      to: '/admin/admins',
      permissionResource: 'admins'
    }
  ]
]

export const ADMIN_ROUTE_PERMISSIONS: Record<string, TPermissionResource> = {
  '/admin/dashboard': 'dashboard',
  '/admin/categories': 'categories',
  '/admin/products': 'products',
  '/admin/pricing': 'pricing',
  '/admin/stock': 'stock',
  '/admin/stock-history': 'stock_history',
  '/admin/banners': 'banners',
  '/admin/stories': 'stories',
  '/admin/blogs': 'blogs',
  '/admin/faqs': 'faqs',
  '/admin/brands': 'brands',
  '/admin/attributes': 'attributes',
  '/admin/files': 'files',
  '/admin/chat': 'chat',
  '/admin/contact': 'contact',
  '/admin/users': 'users',
  '/admin/orders': 'orders',
  '/admin/payments': 'payments',
  '/admin/discounts': 'discounts',
  '/admin/notifications': 'notifications',
  '/admin/admins': 'admins'
}
