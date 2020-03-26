<template>
  <a-entity id="playerRig" :position="'0 ' + playerHeight + ' 0'">
    <a-entity id="camera-rig" class="camera-rig" position="0 0 0">
      <a-entity id="player-camera" class="player-camera camera" camera></a-entity>
      <rightHandController ref="righthand" />
    </a-entity>

    <a-entity
      v-if="cursorActive"
      cursor="rayOrigin: mouse"
      raycaster="interval: 1000; objects: .clickable, .a-enter-vr"
    ></a-entity>
  </a-entity>
</template>

<script lang="ts">
// TODO: Move logic to pull from server, not local

import { mapState } from "vuex"
import rightHandController from "./input-controller-right.vue"
import AFRAME from 'aframe'
import THREE from 'three'
import NAF from 'networked-aframe'

export default {
  components: {
    rightHandController
  },

  data() {
    return {
      teleporting: false,
      teleportThreshold: 0.4
    })
  },

  computed: {
    ...mapState("xr", ["inVR", "sceneLoaded", "isMobile"]),
    ...mapState("xr/avatar", [
      "cursorActive",
      "rightHandControllerActive",
      "playerHeight"
    ])
  },

// TODO: This is super cumbersome, current state should be an enum -- isVR, isMobile, isMobileVR
  watch: {
    sceneLoaded: function(newVal, oldVal) {
      if (newVal) {
        this.onSceneLoaded()
      }
    },
    inVR: function(newVal, oldVal) {
      if (newVal) {
        if (AFRAME.utils.device.isMobile()) 
          this.tearDownMobile()
        else 
          this.tearDownDesktop()
        
        this.setupVR()
      }
      else {
        this.tearDownVR()
        if (AFRAME.utils.device.isMobile()) 
          this.setupMobile()
        else
          this.setupDesktop()
      }
    }
  },

  mounted() {
    if ((this.$el as AFRAME.entity).hasLoaded) 
      this.onSceneLoaded()
    else 
      this.$el.addEventListener( "loaded", ()=>  this.onSceneLoaded(), { once: true } )
  },

// TODO: All teardown can be one function in the object
  beforeDestroy() {
    if ((this.$el as AFRAME.entity).sceneEl.is("vr-mode"))
      this.tearDownVR()
    else if (AFRAME.utils.device.isMobile())
      this.tearDownMobile()
    else this.tearDownDesktop()
  },

// TODO: These methods are very bad, these should all be class constructed objects

  methods: {

  // TODO: All of these setup function can be combined into one with an object and branching behaviour

    // TODO: Construct Player Rig object, add event listeners inside object
    setupDesktop() {
      const playerRig = (this.$el as AFRAME.entity)
      if (playerRig.hasLoaded)
        playerRig.sceneEl.addEventListener("enter-vr", this.tearDownDesktop, {
          once: true
        })
       else 
        playerRig.addEventListener("loaded",() => {
          playerRig.sceneEl.addEventListener("enter-vr", this.tearDownDesktop, {
            once: true
          })
        })
      
          playerRig.setAttribute("wasd-controls", {
            enabled: true,
            acceleration: 100
          })
          playerRig.setAttribute("look-controls", "reverseMouseDrag", true)
    },
    // TODO: Destroy player rig object
    tearDownDesktop() {
      const playerRig = (this.$el as AFRAME.entity)
          playerRig.removeAttribute("wasd-controls")
          playerRig.removeAttribute("look-controls")
          playerRig.sceneEl.canvas.classList.remove("a-grab-cursor")
    },

    // TODO: Construct Player Rig object, add event listeners inside object
    setupMobile() {
      const playerRig = (this.$el as AFRAME.entity)
      const camera = playerRig.querySelector("#player-camera")
          // playerRig.setAttribute("character-controller", {'pivot': "#player-camera"})
          // playerRig.setAttribute("virtual-gamepad-controls", {})
          // camera.setAttribute('pitch-yaw-rotator', {})
          // sceneEl.setAttribute("look-on-mobile", "camera", camera)
          // sceneEl.setAttribute("look-on-mobile", "verticalLookSpeedRatio", 3)
    },

    // TODO: Destroy player rig object
    tearDownMobile() {
      const playerRig = (this.$el as AFRAME.entity)
      const camera = playerRig.querySelector("#player-camera")
      const sceneEl = document.getElementsByTagName("a-scene")[0])
          // playerRig.removeAttribute("character-controller")
          // playerRig.removeAttribute("virtual-gamepad-controls")
          // camera.removeAttribute('pitch-yaw-rotator')
          // sceneEl.removeAttribute("look-on-mobile")
    },

    // TODO: Construct Player Rig object, add event listeners inside object
    setupVR() {
      //this.fixVRCameraPosition()
      // this.$store.commit("xr/avatar/SET_RIGHT_HAND_CONTROLLER_ACTIVE", true)
      (this.$refs.righthand as AFRAME.entity).setupControls()

      const playerRig = (this.$el as AFRAME.entity)
      playerRig.object3D.matrixAutoUpdate = true
    },
    
    // TODO: Destroy player rig object
    tearDownVR() {
      // this.$store.commit("xr/avatar/SET_RIGHT_HAND_CONTROLLER_ACTIVE", false)
      (this.$refs.righthand as AFRAME.entity).tearDownControls()
      this.unFixVRCameraPosition()
    },

