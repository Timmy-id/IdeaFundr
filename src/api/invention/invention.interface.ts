import { type IGallery } from '../../common';
import { type IUser } from '../user/user.interface';

export interface InventionInterface {
  _id?: string;
  owner: IUser['_id'];
  productName: string;
  productCategory: string;
  keyFeatures: string;
  keyBenefit: string;
  description: string;
  size?: string;
  weight?: string;
  materialsUsed?: string;
  productPicture: IGallery;
  productVideo?: IGallery;
  productDemo?: IGallery;
}
