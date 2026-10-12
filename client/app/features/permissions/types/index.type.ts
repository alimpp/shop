export type TPermissionAction = 'view' | 'create' | 'edit' | 'delete'

export type TPermissionResource =
  | 'dashboard'
  | 'categories'
  | 'products'
  | 'pricing'
  | 'stock'
  | 'stock_history'
  | 'banners'
  | 'stories'
  | 'blogs'
  | 'brands'
  | 'attributes'
  | 'files'
  | 'chat'
  | 'contact'
  | 'users'
  | 'orders'
  | 'payments'
  | 'discounts'
  | 'notifications'
  | 'admins'
  | 'faqs'

export type TResourcePermissions = Record<TPermissionAction, boolean>

export type TAdminPermissionsMap = Partial<
  Record<TPermissionResource, Partial<TResourcePermissions>>
>

export const PERMISSION_RESOURCES: TPermissionResource[] = [
  'dashboard',
  'categories',
  'products',
  'pricing',
  'stock',
  'stock_history',
  'banners',
  'stories',
  'blogs',
  'brands',
  'attributes',
  'files',
  'chat',
  'contact',
  'users',
  'orders',
  'payments',
  'discounts',
  'notifications',
  'admins',
  'faqs'
]

export const PERMISSION_RESOURCE_LABELS: Record<TPermissionResource, string> = {
  dashboard: 'داشبورد',
  categories: 'دسته‌بندی‌ها',
  products: 'محصولات',
  pricing: 'قیمت‌گذاری',
  stock: 'هشدار موجودی',
  stock_history: 'تاریخچه موجودی',
  banners: 'بنرها',
  stories: 'استوری‌ها',
  blogs: 'بلاگ‌ها',
  brands: 'برندها',
  attributes: 'ویژگی‌ها',
  files: 'فایل‌ها',
  chat: 'چت پشتیبانی',
  contact: 'پیام‌های تماس',
  users: 'کاربران',
  orders: 'سفارش‌ها',
  payments: 'تراکنش‌های پرداخت',
  discounts: 'کدهای تخفیف',
  notifications: 'اعلان‌ها',
  admins: 'مدیریت ادمین‌ها',
  faqs: 'سوالات متداول'
}

export const PERMISSION_ACTION_LABELS: Record<TPermissionAction, string> = {
  view: 'مشاهده',
  create: 'ایجاد',
  edit: 'ویرایش',
  delete: 'حذف'
}

export function emptyPermissions(): TAdminPermissionsMap {
  return PERMISSION_RESOURCES.reduce((acc, resource) => {
    acc[resource] = {
      view: false,
      create: false,
      edit: false,
      delete: false
    }
    return acc
  }, {} as TAdminPermissionsMap)
}

export function fullPermissions(): TAdminPermissionsMap {
  return PERMISSION_RESOURCES.reduce((acc, resource) => {
    acc[resource] = {
      view: true,
      create: true,
      edit: true,
      delete: true
    }
    return acc
  }, {} as TAdminPermissionsMap)
}
