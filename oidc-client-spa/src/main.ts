import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Home from './views/Home.vue'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
  methods: {

  }
}).$mount('#app')
