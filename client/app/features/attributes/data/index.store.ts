import { BaseStore } from "~/core/BaseStore";
import { StoreManager } from "~/core/StoreManager";
import { AttributeModel, AttributeValueModel } from "../models/index.model";
import type { TAttribute, TAttributeValue } from "../types/index.type";

interface IAttributesState {
  attributes: AttributeModel[];
  selectedAttribute: AttributeModel | null;
  selectedAttributeValue: AttributeValueModel | null;
  loading: boolean;
  submitting: boolean;
}

export class AttributesDS extends BaseStore<IAttributesState> {
  private static _instance: AttributesDS;

  public static getInstance(): AttributesDS {
    if (!AttributesDS._instance) {
      AttributesDS._instance = new AttributesDS();
    }
    return AttributesDS._instance;
  }

  private constructor() {
    super("attributes", {
      attributes: [],
      selectedAttribute: null,
      selectedAttributeValue: null,
      loading: false,
      submitting: false
    });

    StoreManager.register(this);
  }

  public get getAttributes(): AttributeModel[] {
    return this._state.attributes;
  }

  public get getSelectedAttribute(): AttributeModel | null {
    return this._state.selectedAttribute;
  }

  public get getSelectedAttributeValue(): AttributeValueModel | null {
    return this._state.selectedAttributeValue;
  }

  public get getLoading(): boolean {
    return this._state.loading;
  }

  public get getSubmitting(): boolean {
    return this._state.submitting;
  }

  private sortAttributes(): void {
    this._state.attributes = [...this._state.attributes].sort((a, b) => {
      const sortDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      if (sortDiff !== 0) {
        return sortDiff;
      }

      return a.name.localeCompare(b.name, "fa");
    });
  }

  private sortAttributeValues(attribute: AttributeModel): void {
    attribute.values = [...attribute.values].sort((a, b) => {
      const sortDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      if (sortDiff !== 0) {
        return sortDiff;
      }

      return a.value.localeCompare(b.value, "fa");
    });
  }

  public setAttributes(attributes: TAttribute[]): void {
    this._state.attributes = attributes.map((attribute) => new AttributeModel(attribute));
    this.sortAttributes();
  }

  public setSelectedAttribute(attribute: TAttribute | null): void {
    this._state.selectedAttribute = attribute ? new AttributeModel(attribute) : null;
  }

  public setSelectedAttributeValue(value: TAttributeValue | null): void {
    this._state.selectedAttributeValue = value ? new AttributeValueModel(value) : null;
  }

  public setLoading(loading: boolean): void {
    this._state.loading = loading;
  }

  public setSubmitting(submitting: boolean): void {
    this._state.submitting = submitting;
  }

  public upsertAttribute(attribute: TAttribute): void {
    const model = new AttributeModel(attribute);
    const index = this._state.attributes.findIndex((item) => item.id === model.id);

    if (index === -1) {
      this._state.attributes = [model, ...this._state.attributes];
      this.sortAttributes();
      return;
    }

    this._state.attributes.splice(index, 1, model);
    this.sortAttributes();
  }

  public removeAttribute(id: string): void {
    this._state.attributes = this._state.attributes.filter((attribute) => attribute.id !== id);
  }

  public upsertAttributeValue(attributeId: string, value: TAttributeValue): void {
    const attribute = this._state.attributes.find((item) => item.id === attributeId);

    if (!attribute) {
      return;
    }

    const model = new AttributeValueModel(value);
    const index = attribute.values.findIndex((item) => item.id === model.id);

    if (index === -1) {
      attribute.values = [...attribute.values, model];
      this.sortAttributeValues(attribute);
      return;
    }

    attribute.values.splice(index, 1, model);
    this.sortAttributeValues(attribute);
  }

  public removeAttributeValue(attributeId: string, valueId: string): void {
    const attribute = this._state.attributes.find((item) => item.id === attributeId);

    if (!attribute) {
      return;
    }

    attribute.values = attribute.values.filter((value) => value.id !== valueId);
  }

  public reset(): void {
    this._state.attributes = [];
    this._state.selectedAttribute = null;
    this._state.selectedAttributeValue = null;
    this._state.loading = false;
    this._state.submitting = false;
  }
}
