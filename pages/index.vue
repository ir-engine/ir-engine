<template>
  <div id="index">
    <auth />
    <aframe-scene></aframe-scene>
    <loading-screen v-if="!sceneLoaded" />
  </div>
</template>

<script>
import { mapState } from "vuex";

import auth from "../components/auth";

import aframeScene from "../components/scene.vue";
import LoadingScreen from "../components/LoadingScreen.vue";

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
