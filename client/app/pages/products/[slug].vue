<script setup lang="ts">
import { interactionsController } from '~/features/interactions/controllers/index.controller'
import { favoritesController } from '~/features/favorites/controllers/index.controller'
import { productsController } from '~/features/products/controllers/index.controller'
import { cartController } from '~/features/cart/controllers/index.controller'
import { useInteractionsDS } from '~/features/interactions/data/index.store'
import { useFavoritesDS } from '~/features/favorites/data/index.store'
import { TInteractionTargetType } from '~/features/interactions/types/index.type'
import type { TProduct, TProductVariant } from '~/features/products/types/index.type'

const route = useRoute()
const toast = useToast()
const addingToCart = ref(false)
const interactionsDS = useInteractionsDS()
const favoritesDS = useFavoritesDS()

const slug = String(route.params.slug ?? '')

const product = ref<TProduct | null>(null)
const loading = ref(true)
const notFound = ref(false)

const commentText = ref('')
const commentsLimit = 10

const liked = computed(() => interactionsDS.getLiked)
const likeCount = computed(() => interactionsDS.getLikeCount)
const likeLoading = computed(() => interactionsDS.getLikeLoading)
const comments = computed(() => interactionsDS.getComments)
const commentsMeta = computed(() => interactionsDS.getCommentsMeta)
const commentsLoading = computed(() => interactionsDS.getCommentsLoading)
const commentsLoaded = computed(() => interactionsDS.getCommentsLoaded)
const commentSubmitting = computed(() => interactionsDS.getCommentSubmitting)
const hasMoreComments = computed(() => interactionsDS.getHasMoreComments)
const favorited = computed(() =>
  product.value ? favoritesDS.isFavorited(product.value.id) : false
)
const favoriteLoading = computed(() => favoritesDS.getSubmitting)

const selectedMediaIndex = ref(0)
const quantity = ref(1)
const selectedVariantId = ref('')
const selectedOptions = reactive<Record<string, string>>({})

const token = useCookie<string | null>('token')

const isLoggedIn = computed(() => Boolean(token.value))

const hasDiscount = computed(() => {
  const p = product.value
  return (
    !!p
    && typeof p.salePrice === 'number'
    && p.salePrice > 0
    && p.salePrice < p.price
  )
})

const displayPrice = computed(() => {
  const variant = activeVariant.value
  const basePrice = variant ? (variant.salePrice ?? variant.price) : (hasDiscount.value ? product.value!.salePrice! : product.value!.price)
  return basePrice
})

const originalPrice = computed(() => {
  const variant = activeVariant.value
  if (variant) {
    return variant.price
  }
  return hasDiscount.value ? product.value!.price : null
})

const discountPercent = computed(() => {
  const orig = originalPrice.value
  const sale = displayPrice.value
  if (!orig || orig <= 0 || sale >= orig) return 0
  return Math.round((1 - sale / orig) * 100)
})

const stock = computed(() => {
  const variant = activeVariant.value
  if (variant) {
    return variant.stock
  }
  return product.value?.stock ?? 0
})

const isOutOfStock = computed(() => {
  const variant = activeVariant.value
  if (variant) {
    if (!variant.manageStock || variant.allowBackorder) return false
    return variant.stock <= 0
  }

  const p = product.value
  if (!p) return true
  if (!p.manageStock || p.allowBackorder) return false
  return (p.stock ?? 0) <= 0
})

const activeVariant = computed<TProductVariant | null>(() => {
  if (!product.value?.variants?.length || !selectedVariantId.value) {
    return null
  }
  return product.value.variants.find(v => v.id === selectedVariantId.value) ?? null
})

const hasVariants = computed(() => Boolean(product.value?.variants?.length))

function pickDefaultVariant(p: TProduct): TProductVariant | null {
  const active = (p.variants ?? []).filter(variant => variant.isActive !== false)
  if (!active.length) return null
  return active.find(variant => variant.isDefault) ?? active[0] ?? null
}

function applyProductDefaults(p: TProduct): void {
  Object.keys(selectedOptions).forEach((key) => {
    delete selectedOptions[key]
  })
  selectedVariantId.value = ''

  const defaultVariant = pickDefaultVariant(p)
  if (defaultVariant) {
    selectedVariantId.value = defaultVariant.id

    for (const variantValue of defaultVariant.values ?? []) {
      const attributeId =
        variantValue.attributeValue?.attributeId
        || variantValue.attributeValue?.attribute?.id
      if (!attributeId) continue

      const option = p.options?.find(
        item => item.attributeId === attributeId || item.attribute?.id === attributeId
      )
      if (!option) continue

      const optionKey = option.attribute?.slug ?? option.attributeId
      const optionValue = option.values?.find(
        value => value.attributeValueId === variantValue.attributeValueId
      )
      if (optionValue) {
        selectedOptions[optionKey] = optionValue.id
      }
    }
  }

  ensureOptionDefaults(p)

  if (p.variants?.length) {
    const matched = resolveVariantFromOptions()
    if (matched) {
      selectedVariantId.value = matched.id
    } else if (!selectedVariantId.value && defaultVariant) {
      selectedVariantId.value = defaultVariant.id
    }
  }
}

