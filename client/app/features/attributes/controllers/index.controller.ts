import type { ControllerResponse, ServerResponse } from "~/types/common";
import { BaseController } from "~/core/BaseController";
import { AttributesDS } from "../data/index.store";
import { AttributesService } from "../services/index.service";
import type {
  TAttribute,
  TAttributePayload,
  TAttributeValue,
  TAttributeValuePayload
} from "../types/index.type";

class AttributesController extends BaseController<AttributesService> {
  constructor() {
    super(new AttributesService());
  }

  private readonly attributesDS = AttributesDS.getInstance();

  public async getAttributes(): Promise<ControllerResponse<TAttribute[]>> {
    this.attributesDS.setLoading(true);

    const response: ServerResponse<TAttribute[]> = await this.service.getAttributes();

    if (response.success) {
      this.attributesDS.setAttributes(response.data);
    }

    this.attributesDS.setLoading(false);
    return this.handleResponse(response);
  }

  public async createAttribute(payload: TAttributePayload): Promise<ControllerResponse<TAttribute>> {
    this.attributesDS.setSubmitting(true);

    const response: ServerResponse<TAttribute> = await this.service.createAttribute(payload);

    if (response.success) {
      this.attributesDS.upsertAttribute(response.data);
    }

    this.attributesDS.setSubmitting(false);
    return this.handleResponse(response);
  }

  public async updateAttribute(
    id: string,
    payload: TAttributePayload
  ): Promise<ControllerResponse<TAttribute>> {
    this.attributesDS.setSubmitting(true);

    const response: ServerResponse<TAttribute> = await this.service.updateAttribute(id, payload);

    if (response.success) {
      this.attributesDS.upsertAttribute(response.data);
      this.attributesDS.setSelectedAttribute(response.data);
    }

    this.attributesDS.setSubmitting(false);
    return this.handleResponse(response);
  }

  public async deleteAttribute(id: string): Promise<ControllerResponse<{ id: string }>> {
    this.attributesDS.setSubmitting(true);

    const response: ServerResponse<{ id: string }> = await this.service.deleteAttribute(id);

    if (response.success) {
      this.attributesDS.removeAttribute(id);

      if (this.attributesDS.getSelectedAttribute?.id === id) {
        this.attributesDS.setSelectedAttribute(null);
      }
    }

    this.attributesDS.setSubmitting(false);
    return this.handleResponse(response);
  }

  public async createValue(
    attributeId: string,
    payload: TAttributeValuePayload
  ): Promise<ControllerResponse<TAttributeValue>> {
    this.attributesDS.setSubmitting(true);

    const response: ServerResponse<TAttributeValue> = await this.service.createValue(attributeId, payload);

    if (response.success) {
      this.attributesDS.upsertAttributeValue(attributeId, response.data);
    }

    this.attributesDS.setSubmitting(false);
    return this.handleResponse(response);
  }

  public async updateValue(
    valueId: string,
    payload: TAttributeValuePayload
  ): Promise<ControllerResponse<TAttributeValue>> {
    this.attributesDS.setSubmitting(true);

    const response: ServerResponse<TAttributeValue> = await this.service.updateValue(valueId, payload);

    if (response.success) {
      this.attributesDS.upsertAttributeValue(response.data.attributeId, response.data);
      this.attributesDS.setSelectedAttributeValue(response.data);
    }

    this.attributesDS.setSubmitting(false);
    return this.handleResponse(response);
  }

  public async deleteValue(
    attributeId: string,
    valueId: string
  ): Promise<ControllerResponse<{ id: string }>> {
    this.attributesDS.setSubmitting(true);

    const response: ServerResponse<{ id: string }> = await this.service.deleteValue(valueId);

    if (response.success) {
      this.attributesDS.removeAttributeValue(attributeId, valueId);

      if (this.attributesDS.getSelectedAttributeValue?.id === valueId) {
        this.attributesDS.setSelectedAttributeValue(null);
      }
    }

    this.attributesDS.setSubmitting(false);
    return this.handleResponse(response);
  }
}

export const attributesController = new AttributesController();
