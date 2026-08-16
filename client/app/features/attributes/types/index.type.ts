export interface TAttributeValue {
  id: string;
  attributeId: string;
  value: string;
  slug: string;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TAttribute {
  id: string;
  name: string;
  slug: string;
  isFilterable: boolean;
  sortOrder: number;
  values: TAttributeValue[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TAttributePayload {
  name: string;
  slug?: string;
  isFilterable?: boolean;
  sortOrder?: number;
}

export interface TAttributeValuePayload {
  value: string;
  slug?: string;
  sortOrder?: number;
}
