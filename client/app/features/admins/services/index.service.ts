import type { ServerResponse } from '~/types/common'
import { BaseApp } from '~/core/BaseApp'
import type {
  TAdminPayload,
  TManagedAdmin,
  TPermissionCatalog
} from '../types/index.type'

export class AdminsService extends BaseApp<{ id: string }> {
  constructor() {
    super('admins')
  }

  public async getAdmins(): Promise<ServerResponse<TManagedAdmin[]>> {
    return this.executeRequest<TManagedAdmin[]>(async () => {
      const response = await this.Get<ServerResponse<TManagedAdmin[]>>('/admin/all')
      return {
        ...response,
        data: Array.isArray(response.data) ? response.data : []
      }
    })
  }

  public async getCatalog(): Promise<ServerResponse<TPermissionCatalog>> {
    return this.executeRequest<TPermissionCatalog>(async () => {
      return this.Get<ServerResponse<TPermissionCatalog>>('/admin/permissions/catalog')
    })
  }

  public async createAdmin(
    payload: TAdminPayload
  ): Promise<ServerResponse<TManagedAdmin>> {
    return this.executeRequest<TManagedAdmin>(async () => {
      return this.Post<ServerResponse<TManagedAdmin>>('/admin', payload)
    })
  }

  public async updateAdmin(
    id: string,
    payload: TAdminPayload
  ): Promise<ServerResponse<TManagedAdmin>> {
    return this.executeRequest<TManagedAdmin>(async () => {
      return this.Patch<ServerResponse<TManagedAdmin>>(`/admin/${id}`, payload)
    })
  }

  public async deleteAdmin(
    id: string
  ): Promise<ServerResponse<{ id: string, deleted: boolean }>> {
    return this.executeRequest<{ id: string, deleted: boolean }>(async () => {
      return this.Delete<ServerResponse<{ id: string, deleted: boolean }>>(
        `/admin/${id}`
      )
    })
  }
}
