import { AppError } from '../../utils';
import {
  modelOptions,
  pre,
  prop,
  Severity,
  getModelForClass,
  Ref,
  type DocumentType
} from '@typegoose/typegoose';
import bcrypt from 'bcryptjs';
import { User } from '../user/user.model';

@pre<OTP>('save', async function () {
  if (!this.isModified('code')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(this.code, salt);

  this.code = hash;
})
@modelOptions({
  schemaOptions: {
    collection: 'otps'
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
export class OTP {
  @prop({ ref: () => User })
  public userId: Ref<User>;

  @prop({ required: true })
  public code: string;

  @prop({ default: Date.now(), expires: 5 * 60 * 1000 })
  public createdAt: Date;

  async validateOTP(this: DocumentType<OTP>, code: string) {
    try {
      return await bcrypt.compare(code, this.code);
    } catch (err) {
      throw new AppError(400, 'Could not validate otp');
    }
  }
}

const OTPModel = getModelForClass(OTP);
export default OTPModel;
