export interface TBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  link?: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TBannerPayload {
  title: string;
  subtitle?: string;
  imageUrl: string;
  link?: string;
  description?: string;
  isActive?: boolean;
}
