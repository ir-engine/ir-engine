<template>
    <a-entity id="rightHandController" v-if="rightHandControllerActive"
            teleport-controls="cameraRig: #playerRig; startEvents: teleportstart; endEvents: teleportend; collisionEntities: .boundry;"
            windows-motion-controls="hand: right;"
            oculus-go-controls="hand: right;"
            oculus-touch-controls="hand: right;"
            daydream-controls="hand: right;"
            vive-controls="hand: right;"
            gearvr-controls="hand: right;"
            >
            <a-entity id="rightHandCursor"
                raycaster="objects: .clickable, .a-enter-vr; showLine: true;"></a-entity>
        </a-entity>
</template>

<script>
import { mapState } from 'vuex';

export default {

    data () {
        return {
            teleporting: false,
            teleportThreshold: 0.4,
            intersected: null
        }
    },

    computed: {
        ...mapState('xr/avatar',
            [
                'rightHandControllerActive'
            ]
        )
    },

    mounted () {
        document.addEventListener('controllerconnected', this.controllerConnectedListener) 
    },

    beforeDestroy() {
        document.body.removeEventListener('controllerconnected', this.controllerConnectedListener)
    },

    methods: {
        setupControls() {
            if (CONFIG.DEBUG) {console.log('setupControls');}
            var self = this;
            document.addEventListener('thumbstickmoved', self.thumbstickmovedListener);
            document.addEventListener('raycaster-intersected', self.intersectedListener);
            document.addEventListener('raycaster-intersected-cleared', self.intersectedClearListener);
            document.addEventListener('triggerup', self.triggerUpListener);

        },

        tearDownControls() {
            if (CONFIG.DEBUG) {console.log('tearDownControls');}
            var self = this;
            document.removeEventListener('thumbstickmoved', self.thumbstickmovedListener);
            document.removeEventListener('raycaster-intersected', self.intersectedListener);
            document.removeEventListener('raycaster-intersected-cleared', self.intersectedClearListener);
            document.removeEventListener('triggerup', self.triggerUpListener);
        },

        thumbstickmovedListener(evt) {
            var self = this;
            if (self.teleporting) {
                if (evt.detail.y >= -self.teleportThreshold) {
                    self.$el.emit('teleportend');
                    self.teleporting = false;
                }
            }
            else {
                if (evt.detail.y <= -self.teleportThreshold) {
                    self.$el.emit('teleportstart');
                    self.teleporting = true;
                }
            }
        },

        intersectedListener(evt) {
            this.intersected = evt.target;
        },

        intersectedClearListener(evt) {
            this.intersected = null;
        },

        triggerUpListener(evt) {
            var self = this;
            if (self.intersected) {
                var rightHandCursor = document.querySelector('#rightHandCursor');
                var intersectedEl = self.intersected;
                var intersection = rightHandCursor.components.raycaster.getIntersection(intersectedEl);
                var eventDetail = {};
                eventDetail.intersectedEl = intersectedEl;
                eventDetail.intersection = intersection;
                self.intersected.emit('click', eventDetail);
            }
        },

        controllerConnectedListener(evt) {
            this.fixCursorPosition(evt.detail.name);
        },

        fixCursorPosition(controllerName) {
            var cursor = document.querySelector('#rightHandCursor');
            switch (controllerName) {
                case 'oculus-touch-controls':
                    cursor.object3D.rotation.set(THREE.Math.degToRad(-45), THREE.Math.degToRad(2.5), 0);
                    cursor.object3D.position.set(0, -0.01, 0);
                    break;
                case 'windows-motion-controls':
                    cursor.object3D.rotation.set(THREE.Math.degToRad(-45), THREE.Math.degToRad(2.5), 0);
                    cursor.object3D.position.set(0, 0, -0.03);
                    break;
                default:
                    cursor.object3D.rotation.set(THREE.Math.degToRad(-45), THREE.Math.degToRad(2.5), 0);
                    cursor.object3D.position.set(0, -0.01, 0);
                    break;
            }
        }
    }
}
</script>