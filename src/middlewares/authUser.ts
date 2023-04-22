import { type NextFunction, type Request, type Response } from 'express';
import { AppError } from '../utils';

export const restrictUser =
  (...allowedRoles: string[]) =>
  (_req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    if (!allowedRoles.includes(user.role)) {
      next(new AppError(403, 'You are not allowed to perform this action'));
      return;
    }

    next();
  };
