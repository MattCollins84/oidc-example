"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const logger = require("morgan");
const cors = require("cors");
const source_map_support_1 = require("source-map-support");
source_map_support_1.install();
const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(cors());
const checkCapabilities = (capabilities) => {
    let capArray = !Array.isArray(capabilities) ? [capabilities] : capabilities;
    return (req, res, next) => {
        if (!req.user)
            return next({
                error: 'no_user_found'
            });
        const hasCapabilities = capArray.every(capability => req.user.capabilities.includes(capability));
        if (hasCapabilities)
            return next();
        return next({
            error: 'invalid_permissions'
        });
    };
};
const handler = (name) => {
    return (req, res) => {
        return res.send({
            name,
            params: req.body
        });
    };
};
const checkJWT = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'http://localhost:3000/jwks'
    })
});
app.post('/this', checkJWT, checkCapabilities('this'), handler('this'));
app.post('/that', checkJWT, checkCapabilities('that'), handler('that'));
app.post('/other', checkJWT, checkCapabilities('other'), handler('other'));
app.get('/content', (req, res) => {
    return res.json({
        content: [
            'This is some data returned from the API',
            'Anyone can see this content, it requires no authentication or capabilities',
            'Try it yourself <code>curl http://localhost:5000/content</code> or <a href="http://localhost:5000/content" target="_blank">click here</a>'
        ]
    });
});
app.use((err, req, res, next) => {
    console.log(err.status);
    return res.status(err.error === 'no_user_found' ? 401 : 403).json(err);
});
app.listen(5000, () => {
    console.log('listening on port 5000');
});
//# sourceMappingURL=app.js.map