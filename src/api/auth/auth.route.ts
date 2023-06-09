/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { type Routes } from '../../common';
import { AuthController } from './auth.controller';
import { deserializeUser, requireUser, validateResource } from '../../middlewares';
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
    this.router.get(`${this.path}refresh`, this.auth.refreshAccessTokens);
    this.router.get(`${this.path}oauth/google`, this.auth.googleSignIn);
    this.router.use(deserializeUser, requireUser);
    this.router.get(`${this.path}logout`, this.auth.logoutUser);
  }
}
