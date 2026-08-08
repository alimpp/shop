import type { ServerResponse } from "~/types/common";

import { BaseApp } from "~/core/BaseApp";
import type {
  TLoginPayload,
  TLoginData,
  TUserLoginPayload,
  TUserLoginData,
  TUserOtpPayload,
} from "../types/index.type";

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

  public async requestUserOtp(
    payload: TUserOtpPayload,
  ): Promise<ServerResponse<null>> {
    return this.executeRequest<null>(async () => {
      return await this.Post<null>("/auth/user/otp", payload);
    });
  }

  public async loginUser(
    payload: TUserLoginPayload,
  ): Promise<ServerResponse<TUserLoginData>> {
    return this.executeRequest<TUserLoginData>(async () => {
      return await this.Post<TUserLoginData>("/auth/user/login", payload);
    });
  }
}
