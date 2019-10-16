# oidc-client-api
A simple Express based API created using:

* [Express](https://expressjs.com)
* [express-jwt](https://github.com/auth0/express-jwt)
* [node-jwks-rsa](https://github.com/auth0/node-jwks-rsa)

It is all written in TypeScript so you will need to `npm install -g typescript` and then run `tsc` to build it if you make any changes.

Install dependencies with `npm install`.

To run it, you can do `node build/app.js` and it will be accessible on port `5000`.

## Comments
This is a very basic API with the following endpoints:

* `GET /content` - returns a JSON object with a `content` property containing an array of strings
* `POST /this`
* `POST /that`
* `POST /other`

There is no authentication required at all for `GET /content`.

For each of the `POST` requests there is two layers of authentication/authorisation:

* Firstly we check the JWT that we are expecting in the `Authorization` header.
* Secondly we check that the User has the required capabilities to perform this request.

If the JWT is either not present or has expired, we will return a suitable error response.

If the User does not have the required capabilities, we will return a suitable error response.

Otherwise we will perform the action (at the moment, it simply returns some basic data).

Due to the modular nature of these authentication/authorisation layers, they can be added/removed to the different routes as we see fit (e.g. the `GET /contents` route could require a valid JWT but not any capabilities).
