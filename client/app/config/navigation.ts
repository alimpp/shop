import type { NavigationMenuItem } from "@nuxt/ui";

export interface AppNavigationItem extends NavigationMenuItem {
  permission?: boolean;
  children?: AppNavigationItem[];
}

export const navigation: AppNavigationItem[][] = [
  [
    {
      label: "داشبورد",
      icon: "solar:chart-linear",
      to: "/admin/dashboard",
      permission: true,
    },
    {
      label: "دسته بندی ها",
      icon: "iconamoon:category-light",
      to: "/admin/categories",
      permission: true,
    },
    {
      label: "محصولات",
      icon: "lucide:package-2",
      to: "/admin/products",
      permission: true,
    },
    {
      label: "بنرها",
      icon: "i-lucide-images",
      to: "/admin/banners",
      permission: true,
    },
    {
      label: "استوری‌ها",
      icon: "i-lucide-book-open",
      to: "/admin/stories",
      permission: true,
    },
    {
      label: "بلاگ‌ها",
      icon: "i-lucide-newspaper",
      to: "/admin/blogs",
      permission: true,
    },
    {
      label: "برندها",
      icon: "i-lucide-badge-percent",
      to: "/admin/brands",
      permission: true,
    },
    {
      label: "ویژگی‌ها",
      icon: "i-lucide-sliders-horizontal",
      to: "/admin/attributes",
      permission: true,
    },
    {
      label: "فایل‌ها",
      icon: "lucide:files",
      to: "/admin/files",
      permission: true,
    },
  ],
];
