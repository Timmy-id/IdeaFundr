import { type Request, type Response, type NextFunction } from 'express';
import { logger, type AppError } from '../utils';

export const ErrorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  try {
    const status: number = err.status ?? 500;
    const message: string = err.message ?? 'Something went wrong';

    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    res.status(status).json({ message, success: false });
  } catch (err) {
    next(err);
  }
};
