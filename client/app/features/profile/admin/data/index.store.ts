import { BaseStore } from "../../../../core/BaseStore";
import { StoreManager } from "../../../../core/StoreManager";

import { type TAdmin } from "../types/index.type";

import { AdminModel } from "../models/index.model";

interface IAdminState {
  isAuth: boolean;
  admin: TAdmin;
}

const initialAdmin = AdminModel.empty();

export class AdminDS extends BaseStore<IAdminState> {
  private static _instance: AdminDS;

  public static getInstance(): AdminDS {
    if (!AdminDS._instance) {
      AdminDS._instance = new AdminDS();
    }
    return AdminDS._instance;
  }

  private constructor() {
    super("admin", {
      isAuth: false,
      admin: initialAdmin,
    });

    StoreManager.register(this);
  }

  public get getIsAuth(): boolean {
    return this._state.isAuth;
  }

  public setIsAuth(auth: boolean): void {
    this._state.isAuth = auth;
  }

  public get getAdmin(): TAdmin {
    return this._state.admin;
  }

  public setAdmin(admin: TAdmin): void {
    this._state.admin = new AdminModel(admin);
  }

  public reset(): void {
    this._state.isAuth = false;
    this._state.admin = new AdminModel();
  }
}