function ensureOptionDefaults(p: TProduct): void {
  p.options?.forEach((option) => {
    const optionKey = option.attribute?.slug ?? option.attributeId
    if (selectedOptions[optionKey]) return
    const firstValue = option.values?.[0]
    if (firstValue) {
      selectedOptions[optionKey] = firstValue.id
    }
  })
}

function ensureCartSelections(): void {
  if (!product.value) return

  ensureOptionDefaults(product.value)

  if (!product.value.variants?.length) return

  if (!selectedVariantId.value) {
    selectedVariantId.value =
      resolveVariantFromOptions()?.id
      ?? pickDefaultVariant(product.value)?.id
      ?? ''
    return
  }

  const matched = resolveVariantFromOptions()
  if (matched) {
    selectedVariantId.value = matched.id
  }
}

function collectSelectedOptions(p: TProduct): Array<{ optionValueId: string }> {
  return (p.options ?? [])
    .map((option) => {
      const optionKey = option.attribute?.slug ?? option.attributeId
      const optionValueId = selectedOptions[optionKey]
      return optionValueId ? { optionValueId } : null
    })
    .filter((item): item is { optionValueId: string } => Boolean(item))
}

function requireLogin(): boolean {
  if (!isLoggedIn.value) {
    toast.add({
      title: 'برای این عملیات ابتدا وارد حساب شوید',
      color: 'warning'
    })
    navigateTo('/auth/login-by-phone')
    return false
  }
  return true
}

async function loadProduct(): Promise<TProduct | null> {
  loading.value = true
  notFound.value = false

  const response = await productsController.getProductBySlug(slug)

  if (response.success && response.data) {
    product.value = response.data
    interactionsDS.setEntity(TInteractionTargetType.PRODUCT, response.data.id)
    interactionsDS.setLikeCount(response.data.likeCount ?? 0)
    applyProductDefaults(response.data)
  } else {
    notFound.value = true
    if (import.meta.client) {
      toast.add({
        title: response.message || 'محصول یافت نشد',
        color: 'error'
      })
    }
  }

  loading.value = false
  return product.value
}

const { data: ssrProduct, pending: ssrPending } = await useAsyncData(
  () => `product-${slug}`,
  () => loadProduct(),
  { default: () => null }
)

watchEffect(() => {
  loading.value = ssrPending.value

  if (ssrProduct.value && !product.value) {
    product.value = ssrProduct.value
    applyProductDefaults(ssrProduct.value)
  }

  if (!ssrPending.value && !ssrProduct.value && !product.value) {
    notFound.value = true
    loading.value = false
  }
})

async function loadLikeStatus(): Promise<void> {
  if (!product.value || !isLoggedIn.value) return
  await interactionsController.getLikeStatus({
    entityType: TInteractionTargetType.PRODUCT,
    entityId: product.value.id
  })
}

async function loadFavoriteStatus(): Promise<void> {
  if (!product.value || !isLoggedIn.value) return
  await favoritesController.getFavorites(1, 100)
}

async function toggleLike(): Promise<void> {
  if (!product.value || !requireLogin()) return
  if (likeLoading.value) return

  const response = await interactionsController.toggleLike({
    entityType: TInteractionTargetType.PRODUCT,
    entityId: product.value.id
  })

  if (!response.success) {
    toast.add({
      title: response.message,
      color: 'error'
    })
  }
}

async function toggleFavorite(): Promise<void> {
  if (!product.value || !requireLogin()) return
  if (favoriteLoading.value) return

  const response = await favoritesController.toggleFavorite(
    product.value.id,
    product.value
  )

  if (response.success && response.data) {
    toast.add({
      title: response.data.favorited ? 'به علاقه مندی ها اضافه شد' : 'از علاقه مندی ها حذف شد',
      color: 'success'
    })
  } else {
    toast.add({
      title: response.message,
      color: 'error'
    })
  }
}

async function loadComments(page = 1): Promise<void> {
  if (!product.value) return

  await interactionsController.getComments({
    entityType: TInteractionTargetType.PRODUCT,
    entityId: product.value.id,
    page,
    limit: commentsLimit
  })
}

