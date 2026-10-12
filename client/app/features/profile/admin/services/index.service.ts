import type { ServerResponse } from '~/types/common'
import { BaseApp } from '~/core/BaseApp'
import type { TAdmin, TAdminProfileUpdatePayload } from '../types/index.type'

export class ProfileAdminService extends BaseApp<TAdmin> {
  constructor() {
    super('profileAdmin')
  }

  public async getAdminProfile(
    options?: { silent?: boolean }
  ): Promise<ServerResponse<TAdmin>> {
    return this.executeRequest<TAdmin>(async () => {
      return await this.Get<TAdmin>('/admin/info', undefined, {
        silent: options?.silent
      })
    }, true)
  }

  public async updateAdminProfile(
    payload: TAdminProfileUpdatePayload
  ): Promise<ServerResponse<TAdmin>> {
    return this.executeRequest<TAdmin>(async () => {
      return await this.Patch<ServerResponse<TAdmin>>('/admin/profile', payload)
    })
  }
}
