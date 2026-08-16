import type {
  TProduct,
  TProductAttributeRef,
  TProductAttributeValue,
  TProductBrandRef,
  TProductCategoryRef,
  TProductMedia,
  TProductOption,
  TProductOptionValue,
  TProductSpecification,
  TProductTag,
  TProductTagRef,
  TProductVariant,
  TProductVariantValue
} from "../types/index.type";

class ProductCategoryRefModel implements TProductCategoryRef {
  id: string;
  name: string;
  slug?: string;

  constructor(data?: Partial<TProductCategoryRef>) {
    this.id = data?.id ?? "";
    this.name = data?.name ?? "";
    this.slug = data?.slug ?? "";
  }
}

class ProductBrandRefModel implements TProductBrandRef {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  description?: string;
  isActive?: boolean;

  constructor(data?: Partial<TProductBrandRef>) {
    this.id = data?.id ?? "";
    this.name = data?.name ?? "";
    this.slug = data?.slug ?? "";
    this.logo = data?.logo ?? "";
    this.description = data?.description ?? "";
    this.isActive = data?.isActive ?? true;
  }
}

class ProductAttributeRefModel implements TProductAttributeRef {
  id: string;
  name: string;
  slug?: string;
  isFilterable?: boolean;
  sortOrder?: number;

  constructor(data?: Partial<TProductAttributeRef>) {
    this.id = data?.id ?? "";
    this.name = data?.name ?? "";
    this.slug = data?.slug ?? "";
    this.isFilterable = data?.isFilterable ?? false;
    this.sortOrder = data?.sortOrder ?? 0;
  }
}

class ProductAttributeValueModel implements TProductAttributeValue {
  id: string;
  attributeId: string;
  value: string;
  slug?: string;
  sortOrder?: number;
  attribute?: ProductAttributeRefModel;

  constructor(data?: Partial<TProductAttributeValue>) {
    this.id = data?.id ?? "";
    this.attributeId = data?.attributeId ?? "";
    this.value = data?.value ?? "";
    this.slug = data?.slug ?? "";
    this.sortOrder = data?.sortOrder ?? 0;
    this.attribute = data?.attribute
      ? new ProductAttributeRefModel(data.attribute)
      : undefined;
  }
}

class ProductVariantValueModel implements TProductVariantValue {
  id: string;
  variantId: string;
  attributeValueId: string;
  attributeValue?: ProductAttributeValueModel;

  constructor(data?: Partial<TProductVariantValue>) {
    this.id = data?.id ?? "";
    this.variantId = data?.variantId ?? "";
    this.attributeValueId = data?.attributeValueId ?? "";
    this.attributeValue = data?.attributeValue
      ? new ProductAttributeValueModel(data.attributeValue)
      : undefined;
  }
}

class ProductOptionValueModel implements TProductOptionValue {
  id: string;
  productOptionId: string;
  attributeValueId: string;
  attributeValue?: ProductAttributeValueModel;

  constructor(data?: Partial<TProductOptionValue>) {
    this.id = data?.id ?? "";
    this.productOptionId = data?.productOptionId ?? "";
    this.attributeValueId = data?.attributeValueId ?? "";
    this.attributeValue = data?.attributeValue
      ? new ProductAttributeValueModel(data.attributeValue)
      : undefined;
  }
}

class ProductOptionModel implements TProductOption {
  id: string;
  productId: string;
  attributeId: string;
  sortOrder: number;
  attribute?: ProductAttributeRefModel;
  values: ProductOptionValueModel[];

  constructor(data?: Partial<TProductOption>) {
    this.id = data?.id ?? "";
    this.productId = data?.productId ?? "";
    this.attributeId = data?.attributeId ?? "";
    this.sortOrder = data?.sortOrder ?? 0;
    this.attribute = data?.attribute
      ? new ProductAttributeRefModel(data.attribute)
      : undefined;
    this.values = data?.values?.map((item) => new ProductOptionValueModel(item)) ?? [];
  }
}

class ProductTagRefModel implements TProductTagRef {
  id: string;
  name: string;
  slug?: string;

  constructor(data?: Partial<TProductTagRef>) {
    this.id = data?.id ?? "";
    this.name = data?.name ?? "";
    this.slug = data?.slug ?? "";
  }
}

class ProductTagModel implements TProductTag {
  id: string;
  productId: string;
  tagId: string;
  sortOrder: number;
  tag?: ProductTagRefModel;

  constructor(data?: Partial<TProductTag>) {
    this.id = data?.id ?? "";
    this.productId = data?.productId ?? "";
    this.tagId = data?.tagId ?? "";
    this.sortOrder = data?.sortOrder ?? 0;
    this.tag = data?.tag ? new ProductTagRefModel(data.tag) : undefined;
  }
}

