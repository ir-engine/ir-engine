<template>
  <a-scene
    loading-screen="enabled: false"
    :networked-scene="'serverURL: https://nxr.myxr.social; app: xrchat; room: ' +
        roomName + '; connectOnLoad: ' + connectOnLoad + '; audio: false; adapter: webrtc;'"
  >
    <assets />

    <a-gltf-model class="boundry" src="#scene"></a-gltf-model>

    <avatar ref="avatar" :position="'0 ' + playerHeight + ' 0'" />
  </a-scene>
</template>


<script>
import { mapState, mapGetters } from "vuex";
import avatar from "../components/avatar/avatar.vue";
import assets from "./assets.vue";
export default {
  components: {
    avatar,
    assets
  },

  computed: {
    ...mapState("xr", ["inVR", "roomName"]),
    ...mapGetters("xr", {
      roomSrc: "CURRENT_ROOM_SOURCE"
    }),
    ...mapState("xr/avatar", ["avatars", "playerHeight"]),
    ...mapState("xr/naf", ["connectOnLoad"])
  }
};
</script>