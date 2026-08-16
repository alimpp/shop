export interface TBrand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TBrandPayload {
  name: string;
  slug?: string;
  logo?: string;
  description?: string;
  isActive?: boolean;
}

