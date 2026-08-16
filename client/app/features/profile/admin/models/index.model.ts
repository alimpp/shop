import { type TAdmin } from "../types/index.type";

export class AdminModel implements TAdmin {
  id: string;
  username: string;
  role: string;

  constructor(data?: Partial<TAdmin>) {
    this.id = data?.id ?? "";
    this.username = data?.username ?? "";
    this.role = data?.role ?? "";
  }

  static empty(): AdminModel {
    return new AdminModel();
  }
}
