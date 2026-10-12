import type { ControllerResponse } from '~/types/common'
import { BaseController } from '~/core/BaseController'
import { AdminsService } from '../services/index.service'
import type {
  TAdminPayload,
  TManagedAdmin,
  TPermissionCatalog
} from '../types/index.type'

class AdminsController extends BaseController<AdminsService> {
  constructor() {
    super(new AdminsService())
  }

  public async getAdmins(): Promise<ControllerResponse<TManagedAdmin[]>> {
    return this.handleResponse(await this.service.getAdmins())
  }

  public async getCatalog(): Promise<ControllerResponse<TPermissionCatalog>> {
    return this.handleResponse(await this.service.getCatalog())
  }

  public async createAdmin(
    payload: TAdminPayload
  ): Promise<ControllerResponse<TManagedAdmin>> {
    return this.handleResponse(await this.service.createAdmin(payload))
  }

  public async updateAdmin(
    id: string,
    payload: TAdminPayload
  ): Promise<ControllerResponse<TManagedAdmin>> {
    return this.handleResponse(await this.service.updateAdmin(id, payload))
  }

  public async deleteAdmin(
    id: string
  ): Promise<ControllerResponse<{ id: string, deleted: boolean }>> {
    return this.handleResponse(await this.service.deleteAdmin(id))
  }
}

export const adminsController = new AdminsController()
