import type {
  TPricingProduct,
  TUpdateProductPricingPayload
} from '../types/index.type'

export interface TPricingDraft {
  price: number
  salePrice: number | ''
  stock: number
  variants: Record<
    string,
    {
      price: number
      salePrice: number | ''
      stock: number
    }
  >
}

export function createPricingDraft(product: TPricingProduct): TPricingDraft {
  return {
    price: product.price,
    salePrice: product.salePrice ?? '',
    stock: product.stock,
    variants: Object.fromEntries(
      product.variants.map(variant => [
        variant.id,
        {
          price: variant.price,
          salePrice: variant.salePrice ?? '',
          stock: variant.stock
        }
      ])
    )
  }
}

export function buildPricingPayload(
  original: TPricingProduct,
  draft: TPricingDraft
): TUpdateProductPricingPayload | null {
  const payload: TUpdateProductPricingPayload = {}
  let changed = false

  if (draft.price !== original.price) {
    payload.price = draft.price
    changed = true
  }

  const draftSalePrice = draft.salePrice === '' ? null : draft.salePrice
  if (draftSalePrice !== original.salePrice) {
    payload.salePrice = draftSalePrice
    changed = true
  }

  if (!original.variants.length && draft.stock !== original.stock) {
    payload.stock = draft.stock
    changed = true
  }

  const variantPatches = original.variants
    .map((variant) => {
      const row = draft.variants[variant.id]
      if (!row) {
        return null
      }

      const patch: NonNullable<TUpdateProductPricingPayload['variants']>[number] = {
        id: variant.id
      }
      let variantChanged = false

      if (row.price !== variant.price) {
        patch.price = row.price
        variantChanged = true
      }

      const rowSalePrice = row.salePrice === '' ? null : row.salePrice
      if (rowSalePrice !== variant.salePrice) {
        patch.salePrice = rowSalePrice
        variantChanged = true
      }

      if (row.stock !== variant.stock) {
        patch.stock = row.stock
        variantChanged = true
      }

      return variantChanged ? patch : null
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  if (variantPatches.length) {
    payload.variants = variantPatches
    changed = true
  }

  return changed ? payload : null
}

export function isPricingDraftDirty(
  original: TPricingProduct,
  draft: TPricingDraft
): boolean {
  return buildPricingPayload(original, draft) !== null
}
