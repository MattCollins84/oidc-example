# oidc-provider-server
And OIDC Provider Server created using:

* [node-oidc-provider](https://github.com/panva/node-oidc-provider)
* [Express](https://expressjs.com)
* [MongoDB](https://github.com/mongodb/node-mongodb-native)

It is all written in TypeScript so you will need to `npm install -g typescript` and then run `tsc` to build it if you make any changes.

To run it, you can do `node build/app.js` and it will be accessible on port `3000` and you can see the configuration at `/.well-known/openid-configuration`.

## Comments
This was mostly put together using the examples in the documentation and a bit of Googling. It could probably do with a bit of a refactor.

There is only one client configured, but it can easily be extended to use multiple clients.

I have not customised any of the UI for the IDP, that is on the TODO list.

The Users are read from a local MongoDB instance (DB=Users, Collection=Users). Each document looks like this:

```json
{
  "_id" : ObjectId("5d9f25b42168136cea012870"),
  "username" : "mattcollins",
  "password" : "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8",
  "profile" : {
    "name" : "Matt Collins",
    "email" : "matt.collins@datum360.com",
    "capabilities" : [ 
      "this", 
      "that"
    ]
  }
}
```

The cookies and expiry timese are set pretty short at the moment to facilitate testing, and the keys used are the default keys (publicly available) and will obviously need to be changed if we do anything meaningful with this.

This is a subject that has quite a lot of configuration possibilities, as well as the need for all of the extra features that we have come to expect of a User Management system. I think this is a good working example, but far from the finished product.

## TODO

* Modify the UI to include Datum360 Branding
* Handle errors better
* Try alternative `grant_types`