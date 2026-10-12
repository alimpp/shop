import type { ServerResponse, ControllerResponse } from '~/types/common'
import { BaseController } from '~/core/BaseController'
import { useAdminDS } from '~/dataStore'
import { ProfileAdminService } from '../services/index.service'
import type { TAdmin, TAdminProfileUpdatePayload } from '../types/index.type'

class ProfileAdminController extends BaseController<ProfileAdminService> {
  constructor() {
    super(new ProfileAdminService())
  }

  private readonly adminDS = useAdminDS()

  private syncAdmin(data: TAdmin): void {
    this.adminDS.setAdmin({
      id: data.id,
      username: data.username,
      role: data.role || 'admin',
      displayName: data.displayName ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      avatarUrl: data.avatarUrl ?? null,
      isActive: data.isActive ?? true,
      permissions: data.permissions ?? {},
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    })
    this.adminDS.setIsAuth(true)
  }

  public async getAdminProfile(
    options?: { silent?: boolean }
  ): Promise<ControllerResponse<TAdmin>> {
    const response: ServerResponse<TAdmin>
      = await this.service.getAdminProfile(options)

    if (response.success && response.data) {
      this.syncAdmin(response.data)
    }

    return this.handleResponse(response)
  }

  public async updateAdminProfile(
    payload: TAdminProfileUpdatePayload
  ): Promise<ControllerResponse<TAdmin>> {
    const response = await this.service.updateAdminProfile(payload)
    if (response.success && response.data) {
      this.syncAdmin(response.data)
    }
    return this.handleResponse(response)
  }
}

export const profileAdminController = new ProfileAdminController()
