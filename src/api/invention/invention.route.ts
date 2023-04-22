/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { type Routes } from '../../common';
import { upload } from '../../utils';
import {
  deserializeUser,
  multerErrorHandler,
  requireUser,
  restrictUser,
  validateResource
} from '../../middlewares';
import { createInventionSchema } from './invention.schema';
import { InventionController } from './invention.controller';

export class InventionRoute implements Routes {
  public path = '/inventions/';
  public router = Router();
  public invention = new InventionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(deserializeUser, requireUser, restrictUser('user', 'inventor'));
    this.router.post(
      `${this.path}`,
      [upload, multerErrorHandler],
      validateResource(createInventionSchema),
      this.invention.newInvention
    );
    this.router.get(`${this.path}`, this.invention.getAllInventions);
  }
}
