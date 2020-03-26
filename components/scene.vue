<template>
    <a-scene loading-screen="enabled: false"
        :networked-scene="'serverURL: https://nxr.myxr.social; app: xrchat; room: ' +
        roomName + '; connectOnLoad: ' + connectOnLoad + '; audio: false; adapter: webrtc;'">
        
        <a-assets>
            <a-gltf-model
                id="scene"
                src="/gltf/scenes/gallery/gallery.gltf">
            </a-gltf-model>
            <a-gltf-model
                id="avatar-0"
                src="/gltf/avatars/head_female_-_low_poly/scene.gltf">
            </a-gltf-model>
        </a-assets>

        <a-gltf-model
                class="boundry"
                src="#scene">
        </a-gltf-model>

        <avatar ref="avatar"
            :position="'0 ' + playerHeight + ' 0'"/>

    </a-scene>
</template>


<script>
import { mapState, mapGetters } from 'vuex';
import avatar from '../components/avatar/avatar.vue';

export default {
    components: {
        avatar
    },

    computed: {
        ...mapState('xr',
            [
                'inVR',
                'roomName',
            ]
        ),
        ...mapGetters('xr', 
            {
                roomSrc: 'CURRENT_ROOM_SOURCE'
            }
        ),
        ...mapState('xr/avatar',
            [
                'avatars',
                'playerHeight',
            ]
        ),
        ...mapState('xr/naf',
            [
                'connectOnLoad'
            ]
        ),
    },
}
</script>