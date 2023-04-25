import { type Request, type Response, type NextFunction, type CookieOptions } from 'express';
import { AuthService } from './auth.service';
import { type RegisterInput } from './auth.schema';
import { NODE_ENV } from '../../config';
import { type ResendOTPInput, type OtpInput } from '../otp/otp.schema';
import { AppError } from '../../utils';
import { type IUser } from '../user/user.interface';

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
        data: newUser
      });
    } catch (error: any) {
      next(error);
    }
  };

  public loginUser = async (req: Request<{}, {}, IUser>, res: Response, next: NextFunction) => {
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

  public refreshAccessTokens = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;

      const accessToken = await this.authService.refreshToken(refreshToken);

      res.cookie('accessToken', accessToken, accessTokenCookieOptions);
      res.cookie('loggedIn', true, accessTokenCookieOptions);

      return res.status(200).json({ success: true, data: { accessToken } });
    } catch (error: any) {
      next(error);
    }
  };

  public googleSignIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = req.query.code as string;

      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { id_token, access_token } = await this.authService.getGoogleOauthTokens(code);

      const googleUser = await this.authService.getGoogleUser(id_token, access_token);

      if (!googleUser.verified_email) {
        next(new AppError(403, 'Your Google account is not verified'));
        return;
      }

      const user = await this.authService.findAndUpdateUser(
        { email: googleUser.email },
        {
          email: googleUser.email,
          firstName: googleUser.given_name,
          lastName: googleUser.family_name,
          isVerified: true
        },
        {
          upsert: true,
          new: true
        }
      );

      if (user !== null) {
        const { accessToken, refreshToken } = await this.authService.signToken(user);

        res.cookie('accessToken', accessToken, accessTokenCookieOptions);
        res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);
        res.cookie('loggedIn', true, accessTokenCookieOptions);

        res.redirect(`/welcome?user=${user.firstName}`);
        return;
      }

      next(new AppError(404, 'USer not found'));
      return;
    } catch (error: any) {
      next(error);
    }
  };
}
