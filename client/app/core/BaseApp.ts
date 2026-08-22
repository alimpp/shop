import type { ServerResponse } from "~/types/common";

import { useCustomFetch } from "../composables/useCustomFetch";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE" | "PUT";

interface AppRequestOptions {
  query?: Record<string, any>;
  headers?: Record<string, string>;
  silent?: boolean;
}

interface RequestErrorShape {
  response?: {
    _data?: {
      message?: string | string[];
    };
  };
}

export abstract class BaseApp<T extends { id: string | number }> {
  private readonly storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  private normalizeMessage(message: unknown): string {
    if (Array.isArray(message)) {
      return message
        .map((item) => String(item).trim())
        .filter(Boolean)
        .join("، ");
    }

    if (typeof message === "string") {
      return message;
    }

    return "خطا در ارتباط با سرور";
  }

  private getErrorMessage(error: unknown): string {
    const requestError = error as RequestErrorShape;

    return this.normalizeMessage(requestError.response?._data?.message);
  }

  private async request<T>(
    url: string,
    method: HttpMethod,
    body?: any,
    options: AppRequestOptions = {},
  ): Promise<T> {
    const api = useCustomFetch();
    const isFormData = body instanceof FormData;
    try {
      const response = await api(url, {
        method,
        query: options.query,
        body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
        headers: {
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          ...options.headers,
        },
        silent: options.silent,
      });
      return response as T;
    } catch (err: unknown) {
      throw err;
    }
  }

  public async Get<T>(
    url: string,
    query?: Record<string, any>,
    options?: Pick<AppRequestOptions, "silent" | "headers">,
  ): Promise<T> {
    return this.request<T>(url, "GET", undefined, { query, ...options });
  }

  public async Post<T>(
    url: string,
    body: any,
    options?: Pick<AppRequestOptions, "silent" | "headers">,
  ): Promise<T> {
    return this.request<T>(url, "POST", body, options);
  }

  public async Patch<T>(
    url: string,
    body: any,
    options?: Pick<AppRequestOptions, "silent" | "headers">,
  ): Promise<T> {
    return this.request<T>(url, "PATCH", body, options);
  }

  public async Put<T>(
    url: string,
    body: any,
    options?: Pick<AppRequestOptions, "silent" | "headers">,
  ): Promise<T> {
    return this.request<T>(url, "PUT", body, options);
  }

  public async Delete<T>(
    url: string,
    options?: Pick<AppRequestOptions, "silent" | "headers">,
  ): Promise<T> {
    return this.request<T>(url, "DELETE", undefined, options);
  }

  public async Upload<T>(
    url: string,
    body: FormData,
    options?: Pick<AppRequestOptions, "silent" | "headers">,
  ): Promise<T> {
    const api = useCustomFetch();
    try {
      const response = await api(url, {
        method: "POST",
        body,
        silent: options?.silent,
      });
      return response as T;
    } catch (err) {
      throw err;
    }
  }

  protected async executeRequest<T>(
    action: () => Promise<ServerResponse<T>>,
    saveToStorage: boolean = false,
  ): Promise<ServerResponse<T>> {
    try {
      const response = await action();

      if (saveToStorage && response.success) {
        this.saveData(response.data as any);
      }

      return response;
    } catch (error: unknown) {
      return {
        success: false,
        message: this.getErrorMessage(error),
        data: null as T,
      };
    }
  }

  protected getData(): T[] {
    if (!import.meta.client) {
      return [];
    }

    const data = localStorage.getItem(this.storageKey);
    return data ? (JSON.parse(data) as T[]) : [];
  }

  protected hasData(): boolean {
    if (!import.meta.client) {
      return false;
    }

    return Boolean(localStorage.getItem(this.storageKey));
  }

  protected saveData(items: T[] | any): void {
    if (!import.meta.client) {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  protected removeData() {
    if (!import.meta.client) {
      return;
    }

    localStorage.removeItem(this.storageKey);
  }
}
