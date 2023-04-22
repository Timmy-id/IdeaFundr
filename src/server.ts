import { AuthRoute } from './api/auth/auth.route';
import { InventionRoute } from './api/invention/invention.route';
import { App } from './app';
import { ValidateEnv } from './utils';

ValidateEnv();

const authRoute = new AuthRoute();
const inventionRoute = new InventionRoute();

const app = new App([authRoute, inventionRoute]);

app.listen();
