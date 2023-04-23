/* eslint-disable @typescript-eslint/naming-convention */
import { type NextFunction, type Request, type Response } from 'express';
import { InventionService } from './invention.service';
import { uploadToCloudinary } from '../../utils';
import { type InventionInterface } from './invention.interface';
// import { type CreateInventionInput } from './invention.schema';

export class InventionController {
  public inventionService = new InventionService();

  public newInvention = async (
    req: Request<{}, {}, InventionInterface>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = req.body;
      const userId = res.locals.user._id;

      const allFiles = req.files as Express.Multer.File[];

      for (const key of Object.keys(allFiles)) {
        if (key === 'productPicture') {
          // @ts-expect-error not really an error
          for (const file of allFiles[key]) {
            const path: string = file.path;
            const image = await uploadToCloudinary(path, 'Product-Picture');
            data.productPicture = image;
          }
        }

        if (key === 'productVideo') {
          // @ts-expect-error not really an error
          for (const file of allFiles[key]) {
            const path: string = file.path;
            const video = await uploadToCloudinary(path, 'Product-Video');
            data.productVideo = video;
          }
        }

        if (key === 'productDemo') {
          // @ts-expect-error not really an error
          for (const file of allFiles[key]) {
            const path: string = file.path;
            data.productDemo = path;
          }
        }
      }
      const { site_id } = await this.inventionService.getSiteIdFromSwiftXr(
        data.productName.replace(/\s/g, '').toLowerCase()
      );

      const { site_url } = await this.inventionService.getDeployedUrl(
        site_id,
        data.productDemo as string
      );

      const invention = await this.inventionService.createInvention({
        ...data,
        owner: userId,
        siteId: site_id,
        productDemo: site_url
      });

      return res
        .status(201)
        .json({ success: true, message: 'Invention created successfully', data: invention });
    } catch (error: any) {
      next(error);
    }
  };

  public getAllInventions = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const inventions = await this.inventionService.AllInventions();

      return res
        .status(200)
        .json({ success: true, message: 'Successfully gotten all inventions', data: inventions });
    } catch (error: any) {
      next(error);
    }
  };

  public getSingleInvention = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { inventionId } = req.params;

      const invention = await this.inventionService.getSingleInvention(inventionId);
      return res
        .status(200)
        .json({ success: true, message: 'Successfully gotten invention', data: invention });
    } catch (error: any) {
      next(error);
    }
  };
}
