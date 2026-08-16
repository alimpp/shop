import type { TAttribute, TAttributeValue } from "../types/index.type";

export class AttributeValueModel implements TAttributeValue {
  id: string;
  attributeId: string;
  value: string;
  slug: string;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;

  constructor(data?: Partial<TAttributeValue>) {
    this.id = data?.id ?? "";
    this.attributeId = data?.attributeId ?? "";
    this.value = data?.value ?? "";
    this.slug = data?.slug ?? "";
    this.sortOrder = data?.sortOrder ?? 0;
    this.createdAt = data?.createdAt ?? "";
    this.updatedAt = data?.updatedAt ?? "";
  }
}

export class AttributeModel implements TAttribute {
  id: string;
  name: string;
  slug: string;
  isFilterable: boolean;
  sortOrder: number;
  values: AttributeValueModel[];
  createdAt?: string;
  updatedAt?: string;

  constructor(data?: Partial<TAttribute>) {
    this.id = data?.id ?? "";
    this.name = data?.name ?? "";
    this.slug = data?.slug ?? "";
    this.isFilterable = data?.isFilterable ?? true;
    this.sortOrder = data?.sortOrder ?? 0;
    this.values = (data?.values ?? []).map((value) => new AttributeValueModel(value));
    this.createdAt = data?.createdAt ?? "";
    this.updatedAt = data?.updatedAt ?? "";
  }
}
