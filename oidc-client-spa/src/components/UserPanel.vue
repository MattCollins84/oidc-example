<template>
  <div class="container mt-3">
    <hr>
    <div class="row">
      <div class="offset-md-4 col-md-4 text-center">
        <div class="card" style="width: 18rem;">
          <div class="card-body">
            <h5 v-if="!isLoggedIn" class="card-title">Unknown User</h5>
            <h5 v-if="isLoggedIn" class="card-title">{{ username }}</h5>
            <div v-if="isLoggedIn">
              <p class="card-text">Email: {{ email }}</p>
              <p class="card-text">Capabilities: {{ capabilities.join(', ') }}</p>
              <p class="card-text">Expires: {{ expires.toLocaleString() }}</p>
              <p class="card-text text-danger font-weight-bold" v-if="expired">EXPIRED</p>
              <button @click="logout" class="btn btn-warning">Logout</button>
            </div>
            <p v-else>Go to the <router-link to="/admin">Admin Page</router-link> to log in.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import User from '@/services/User';

@Component
export default class UserPanel extends Vue {

  user: User = null

  get username(): string {
    return this.user.name;
  }

  get email(): string {
    return this.user.email;
  }

  get capabilities(): string[] {
    return this.user.capabilities || [];
  }

  get expires(): Date {
    return this.user.expires
  }

  get expired(): boolean {
    return this.user.expired
  }

  get isLoggedIn(): boolean {
    return this.user && !!this.user.isLoggedIn
  }

  public login() {
    User.login();
  }

  public logout() {
    User.logout();
  }

  public async mounted() {
    const user = await User.getCurrentUser(false)
    this.user = user as User;
  }
}
</script>