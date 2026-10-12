export const PERMISSION_ACTIONS = ['view', 'create', 'edit', 'delete'] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const PERMISSION_RESOURCES = [
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
  'faqs',
] as const;

export type PermissionResource = (typeof PERMISSION_RESOURCES)[number];

export type ResourcePermissions = Record<PermissionAction, boolean>;

export type AdminPermissionsMap = Partial<
  Record<PermissionResource, Partial<ResourcePermissions>>
>;

export const PERMISSION_RESOURCE_LABELS: Record<PermissionResource, string> = {
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
  faqs: 'سوالات متداول',
};

export const PERMISSION_ACTION_LABELS: Record<PermissionAction, string> = {
  view: 'مشاهده',
  create: 'ایجاد',
  edit: 'ویرایش',
  delete: 'حذف',
};

export function emptyResourcePermissions(): ResourcePermissions {
  return {
    view: false,
    create: false,
    edit: false,
    delete: false,
  };
}

export function createFullPermissions(): AdminPermissionsMap {
  return PERMISSION_RESOURCES.reduce((acc, resource) => {
    acc[resource] = {
      view: true,
      create: true,
      edit: true,
      delete: true,
    };
    return acc;
  }, {} as AdminPermissionsMap);
}

export function normalizePermissions(
  input?: AdminPermissionsMap | null,
): AdminPermissionsMap {
  const result: AdminPermissionsMap = {};

  for (const resource of PERMISSION_RESOURCES) {
    const current = input?.[resource];
    result[resource] = {
      view: Boolean(current?.view),
      create: Boolean(current?.create),
      edit: Boolean(current?.edit),
      delete: Boolean(current?.delete),
    };
  }

  return result;
}

export function hasPermission(
  permissions: AdminPermissionsMap | null | undefined,
  resource: PermissionResource,
  action: PermissionAction,
  isSuperAdmin = false,
): boolean {
  if (isSuperAdmin) return true;
  return Boolean(permissions?.[resource]?.[action]);
}
