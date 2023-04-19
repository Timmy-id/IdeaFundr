/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Routes } from '../../common';
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateResource } from '../../middlewares';
import { loginSchema, registerSchema } from './auth.schema';
import { resendOTPSchema, verifySchema } from '../otp/otp.schema';

export class AuthRoute implements Routes {
  public path = '/auth/';
  public router = Router();
  public auth = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}register`,
      validateResource(registerSchema),
      this.auth.registerUser
    );
    this.router.post(`${this.path}login`, validateResource(loginSchema), this.auth.loginUser);
    this.router.post(`${this.path}verify`, validateResource(verifySchema), this.auth.verifyUser);
    this.router.post(
      `${this.path}resendotp`,
      validateResource(resendOTPSchema),
      this.auth.resendOtp
    );
    // this.router.get(`${this.path}oauth/google`, this.auth.userGoogleAuth);
  }
}