// TODO: Add mode enum and switch instead of if stastements
    onSceneLoaded() {
      if ((this.$el as AFRAME.entity).sceneEl.is("vr-mode")) 
        this.setupVR()
      else if (AFRAME.utils.device.isMobile()) 
          this.setupMobile()
      else 
          this.setupDesktop()
      
      // TODO: Create a new local avatar object and assign it to vue store
      this.createAvatarTemplate()
      this.addAvatarTemplate()
      this.networkAvatarRig()
    },

// TODO: Avatar template should be a class and object so it can be constructed and modified by prop
    createAvatarTemplate() {
      const frag = this.fragmentFromString(`
            <template id="avatar-rig-template" v-pre>
                <a-entity>
                    <a-entity class="camera-rig"
                        position="0 0 0">
                        <a-entity id="player-camera camera">
                            <a-gltf-model class="gltfmodel" src="#avatar-0"
                                scale="0.02 0.02 0.02">
                            </a-gltf-model>
                        </a-entity>
                    </a-entity>
                </a-entity>
            </template> 
            `)
      (document.querySelector("a-assets") as AFRAME.entity).appendChild(frag)
    },

// TODO: This whole function could be rolled into object creation
    addAvatarTemplate() {
        NAF.schemas.add({
          template: "#avatar-rig-template",
          components: [
            { component: "position" },
            { component: "rotation" },
            { selector: ".camera-rig", component: "rotation" },
            { selector: ".camera-rig", component: "position" },
            { selector: ".player-camera", component: "rotation" },
            { selector: ".player-camera", component: "position" }
          ]
        })
    },

// TO-DO: Get rid of this, roll it into constructor
    networkAvatarRig() {
      const playerRig = document.getElementById("playerRig") as AFRAME.entity
          playerRig.setAttribute("networked", "")
          playerRig.setAttribute("template", "#avatar-rig-template")
          playerRig.setAttribute("attachTemplateToLocal", "false")
    },

    fragmentFromString(strHTML: string) {
      return document.createRange().createContextualFragment(strHTML)
    },

// TO-DO: Get rid of this, make it an object function and construct what can be constructed
    fixVRCameraPosition() {
      const playerRig = (this.$el as AFRAME.entity)

      const playerCamera = playerRig.getElementById("player-camera")
      const cameraRig = playerRig.getElementById("camera-rig")

      let position = playerRig.object3D.getWorldPosition()
      playerRig.object3D.worldToLocal(position)
      cameraRig.object3D.position.set( position.x, -this.playerHeight, position.z )
      cameraRig.object3D.updateMatrix()
    },

// TO-DO: Get rid of this, roll it into constructor
    unFixVRCameraPosition() {
      const playerRig = (this.$el as AFRAME.entity)
      let playerCamera = playerRig.getElementById("player-camera")
      let cameraRig = playerRig.getElementById("camera-rig")
      let position
      position = playerRig.object3D.getWorldPosition()
      playerRig.object3D.worldToLocal(position)
      cameraRig.object3D.position.set(position.x, 0, position.z)
      cameraRig.object3D.updateMatrix()
      playerCamera.object3D.position.set(0, 0, 0)
      playerCamera.object3D.updateMatrix()
    }
  }
}
</script>