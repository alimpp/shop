export interface OrderAddressSnapshot {
  id: string;
  name: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
}

export interface OrderSelectedOptionSnapshot {
  attributeId: string;
  attributeName: string;
  optionValueId: string;
  attributeValueId: string;
  value: string;
}

export interface OrderVariantSnapshot {
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice: number | null;
  image: string | null;
  options: OrderSelectedOptionSnapshot[];
}
