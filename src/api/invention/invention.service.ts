import UserModel from '../user/user.model';
import { type InventionInterface } from './invention.interface';
import InventionModel, { type Invention } from './invention.model';

export class InventionService {
  public async createInvention(data: InventionInterface): Promise<Invention> {
    const invention = await InventionModel.create(data);

    const user = await UserModel.findOne({ _id: invention.owner._id });

    if (user?.role !== 'inventor') {
      await user?.updateOne({ $set: { role: 'inventor' } });
    }

    return invention;
  }
}
