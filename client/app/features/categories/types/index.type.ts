export interface TCategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  children?: TCategory[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TCategoryPayload {
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface TCategoryListQuery {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface TCategoryListData {
  items: TCategory[];
  total: number;
}
