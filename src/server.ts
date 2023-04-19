import { AuthRoute } from './api/auth/auth.route';
import { App } from './app';
import { ValidateEnv } from './utils';

ValidateEnv();

const authRoute = new AuthRoute();

const app = new App([authRoute]);

app.listen();
