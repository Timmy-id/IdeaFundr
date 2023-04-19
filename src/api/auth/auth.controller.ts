import { type Request, type Response, type NextFunction, type CookieOptions } from 'express';
import { omit } from 'lodash';
import { AuthService } from './auth.service';
import { type LoginInput, type RegisterInput } from './auth.schema';
import { privateFields } from '../user/user.model';
import { NODE_ENV } from '../../config';
import { type ResendOTPInput, type OtpInput } from '../otp/otp.schema';

const accessTokenCookieOptions: CookieOptions = {
  maxAge: 900000, // 15mins
  httpOnly: true,
  domain: 'localhost',
  path: '/',
  secure: NODE_ENV === 'production'
};

const refreshTokenCookieOptions: CookieOptions = {
  maxAge: 3.154e10, // 1 year
  httpOnly: true,
  domain: 'localhost',
  path: '/',
  secure: NODE_ENV === 'production'
};

export class AuthController {
  public authService = new AuthService();

  public registerUser = async (
    req: Request<{}, {}, RegisterInput>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.body;
      const newUser = await this.authService.registerUser(userData);

      return res.status(201).json({
        success: true,
        message: 'Check your email for verification code',
        data: omit(newUser.toJSON(), privateFields)
      });
    } catch (error: any) {
      next(error);
    }
  };

  public loginUser = async (
    req: Request<{}, {}, LoginInput>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userInput = req.body;
      const { accessToken, refreshToken } = await this.authService.login(userInput);

      res.cookie('accessToken', accessToken, accessTokenCookieOptions);
      res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);
      res.cookie('loggedIn', true, accessTokenCookieOptions);

      return res.status(200).json({ success: true, data: { accessToken } });
    } catch (error: any) {
      next(error);
    }
  };

  public verifyUser = async (req: Request<OtpInput>, res: Response, next: NextFunction) => {
    try {
      const { userId, otp } = req.body;

      await this.authService.verifyEmail(userId, otp);
      return res.status(200).json({ success: true, message: 'User verified successfully' });
    } catch (error: any) {
      next(error);
    }
  };

  public resendOtp = async (req: Request<ResendOTPInput>, res: Response, next: NextFunction) => {
    try {
      const { userId, email } = req.body;

      await this.authService.resendOtp(userId, email);

      return res.status(200).json({
        success: true,
        message: 'OTP resent successfully. Check your email for the new OTP'
      });
    } catch (error: any) {
      next(error);
    }
  };

  // public userGoogleAuth = async (req: Request, res: Response, next: NextFunction) => {};
}
