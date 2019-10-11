import { UserManager, WebStorageStateStore, User } from "oidc-client";

export default class AuthService {
    private userManager: UserManager;

    constructor() {
        const ISSUER: string = "http://localhost:3000";

        const settings: any = {
            userStore: new WebStorageStateStore({ store: window.localStorage }),
            authority: ISSUER,
            client_id: "spa_client",
            client_secret: 'spa_secret',
            redirect_uri: "http://localhost:8080/callback.html",
            response_type: "code",
            scope: "openid profile",
            post_logout_redirect_uri: "http://localhost:8080/",
            filterProtocolClaims: true,
            metadata: {
                issuer: ISSUER + "/",
                authorization_endpoint: ISSUER + "/auth",
                userinfo_endpoint: ISSUER + "/me",
                end_session_endpoint: ISSUER + "/session/end",
                jwks_uri: ISSUER + "/jwks",
            }
        };

        this.userManager = new UserManager(settings);
    }

    public getUser(): Promise<User | null> {
        return this.userManager.getUser();
    }

    public login(): Promise<void> {
        return this.userManager.signinRedirect();
    }

    public logout(): Promise<void> {
        return this.userManager.signoutRedirect();
    }
}