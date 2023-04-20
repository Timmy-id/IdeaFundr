import express, { type Application } from 'express';
import http from 'http';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { type Routes } from './common';
import { NODE_ENV, PORT, SERVER_URL } from './config';
import { connectDB, getGoogleAuthUri, logger, stream } from './utils';
import { set } from 'mongoose';
import { ErrorHandler } from './middlewares';
import path from 'path';

export class App {
  public app: Application;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    this.app = express();
    this.port = PORT ?? 5000;
    this.env = NODE_ENV ?? 'development';

    this.app.set('views', path.join(__dirname, 'views'));
    this.app.set('view engine', 'ejs');

    this.app.get('/', (req, res) => {
      res.render('index', { getGoogleAuthUri });
    });

    this.app.get('/welcome', (req, res) => {
      const name = req.query.user;
      res.render('welcome', { name });
    });

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initilaizeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandler();
  }

  public listen() {
    const server = http.createServer(this.app);
    server.listen(this.port, () => {
      logger.info(`===== ENV: ${this.env} =====`);
      logger.info(`App listening on port ${this.port}`);
      logger.info(`============================`);
    });
  }

  public runserver() {
    return this.app;
  }

  private connectToDatabase(): void {
    if (this.env !== 'production') {
      set('debug', true);
    }

    void connectDB();
  }

  public initializeMiddlewares() {
    this.app.use(morgan('dev', { stream }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  public initilaizeRoutes(routes: Routes[]) {
    routes.forEach((route) => this.app.use('/api/v1', route.router));
  }

  private initializeSwagger() {
    const options: swaggerJSDoc.Options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'IdeaFundr REST API',
          version: '1.0.0',
          description: 'This documentation describes the endpoints for IdeaFundr.'
        },
        servers: [
          {
            url: SERVER_URL
          }
        ]
      },
      apis: ['swagger.yaml']
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandler() {
    this.app.use(ErrorHandler);
  }
}
