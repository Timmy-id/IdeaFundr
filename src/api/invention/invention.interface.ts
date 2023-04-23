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
  productDemo?: string;
  siteId?: string;
}

export interface Site {
  site_id: string;
  site_name: string;
  created: Date;
  updated: Date;
  site_url: string;
}

interface SiteConfig {
  type: string;
  logo_url: string;
  compress_model: boolean;
  compress_image: boolean;
  model_compression_level: number;
  image_compression_level: number;
  use_ar: boolean;
}

export interface GetSiteResponse {
  success: string;
  site: Site;
}

export interface DeploySite {
  config: SiteConfig;
  site_id: string;
  site_name: string;
  site_url: string;
  last_update: Date;
  view_count: number;
  _id: string;
  date_created: Date;
}

export interface DeployResponse {
  success: string;
  credits: number;
  site: DeploySite;
}