class ProductMediaModel implements TProductMedia {
  id: string;
  type: "image" | "video";
  url: string;
  mimeType?: string;
  size?: number;
  alt?: string;
  caption?: string;
  isThumbnail: boolean;
  sortOrder: number;
  createdAt?: string;

  constructor(data?: Partial<TProductMedia>) {
    this.id = data?.id ?? "";
    this.type = data?.type ?? "image";
    this.url = data?.url ?? "";
    this.mimeType = data?.mimeType ?? "";
    this.size = data?.size ?? 0;
    this.alt = data?.alt ?? "";
    this.caption = data?.caption ?? "";
    this.isThumbnail = data?.isThumbnail ?? false;
    this.sortOrder = data?.sortOrder ?? 0;
    this.createdAt = data?.createdAt ?? "";
  }
}

class ProductVariantModel implements TProductVariant {
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
  values: ProductVariantValueModel[];
  createdAt?: string;
  updatedAt?: string;

  constructor(data?: Partial<TProductVariant>) {
    this.id = data?.id ?? "";
    this.name = data?.name ?? "";
    this.sku = data?.sku ?? "";
    this.barcode = data?.barcode ?? "";
    this.price = data?.price ?? 0;
    this.salePrice = data?.salePrice ?? undefined;
    this.stock = data?.stock ?? 0;
    this.manageStock = data?.manageStock ?? true;
    this.allowBackorder = data?.allowBackorder ?? false;
    this.weight = data?.weight ?? undefined;
    this.length = data?.length ?? undefined;
    this.width = data?.width ?? undefined;
    this.height = data?.height ?? undefined;
    this.image = data?.image ?? "";
    this.isDefault = data?.isDefault ?? false;
    this.isActive = data?.isActive ?? true;
    this.values = data?.values?.map((item) => new ProductVariantValueModel(item)) ?? [];
    this.createdAt = data?.createdAt ?? "";
    this.updatedAt = data?.updatedAt ?? "";
  }
}

export class ProductModel implements TProduct {
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
  status: "draft" | "published" | "archived";
  visibility: "public" | "hidden";
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
  category?: ProductCategoryRefModel;
  brand?: ProductBrandRefModel;
  medias: ProductMediaModel[];
  variants: ProductVariantModel[];
  options: ProductOptionModel[];
  productTags: ProductTagModel[];
  specifications?: TProductSpecification[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;

  constructor(data?: Partial<TProduct>) {
    this.id = data?.id ?? "";
    this.name = data?.name ?? "";
    this.slug = data?.slug ?? "";
    this.description = data?.description ?? "";
    this.shortDescription = data?.shortDescription ?? "";
    this.sku = data?.sku ?? "";
    this.barcode = data?.barcode ?? "";
    this.price = data?.price ?? 0;
    this.salePrice = data?.salePrice ?? undefined;
    this.costPrice = data?.costPrice ?? undefined;
    this.stock = data?.stock ?? 0;
    this.manageStock = data?.manageStock ?? true;
    this.allowBackorder = data?.allowBackorder ?? false;
    this.weight = data?.weight ?? undefined;
    this.length = data?.length ?? undefined;
    this.width = data?.width ?? undefined;
    this.height = data?.height ?? undefined;
    this.categoryId = data?.categoryId ?? "";
    this.brandId = data?.brandId ?? "";
    this.status = data?.status ?? "draft";
    this.visibility = data?.visibility ?? "public";
    this.isFeatured = data?.isFeatured ?? false;
    this.isActive = data?.isActive ?? true;
    this.soldCount = data?.soldCount ?? 0;
    this.viewCount = data?.viewCount ?? 0;
    this.likeCount = data?.likeCount ?? 0;
    this.commentCount = data?.commentCount ?? 0;
    this.publishedAt = data?.publishedAt ?? "";
    this.metaTitle = data?.metaTitle ?? "";
    this.metaDescription = data?.metaDescription ?? "";
    this.keywords = data?.keywords ?? "";
    this.canonical = data?.canonical ?? "";
    this.ogImage = data?.ogImage ?? "";
    this.category = data?.category ? new ProductCategoryRefModel(data.category) : undefined;
    this.brand = data?.brand ? new ProductBrandRefModel(data.brand) : undefined;
    this.medias = data?.medias?.map((item) => new ProductMediaModel(item)) ?? [];
    this.variants = data?.variants?.map((item) => new ProductVariantModel(item)) ?? [];
    this.options = data?.options?.map((item) => new ProductOptionModel(item)) ?? [];
    this.productTags = data?.productTags?.map((item) => new ProductTagModel(item)) ?? [];
    this.specifications = data?.specifications?.map((spec) => ({ ...spec })) ?? undefined;
    this.createdAt = data?.createdAt ?? "";
    this.updatedAt = data?.updatedAt ?? "";
    this.deletedAt = data?.deletedAt ?? "";
  }

  static empty(): ProductModel {
    return new ProductModel();
  }
}
