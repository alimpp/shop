import type { ServerResponse } from '~/types/common'

import { BaseApp } from '~/core/BaseApp'

import type { TUpdateUserPayload, TUserProfile } from '../types/index.type'

export class ProfileUserService extends BaseApp<TUserProfile> {
  constructor() {
    super('profileUser')
  }

  public async getUserProfile(): Promise<ServerResponse<TUserProfile>> {
    return this.executeRequest<TUserProfile>(async () => {
      return await this.Get<TUserProfile>('/users/profile')
    })
  }

  public async updateUserProfile(
    payload: TUpdateUserPayload
  ): Promise<ServerResponse<TUserProfile>> {
    return this.executeRequest<TUserProfile>(async () => {
      return await this.Patch<TUserProfile>('/users/update', payload)
    })
  }
}
