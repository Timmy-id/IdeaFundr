import {
  modelOptions,
  prop,
  Severity,
  pre,
  getModelForClass,
  type DocumentType
} from '@typegoose/typegoose';
import bcrypt from 'bcryptjs';
import { AppError } from '../../utils';

export const privateFields = ['password', '__v'];

@pre<User>('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(this.password, salt);

  this.password = hash;
})
@modelOptions({
  schemaOptions: {
    collection: 'users',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
export class User {
  @prop({ required: true })
  public firstName: string;

  @prop({ required: true })
  public lastName: string;

  @prop({ required: true, unique: true })
  public email: string;

  @prop()
  public password: string;

  @prop({ default: false })
  public isVerified: boolean;

  @prop()
  public phone?: string;

  @prop()
  public website?: string;

  @prop()
  public avatar?: object;

  @prop()
  public socialMedia?: string[];

  @prop()
  public languages?: string[];

  @prop()
  public skills?: string;

  @prop()
  public education: string[];

  @prop({ default: 'user' })
  public role: string;

  async validatePassword(this: DocumentType<User>, candidatePassword: string) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      throw new AppError(400, 'Could not validate password');
    }
  }
}

const UserModel = getModelForClass(User);
export default UserModel;
