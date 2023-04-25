import { type Request, type Response, type NextFunction } from 'express';
import { AppError, verifyJwt } from '../utils';
import { ACCESS_TOKEN_PUBLIC_KEY } from '../config';
import { UserService } from '../api/user/user.service';

const userService = new UserService();

export const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = (req.headers.authorization ?? '').replace(/^Bearer\s/, '');

    if (accessToken === null) {
      next(new AppError(401, 'You are not logged in'));
      return;
    }

    const decoded = verifyJwt<{ _id: string }>(accessToken, ACCESS_TOKEN_PUBLIC_KEY as string);

    if (decoded === null) {
      next(new AppError(401, 'User session expired'));
      return;
    }

    const user = await userService.findUser({ _id: decoded._id });

    if (user === null) {
      next(new AppError(401, 'User with token no longer exist'));
      return;
    }

    res.locals.user = user;
    next();
  } catch (error: any) {
    next(error);
  }
};
