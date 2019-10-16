# oidc-example
Example OIDC Service and application/user workflows

The purpose of this work is to demonstrate how we might use OIDC to manage authentication/authorisation for users using OIDC.

In this repo we have an OIDC Provider (IDP) to do the authentication, giving us a JWT that we can use to determine:

* Who the User is
* What Capabilities the User has

The IDP is accessed from the UI (A simple SPA using Vue) and the returned capabilities are used to determine which UI elements should be displayed. Additionally, when the UI makes a request to an API service it authenticates using the JWT which in turn allows the API to determine what actions this User is allowed to perform.

For more information on each individual component please see:

* [OIDC Provider](/oidc-provider-server)
* [SPA](/oidc-client-api)
* [API](/oidc-client-api)
