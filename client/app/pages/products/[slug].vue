<script setup lang="ts">
import { interactionsController } from '~/features/interactions/controllers/index.controller'
import { favoritesController } from '~/features/favorites/controllers/index.controller'
import { productsController } from '~/features/products/controllers/index.controller'
import { cartController } from '~/features/cart/controllers/index.controller'
import { useInteractionsDS } from '~/features/interactions/data/index.store'
import { useFavoritesDS } from '~/features/favorites/data/index.store'
import { TInteractionTargetType } from '~/features/interactions/types/index.type'
import type { TProduct, TProductVariant } from '~/features/products/types/index.type'
import ProductSupportAsk from '~/features/products/components/ProductSupportAsk.vue'
import {
  DEFAULT_ROBOTS,
  NOINDEX_ROBOTS,
  SITE_NAME,
  resolveProductCanonical,
  resolveProductDescription,
  resolveProductImages,
  resolveProductOgImage,
  resolveProductTitle,
  resolveSocialTitle
} from '~/utils/seo'

const route = useRoute()
const requestURL = useRequestURL()
const toast = useToast()
const addingToCart = ref(false)
const interactionsDS = useInteractionsDS()
const favoritesDS = useFavoritesDS()
const { track } = useBehaviorTracker()

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

const activeVariants = computed(() =>
  (product.value?.variants ?? []).filter(variant => variant.isActive !== false)
)

const hasSelectableOptions = computed(() =>
  (product.value?.options ?? []).some(
    option => (option.values?.length ?? 0) > 0
  )
)

const usesOptionBasedVariants = computed(() => {
  const p = product.value
  if (!p?.variants?.length || !hasSelectableOptions.value) {
    return false
  }

  return p.variants.some(variant => (variant.values?.length ?? 0) > 0)
})

const selectableProductOptions = computed(() =>
  (product.value?.options ?? []).filter(
    option => (option.values?.length ?? 0) > 0
  )
)

const showOptionPicker = computed(() => hasSelectableOptions.value)

const showVariantPicker = computed(
  () => activeVariants.value.length > 0 && !usesOptionBasedVariants.value
)

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
    return
  }

  await track(response.data?.liked ? 'like' : 'unlike', {
    productId: product.value.id,
    product: product.value
  })
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
    await track(response.data.favorited ? 'favorite' : 'unfavorite', {
      productId: product.value.id,
      product: product.value
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
    await track('comment', {
      productId: product.value.id,
      product: product.value
    })
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
    const variant = usesOptionBasedVariants.value
      ? resolveVariantFromOptions()
      : activeVariant.value ?? pickDefaultVariant(product.value)

    const resolved =
      variant
      ?? (usesOptionBasedVariants.value ? null : activeVariant.value)
      ?? pickDefaultVariant(product.value)

    if (resolved) {
      payload.variantId = resolved.id
      selectedVariantId.value = resolved.id
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
  await track('add_to_cart', {
    productId: product.value.id,
    product: product.value,
    metadata: {
      variantId: payload.variantId ?? null,
      quantity: payload.quantity
    }
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

function selectVariant(variantId: string): void {
  selectedVariantId.value = variantId
}

const isProductMissing = computed(
  () => notFound.value || (!loading.value && !product.value)
)

const seoTitle = computed(() =>
  isProductMissing.value ? 'محصول یافت نشد' : resolveProductTitle(product.value)
)
const seoSocialTitle = computed(() =>
  isProductMissing.value ? `محصول یافت نشد | ${SITE_NAME}` : resolveSocialTitle(product.value)
)
const seoDescription = computed(() =>
  isProductMissing.value
    ? 'محصول مورد نظر شما یافت نشد یا از فروشگاه حذف شده است.'
    : resolveProductDescription(product.value)
)
const seoImage = computed(() => resolveProductOgImage(product.value, requestURL.origin))
const seoCanonical = computed(() =>
  resolveProductCanonical(product.value, requestURL.origin, requestURL.href)
)
const seoRobots = computed(() =>
  isProductMissing.value ? NOINDEX_ROBOTS : DEFAULT_ROBOTS
)

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  robots: () => seoRobots.value,
  ogTitle: () => seoSocialTitle.value,
  ogDescription: () => seoDescription.value,
  ogImage: () => seoImage.value,
  ogUrl: () => seoCanonical.value,
  ogSiteName: SITE_NAME,
  ogLocale: 'fa_IR',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: () => seoSocialTitle.value,
  twitterDescription: () => seoDescription.value,
  twitterImage: () => seoImage.value
})

useHead({
  link: [
    {
      key: 'canonical',
      rel: 'canonical',
      href: () => seoCanonical.value
    }
  ]
})

useSchemaOrg(() => {
  const p = product.value
  if (!p || notFound.value) {
    return []
  }

  const origin = requestURL.origin
  const productUrl = `${origin}/products/${p.slug}`
  const categoryUrl = p.category
    ? `${origin}/products?categoryId=${p.category.id}`
    : `${origin}/products`

  return [
    defineProduct({
      name: p.name,
      description: resolveProductDescription(p, 5000) || p.name,
      sku: p.sku,
      image: resolveProductImages(p, origin),
      brand: p.brand?.name || false,
      category: p.category?.name,
      url: productUrl,
      offers: [
        defineOffer({
          price: String(displayPrice.value),
          priceCurrency: 'IRR',
          availability: isOutOfStock.value ? 'OutOfStock' : 'InStock',
          itemCondition: 'NewCondition',
          url: productUrl
        })
      ]
    }),
    defineBreadcrumb({
      itemListElement: [
        defineListItem({ name: 'خانه', url: origin, position: 1 }),
        defineListItem({ name: 'محصولات', url: `${origin}/products`, position: 2 }),
        ...(p.category
          ? [defineListItem({ name: p.category.name, url: categoryUrl, position: 3 })]
          : []),
        defineListItem({
          name: p.name,
          url: productUrl,
          position: p.category ? 4 : 3
        })
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
    await track('product_view', {
      productId: product.value.id,
      product: product.value,
      metadata: {
        slug: product.value.slug,
        categoryId: product.value.categoryId || null,
        brandId: product.value.brandId || null
      }
    })
  }
})

watch(selectedMediaIndex, async (index, previous) => {
  if (!product.value || index === previous || index <= 0) return
  await track('gallery_view', {
    productId: product.value.id,
    product: product.value,
    metadata: { mediaIndex: index }
  })
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

        <section
          v-if="showOptionPicker"
          class="space-y-3"
        >
          <p class="text-sm font-bold text-highlighted">
            انتخاب ویژگی‌ها
          </p>
          <PublicProductOptions
            :options="selectableProductOptions"
            :selected="selectedOptions"
            @select="selectOption"
          />
        </section>

        <PublicProductVariants
          v-if="showVariantPicker"
          :variants="activeVariants"
          :selected-id="selectedVariantId"
          @select="selectVariant"
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
      >
        <template #after-description>
          <ProductSupportAsk :product="product" />
        </template>
      </PublicProductDetails>

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
