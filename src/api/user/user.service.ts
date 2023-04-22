import UserModel from './user.model';

export class UserService {
  public async findUser(option: object) {
    return await UserModel.findOne(option);
  }
}