async function submitComment(): Promise<void> {
  if (!product.value || !requireLogin()) return

  const content = commentText.value.trim()
  if (!content) {
    toast.add({ title: 'متن کامنت را وارد کنید', color: 'warning' })
    return
  }
  if (commentSubmitting.value) return

  const response = await interactionsController.createComment({
    entityType: TInteractionTargetType.PRODUCT,
    entityId: product.value.id,
    content
  })

  if (response.success) {
    commentText.value = ''
    toast.add({ title: 'کامنت شما ثبت شد', color: 'success' })
  } else {
    toast.add({
      title: response.message,
      color: 'error'
    })
  }
}

function resolveVariantFromOptions(): TProductVariant | null {
  if (!product.value?.variants?.length) return null

  const selectedAttributeValueIds = Object.entries(selectedOptions)
    .map(([optionKey, optionValueId]) => {
      if (!optionValueId) return null
      const option = product.value?.options?.find(
        item => (item.attribute?.slug ?? item.attributeId) === optionKey
      )
      const optionValue = option?.values?.find(value => value.id === optionValueId)
      return optionValue?.attributeValueId ?? null
    })
    .filter((id): id is string => Boolean(id))

  if (!selectedAttributeValueIds.length) {
    return activeVariant.value ?? pickDefaultVariant(product.value)
  }

  const matches = product.value.variants.filter((variant) => {
    if (variant.isActive === false) return false
    const variantValueIds = (variant.values ?? []).map(value => value.attributeValueId)
    return selectedAttributeValueIds.every(id => variantValueIds.includes(id))
  })

  const exact = matches.find(
    variant => (variant.values ?? []).length === selectedAttributeValueIds.length
  )

  return exact ?? matches[0] ?? activeVariant.value ?? pickDefaultVariant(product.value)
}

async function addToCart(): Promise<void> {
  if (!product.value || addingToCart.value) return
  if (!requireLogin()) return

  if (isOutOfStock.value) {
    toast.add({
      title: 'این محصول در حال حاضر موجود نیست',
      color: 'warning'
    })
    return
  }

  ensureCartSelections()

  const payload: {
    productId: string
    quantity: number
    variantId?: string
    selectedOptions?: Array<{ optionValueId: string }>
  } = {
    productId: product.value.id,
    quantity: quantity.value,
    selectedOptions: collectSelectedOptions(product.value)
  }

  if (hasVariants.value) {
    const variant =
      resolveVariantFromOptions()
      ?? activeVariant.value
      ?? pickDefaultVariant(product.value)

    if (variant) {
      payload.variantId = variant.id
      selectedVariantId.value = variant.id
    }
  }

  addingToCart.value = true
  const response = await cartController.addItem(payload)
  addingToCart.value = false

  if (!response.success) {
    toast.add({
      title: response.message || 'افزودن به سبد خرید ناموفق بود',
      color: 'error'
    })
    return
  }

  toast.add({
    title: 'به سبد خرید اضافه شد',
    color: 'success'
  })
}

function selectOption(slug: string, valueId: string): void {
  selectedOptions[slug] = valueId

  if (!hasVariants.value) return

  const matched = resolveVariantFromOptions()
  if (matched) {
    selectedVariantId.value = matched.id
  }
}

useSeoMeta({
  title: () => {
    const p = product.value
    return p?.metaTitle || (p ? `${p.name} | فروشگاه اینترنتی پرایم` : 'فروشگاه اینترنتی پرایم')
  },
  description: () => (product.value?.metaDescription || product.value?.shortDescription || product.value?.description || '').slice(0, 160),
  keywords: () => {
    const p = product.value
    return p?.keywords || (p ? `${p.name}, خرید ${p.name}, ${p?.category?.name ?? ''}` : '')
  },
  robots: 'index, follow, max-image-preview:large',
  ogTitle: () => {
    const p = product.value
    return p?.metaTitle || (p ? `${p.name} | فروشگاه اینترنتی پرایم` : 'فروشگاه اینترنتی پرایم')
  },
  ogDescription: () => (product.value?.metaDescription || product.value?.shortDescription || product.value?.description || '').slice(0, 160),
  ogImage: () => (product.value?.medias[0]?.url ?? product.value?.ogImage) || '',
  ogUrl: useRequestURL().href,
  ogSiteName: 'فروشگاه اینترنتی پرایم',
  ogLocale: 'fa_IR',
  twitterCard: 'summary_large_image',
  twitterTitle: () => {
    const p = product.value
    return p?.metaTitle || (p ? `${p.name} | فروشگاه اینترنتی پرایم` : 'فروشگاه اینترنتی پرایم')
  },
  twitterDescription: () => (product.value?.metaDescription || product.value?.shortDescription || product.value?.description || '').slice(0, 160),
  twitterImage: () => (product.value?.medias[0]?.url ?? product.value?.ogImage) || ''
})

