<template>
  <div class="card" style="width: 18rem;">
    <div class="card-body">
      <h5 class="card-title text-capitalize">{{ action }}</h5>
      <p v-if="user && user.hasCapability(action)" class="card-text">You have access to <strong class='text-success'>{{ action }}</strong></p>
      <p v-if="user && !user.hasCapability(action)" class="card-text">You dont have access to <strong class='text-danger'>{{ action }}</strong></p>
      <button class="btn text-capitalize" :class="getBtnCss()" @click="doSomething(action)">Try {{ action }}</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import User from '@/services/User';
import axios from 'axios'

@Component
export default class AdminAction extends Vue {

  @Prop(Object) user: User
  @Prop(String) action: string

  public getBtnCss() {
    return {
      'btn-success': this.user && this.user.hasCapability(this.action),
      'btn-danger': !this.user || !this.user.hasCapability(this.action)
    }
  }

  public async doSomething(action) {
    const opts = {
      headers: {
        'Authorization': `${this.user.tokenType} ${this.user.idToken}`
      }
    }
    const data = {
      action: action
    }
    
    try {
      const response = await axios.post(`http://localhost:5000/${action}`, data, opts)
      this.alert(response)
    } catch(err) {
      this.alert(err.response)
    }
    
  }

  public alert(response) {
    const str = `Status: ${response.status}
Data:
${JSON.stringify(response.data, null, 2)}`
    alert(str)
  }
}
</script>