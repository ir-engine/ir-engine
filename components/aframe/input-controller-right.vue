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
import { mapState } from "vuex"
import AFRAME from 'aframe'
import THREE from 'three'

// TODO: Controller should be stored as a global vuex store object and accessed through accessor
// We should get element once to have reference, and keep the reference, multiple get elements is not efficient

export default {
  data() {
    return {
      teleporting: false,
      teleportThreshold: 0.4,
      intersected: null
    }
  },

  computed: {
    ...mapState("xr/avatar", ["rightHandControllerActive"])
  },

  mounted() {
    document.addEventListener(
      "controllerconnected",
      this.controllerConnectedListener
    )
  },

  beforeDestroy() {
    document.body.removeEventListener(
      "controllerconnected",
      this.controllerConnectedListener
    )
  },

  methods: {
// TOOD: Remove this horrific madness and make objects please

    setupControls() {
      document.addEventListener( "thumbstickmoved", this.thumbstickmovedListener )
      document.addEventListener("raycaster-intersected", this.intersectedListener )
      document.addEventListener( "raycaster-intersected-cleared", this.intersectedClearListener )
      document.addEventListener("triggerup", this.triggerUpListener)
    },

//Same
    tearDownControls() {
      document.removeEventListener( "thumbstickmoved", this.thumbstickmovedListener)
      document.removeEventListener( "raycaster-intersected", this.intersectedListener)
      document.removeEventListener( "raycaster-intersected-cleared", this.intersectedClearListener )
      document.removeEventListener("triggerup", this.triggerUpListener)
    },

//Same, move this into the objecton
    thumbstickmovedListener(evt : any) {
      if (this.teleporting && evt.detail.y >= -this.teleportThreshold) {
          (this.$el as AFRAME.Entity).emit("teleportend")
          this.teleporting = false
        }
       else if (evt.detail.y <= -this.teleportThreshold){
          (this.$el as AFRAME.Entity).emit("teleportstart")
          this.teleporting = true
      }
    },

    intersectedListener(evt : any) {
      this.intersected = evt.target
    },

    intersectedClearListener(evt : any) {
      this.intersected = null
    },

    triggerUpListener(evt : any) {
      if (!this.intersected) return
        const rightHandCursor = document.querySelector("#rightHandCursor") as AFRAME.Entity
        //TODO: This is commented out because raycasting API seems to have changed in newer threejs
        // const intersection = rightHandCursor.components.raycaster.getIntersection( this.intersected )
        // let eventDetail = () => {
        // this.intersected,
        // intersection
        // }
        // (this.intersected as AFRAME.Entity).emit("click", eventDetail)
    },

    controllerConnectedListener(evt: any) {
      this.fixCursorPosition(evt.detail.name)
    },

// To do -- make SetTransform function to simplify switch statement
    fixCursorPosition(controllerName : any) {
      const cursor = document.querySelector("#rightHandCursor") as AFRAME.Entity
      switch (controllerName) {
        case "oculus-touch-controls":
          cursor.object3D.rotation.set( THREE.MathUtils.degToRad(-45), THREE.MathUtils.degToRad(2.5), 0)
          cursor.object3D.position.set(0, -0.01, 0)
          break
        case "windows-motion-controls":
          cursor.object3D.rotation.set( THREE.MathUtils.degToRad(-45), THREE.MathUtils.degToRad(2.5), 0 )
          cursor.object3D.position.set(0, 0, -0.03)
          break
        default:
          cursor.object3D.rotation.set( THREE.MathUtils.degToRad(-45), THREE.MathUtils.degToRad(2.5), 0 )
          cursor.object3D.position.set(0, -0.01, 0)
          break
      }
    }
  }
}
</script>