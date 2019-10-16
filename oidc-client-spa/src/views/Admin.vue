<template>
  <div>
    <div class="row">
      <div class="col-sm text-center">
        <h1>This is an admin page</h1>
        <p>You can only view this page if you are successfully authenticated</p>
        <p>Below are three actions that can be performed - if you have the right capabilities.</p>
      </div>
    </div>
    <div class="row">
      <div class="col-md-4 text-center">
        <admin-action :user="user" action="this"/>
      </div>
      <div class="col-md-4 text-center">
        <admin-action :user="user" action="that"/>
      </div>
      <div class="col-md-4 text-center">
        <admin-action :user="user" action="other"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import AdminAction from '@/components/AdminAction.vue';
import User from '@/services/User';

@Component({
  beforeRouteEnter(to, from, next) {
    next(async (vm) => {
      const user = await User.getCurrentUser()
      vm.$data.user = user
    })
  },
  components: {
    AdminAction
  }
})
export default class Admin extends Vue {

  private user: User = null

}
</script>