import { BaseStore } from "./BaseStore";
type StoreInstance = InstanceType<typeof BaseStore>;

const stores = new Map<string, StoreInstance>();

export const StoreManager = {
  register(store: StoreInstance): void {
    const namespace = store.getNamespace();
    if (stores.has(namespace)) {
      console.log(`Store with namespace '${namespace}' is already registered`);
    }
    stores.set(namespace, store);
  },

  get<T extends BaseStore<any>>(namespace: string): T {
    const store = stores.get(namespace);
    if (!store) {
      throw new Error(`Store with namespace '${namespace}' not found`);
    }
    return store as T;
  },

  getAll(): StoreInstance[] {
    return Array.from(stores.values());
  },

  resetAll(): void {
    stores.forEach((store) => store.reset());
  },
};
