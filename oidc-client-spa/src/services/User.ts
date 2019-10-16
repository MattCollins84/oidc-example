import { User as OIDCUser } from "oidc-client";
import AuthService from '@/services/AuthService';
const auth = new AuthService();

interface UserProfile {
  sub: string
  name: string
  email: string
  capabilities: string[]
}

export default class User {

  readonly accessToken: string = null
  readonly expiresAt: number = null
  readonly expiresAtDate: Date = null
  readonly idToken: string = null
  readonly refreshToken: string = null
  readonly scope: string = null
  readonly tokenType: string = null
  readonly profile: UserProfile = null

  constructor(oidcProfile: OIDCUser) {
    this.accessToken = oidcProfile.access_token || ''
    this.expiresAt = oidcProfile.expires_at || 0 //
    this.idToken = oidcProfile.id_token || ''
    this.refreshToken = oidcProfile.refresh_token || ''
    this.scope = oidcProfile.scope || ''
    this.tokenType = oidcProfile.token_type || ''
    this.profile = oidcProfile.profile
  }

  get capabilities(): string[] {
    return this.profile && this.profile.capabilities || []
  }

  get name(): string {
    return this.profile && this.profile.name || null
  }

  get email(): string {
    return this.profile && this.profile.email || null
  }

  get expires(): Date {
    return new Date(this.expiresAt * 1000)
  }

  get expired(): boolean {
    if (!!this.profile == false) return true;
    return this.expires.getTime() < Date.now();
  }

  get isLoggedIn(): boolean {
    return !this.expired
  }

  hasCapability(capabilityName: string | string[]): boolean {
    if (!Array.isArray(capabilityName)) {
      capabilityName = [capabilityName]
    }
    return capabilityName.every(capability => this.capabilities.includes(capability))
  }

  static async getCurrentUser(forceRedirect: boolean = true): Promise<User|void> {
    const userProfile = await auth.getUser()
    if (!userProfile && forceRedirect) return await User.login()
    if (!userProfile && !forceRedirect) return null;
    if (userProfile) {
      const user = new User(userProfile)
      // console.log('token', user.accessToken)
      // console.log('now >', new Date())
      // console.log('expiry >', user.expires, user.expired)
      if (user.isLoggedIn === false && forceRedirect) return await User.login()
      // console.log(user)

      return user
    }
  }

  static async login() {
    return await auth.login()
  }

  static async logout() {
    return await auth.logout()
  }

}