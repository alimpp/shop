export interface PublicNavigationItem {
  label: string;
  icon: string;
  to: string;
}

export const publicNavigation: PublicNavigationItem[] = [
  {
    label: "خانه",
    icon: "i-lucide-house",
    to: "/#home"
  },
  {
    label: "محصولات",
    icon: "i-lucide-package-search",
    to: "/products"
  },
  {
    label: "بلاگ",
    icon: "i-lucide-newspaper",
    to: "/#blog"
  },
  {
    label: "درباره ما",
    icon: "i-lucide-info",
    to: "/#about"
  },
  {
    label: "تماس با ما",
    icon: "i-lucide-phone",
    to: "/#contact"
  }
];
