import type { ControllerResponse, ServerResponse } from "~/types/common";

export abstract class BaseController<TService> {
  protected constructor(
    protected readonly service: TService
  ) {}

  protected handleResponse<T>(response: ServerResponse<T>): ControllerResponse<T> {
    return {
      success: response.success,
      message: response.message ?? "",
      data: response.data,
    };
  }

}

