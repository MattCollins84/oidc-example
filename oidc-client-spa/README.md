# oidc-client
A Simple SPA application created with:

* Vue
* [oidc-client](https://github.com/IdentityModel/oidc-client-js)
* [axios](https://github.com/axios/axios)

Install dependecies with `npm install`. You can run locally with `npm run serve`

It is written using TypeScript where possible, however this is handled as part of `npm run serve`

## Comments
This is a basic SPA that has two pages - Home, and Admin.

Both pages show some navigation at the top and a "User Panel" at the bottom, showing the current Users details (if applicable).

### Home
This page displays some content that it receives from the API (`GET /content` on the API). This requires no authentication, permissions, or capabilities.

### Admin
This page requires authentication, and if there is no current User you will be redirected to the Login form on the IDP. After authenticating you will be redirected back to the Admin page of the SPA. All the handling of the redirection etc... is handled by the `oidc-client` library which is wrapped up in the `AuthService` class, which itself is used within the `User` class.

Once authenticated and on the Admin page there are three panels that expose three different actions (this, that, other) the user can perform. The UI is set to indicate (based on the capabilities assigned to the User) which actions this User has access to, although it doesn't prohibit this.

The User can perform these individual actions by clicking the appropriate button. Each button will send a `POST` request to the respective API endpoint, passing the Users `id_token` (JWT) via the `Authorization` header:

* `POST /this`
* `POST /that`
* `POST /other`

In response, the SPA will `alert()` the response to the User indicating success or failure and include any failure information.

The potential responses are:

* Authenticated with required capabilities (success)
* Authenticated without required capabilities (failure)
* Not authenticated (no token - failure)
* Not authenticated (token expired - failure)