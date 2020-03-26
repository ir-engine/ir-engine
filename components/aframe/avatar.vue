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

<script>
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
        if (AFRAME.utils.device.isMobile()) {
          this.tearDownMobile();
        } else {
          this.tearDownDesktop();
        }
        this.setupVR();
      } else {
        this.tearDownVR();
        if (AFRAME.utils.device.isMobile()) {
          this.setupMobile();
        } else {
          this.setupDesktop();
        }
      }
    }
  },

  mounted() {
    var self = this;
    if (this.$el.hasLoaded) {
      self.onSceneLoaded();
    } else {
      this.$el.addEventListener(
        "loaded",
        function() {
          self.onSceneLoaded();
        },
        { once: true }
      );
    }
  },

  beforeDestroy() {
    if (this.$el.sceneEl.is("vr-mode")) {
      this.tearDownVR();
    } else {
      if (AFRAME.utils.device.isMobile()) {
        this.tearDownMobile();
      } else {
        this.tearDownDesktop();
      }
    }
  },

  methods: {
    setupDesktop() {
      if (CONFIG.DEBUG) {
        console.log("setupDesktop");
      }
      var self = this;
      var playerRig = self.$el;
      if (playerRig.hasLoaded) {
        playerRig.sceneEl.addEventListener("enter-vr", self.tearDownDesktop, {
          once: true
        });
      } else {
        playerRig.addEventListener("loaded", function() {
          playerRig.sceneEl.addEventListener("enter-vr", self.tearDownDesktop, {
            once: true
          });
        });
      }
      try {
        if (playerRig) {
          playerRig.setAttribute("wasd-controls", {
            enabled: true,
            acceleration: 100
          });
          playerRig.setAttribute("look-controls", "reverseMouseDrag", true);
        } else {
          console.log("failed to set controls on playerRig");
        }
      } catch (e) {
        console.log("failed to set controls on playerRig");
        console.log(e);
      }
    },

    tearDownDesktop() {
      if (CONFIG.DEBUG) {
        console.log("tearDownDesktop");
      }
      var playerRig = this.$el;
      try {
        if (playerRig) {
          playerRig.removeAttribute("wasd-controls");
          playerRig.removeAttribute("look-controls");
          playerRig.sceneEl.canvas.classList.remove("a-grab-cursor");
        } else {
          console.log("failed to teardown desktop controls on playerRig");
        }
      } catch (e) {
        console.log("failed to teardown desktop controls on playerRig");
        console.log(e);
      }
    },

    setupMobile() {
      if (CONFIG.DEBUG) {
        console.log("setupMobile");
      }
      var playerRig = this.$el;
      var camera = playerRig.querySelector("#player-camera");
      var sceneEl = document.getElementsByTagName("a-scene")[0];
      try {
        if (playerRig) {
          // playerRig.setAttribute("character-controller", {'pivot': "#player-camera"});
          // playerRig.setAttribute("virtual-gamepad-controls", {});
          // camera.setAttribute('pitch-yaw-rotator', {});
          // sceneEl.setAttribute("look-on-mobile", "camera", camera);
          // sceneEl.setAttribute("look-on-mobile", "verticalLookSpeedRatio", 3);
        } else {
          console.log("failed to set controls on playerRig");
        }
      } catch (e) {
        console.log("failed to set controls on playerRig");
        console.log(e);
      }
    },

    tearDownMobile() {
      if (CONFIG.DEBUG) {
        console.log("tearDownMobile");
      }
      var playerRig = this.$el;
      var camera = playerRig.querySelector("#player-camera");
      var sceneEl = document.getElementsByTagName("a-scene")[0];
      try {
        if (playerRig) {
          // playerRig.removeAttribute("character-controller");
          // playerRig.removeAttribute("virtual-gamepad-controls");
          // camera.removeAttribute('pitch-yaw-rotator');
          // sceneEl.removeAttribute("look-on-mobile");
        } else {
          console.log("failed to teardown mobile controls on playerRig");
        }
      } catch (e) {
        console.log("failed to teardown mobile controls on playerRig");
        console.log(e);
      }
    },

    setupVR() {
      if (CONFIG.DEBUG) {
        console.log("setupVR");
      }
      this.fixVRCameraPosition();
      this.$store.commit("xr/avatar/SET_RIGHT_HAND_CONTROLLER_ACTIVE", true);
      this.$refs.righthand.setupControls();

      var playerRig = document.getElementById("playerRig");
      playerRig.object3D.matrixAutoUpdate = true;
    },

    tearDownVR() {
      if (CONFIG.DEBUG) {
        console.log("tearDownVR");
      }
      this.$store.commit("xr/avatar/SET_RIGHT_HAND_CONTROLLER_ACTIVE", false);
      this.$refs.righthand.tearDownControls();
      this.unFixVRCameraPosition();
    },

    onSceneLoaded() {
      if (this.$el.sceneEl.is("vr-mode")) {
        this.setupVR();
      } else {
        if (AFRAME.utils.device.isMobile()) {
          this.setupMobile();
        } else {
          this.setupDesktop();
        }
      }
      this.createAvatarTemplate();
      this.addAvatarTemplate();
      this.networkAvatarRig();
    },

    createAvatarTemplate() {
      if (CONFIG.DEBUG) {
        console.log("createAvatarGLTFTemplate()");
      }
      //                         <rightHandController ref="righthand" />
      var frag = this.fragmentFromString(`
            <template id="avatar-rig-template" v-pre>
                <a-entity>
                    <a-entity class="camera-rig"
                        position="0 0 0">
                        <a-entity
                            class="player-camera camera">
                            <a-gltf-model class="gltfmodel" src="#avatar-0"
                                scale="0.02 0.02 0.02">
                            </a-gltf-model>
                        </a-entity>
                    </a-entity>
                </a-entity>
            </template> 
            `);
      var assets = document.querySelector("a-assets");
      try {
        assets.appendChild(frag);
      } catch (err) {
        console.log("createAvatarGLTFTemplate error");
        console.log(err);
      }
    },

    addAvatarTemplate() {
      if (CONFIG.DEBUG) {
        console.log("addAvatarTemplate");
      }

      try {
        NAF.schemas.add({
          template: "#avatar-rig-template",
          components: [
            {
              component: "position"
            },
            {
              component: "rotation"
            },
            {
              selector: ".camera-rig",
              component: "rotation"
            },
            {
              selector: ".camera-rig",
              component: "position"
            },
            {
              selector: ".player-camera",
              component: "rotation"
            },
            {
              selector: ".player-camera",
              component: "position"
            }
          ]
        });
      } catch (err) {
        console.log("addAvatarRigTemplate error");
        console.log(err);
      }
    },

    networkAvatarRig() {
      if (CONFIG.DEBUG) {
        console.log("networkAvatarRig");
      }
      var playerRig = document.getElementById("playerRig");
      try {
        if (playerRig) {
          playerRig.setAttribute("networked", {
            template: "#avatar-rig-template",
            attachTemplateToLocal: false
          });
        } else {
          console.log("failed to set up NAF on playerRig");
        }
      } catch (e) {
        console.log("failed to set up NAF on playerRig");
        console.log(e);
      } finally {
        // console.log('networkAvatarRig finally');
      }
    },

    fragmentFromString(strHTML) {
      return document.createRange().createContextualFragment(strHTML);
    },

    fixVRCameraPosition() {
      if (CONFIG.DEBUG) {
        console.log("fixVRCameraPosition");
      }

      var playerRig = this.$el;

      var playerCamera = document.getElementById("player-camera");
      var cameraRig = document.getElementById("camera-rig");

      var position;
      position = playerRig.object3D.getWorldPosition();
      playerRig.object3D.worldToLocal(position);
      cameraRig.object3D.position.set(
        position.x,
        -this.playerHeight,
        position.z
      );
      cameraRig.object3D.updateMatrix();
    },

    unFixVRCameraPosition() {
      if (CONFIG.DEBUG) {
        console.log("unFixVRCameraPosition");
      }

      var playerRig = this.$el;

      var playerCamera = document.getElementById("player-camera");
      var cameraRig = document.getElementById("camera-rig");

      var position;
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