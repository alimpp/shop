export const SITE_NAME = 'فروشگاه دیجیتال'

export const SITE_LOGO_PATH = '/image/logo/logo.png'

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
  return `${origin.replace(/\/+$/, '')}${path}`
}

export function buildCanonicalUrl(origin: string, path: string): string {
  const base = origin.replace(/\/+$/, '')
  const normalized = path.startsWith('/') ? path : `/${path}`
  const cleanPath
    = normalized.length > 1 ? normalized.replace(/\/+$/, '') : normalized
  return `${base}${cleanPath}`
}

export function resolveSiteLogoUrl(origin: string): string {
  return toAbsoluteUrl(SITE_LOGO_PATH, origin)
}

export function clampMetaDescription(text: string, maxLength = 160): string {
  const normalized = text.trim().replace(/\s+/g, ' ')
  if (normalized.length <= maxLength) return normalized

  const slice = normalized.slice(0, Math.max(0, maxLength - 1))
  const lastSpace = slice.lastIndexOf(' ')
  const cut = lastSpace > Math.floor(maxLength * 0.6) ? slice.slice(0, lastSpace) : slice
  return `${cut.trim()}…`
}

export function resolvePageSocialTitle(pageTitle: string): string {
  const title = pageTitle.trim()
  if (!title) return SITE_NAME
  if (title.includes(SITE_NAME)) return title
  return `${title} | ${SITE_NAME}`
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

export function resolveBlogTitle(
  blog: { metaTitle?: string; title?: string } | null | undefined
): string {
  if (!blog) return 'مجله فروشگاه'
  return blog.metaTitle?.trim() || blog.title?.trim() || 'مجله فروشگاه'
}

export function resolveBlogSocialTitle(
  blog: { metaTitle?: string; title?: string } | null | undefined
): string {
  const title = resolveBlogTitle(blog)
  if (title === 'مجله فروشگاه') return SITE_NAME
  return `${title} | ${SITE_NAME}`
}

export function resolveBlogDescription(
  blog:
    | {
        metaDescription?: string
        summary?: string
      }
    | null
    | undefined,
  maxLength = 160
): string {
  if (!blog) return ''

  const text = blog.metaDescription?.trim() || blog.summary?.trim() || ''
  return text.slice(0, maxLength)
}

export function resolveBlogOgImage(
  blog:
    | {
        ogImage?: string
        coverImage?: string
      }
    | null
    | undefined,
  origin: string
): string {
  if (!blog) return ''

  const dedicated = blog.ogImage?.trim() || blog.coverImage?.trim()
  return toAbsoluteUrl(dedicated, origin)
}

export function resolveBlogCanonical(
  blog: { canonical?: string; slug?: string } | null | undefined,
  origin: string,
  fallbackHref: string
): string {
  const custom = blog?.canonical?.trim()
  if (custom) {
    return toAbsoluteUrl(custom, origin) || custom
  }

  if (blog?.slug) {
    return `${origin}/blog/${blog.slug}`
  }

  return fallbackHref
}

export function formatBlogDate(value?: string | Date | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}
