<template>
  <div class="container mt-3">
    <div class="row">
      <div class="col-sm text-center">
        <p v-if="isLoggedIn">User: {{ username }}</p>
        <p v-if="isLoggedIn">Email: {{ email }}</p>
        <p v-if="isLoggedIn">Capabilities: {{ capabilities.join(', ') }}</p>
        <button @click="login" v-if="!isLoggedIn">Login</button>
        <button @click="logout" v-if="isLoggedIn">Logout</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import AuthService from '@/services/AuthService';

interface IUser {
  profile: IUserProfile
}

interface IUserProfile {
  name: string;
  email: string;
  capabilities: string[]
}

const auth = new AuthService();

@Component({
  components: {
  },
})
export default class Home extends Vue {  
  public user: IUser = null;
  public accessTokenExpired: boolean | undefined = false;
  public isLoggedIn: boolean = false;

  get username(): string {
    return this.user.profile.name;
  }

  get email(): string {
    return this.user.profile.email;
  }

  get capabilities(): string[] {
    return this.user.profile.capabilities;
  }

  public login() {
    auth.login();
  }

  public logout() {
    auth.logout();
  }

  public mounted() {
    auth.getUser().then((user) => {
      if (user !== null) {
        this.user = user;
        this.accessTokenExpired = user.expired;
      }

      this.isLoggedIn = (user !== null && !user.expired);
    });
  }
}
</script>