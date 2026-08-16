export interface TResponseServer {
  success?: boolean;
  message?: string;
  data: TUser;
}

export interface TRole {
  id: number;
  name: string;
  description: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface TUser {
  id: number;
  avatar?: string;
  fullName: string;
  mobile: string;
  email: string;
  userType: "customer" | "admin" | "internal" | string;
  isActive: 0 | 1;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  roles: TRole[];
  departments: any[];
}
