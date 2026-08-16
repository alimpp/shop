import type { ServerResponse, ControllerResponse } from '~/types/common'

import { BaseController } from '~/core/BaseController'
import { ProfileUserService } from '../services/index.service'

import type {
  TUpdateUserPayload,
  TUserProfile
} from '../types/index.type'

class ProfileUserController extends BaseController<ProfileUserService> {
  constructor() {
    super(new ProfileUserService())
  }

  public async getProfile(): Promise<ControllerResponse<TUserProfile>> {
    const serverResponse: ServerResponse<TUserProfile>
      = await this.service.getUserProfile()
    return this.handleResponse(serverResponse)
  }

  public async updateProfile(
    payload: TUpdateUserPayload
  ): Promise<ControllerResponse<TUserProfile>> {
    const serverResponse: ServerResponse<TUserProfile>
      = await this.service.updateUserProfile(payload)
    return this.handleResponse(serverResponse)
  }
}

export const profileUserController = new ProfileUserController()
