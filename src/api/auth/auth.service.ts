import { compare } from 'bcryptjs';
import { Types } from 'mongoose';
import {
  AppError,
  emailVerifiedTemplate,
  otpGenerator,
  sendMail,
  signJwt,
  verifyEmailTemplate
} from '../../utils';
import { type IUser } from '../user/user.interface';
import { UserModel } from '../user/user.model';
import { OTPModel } from '../otp/otp.model';
import { type ILoginData } from './auth.interface';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_PRIVATE_KEY,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_PRIVATE_KEY
} from '../../config';

export class AuthService {
  public async registerUser(userData: Partial<IUser>): Promise<IUser> {
    const user = await UserModel.findOne({ email: userData.email });

    if (user !== null) {
      throw new AppError(409, `User ${user.email} already exist`);
    }

    const newUser = await UserModel.create(userData);
    const otp = await OTPModel.findOne({ userId: newUser._id });

    if (otp !== null) {
      await otp.deleteOne();
    }

    const newOtp = otpGenerator(4, {
      digits: true,
      lowerCaseAlphabets: true,
      upperCaseAlphabets: true,
      specialChars: false
    });

    // otp to expire in 5 minutes
    await OTPModel.create({
      userId: newUser._id,
      code: newOtp
    });

    const message = verifyEmailTemplate(newUser.firstName, newOtp);
    await sendMail(newUser.email, 'Email Verification', message);

    return newUser;
  }

  public async login(userData: ILoginData) {
    const user = await UserModel.findOne({ email: userData.email });

    if (user === null) {
      throw new AppError(400, `Invalid email or password`);
    }

    const isValidPassword = await compare(userData.password, user.password);

    if (!isValidPassword) {
      throw new AppError(400, 'Invalid email or password');
    }

    if (user.isVerified === false) {
      throw new AppError(400, 'Please verify your email');
    }

    const { accessToken, refreshToken } = await this.signToken(user);

    return { accessToken, refreshToken };
  }

  public async signToken(user: IUser) {
    const accessToken = signJwt({ _id: user._id }, ACCESS_TOKEN_PRIVATE_KEY as string, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN
    });
    const refreshToken = signJwt({ _id: user._id }, REFRESH_TOKEN_PRIVATE_KEY as string, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN
    });

    return { accessToken, refreshToken };
  }

  public async verifyEmail(userId: string, otp: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(400, 'Invalid user ID');
    }

    const otpRecord = await OTPModel.findOne({ userId });
    const user = await UserModel.findOne({ _id: userId });

    if (otpRecord === null) {
      throw new AppError(400, 'User has been verified or otp has expired');
    }

    const isOtpValid = await compare(otp, otpRecord.code);

    if (!isOtpValid) {
      throw new AppError(400, 'Invalid otp');
    }

    await UserModel.updateOne({ _id: userId }, { $set: { isVerified: true } });
    await OTPModel.deleteOne({ userId });

    const message = emailVerifiedTemplate(user?.firstName as string);

    await sendMail(user?.email as string, 'Email Verified Successfully', message);
  }

  public async resendOtp(userId: string, email: string) {
    const user = await UserModel.findOne({ email });

    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(400, 'Invalid user ID');
    }

    if (user !== null) {
      if (user.isVerified === true) {
        throw new AppError(400, 'User already verified');
      }

      await OTPModel.deleteOne({ userId });

      const newOtp = otpGenerator(4, {
        digits: true,
        lowerCaseAlphabets: true,
        upperCaseAlphabets: true,
        specialChars: false
      });

      await OTPModel.create({ userId, code: newOtp });

      const message = verifyEmailTemplate(user.firstName, newOtp);
      await sendMail(user.email, 'Email Verification', message);
      return;
    }
    throw new AppError(404, 'User not found');
  }
}
