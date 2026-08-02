import type { ServerResponse } from "~/types/common";

import { BaseApp } from "~/core/BaseApp";

import type { TAdmin } from "../types/index.type";

export class ProfileAdminService extends BaseApp<TAdmin> {
  constructor() {
    super("profileAdmin");
  }

  public async getAdminProfile(): Promise<ServerResponse<TAdmin>> {
    return this.executeRequest<TAdmin>(async () => {
      return await this.Get<TAdmin>("/admin/info");
    }, true);
  }
}
