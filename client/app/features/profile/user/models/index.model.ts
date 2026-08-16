import type { TUserProfile } from '../types/index.type'

export class UserModel implements TUserProfile {
  id: string
  fristname: string
  lastname: string
  email: string
  avatarUrl: string
  phone: string
  created_at?: string

  constructor(data?: Partial<TUserProfile>) {
    this.id = data?.id ?? ''
    this.fristname = data?.fristname ?? ''
    this.lastname = data?.lastname ?? ''
    this.email = data?.email ?? ''
    this.avatarUrl = data?.avatarUrl ?? ''
    this.phone = data?.phone ?? ''
    this.created_at = data?.created_at
  }

  static empty(): UserModel {
    return new UserModel()
  }
}
