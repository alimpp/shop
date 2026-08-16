interface SitemapProductItem {
  slug: string;
  updatedAt?: string;
}

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "public, max-age=3600, s-maxage=3600");

  const config = useRuntimeConfig();

  let items: SitemapProductItem[] = [];

  try {
    const response = await $fetch<{
      items: SitemapProductItem[];
    }>(`${config.public.apiBase}/products?limit=100&status=published&isActive=true`, {
      timeout: 5000,
    });

    items = response?.items ?? [];
  } catch {
    items = [];
  }

  return items.map((product) => ({
    loc: `/products/${product.slug}`,
    lastmod: product.updatedAt,
  }));
});