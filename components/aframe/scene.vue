<template>
  <a-scene
    loading-screen="enabled: false"
    :networked-scene="'serverURL: https://nxr.myxr.social; app: xrchat; room: ' +
        roomName + '; connectOnLoad: ' + connectOnLoad + '; audio: false; adapter: webrtc;'"
  >
    <assets />

<sceneObjects />
    <avatar ref="avatar" :position="'0 ' + playerHeight + ' 0'" />
  </a-scene>
</template>


<script>
import { mapState, mapGetters } from "vuex";
import avatar from "./avatar.vue";
import assets from "./assets.vue";
import sceneObjects from "./scene-objects.vue"

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