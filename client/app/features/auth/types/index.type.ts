export interface TLoginPayload {
  username: string;
  password: string;
}

export interface TLoginData {
  token: string;
  id: string;
  username: string;
}

export interface TUserOtpPayload {
  phoneNumber: string;
}

export interface TUserLoginPayload {
  phoneNumber: string;
  otp: string;
}

export interface TUserData {
  id: string;
  fristname: string;
  lastname: string;
  email: string;
  avatarUrl: string;
  phone: string;
}

export interface TUserLoginData {
  user: TUserData;
  token: string;
}

