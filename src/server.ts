import { AuthRoute } from './api/auth/auth.route';
import { InventionRoute } from './api/invention/invention.route';
import { UserRoute } from './api/user/user.route';
import { App } from './app';
import { ValidateEnv } from './utils';

ValidateEnv();

const authRoute = new AuthRoute();
const inventionRoute = new InventionRoute();
const userRoute = new UserRoute();

const app = new App([authRoute, inventionRoute, userRoute]);

app.listen();
