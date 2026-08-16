export interface TUserProfile {
  id: string
  fristname: string
  lastname: string
  email: string
  avatarUrl: string
  phone: string
  created_at?: string
}

export interface TUpdateUserPayload {
  fristname: string
  lastname: string
  email: string
  avatarUrl: string
}
