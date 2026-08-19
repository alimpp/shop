import type { TAdminUser, TAdminUserStats } from '../types/index.type'

export class AdminUserModel implements TAdminUser {
  id: string
  fristname: string
  lastname: string
  email: string
  avatarUrl: string
  phone: string
  created_at: string

  constructor(data?: Partial<TAdminUser>) {
    this.id = data?.id ?? ''
    this.fristname = data?.fristname ?? ''
    this.lastname = data?.lastname ?? ''
    this.email = data?.email ?? ''
    this.avatarUrl = data?.avatarUrl ?? ''
    this.phone = data?.phone ?? ''
    this.created_at = data?.created_at ?? ''
  }

  get displayName(): string {
    const name = [this.fristname, this.lastname].filter(Boolean).join(' ')
    return name || this.phone || 'کاربر'
  }

  get initials(): string {
    const first = this.fristname?.trim().charAt(0) || ''
    const last = this.lastname?.trim().charAt(0) || ''
    return (first + last || this.phone.slice(-2) || 'ک').slice(0, 2)
  }

  get formattedDate(): string {
    if (!this.created_at) return ''
    return new Date(this.created_at).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}

export class AdminUserStatsModel implements TAdminUserStats {
  orders: number
  cartItems: number
  favorites: number
  likes: number
  comments: number
  addresses: number

  constructor(data?: Partial<TAdminUserStats>) {
    this.orders = data?.orders ?? 0
    this.cartItems = data?.cartItems ?? 0
    this.favorites = data?.favorites ?? 0
    this.likes = data?.likes ?? 0
    this.comments = data?.comments ?? 0
    this.addresses = data?.addresses ?? 0
  }
}
