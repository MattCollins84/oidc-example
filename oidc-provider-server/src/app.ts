import * as path from 'path'
import * as url from 'url'
import * as set from 'lodash/set'
import * as express from 'express'
import * as helmet from 'helmet'
import { Provider } from 'oidc-provider'
import { install as sourceMapInstall } from 'source-map-support';
// import { MongoAdapter } from './adapters/mongodb'

sourceMapInstall()

import { Account } from './support/account'
import { configuration } from './support/configuration'
import { routes } from './routes/express'

const { PORT = 3000, ISSUER = `http://localhost:${PORT}` } = process.env;
configuration.findAccount = Account.findAccount;

const app = express();
app.use(helmet());
app.use(express.json())

app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');

let server;
(async () => {
  const adapter = require('./adapters/mongodb'); // eslint-disable-line global-require
  await adapter.connect();

  // const provider = new Provider(ISSUER, { adapter, ...configuration });
  const provider = new Provider(ISSUER, { ...configuration });

  if (process.env.NODE_ENV === 'production') {
    app.enable('trust proxy');
    provider.proxy = true;
    set(configuration, 'cookies.short.secure', true);
    set(configuration, 'cookies.long.secure', true);

    app.use((req, res, next) => {
      if (req.secure) {
        next();
      } else if (req.method === 'GET' || req.method === 'HEAD') {
        res.redirect(url.format({
          protocol: 'https',
          host: req.get('host'),
          pathname: req.originalUrl,
        }));
      } else {
        res.status(400).json({
          error: 'invalid_request',
          error_description: 'do yourself a favor and only use https',
        });
      }
    });
  }

  routes(app, provider);
  app.use(provider.callback);
  server = app.listen(PORT, () => {
    console.log(`application is listening on port ${PORT}, check its /.well-known/openid-configuration`);
  });
})().catch((err) => {
  if (server && server.listening) server.close();
  console.error(err);
  process.exitCode = 1;
});