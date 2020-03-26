<template>
  <a-entity
    id="rightHandController"
    v-if="rightHandControllerActive"
    teleport-controls="cameraRig: #playerRig; startEvents: teleportstart; endEvents: teleportend; collisionEntities: .boundry;"
    windows-motion-controls="hand: right;"
    oculus-go-controls="hand: right;"
    oculus-touch-controls="hand: right;"
    daydream-controls="hand: right;"
    vive-controls="hand: right;"
    gearvr-controls="hand: right;"
  >
    <a-entity id="rightHandCursor" raycaster="objects: .clickable, .a-enter-vr; showLine: true;"></a-entity>
  </a-entity>
</template>

<script lang="ts">
import { mapState } from "vuex";

export default {
  data() {
    return {
      teleporting: false,
      teleportThreshold: 0.4,
      intersected: null
    };
  },

  computed: {
    ...mapState("xr/avatar", ["rightHandControllerActive"])
  },

  mounted() {
    document.addEventListener(
      "controllerconnected",
      this.controllerConnectedListener
    );
  },

  beforeDestroy() {
    document.body.removeEventListener(
      "controllerconnected",
      this.controllerConnectedListener
    );
  },

  methods: {
    setupControls() {
      document.addEventListener( "thumbstickmoved", this.thumbstickmovedListener );
      document.addEventListener("raycaster-intersected", this.intersectedListener );
      document.addEventListener( "raycaster-intersected-cleared", this.intersectedClearListener );
      document.addEventListener("triggerup", this.triggerUpListener);
    },

    tearDownControls() {
      document.removeEventListener( "thumbstickmoved", this.thumbstickmovedListener);
      document.removeEventListener( "raycaster-intersected", this.intersectedListener);
      document.removeEventListener( "raycaster-intersected-cleared", this.intersectedClearListener );
      document.removeEventListener("triggerup", this.triggerUpListener);
    },

    thumbstickmovedListener(evt) {
      if (this.teleporting && evt.detail.y >= -this.teleportThreshold) {
          this.$el.emit("teleportend");
          this.teleporting = false;
        }
       else if (evt.detail.y <= -this.teleportThreshold){
          this.$el.emit("teleportstart")
          this.teleporting = true;
      }
    },

    intersectedListener(evt) {
      this.intersected = evt.target;
    },

    intersectedClearListener(evt) {
      this.intersected = null;
    },

    triggerUpListener(evt) {
      if (!this.intersected) return;
        const rightHandCursor = document.querySelector("#rightHandCursor");
        const intersectedEl = this.intersected;
        const intersection = rightHandCursor.components.raycaster.getIntersection( intersectedEl );
        let eventDetail = {
        intersectedEl: intersectedEl,
        intersection: intersection
        }
        this.intersected.emit("click", eventDetail);
    },

    controllerConnectedListener(evt) {
      this.fixCursorPosition(evt.detail.name);
    },

    fixCursorPosition(controllerName) {
      const cursor = document.querySelector("#rightHandCursor");
      switch (controllerName) {
        case "oculus-touch-controls":
          cursor.object3D.rotation.set( THREE.Math.degToRad(-45), THREE.Math.degToRad(2.5), 0);
          cursor.object3D.position.set(0, -0.01, 0);
          break;
        case "windows-motion-controls":
          cursor.object3D.rotation.set( THREE.Math.degToRad(-45), THREE.Math.degToRad(2.5), 0 );
          cursor.object3D.position.set(0, 0, -0.03);
          break;
        default:
          cursor.object3D.rotation.set( THREE.Math.degToRad(-45), THREE.Math.degToRad(2.5), 0 );
          cursor.object3D.position.set(0, -0.01, 0);
          break;
      }
    }
  }
};
</script>