import { type Request, type Response, type NextFunction } from 'express';
import { AuthService } from './auth.service';
import { type RegisterInput } from './auth.schema';
import { type ResendOTPInput, type OtpInput } from '../otp/otp.schema';
import { AppError, signJwt } from '../../utils';
import { type IUser } from '../user/user.interface';

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

      return res.status(200).json({ success: true, data: { accessToken, refreshToken } });
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
      const { refreshToken, userId } = req.body;

      const accessToken = await this.authService.refreshToken(refreshToken, userId);

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

        res.redirect(`/welcome?user=${user.firstName}`);
        return res.status(200).json({ sucess: true, data: { accessToken, refreshToken } });
      }

      next(new AppError(404, 'USer not found'));
      return;
    } catch (error: any) {
      next(error);
    }
  };

  public logoutUser = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const user = res.locals.user;

      signJwt({ _id: user._id }, '', {
        expiresIn: 1
      });

      return res.sendStatus(204);
    } catch (error: any) {
      next(error);
    }
  };
}
