export const SITE_NAME = 'فروشگاه دیجیتال'

export const DEFAULT_ROBOTS =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

export const NOINDEX_ROBOTS = 'noindex, nofollow'

export function toAbsoluteUrl(
  url: string | undefined | null,
  origin: string
): string {
  if (!url?.trim()) return ''

  const value = url.trim()
  if (/^https?:\/\//i.test(value)) return value

  const path = value.startsWith('/') ? value : `/${value}`
  return `${origin}${path}`
}

export function resolveProductTitle(
  product: { metaTitle?: string; name?: string } | null | undefined
): string {
  if (!product) return SITE_NAME
  return product.metaTitle?.trim() || product.name?.trim() || SITE_NAME
}

export function resolveSocialTitle(
  product: { metaTitle?: string; name?: string } | null | undefined
): string {
  const title = resolveProductTitle(product)
  if (!product || title === SITE_NAME) return SITE_NAME
  return `${title} | ${SITE_NAME}`
}

export function resolveProductDescription(
  product:
    | {
        metaDescription?: string
        shortDescription?: string
        description?: string
      }
    | null
    | undefined,
  maxLength = 160
): string {
  if (!product) return ''

  const text =
    product.metaDescription?.trim()
    || product.shortDescription?.trim()
    || product.description?.trim()
    || ''

  return text.slice(0, maxLength)
}

export function resolveProductOgImage(
  product:
    | {
        ogImage?: string
        medias?: Array<{ url?: string }>
      }
    | null
    | undefined,
  origin: string
): string {
  if (!product) return ''

  const dedicated = product.ogImage?.trim()
  if (dedicated) return toAbsoluteUrl(dedicated, origin)

  return toAbsoluteUrl(product.medias?.[0]?.url, origin)
}

export function resolveProductImages(
  product: { ogImage?: string; medias?: Array<{ url?: string }> } | null | undefined,
  origin: string
): string[] {
  if (!product) return []

  const images = new Set<string>()

  const ogImage = resolveProductOgImage(product, origin)
  if (ogImage) images.add(ogImage)

  for (const media of product.medias ?? []) {
    const absolute = toAbsoluteUrl(media.url, origin)
    if (absolute) images.add(absolute)
  }

  return Array.from(images)
}

export function resolveProductCanonical(
  product: { canonical?: string; slug?: string } | null | undefined,
  origin: string,
  fallbackHref: string
): string {
  const custom = product?.canonical?.trim()
  if (custom) {
    return toAbsoluteUrl(custom, origin) || custom
  }

  if (product?.slug) {
    return `${origin}/products/${product.slug}`
  }

  return fallbackHref
}
