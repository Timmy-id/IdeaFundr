import { type Document } from 'mongoose';

export interface IUser extends Document {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm?: string;
  googleId?: string;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword?: (candidatePassword: string) => Promise<Boolean>;
}
