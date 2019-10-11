import { JWKS } from 'jose'
const KeyStore = JWKS.KeyStore
const keystore = new KeyStore();
keystore.generateSync('RSA', 2048, {
  alg: 'RS256',
  use: 'sig',
});
console.log('this is the full private JWKS:\n', keystore.toJWKS(true));