import { type DocumentType } from '@typegoose/typegoose';
import { type FilterQuery, type QueryOptions, Types, type UpdateQuery } from 'mongoose';
import axios from 'axios';
import qs from 'qs';
import {
  AppError,
  emailVerifiedTemplate,
  otpGenerator,
  sendMail,
  signJwt,
  verifyEmailTemplate,
  verifyJwt
} from '../../utils';
import { type IUser } from '../user/user.interface';
import UserModel, { type User } from '../user/user.model';
import OTPModel from '../otp/otp.model';
import { type IGoogleTokensResult, type IGoogleUserResult } from './auth.interface';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_PRIVATE_KEY,
  GOOGLE_AUTH_REDIRECT_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_TOKEN_URL,
  GOOGLE_USER_URL,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_PRIVATE_KEY,
  REFRESH_TOKEN_PUBLIC_KEY
} from '../../config';

export class AuthService {
  public async registerUser(userData: Partial<User>): Promise<User> {
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

  public async login(userData: IUser) {
    const user = await UserModel.findOne({ email: userData.email });

    if (user === null) {
      throw new AppError(400, `Invalid email or password`);
    }

    const isValidPassword = await user.validatePassword(userData.password);

    if (!isValidPassword) {
      throw new AppError(400, 'Invalid email or password');
    }

    if (!user.isVerified) {
      throw new AppError(400, 'Please verify your email');
    }

    const { accessToken, refreshToken } = await this.signToken(user);

    return { accessToken, refreshToken };
  }

  public async signToken(user: DocumentType<User>) {
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

    const isOtpValid = await otpRecord.validateOTP(otp);

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
      if (user.isVerified) {
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

  public async refreshToken(refreshToken: string, userId: string) {
    const decoded = verifyJwt<{ _id: string }>(refreshToken, REFRESH_TOKEN_PUBLIC_KEY as string);

    if (decoded === null) {
      throw new AppError(403, 'Could not refresh access token');
    }

    if (String(decoded._id) !== userId) {
      throw new AppError(403, 'You are not allowed to do that');
    }

    const user = await UserModel.findOne({ _id: String(decoded._id) });

    if (user === null) {
      throw new AppError(404, 'User does not exist');
    }

    const accessToken = signJwt({ _id: user._id }, ACCESS_TOKEN_PRIVATE_KEY as string, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN
    });

    return accessToken;
  }

  public async getGoogleOauthTokens(code: string): Promise<IGoogleTokensResult> {
    const url = GOOGLE_TOKEN_URL as string;

    const values = {
      code,
      client_id: GOOGLE_CLIENT_ID as string,
      client_secret: GOOGLE_CLIENT_SECRET as string,
      redirect_uri: GOOGLE_AUTH_REDIRECT_URL as string,
      grant_type: 'authorization_code'
    };

    try {
      const res = await axios.post<IGoogleTokensResult>(url, qs.stringify(values), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      return res.data;
    } catch (error: any) {
      throw new AppError(403, error.message);
    }
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public async getGoogleUser(id_token: string, access_token: string): Promise<IGoogleUserResult> {
    try {
      const res = await axios.get<IGoogleUserResult>(
        `${GOOGLE_USER_URL as string}${access_token}`,
        { headers: { Authorization: `Bearer ${id_token}` } }
      );
      return res.data;
    } catch (error: any) {
      throw new AppError(400, error.message);
    }
  }

  public async findAndUpdateUser(
    query: FilterQuery<IUser>,
    update: UpdateQuery<IUser>,
    options: QueryOptions = {}
  ) {
    return await UserModel.findOneAndUpdate(query, update, options);
  }
}
