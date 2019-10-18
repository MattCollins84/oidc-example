<template>
  <div class="row">
    <div class="col-sm text-center">
      <h1>This is a home page</h1>
      <p v-for="(line, i) in content" :key="i" v-html="line"></p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import User from '@/services/User'
import axios from 'axios'

@Component({
  beforeRouteEnter(to, from, next) {
    next(async (vm) => {
      try {
        const response = await axios.get('http://localhost:5000/content')
        vm.$data.content = response.data.content
      } catch (e) {
        alert(e.response)
      }
    })
  }
})
export default class Home extends Vue {
  
  @Prop(Object) user: User
  @Emit('refreshUserPanel')
  refreshUserPanel() {
    return true
  }

  public content: string[] = []

  mounted() {
    this.refreshUserPanel()
  }

}
</script>