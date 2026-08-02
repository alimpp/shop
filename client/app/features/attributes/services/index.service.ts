import type { ServerResponse } from "~/types/common";
import { BaseApp } from "~/core/BaseApp";
import type {
  TAttribute,
  TAttributePayload,
  TAttributeValue,
  TAttributeValuePayload
} from "../types/index.type";

type TRawAttribute = Record<string, any>;

export class AttributesService extends BaseApp<TAttribute> {
  constructor() {
    super("attributes");
  }

  private normalizeValue(item: TRawAttribute): TAttributeValue {
    return {
      id: item.id ?? "",
      attributeId: item.attributeId ?? "",
      value: item.value ?? "",
      slug: item.slug ?? "",
      sortOrder: Number(item.sortOrder ?? 0) || 0,
      createdAt: item.createdAt ?? "",
      updatedAt: item.updatedAt ?? ""
    };
  }

  private normalizeAttribute(item: TRawAttribute): TAttribute {
    const values = Array.isArray(item.values)
      ? item.values
          .map((value: TRawAttribute) => this.normalizeValue(value))
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      : [];

    return {
      id: item.id ?? "",
      name: item.name ?? "",
      slug: item.slug ?? "",
      isFilterable: item.isFilterable ?? true,
      sortOrder: Number(item.sortOrder ?? 0) || 0,
      values,
      createdAt: item.createdAt ?? "",
      updatedAt: item.updatedAt ?? ""
    };
  }

  public async getAttributes(): Promise<ServerResponse<TAttribute[]>> {
    return this.executeRequest<TAttribute[]>(async () => {
      const response = await this.Get<ServerResponse<TRawAttribute[]>>(
        "/attributes",
        { includeValues: 1 }
      );

      return {
        ...response,
        data: Array.isArray(response.data)
          ? response.data.map((item) => this.normalizeAttribute(item))
          : []
      };
    });
  }

  public async createAttribute(payload: TAttributePayload): Promise<ServerResponse<TAttribute>> {
    return this.executeRequest<TAttribute>(async () => {
      const response = await this.Post<ServerResponse<TRawAttribute>>("/attributes", payload);

      return {
        ...response,
        data: this.normalizeAttribute(response.data)
      };
    });
  }

  public async updateAttribute(
    id: string,
    payload: TAttributePayload
  ): Promise<ServerResponse<TAttribute>> {
    return this.executeRequest<TAttribute>(async () => {
      const response = await this.Patch<ServerResponse<TRawAttribute>>(`/attributes/${id}`, payload);

      return {
        ...response,
        data: this.normalizeAttribute(response.data)
      };
    });
  }

  public async deleteAttribute(id: string): Promise<ServerResponse<{ id: string }>> {
    return this.executeRequest<{ id: string }>(async () => {
      const response = await this.Delete<ServerResponse<Record<string, unknown>>>(`/attributes/${id}`);

      return {
        ...response,
        data: { id }
      };
    });
  }

  public async createValue(
    attributeId: string,
    payload: TAttributeValuePayload
  ): Promise<ServerResponse<TAttributeValue>> {
    return this.executeRequest<TAttributeValue>(async () => {
      const response = await this.Post<ServerResponse<TRawAttribute>>(
        `/attributes/${attributeId}/values`,
        payload
      );

      return {
        ...response,
        data: this.normalizeValue(response.data)
      };
    });
  }

  public async updateValue(
    valueId: string,
    payload: TAttributeValuePayload
  ): Promise<ServerResponse<TAttributeValue>> {
    return this.executeRequest<TAttributeValue>(async () => {
      const response = await this.Patch<ServerResponse<TRawAttribute>>(
        `/attributes/values/${valueId}`,
        payload
      );

      return {
        ...response,
        data: this.normalizeValue(response.data)
      };
    });
  }

  public async deleteValue(valueId: string): Promise<ServerResponse<{ id: string }>> {
    return this.executeRequest<{ id: string }>(async () => {
      const response = await this.Delete<ServerResponse<Record<string, unknown>>>(
        `/attributes/values/${valueId}`
      );

      return {
        ...response,
        data: { id: valueId }
      };
    });
  }
}
