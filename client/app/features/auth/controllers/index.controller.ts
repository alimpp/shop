import type { ControllerResponse, ServerResponse } from "~/types/common";

import { BaseController } from "~/core/BaseController";
import { AuthService } from "../services/index.service";
import { useAdminDS } from "~/dataStore";
import { useCookie } from "#app";

import type { TLoginPayload, TLoginData } from "../types/index.type";

class AuthController extends BaseController<AuthService> {
  constructor() {
    super(new AuthService());
  }
  private readonly adminDS = useAdminDS();

  public async login(payload: TLoginPayload): Promise<ControllerResponse> {
    const response: ServerResponse<TLoginData> =
      await this.service.login(payload);
console.log(response);

    if (response.success) {
      const token = useCookie("token");
      token.value = response.data.token || "";
      this.adminDS.setIsAuth(true);
    }

    return this.handleResponse(response);
  }
}

export const authController = new AuthController();
