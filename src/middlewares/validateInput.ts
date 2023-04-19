import { type Request, type Response, type NextFunction } from 'express';
import { type AnyZodObject } from 'zod';

export const validateResource =
  (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (e: any) {
      return res.status(400).json({
        success: false,
        message: e.issues[0].message
      });
    }
  };
