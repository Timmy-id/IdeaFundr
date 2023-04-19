import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type IOtp from './otp.interface';

const otpSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    code: { type: String, required: true }
  },
  { timestamps: true, expireAfterSeconds: 300 }
);

otpSchema.pre('save', async function (next) {
  const otp = this as IOtp;
  if (!otp.isModified('code')) {
    next();
    return;
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(otp.code, salt);

  otp.code = hash;

  next();
});

export const OTPModel = model<IOtp>('OTP', otpSchema);
