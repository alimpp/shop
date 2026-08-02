export type TProductStatus = "draft" | "published" | "archived";
export type TProductVisibility = "public" | "hidden";
export type TProductMediaType = "image" | "video";

export interface TProductCategoryRef {
  id: string;
  name: string;
  slug?: string;
}

export interface TProductBrandRef {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  description?: string;
  isActive?: boolean;
}

export interface TProductAttributeRef {
  id: string;
  name: string;
  slug?: string;
  isFilterable?: boolean;
  sortOrder?: number;
}

export interface TProductAttributeValue {
  id: string;
  attributeId: string;
  value: string;
  slug?: string;
  sortOrder?: number;
  attribute?: TProductAttributeRef;
}

export interface TProductAttributeWithValues extends TProductAttributeRef {
  values: TProductAttributeValue[];
}

export interface TProductVariantValue {
  id: string;
  variantId: string;
  attributeValueId: string;
  attributeValue?: TProductAttributeValue;
}

export interface TProductOptionValue {
  id: string;
  productOptionId: string;
  attributeValueId: string;
  attributeValue?: TProductAttributeValue;
}

export interface TProductOption {
  id: string;
  productId: string;
  attributeId: string;
  sortOrder: number;
  attribute?: TProductAttributeRef;
  values: TProductOptionValue[];
}

export interface TProductOptionPayload {
  attributeId: string;
  valueIds: string[];
}

export interface TProductTagRef {
  id: string;
  name: string;
  slug?: string;
}

export interface TProductTag {
  id: string;
  productId: string;
  tagId: string;
  sortOrder: number;
  tag?: TProductTagRef;
}

export interface TProductMedia {
  id: string;
  type: TProductMediaType;
  url: string;
  mimeType?: string;
  size?: number;
  alt?: string;
  caption?: string;
  isThumbnail: boolean;
  sortOrder: number;
  createdAt?: string;
}

export interface TProductVariant {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  salePrice?: number;
  stock: number;
  manageStock: boolean;
  allowBackorder: boolean;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  image?: string;
  isDefault: boolean;
  isActive: boolean;
  values: TProductVariantValue[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku: string;
  barcode?: string;
  price: number;
  salePrice?: number;
  costPrice?: number;
  stock: number;
  manageStock: boolean;
  allowBackorder: boolean;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  categoryId: string;
  brandId?: string;
  status: TProductStatus;
  visibility: TProductVisibility;
  isFeatured: boolean;
  isActive: boolean;
  soldCount: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  category?: TProductCategoryRef;
  brand?: TProductBrandRef;
  medias: TProductMedia[];
  variants: TProductVariant[];
  options: TProductOption[];
  productTags: TProductTag[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface TProductVariantPayload {
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  salePrice?: number;
  stock?: number;
  image?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface TProductPayload {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku: string;
  barcode?: string;
  price: number;
  salePrice?: number;
  costPrice?: number;
  stock?: number;
  manageStock?: boolean;
  allowBackorder?: boolean;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  categoryId: string;
  brandId?: string;
  status?: TProductStatus;
  visibility?: TProductVisibility;
  isFeatured?: boolean;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  medias?: string[];
  variants?: TProductVariantPayload[];
  options?: TProductOptionPayload[];
}

export interface TProductListQuery {
  search?: string;
  categoryId?: string;
  brandId?: string;
  attributeValueIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  status?: TProductStatus;
  isActive?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface TProductListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TProductListData {
  items: TProduct[];
  meta: TProductListMeta;
}
