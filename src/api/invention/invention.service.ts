import { Types } from 'mongoose';
import UserModel from '../user/user.model';
import { type InventionInterface } from './invention.interface';
import InventionModel, { type Invention } from './invention.model';
import { AppError } from '../../utils';

export class InventionService {
  public async createInvention(data: InventionInterface): Promise<Invention> {
    const invention = await InventionModel.create(data);

    const user = await UserModel.findOne({ _id: invention.owner._id });

    if (user?.role !== 'inventor') {
      await user?.updateOne({ $set: { role: 'inventor' } });
    }

    return invention;
  }

  public async AllInventions(): Promise<Invention[]> {
    return await InventionModel.find({});
  }

  public async getSingleInvention(inventionId: string): Promise<Invention> {
    if (!Types.ObjectId.isValid(inventionId)) {
      throw new AppError(400, 'Invalid Invention ID');
    }

    const invention = await InventionModel.findOne({ _id: inventionId });

    if (invention === null) {
      throw new AppError(404, 'Invention not found');
    }

    return invention;
  }
}
