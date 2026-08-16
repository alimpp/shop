import type { ServerResponse, ControllerResponse } from "~/types/common";

import { BaseController } from "~/core/BaseController";
import { ProfileAdminService } from "../services/index.service";
import { useAdminDS } from "~/dataStore";

import type { TAdmin } from "../types/index.type";

class ProfileAdminController extends BaseController<ProfileAdminService> {
  constructor() {
    super(new ProfileAdminService());
  }

  private readonly adminDS = useAdminDS();

  public async getAdminProfile(): Promise<ControllerResponse<TAdmin>> {
    const response: ServerResponse<TAdmin> =
      await this.service.getAdminProfile();

    if (response.success && response.data) {
      this.adminDS.setAdmin({
        id: response.data.id,
        username: response.data.username,
        role: response.data.role || "admin",
      });
      this.adminDS.setIsAuth(true);
    }

    return this.handleResponse(response);
  }
}

export const profileAdminController = new ProfileAdminController();
