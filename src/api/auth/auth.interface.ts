export interface ILoginData {
  id?: string;
  email: string;
  password: string;
}

export interface ILoginResponse {
  success: boolean;
  data: object;
}
