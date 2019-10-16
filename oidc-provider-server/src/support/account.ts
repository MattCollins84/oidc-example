const store = new Map();
const logins = new Map();
import * as nanoid from 'nanoid'
import { MongoClient } from 'mongodb';
import * as crypto from 'crypto'

export class Account {
  
  readonly accountId: string
  readonly profile: any
  
  constructor(id: string, profile?: any) {
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
  async claims(use, scope) { // eslint-disable-line no-unused-vars
    if (this.profile) {
      return {
        sub: this.accountId, // it is essential to always return a sub claim
        email: this.profile.email,
        name: this.profile.name,
        capabilities: this.profile.capabilities
      };
    }

    return {
      sub: this.accountId, // it is essential to always return a sub claim
      email: null,
      name: null,
      capabilities: []
    };
  }

  static async findFromDB(credentials) {
    
    const client = await MongoClient.connect('mongodb://localhost:27017')
    const db = client.db('Users');
    const collection = db.collection('Users');
    
    const query = {
      username: credentials.login,
      password: crypto.createHash('sha1').update(credentials.password).digest('hex')
    }
    const user = await collection.findOne(query)

    if (!user) return null;

    const account = new Account(user.username, user.profile)
    if (!logins.get(user.username)) {
      logins.set(user.username, account);
    }

    return account
  }

  static async findByLogin(login) {
    if (!logins.get(login)) {
      logins.set(login, new Account(login));
    }

    return logins.get(login);
  }

  static async findAccount(ctx, id, token) { // eslint-disable-line no-unused-vars
    // token is a reference to the token used for which a given account is being loaded,
    //   it is undefined in scenarios where account claims are returned from authorization endpoint
    // ctx is the koa request context
    console.log('findAccount', id)
    if (!store.get(id)) new Account(id); // eslint-disable-line no-new
    return store.get(id);
  }
}