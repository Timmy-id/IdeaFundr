import { Types } from 'mongoose';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import UserModel from '../user/user.model';
import {
  type Site,
  type GetSiteResponse,
  type InventionInterface,
  type DeployResponse,
  type DeploySite
} from './invention.interface';
import InventionModel, { type Invention } from './invention.model';
import { AppError } from '../../utils';
import { SWIFTXR_API_TOKEN, SWIFTXR_API_URL } from '../../config';

const url = SWIFTXR_API_URL as string;
export class InventionService {
  public async createInvention(data: InventionInterface): Promise<Invention> {
    const invention = await InventionModel.create(data);

    const user = await UserModel.findOne({ _id: invention.owner._id });

    if (user?.role !== 'inventor') {
      await user?.updateOne({ $set: { role: 'inventor' } });
    }

    return invention;
  }

  public async getSiteIdFromSwiftXr(siteName: string): Promise<Site> {
    const payload = {
      site_name: siteName,
      config: {
        type: 'artwork',
        logo_url: '',
        compress_model: true,
        model_compression_level: 5,
        compress_image: true,
        image_compression_level: 5,
        use_ar: false
      }
    };

    try {
      const response = await axios.post<GetSiteResponse>(url, payload, {
        headers: {
          Authorization: `Bearer ${SWIFTXR_API_TOKEN as string}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.site;
    } catch (error: any) {
      throw new AppError(400, error.response.data.error);
    }
  }

  public async getDeployedUrl(siteId: string, image: string): Promise<DeploySite> {
    try {
      const form = new FormData();
      form.append('deploy', fs.createReadStream(image));

      const response = await axios.post<DeployResponse>(`${url}/deploy/${siteId}`, form, {
        headers: {
          Authorization: `Bearer ${SWIFTXR_API_TOKEN as string}`
        }
      });
      return response.data.site;
    } catch (error: any) {
      throw new AppError(400, error.response.data.error);
    }
  }

  public async AllInventions(): Promise<Invention[]> {
    return await InventionModel.find({});
  }

  public async getSingleInvention(inventionId: string): Promise<Invention> {
    if (!Types.ObjectId.isValid(inventionId)) {
      throw new AppError(400, 'Invalid Invention ID');
    }

    const invention = await InventionModel.findOne({ _id: inventionId });

    if (invention === null) {
      throw new AppError(404, 'Invention not found');
    }

    return invention;
  }
}
