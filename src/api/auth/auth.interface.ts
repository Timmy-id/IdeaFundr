export interface ILoginData {
  id?: string;
  email: string;
  password: string;
}

export interface ILoginResponse {
  success: boolean;
  data: object;
}

export interface IGoogleTokensResult {
  access_token: string;
  expires_in: Number;
  refresh_token: string;
  scope: string;
  id_token: string;
}

export interface IGoogleUserResult {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}
