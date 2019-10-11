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
const store = new Map();
const logins = new Map();
const nanoid = require("nanoid");
const mongodb_1 = require("mongodb");
const crypto = require("crypto");
class Account {
    constructor(id, profile) {
        this.accountId = id || nanoid();
        this.profile = profile || null;
        store.set(this.accountId, this);
    }
    /**
     * @param use - can either be "id_token" or "userinfo", depending on
     *   where the specific claims are intended to be put in.
     * @param scope - the intended scope, while oidc-provider will mask
     *   claims depending on the scope automatically you might want to skip
     *   loading some claims from external resources etc. based on this detail
     *   or not return them in id tokens but only userinfo and so on.
     */
    claims(use, scope) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.profile) {
                return {
                    sub: this.accountId,
                    email: this.profile.email,
                    name: this.profile.name,
                    capabilities: this.profile.capabilities
                };
            }
            return {
                sub: this.accountId,
                email: null,
                name: null,
                capabilities: []
            };
        });
    }
    static findFromDB(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield mongodb_1.MongoClient.connect('mongodb://localhost:27017');
            const db = client.db('Users');
            const collection = db.collection('Users');
            const query = {
                username: credentials.login,
                password: crypto.createHash('sha1').update(credentials.password).digest('hex')
            };
            const user = yield collection.findOne(query);
            if (!user)
                return null;
            const account = new Account(user.username, user.profile);
            if (!logins.get(user.username)) {
                logins.set(user.username, account);
            }
            return account;
        });
    }
    static findByLogin(login) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!logins.get(login)) {
                logins.set(login, new Account(login));
            }
            return logins.get(login);
        });
    }
    static findAccount(ctx, id, token) {
        return __awaiter(this, void 0, void 0, function* () {
            // token is a reference to the token used for which a given account is being loaded,
            //   it is undefined in scenarios where account claims are returned from authorization endpoint
            // ctx is the koa request context
            console.log('findAccount', id);
            if (!store.get(id))
                new Account(id); // eslint-disable-line no-new
            return store.get(id);
        });
    }
}
exports.Account = Account;
//# sourceMappingURL=account.js.map