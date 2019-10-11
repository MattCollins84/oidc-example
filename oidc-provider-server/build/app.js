"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const url = require("url");
const set = require("lodash/set");
const express = require("express");
const helmet = require("helmet");
const oidc_provider_1 = require("oidc-provider");
const source_map_support_1 = require("source-map-support");
// import { MongoAdapter } from './adapters/mongodb'
source_map_support_1.install();
const account_1 = require("./support/account");
const configuration_1 = require("./support/configuration");
const express_1 = require("./routes/express");
const { PORT = 3000, ISSUER = `http://localhost:${PORT}` } = process.env;
configuration_1.configuration.findAccount = account_1.Account.findAccount;
const app = express();
app.use(helmet());
app.use(express.json());
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');
let server;
(() => __awaiter(void 0, void 0, void 0, function* () {
    const adapter = require('./adapters/mongodb'); // eslint-disable-line global-require
    yield adapter.connect();
    // const provider = new Provider(ISSUER, { adapter, ...configuration });
    const provider = new oidc_provider_1.Provider(ISSUER, Object.assign({}, configuration_1.configuration));
    if (process.env.NODE_ENV === 'production') {
        app.enable('trust proxy');
        provider.proxy = true;
        set(configuration_1.configuration, 'cookies.short.secure', true);
        set(configuration_1.configuration, 'cookies.long.secure', true);
        app.use((req, res, next) => {
            if (req.secure) {
                next();
            }
            else if (req.method === 'GET' || req.method === 'HEAD') {
                res.redirect(url.format({
                    protocol: 'https',
                    host: req.get('host'),
                    pathname: req.originalUrl,
                }));
            }
            else {
                res.status(400).json({
                    error: 'invalid_request',
                    error_description: 'do yourself a favor and only use https',
                });
            }
        });
    }
    express_1.routes(app, provider);
    app.use(provider.callback);
    server = app.listen(PORT, () => {
        console.log(`application is listening on port ${PORT}, check its /.well-known/openid-configuration`);
    });
}))().catch((err) => {
    if (server && server.listening)
        server.close();
    console.error(err);
    process.exitCode = 1;
});
//# sourceMappingURL=app.js.map