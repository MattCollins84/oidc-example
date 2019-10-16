"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jose_1 = require("jose");
const KeyStore = jose_1.JWKS.KeyStore;
const keystore = new KeyStore();
keystore.generateSync('RSA', 2048, {
    alg: 'RS256',
    use: 'sig',
});
console.log('this is the full private JWKS:\n', keystore.toJWKS(true));
//# sourceMappingURL=generate-keys.js.map