useHead({
  meta: [
    {
      key: 'og:type',
      property: 'og:type',
      content: 'product'
    }
  ],
  link: [
    {
      rel: 'canonical',
      href: () => product.value?.canonical || useRequestURL().href
    }
  ]
})

useSchemaOrg(() => {
  const p = product.value
  if (!p) {
    return []
  }

  const origin = useRequestURL().origin

  return [
    defineProduct({
      name: p.name,
      description: p.metaDescription || p.shortDescription || p.description,
      sku: p.sku,
      image: p.medias.map(m => m.url),
      brand: p.brand?.name || false,
      category: p.category?.name,
      url: origin + p.slug,
      offers: [
        defineOffer({
          price: String(displayPrice.value),
          priceCurrency: 'IRR',
          availability: isOutOfStock.value ? 'OutOfStock' : 'InStock',
          itemCondition: 'NewCondition',
          url: origin + p.slug
        })
      ],
      aggregateRating: likeCount.value > 0
        ? defineAggregateRating({
            ratingValue: 5,
            reviewCount: likeCount.value
          })
        : undefined,
      review: comments.value.slice(0, 10).map(comment =>
        defineReview({
          name: `نظر کاربر درباره ${p.name}`,
          reviewRating: {
            '@type': 'Rating',
            ratingValue: 5,
            bestRating: 5,
          },
          author: definePerson({
            name: [comment.user?.fristname, comment.user?.lastname].filter(Boolean).join(' ') || 'کاربر فروشگاه'
          }),
          datePublished: comment.createdAt
        })
      )
    }),
    defineBreadcrumb({
      itemListElement: [
        defineListItem({ name: 'خانه', url: origin, position: 1 }),
        ...(p.category
          ? [defineListItem({ name: p.category.name, url: origin + '/products', position: 2 })]
          : []),
        defineListItem({ name: p.name, url: origin + p.slug, position: p.category ? 3 : 2 })
      ]
    })
  ]
})

onMounted(async () => {
  if (!product.value) {
    await loadProduct()
  }
  if (product.value) {
    await Promise.all([loadLikeStatus(), loadFavoriteStatus(), loadComments(1)])
  }
})
</script>

<template>
  <div
    class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    dir="rtl"
  >
    <PublicProductBreadcrumb
      v-if="!loading && product"
      :product="product"
    />

    <PublicProductSkeleton v-if="loading" />

    <PublicProductNotFound v-else-if="notFound || !product" />

    <div
      v-else
      class="grid gap-8 lg:grid-cols-2 lg:gap-12"
    >
      <PublicProductGallery
        v-model:selectedMediaIndex="selectedMediaIndex"
        :medias="product.medias"
        :name="product.name"
        :discount-percent="discountPercent"
      />

      <div class="flex flex-col gap-5 py-2">
        <PublicProductInfo
          :product="product"
          :liked="liked"
          :like-count="likeCount"
          :like-loading="likeLoading"
          :comment-count="commentsMeta.total || product.commentCount || 0"
          :view-count="product.viewCount ?? 0"
          @like="toggleLike"
        />

        <PublicProductPrice
          :original-price="originalPrice"
          :display-price="displayPrice"
          :discount-percent="discountPercent"
        />

        <p
          v-if="product.shortDescription || product.description"
          class="text-sm leading-8 text-toned"
        >
          {{ product.shortDescription || product.description }}
        </p>

        <PublicProductOptions
          :options="product.options"
          :selected="selectedOptions"
          @select="selectOption"
        />

        <PublicProductActions
          :is-out-of-stock="isOutOfStock"
          :favorited="favorited"
          @add-to-cart="addToCart"
          @toggle-favorite="toggleFavorite"
        />

        <PublicProductPerks />

        <PublicProductTags :tags="product.productTags ?? []" />
      </div>
    </div>

    <div
      v-if="product"
      class="mt-12 space-y-12"
    >
      <PublicProductDetails
        :description="product.description"
        :specifications="product.specifications"
      />

      <PublicProductComments
        :comments="comments"
        :comment-count="commentsMeta.total || product.commentCount || 0"
        :is-logged-in="isLoggedIn"
        v-model:comment-text="commentText"
        :comment-submitting="commentSubmitting"
        :comments-loading="commentsLoading"
        :comments-loaded="commentsLoaded"
        :has-more-comments="hasMoreComments"
        @submit="submitComment"
        @load-more="loadComments(commentsMeta.page + 1)"
      />
    </div>
  </div>
</template>
