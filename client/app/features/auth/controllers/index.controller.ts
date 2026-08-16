import type { ControllerResponse, ServerResponse } from "~/types/common";

import { BaseController } from "~/core/BaseController";
import { AuthService } from "../services/index.service";
import { useAdminDS } from "~/dataStore";
import { useCookie } from "#app";

import type {
  TLoginPayload,
  TLoginData,
  TUserLoginPayload,
  TUserLoginData,
  TUserOtpPayload,
} from "../types/index.type";

class AuthController extends BaseController<AuthService> {
  constructor() {
    super(new AuthService());
  }
  private readonly adminDS = useAdminDS();

  public async login(payload: TLoginPayload): Promise<ControllerResponse> {
    const response: ServerResponse<TLoginData> =
      await this.service.login(payload);

    if (response.success) {
      const token = useCookie("token");
      token.value = response.data.token || "";
      this.adminDS.setIsAuth(true);
      this.adminDS.setAdmin({
        id: response.data.id,
        username: response.data.username,
        role: "admin",
      });
    }

    return this.handleResponse(response);
  }

  public async loginWithPhone(
    payload: TUserOtpPayload,
  ): Promise<ControllerResponse> {
    const response: ServerResponse<null> = await this.service.requestUserOtp(
      payload,
    );

    return this.handleResponse(response);
  }

  public async loginUser(
    payload: TUserLoginPayload,
  ): Promise<ControllerResponse<TUserLoginData>> {
    const response: ServerResponse<TUserLoginData> =
      await this.service.loginUser(payload);

    if (response.success && response.data) {
      const token = useCookie("token");
      token.value = response.data.token;
    }

    return this.handleResponse(response);
  }
}

export const authController = new AuthController();
