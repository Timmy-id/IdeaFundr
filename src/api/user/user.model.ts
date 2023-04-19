import { model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { type IUser } from './user.interface';

export const privateFields = ['password', '__v'];

const userSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    googleId: { type: String },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  const user = this as IUser;
  if (!user.isModified('password')) {
    next();
    return;
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);

  user.password = hash;

  next();
});

export const UserModel = model<IUser>('User', userSchema);
