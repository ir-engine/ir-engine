<template>
  <div id="index">
    <auth />
    <aframe-scene />
    <loading-screen v-if="!sceneLoaded" />
  </div>
</template>

<script>
import { mapState } from "vuex";

import auth from "../components/auth/auth.vue";

import aframeScene from "../components/aframe/scene.vue";
import LoadingScreen from "../components/ui/loading-screen.vue";

export default {
  components: {
    aframeScene,
    LoadingScreen
  },

  computed: {
    ...mapState("xr", ["inVR", "sceneLoaded", "isMobile"])
  }
};
</script>

<!-- <style src="./app.scss"></style> -->
