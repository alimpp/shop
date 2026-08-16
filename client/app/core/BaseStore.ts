import { reactive, readonly, computed } from "vue";

export abstract class BaseStore<TState extends object> {
  protected readonly _state: TState;
  protected readonly _namespace: string;

  constructor(namespace: string, initialState: TState) {
    this._namespace = namespace;
    this._state = reactive(initialState) as TState;
  }

  public get state() {
    return readonly(this._state) as TState;
  }

  protected createGetter<T>(getterFn: (state: TState) => T) {
    return computed(() => getterFn(this._state));
  }

  protected abstract reset(): void;

  public getNamespace(): string {
    return this._namespace;
  }
}
