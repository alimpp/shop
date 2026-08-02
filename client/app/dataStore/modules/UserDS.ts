import { BaseStore } from "../../core/BaseStore";
import { StoreManager } from "../../core/StoreManager";

import { type TUser } from "~/types/user";

interface IUserState {
  isAuth: boolean;
  user: TUser;
}

const initialUser: TUser = {
  id: 0,
  fullName: "",
  mobile: "",
  email: "",
  userType: "",
  isActive: 0,
  lastLoginAt: "",
  createdAt: "",
  updatedAt: "",
  roles: [
    {
      id: 0,
      name: "",
      description: "",
      slug: "",
      createdAt: "",
      updatedAt: "",
    },
  ],
  departments: [],
};

export class UserDS extends BaseStore<IUserState> {
  private static _instance: UserDS;

  public static getInstance(): UserDS {
    if (!UserDS._instance) {
      UserDS._instance = new UserDS();
    }
    return UserDS._instance;
  }

  private constructor() {
    super("user", {
      isAuth: false,
      user: initialUser,
    });

    StoreManager.register(this);
  }

  public get getIsAuth(): boolean {
    return this._state.isAuth;
  }

  public setIsAuth(auth: boolean): void {
    this._state.isAuth = auth;
  }

  public get getUser(): TUser {
    return this._state.user;
  }

  public setUser(user: TUser): void {
    const formater = {
      ...user,
      avatar: user.fullName ? user.fullName[0]?.toUpperCase() : "",
    };
    this._state.user = formater;
  }

  public reset(): void {
    this._state.isAuth = false;
    this._state.user = initialUser;
  }
}
