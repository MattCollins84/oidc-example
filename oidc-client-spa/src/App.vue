<template >
  <div id="app" class="container" v-cloak>
    <div class="row mt-3 mb-3">
      <div class="col-sm text-center">
        <ul class="nav nav-tabs justify-content-center">
          <li class="nav-item"><router-link to="/" class="nav-link">Home</router-link></li>
          <li class="nav-item"><router-link to="/admin" class="nav-link">Admin</router-link></li>
        </ul>
      </div>
    </div>
    <router-view/>
    <user-panel/>
  </div>
</template>

<script>
import UserPanel from "./components/UserPanel";

export default {
  name: "App",
  components: {
    UserPanel
  },
  methods: {

  }
};
</script>