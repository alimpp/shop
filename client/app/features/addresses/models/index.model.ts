import type { TAddress } from '../types/index.type'

export class AddressModel implements TAddress {
  id: string
  userId?: string
  name: string
  province: string
  city: string
  address: string
  postalCode: string
  created_at?: string
  updated_at?: string

  constructor(data?: Partial<TAddress>) {
    this.id = data?.id ?? ''
    this.userId = data?.userId ?? ''
    this.name = data?.name ?? ''
    this.province = data?.province ?? ''
    this.city = data?.city ?? ''
    this.address = data?.address ?? ''
    this.postalCode = data?.postalCode ?? ''
    this.created_at = data?.created_at ?? ''
    this.updated_at = data?.updated_at ?? ''
  }

  get summary(): string {
    return [this.province, this.city].filter(Boolean).join('، ')
  }

  get formattedPostalCode(): string {
    if (!this.postalCode) return ''
    return this.postalCode.replace(/\d/g, digit =>
      '۰۱۲۳۴۵۶۷۸۹'[Number(digit)] ?? digit
    )
  }
}
