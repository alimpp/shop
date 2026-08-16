import { reactive } from 'vue'

import { BaseStore } from '../../../../core/BaseStore'
import { StoreManager } from '../../../../core/StoreManager'

import { UserModel } from '../models/index.model'
import type { TUserProfile } from '../types/index.type'

interface IUserProfileState {
  user: TUserProfile | null
  isAuth: boolean
}

const initialState: IUserProfileState = {
  user: null,
  isAuth: false
}

class UserProfileDS extends BaseStore<IUserProfileState> {
  private static _instance: UserProfileDS

  public static getInstance(): UserProfileDS {
    if (!UserProfileDS._instance) {
      UserProfileDS._instance = new UserProfileDS()
    }
    return UserProfileDS._instance
  }

  private constructor() {
    super('userProfile', reactive(initialState) as IUserProfileState)
    StoreManager.register(this)
  }

  public get getIsAuth(): boolean {
    return this._state.isAuth
  }

  public get getUser(): TUserProfile | null {
    return this._state.user
  }

  public get fullName(): string {
    const user = this._state.user
    if (!user) return ''
    const name = `${user.fristname} ${user.lastname}`.trim()
    return name || user.phone
  }

  public setUser(user: TUserProfile): void {
    this._state.user = new UserModel(user)
    this._state.isAuth = true
  }

  public reset(): void {
    this._state.user = new UserModel()
    this._state.isAuth = false
  }
}

export const useUserProfileDS = () => UserProfileDS.getInstance()
