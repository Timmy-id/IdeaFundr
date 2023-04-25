import { type Request, type Response, type NextFunction } from 'express';
import { Types } from 'mongoose';
import { AppError } from '../../utils';
import { UserService } from './user.service';

export class UserController {
  public userService = new UserService();

  public getUserProfile = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const user = res.locals.user;

      return res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = res.locals.user._id;
      const { userId } = req.params;

      if (!Types.ObjectId.isValid(userId)) {
        next(new AppError(400, 'Invalid user ID'));
        return;
      }

      if (String(id) !== userId) {
        next(new AppError(403, 'You are not allowed to perform such operation'));
        return;
      }

      await this.userService.deleteUser({ _id: userId });

      return res.sendStatus(204);
    } catch (error: any) {
      next(error);
    }
  };
}
