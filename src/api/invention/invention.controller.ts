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
            const demo = await uploadToCloudinary(path, 'Product-Demo');
            data.productDemo = demo;
          }
        }
      }
      const invention = await this.inventionService.createInvention({ ...data, owner: userId });

      return res
        .status(201)
        .json({ success: true, message: 'Innvention created successfully', data: invention });
    } catch (error: any) {
      next(error);
    }
  };
}
