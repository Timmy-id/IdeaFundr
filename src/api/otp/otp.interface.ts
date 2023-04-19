import { type Document } from 'mongoose';

export default interface IOtp extends Document {
  _id?: string;
  userId: object;
  code: string;
}
