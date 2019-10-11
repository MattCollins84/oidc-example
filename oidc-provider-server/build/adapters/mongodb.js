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
const mongodb_1 = require("mongodb");
const snakeCase = require('lodash/snakeCase');
let DB;
const grantable = new Set([
    'access_token',
    'authorization_code',
    'refresh_token',
    'device_code',
]);
class CollectionSet extends Set {
    add(name) {
        const nu = this.has(name);
        super.add(name);
        if (!nu) {
            DB.collection(name).createIndexes([
                ...(grantable.has(name)
                    ? [{
                            key: { 'payload.grantId': 1 },
                        }] : []),
                ...(name === 'device_code'
                    ? [{
                            key: { 'payload.userCode': 1 },
                            unique: true,
                        }] : []),
                ...(name === 'session'
                    ? [{
                            key: { 'payload.uid': 1 },
                            unique: true,
                        }] : []),
                {
                    key: { expiresAt: 1 },
                    expireAfterSeconds: 0,
                },
            ]).catch(console.error);
        }
        return this;
    }
}
const collections = new CollectionSet();
class MongoAdapter {
    constructor(name) {
        this.name = snakeCase(name);
        // NOTE: you should never be creating indexes at runtime in production, the following is in
        //   place just for demonstration purposes of the indexes required
        collections.add(this.name);
    }
    // NOTE: the payload for Session model may contain client_id as keys, make sure you do not use
    //   dots (".") in your client_id value charset.
    upsert(_id, payload, expiresIn) {
        return __awaiter(this, void 0, void 0, function* () {
            let expiresAt;
            if (expiresIn) {
                expiresAt = new Date(Date.now() + (expiresIn * 1000));
            }
            yield this.coll().updateOne({ _id }, { $set: Object.assign({ payload }, (expiresAt ? { expiresAt } : undefined)) }, { upsert: true });
        });
    }
    find(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.coll().find({ _id }, { payload: 1 }).limit(1).next();
            if (!result)
                return undefined;
            return result.payload;
        });
    }
    findByUserCode(userCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.coll().find({ 'payload.userCode': userCode }, { payload: 1 }).limit(1).next();
            if (!result)
                return undefined;
            return result.payload;
        });
    }
    findByUid(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.coll().find({ 'payload.uid': uid }, { payload: 1 }).limit(1).next();
            if (!result)
                return undefined;
            return result.payload;
        });
    }
    destroy(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.coll().deleteOne({ _id });
        });
    }
    revokeByGrantId(grantId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.coll().deleteMany({ 'payload.grantId': grantId });
        });
    }
    consume(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.coll().findOneAndUpdate({ _id }, { $set: { 'payload.consumed': Math.floor(Date.now() / 1000) } });
        });
    }
    coll(name) {
        return MongoAdapter.coll(name || this.name);
    }
    static coll(name) {
        return DB.collection(name);
    }
    // This is not part of the required or supported API, all initialization should happen before
    // you pass the adapter to `new Provider`
    static connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield mongodb_1.MongoClient.connect('mongodb://localhost:27017', {
                useNewUrlParser: true,
                dbName: 'Users'
            });
            DB = connection.db(connection.s.options.dbName);
        });
    }
}
exports.MongoAdapter = MongoAdapter;
module.exports = MongoAdapter;
//# sourceMappingURL=mongodb.js.map