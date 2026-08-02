import type { ServerResponse } from "~/types/common";

import { BaseApp } from "~/core/BaseApp";
import type { TLoginPayload, TLoginData } from "../types/index.type";

export class AuthService extends BaseApp<any> {
  constructor() {
    super("auth");
  }

  public async login(
    payload: TLoginPayload,
  ): Promise<ServerResponse<TLoginData>> {
    return this.executeRequest<TLoginData>(async () => {
      return await this.Post<TLoginData>("/auth/login", payload);
    });
  }
}
