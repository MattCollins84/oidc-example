import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import User from '@/services/User'

/** middleware */
import middlewarePipeline from '@/views/middleware/pipeline'
import oidcAuth from '@/views/middleware/oidc-auth'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    }
    ,{
      path: '/admin',
      name: 'admin',
      props: true,
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/Admin.vue'),
      meta: {
        requiresAuth: true
      }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  if (!to.meta.requiresAuth) {
    return next()
  }
  const user = await User.getCurrentUser();
  if (!user) return
  return next()
})

export default router