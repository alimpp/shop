export interface TAddress {
  id: string
  userId?: string
  name: string
  province: string
  city: string
  address: string
  postalCode: string
  created_at?: string
  updated_at?: string
}

export interface TAddressPayload {
  name: string
  province: string
  city: string
  address: string
  postalCode: string
}
