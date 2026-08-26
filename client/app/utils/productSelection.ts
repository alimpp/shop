export type ProductSelectionOption = {
  attributeName?: string
  value?: string
  label?: string
  optionValueId?: string
  attributeValueId?: string
  valueId?: string
}

export type ProductSelectionInput = {
  variant?: {
    name?: string
    sku?: string
    options?: ProductSelectionOption[]
  } | null
  selectedOptions?: ProductSelectionOption[]
}

export type ProductSelectionChip = {
  key: string
  label: string
}

function optionLabel(option: ProductSelectionOption): string {
  if (option.label?.trim()) return option.label.trim()
  if (option.attributeName && option.value) {
    return `${option.attributeName}: ${option.value}`
  }
  return option.value?.trim() ?? ''
}

export function buildProductSelectionChips(
  input: ProductSelectionInput,
  options?: { includeSku?: boolean }
): ProductSelectionChip[] {
  const chips: ProductSelectionChip[] = []
  const seenLabels = new Set<string>()
  const includeSku = options?.includeSku ?? true

  const push = (key: string, label: string) => {
    const normalized = label.trim()
    if (!normalized || seenLabels.has(normalized)) return
    seenLabels.add(normalized)
    chips.push({ key, label: normalized })
  }

  const variant = input.variant
  if (variant?.name) {
    push(`variant-${variant.name}`, `مدل: ${variant.name}`)
  }

  for (const option of variant?.options ?? []) {
    const label = optionLabel(option)
    if (label) push(`vopt-${label}`, label)
  }

  for (const option of input.selectedOptions ?? []) {
    const label = optionLabel(option)
    if (!label) continue
    const id =
      option.optionValueId
      ?? option.attributeValueId
      ?? option.valueId
      ?? label
    push(`sel-${id}`, label)
  }

  if (includeSku && variant?.sku) {
    push(`sku-${variant.sku}`, `SKU: ${variant.sku}`)
  }

  return chips
}
