import type { ServerResponse, ControllerResponse } from "~/types/common";

import { BaseController } from "~/core/BaseController";
import { ProfileAdminService } from "../services/index.service";

import type { TAdmin } from "../types/index.type";

class ProfileAdminController extends BaseController<ProfileAdminService> {
  constructor() {
    super(new ProfileAdminService());
  }

  public async getAdminProfile(): Promise<ControllerResponse<TAdmin>> {
    const servcerResponse: ServerResponse<TAdmin> =
      await this.service.getAdminProfile();
    return this.handleResponse(servcerResponse);
  }
}

export const profileAdminController = new ProfileAdminController()