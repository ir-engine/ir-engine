<template>
  <a-entity id="playerRig" :position="'0 ' + playerHeight + ' 0'">
    <a-entity id="camera-rig" class="camera-rig" position="0 0 0">
      <a-entity id="player-camera" class="player-camera camera" camera></a-entity>
      <rightHandController ref="righthand" />
    </a-entity>

    <a-entity
      v-if="cursorActive"
      cursor="rayOrigin: mouse"
      raycaster="interval: 1000; objects: .clickable, .a-enter-vr;"
    ></a-entity>
  </a-entity>
</template>

<script lang="ts">
import { mapState } from "vuex";

import rightHandController from "./input-controller-right.vue";

export default {
  components: {
    rightHandController
  },

  data() {
    return {
      teleporting: false,
      teleportThreshold: 0.4
    };
  },

  computed: {
    ...mapState("xr", ["inVR", "sceneLoaded", "isMobile"]),
    ...mapState("xr/avatar", [
      "cursorActive",
      "rightHandControllerActive",
      "playerHeight"
    ])
  },

  watch: {
    sceneLoaded: function(newVal, oldVal) {
      if (newVal) {
        this.onSceneLoaded();
      }
    },
    inVR: function(newVal, oldVal) {
      if (newVal) {
        if (AFRAME.utils.device.isMobile()) 
          this.tearDownMobile();
        else 
          this.tearDownDesktop();
        
        this.setupVR();
      }
      else {
        this.tearDownVR();
        if (AFRAME.utils.device.isMobile()) 
          this.setupMobile();
        else
          this.setupDesktop();
      }
    }
  },

  mounted() {
    if (this.$el.hasLoaded) 
      this.onSceneLoaded();
    else 
      this.$el.addEventListener( "loaded", ()=>  this.onSceneLoaded(), { once: true } );
  },

  beforeDestroy() {
    if (this.$el.sceneEl.is("vr-mode"))
      this.tearDownVR();
    else if (AFRAME.utils.device.isMobile())
      this.tearDownMobile();
    else this.tearDownDesktop();
  },

// TODO: These methods are very bad, these should all be class constructed objects

  methods: {
    setupDesktop() {
      const playerRig = this.$el;
      if (playerRig.hasLoaded)
        playerRig.sceneEl.addEventListener("enter-vr", this.tearDownDesktop, {
          once: true
        });
       else 
        playerRig.addEventListener("loaded", function() {
          playerRig.sceneEl.addEventListener("enter-vr", this.tearDownDesktop, {
            once: true
          });
        });
      
          playerRig.setAttribute("wasd-controls", {
            enabled: true,
            acceleration: 100
          });
          playerRig.setAttribute("look-controls", "reverseMouseDrag", true);
    },

    tearDownDesktop() {
      const playerRig = this.$el;
          playerRig.removeAttribute("wasd-controls");
          playerRig.removeAttribute("look-controls");
          playerRig.sceneEl.canvas.classList.remove("a-grab-cursor");
    },

    setupMobile() {
      const playerRig = this.$el;
      const camera = playerRig.querySelector("#player-camera");
          // playerRig.setAttribute("character-controller", {'pivot': "#player-camera"});
          // playerRig.setAttribute("virtual-gamepad-controls", {});
          // camera.setAttribute('pitch-yaw-rotator', {});
          // sceneEl.setAttribute("look-on-mobile", "camera", camera);
          // sceneEl.setAttribute("look-on-mobile", "verticalLookSpeedRatio", 3);
    },

    tearDownMobile() {
      const playerRig = this.$el;
      const camera = playerRig.querySelector("#player-camera");
      const sceneEl = document.getElementsByTagName("a-scene")[0];
          // playerRig.removeAttribute("character-controller");
          // playerRig.removeAttribute("virtual-gamepad-controls");
          // camera.removeAttribute('pitch-yaw-rotator');
          // sceneEl.removeAttribute("look-on-mobile");
    },

    setupVR() {
      this.fixVRCameraPosition();
      this.$store.commit("xr/avatar/SET_RIGHT_HAND_CONTROLLER_ACTIVE", true);
      this.$refs.righthand.setupControls();

      const playerRig = document.getElementById("playerRig");
      playerRig.object3D.matrixAutoUpdate = true;
    },

    tearDownVR() {
      this.$store.commit("xr/avatar/SET_RIGHT_HAND_CONTROLLER_ACTIVE", false);
      this.$refs.righthand.tearDownControls();
      this.unFixVRCameraPosition();
    },

    onSceneLoaded() {
      if (this.$el.sceneEl.is("vr-mode")) 
        this.setupVR();
      else if (AFRAME.utils.device.isMobile()) 
          this.setupMobile();
      else 
          this.setupDesktop();
      
      this.createAvatarTemplate();
      this.addAvatarTemplate();
      this.networkAvatarRig();
    },

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
            `);
      document.querySelector("a-assets").appendChild(frag);
    },

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
        });
    },

    networkAvatarRig() {
      const playerRig = document.getElementById("playerRig");
          playerRig.setAttribute("networked", "")
          playerRig.setAttribute("template", "#avatar-rig-template")
          playerRig.setAttribute("attachTemplateToLocal", "false")
    },

    fragmentFromString(strHTML) {
      return document.createRange().createContextualFragment(strHTML);
    },

    fixVRCameraPosition() {
      const playerRig = this.$el;

      const playerCamera = playerRig.getElementById("player-camera");
      const cameraRig = document.getElementById("camera-rig");

      let position = playerRig.object3D.getWorldPosition();
      playerRig.object3D.worldToLocal(position);
      cameraRig.object3D.position.set( position.x, -this.playerHeight, position.z );
      cameraRig.object3D.updateMatrix();
    },

    unFixVRCameraPosition() {
      let playerRig = this.$el;
      let playerCamera = document.getElementById("player-camera");
      let cameraRig = document.getElementById("camera-rig");
      let position;
      position = playerRig.object3D.getWorldPosition();
      playerRig.object3D.worldToLocal(position);
      cameraRig.object3D.position.set(position.x, 0, position.z);
      cameraRig.object3D.updateMatrix();
      playerCamera.object3D.position.set(0, 0, 0);
      playerCamera.object3D.updateMatrix();
    }
  }
};
</script>