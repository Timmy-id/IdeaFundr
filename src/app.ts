import express, { type Application } from 'express';
import http from 'http';
import { type Routes } from './common';
import { NODE_ENV, PORT } from './config';

export class App {
  public app: Application;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    this.app = express();
    this.port = PORT ?? 5000;
    this.env = NODE_ENV ?? 'development';

    this.connectToDatabase();
  }

  public listen() {
    const server = http.createServer(this.app);
    server.listen(this.port, () => {});
  }

  public connectToDatabase(): void {}
}
