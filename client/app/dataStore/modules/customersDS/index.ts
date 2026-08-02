import { BaseStore } from "../../../core/BaseStore";
import { StoreManager } from "../../../core/StoreManager";
import type { TCustomer } from "../../../types/customers/index";
import { CustomerModel } from "./models/Customers.model";

interface TMeta {
  page: number;
  per_page: number;
  total: number;
}

interface ICustomersState {
  customers: CustomerModel[];
  meta: TMeta;
  loading: boolean;
  lastSearchField: string;
}

export class CustomersDS extends BaseStore<ICustomersState> {
  private static _instance: CustomersDS;

  public static getInstance(): CustomersDS {
    if (!CustomersDS._instance) {
      CustomersDS._instance = new CustomersDS();
    }
    return CustomersDS._instance;
  }

  private constructor() {
    super("customers", {
      customers: [],
      meta: {
        page: 1,
        per_page: 10,
        total: 0,
      },
      loading: false,
      lastSearchField: "",
    });
    StoreManager.register(this);
  }

  get getCustomers(): CustomerModel[] {
    return this._state.customers;
  }

  get getMeta(): TMeta {
    return this._state.meta;
  }

  get getLoading(): boolean {
    return this._state.loading;
  }

  get getLastSearchField(): string {
    return this._state.lastSearchField;
  }

  setCustomers(list: TCustomer[]): void {
    this._state.customers = list.map((c) => new CustomerModel(c));
  }

  setMeta(meta: TMeta): void {
    this._state.meta = meta;
  }

  resetMeta(): void {
    this._state.meta = {
      page: 1,
      per_page: 10,
      total: 0,
    };
  }

  setLastSearchField(val: string): void {
    this._state.lastSearchField = val;
  }

  setLoading(loading: boolean): void {
    this._state.loading = loading;
  }

  reset(): void {
    this._state.customers = [];
  }
}
