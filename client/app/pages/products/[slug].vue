<script setup lang="ts">
import { interactionsController } from '~/features/interactions/controllers/index.controller'
import { favoritesController } from '~/features/favorites/controllers/index.controller'
import { productsController } from '~/features/products/controllers/index.controller'
import { useCartDS } from '~/dataStore'
import { TInteractionTargetType } from '~/features/interactions/types/index.type'
import type { TComment } from '~/features/interactions/types/index.type'
import type { TProduct, TProductVariant } from '~/features/products/types/index.type'

const route = useRoute()
const toast = useToast()
const cartDS = useCartDS()

const slug = String(route.params.slug ?? '')

const product = ref<TProduct | null>(null)
const loading = ref(true)
const notFound = ref(false)

const liked = ref(false)
const likeCount = ref(0)
const likeLoading = ref(false)

const favorited = ref(false)
const favoriteLoading = ref(false)

const comments = ref<TComment[]>([])
const commentsMeta = ref<{ total: number; page: number; limit: number; totalPages: number } | null>(null)
const commentsLoading = ref(false)
const commentsLoaded = ref(false)
const commentText = ref('')
const commentSubmitting = ref(false)
const commentsPage = ref(1)
const commentsLimit = 10

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
  return variant ? variant.stock : (product.value?.stock ?? 0)
})

const isOutOfStock = computed(() => stock.value <= 0)

const activeVariant = computed<TProductVariant | null>(() => {
  if (!product.value?.variants?.length || !selectedVariantId.value) {
    return null
  }
  return product.value.variants.find(v => v.id === selectedVariantId.value) ?? null
})

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
    likeCount.value = response.data.likeCount ?? 0

    const defaultVariant = response.data.variants?.find(v => v.isDefault) ?? response.data.variants?.[0]
    if (defaultVariant) {
      selectedVariantId.value = defaultVariant.id
    }

    response.data.options?.forEach((option) => {
      const optionKey = option.attribute?.slug ?? option.attributeId
      if (!selectedOptions[optionKey]) {
        selectedOptions[optionKey] = ''
      }
    })
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
  }

  if (!ssrPending.value && !ssrProduct.value && !product.value) {
    notFound.value = true
    loading.value = false
  }
})

async function loadLikeStatus(): Promise<void> {
  if (!product.value || !isLoggedIn.value) return
  const response = await interactionsController.getLikeStatus({
    entityType: TInteractionTargetType.PRODUCT,
    entityId: product.value.id
  })
  if (response.success) {
    liked.value = response.data
  }
}

async function loadFavoriteStatus(): Promise<void> {
  if (!product.value || !isLoggedIn.value) return
  const response = await favoritesController.getFavorites(1, 100)
  if (response.success && response.data) {
    favorited.value = response.data.items.some(item => item.id === product.value?.id)
  }
}

async function toggleLike(): Promise<void> {
  if (!product.value || !requireLogin()) return
  if (likeLoading.value) return

  likeLoading.value = true
  const response = await interactionsController.toggleLike({
    entityType: TInteractionTargetType.PRODUCT,
    entityId: product.value.id
  })

  if (response.success && response.data) {
    liked.value = response.data.liked
    likeCount.value = response.data.likeCount
  } else {
    toast.add({
      title: response.message,
      color: 'error'
    })
  }

  likeLoading.value = false
}

async function toggleFavorite(): Promise<void> {
  if (!product.value || !requireLogin()) return
  if (favoriteLoading.value) return

  favoriteLoading.value = true
  const response = await favoritesController.toggleFavorite(product.value.id)

  if (response.success && response.data) {
    favorited.value = response.data.favorited
    toast.add({
      title: favorited.value ? 'به علاقه مندی ها اضافه شد' : 'از علاقه مندی ها حذف شد',
      color: 'success'
    })
  } else {
    toast.add({
      title: response.message,
      color: 'error'
    })
  }

  favoriteLoading.value = false
}

async function loadComments(page = 1): Promise<void> {
  if (!product.value) return

  commentsLoading.value = true
  const response = await interactionsController.getComments({
    entityType: TInteractionTargetType.PRODUCT,
    entityId: product.value.id,
    page,
    limit: commentsLimit
  })

  if (response.success && response.data) {
    if (page === 1) {
      comments.value = response.data.items
    } else {
      comments.value = [...comments.value, ...response.data.items]
    }
    commentsMeta.value = {
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit,
      totalPages: response.data.totalPages
    }
    commentsPage.value = page
  }

  commentsLoading.value = false
  commentsLoaded.value = true
}

const hasMoreComments = computed(() =>
  Boolean(commentsMeta.value && commentsPage.value < commentsMeta.value.totalPages)
)

async function submitComment(): Promise<void> {
  if (!product.value || !requireLogin()) return

  const content = commentText.value.trim()
  if (!content) {
    toast.add({ title: 'متن کامنت را وارد کنید', color: 'warning' })
    return
  }
  if (commentSubmitting.value) return

  commentSubmitting.value = true
  const response = await interactionsController.createComment({
    entityType: TInteractionTargetType.PRODUCT,
    entityId: product.value.id,
    content
  })

  if (response.success) {
    commentText.value = ''
    toast.add({ title: 'کامنت شما ثبت شد', color: 'success' })
    await loadComments(1)
  } else {
    toast.add({
      title: response.message,
      color: 'error'
    })
  }

  commentSubmitting.value = false
}

function addToCart(): void {
  if (!product.value) return

  cartDS.add({
    productId: product.value.id,
    name: product.value.name,
    slug: product.value.slug,
    price: product.value.price,
    salePrice: product.value.salePrice,
    image: product.value.medias[0]?.url ?? '',
    quantity: quantity.value
  })

  toast.add({
    title: 'به سبد خرید اضافه شد',
    color: 'success'
  })
}

function selectOption(slug: string, valueId: string): void {
  selectedOptions[slug] = valueId
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
          :comment-count="commentsMeta?.total ?? product.commentCount ?? 0"
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
        :comment-count="commentsMeta?.total ?? product.commentCount ?? 0"
        :is-logged-in="isLoggedIn"
        v-model:comment-text="commentText"
        :comment-submitting="commentSubmitting"
        :comments-loading="commentsLoading"
        :comments-loaded="commentsLoaded"
        :has-more-comments="hasMoreComments"
        @submit="submitComment"
        @load-more="loadComments(commentsPage + 1)"
      />
    </div>
  </div>
</template>
