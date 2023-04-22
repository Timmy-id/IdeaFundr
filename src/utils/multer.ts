import { type Request } from 'express';
import multer from 'multer';
import { AppError } from './appError';

type FileNameCallback = (error: Error | null, filename: string) => void;
type FileFilterCallback = (error: any | null, file: boolean) => void;

const storage = multer.diskStorage({
  filename: (_req: Request, file: Express.Multer.File, callback: FileNameCallback): void => {
    callback(null, `${file.fieldname}${Date.now()}`);
  }
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
): void => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'video/mp4' ||
    file.mimetype === 'video/avi' ||
    file.mimetype === 'video/mkv'
  ) {
    callback(null, true);
  } else {
    callback(
      new AppError(
        400,
        'Invalid file extension. Accepted extensions are png, jpeg, jpg, mp4, mkv, avi'
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // max size of 20MB
}).fields([
  { name: 'productPicture', maxCount: 1 },
  { name: 'productVideo', maxCount: 1 },
  { name: 'productDemo', maxCount: 1 }
]);
