export default class avatarTemplate {
template=`<template id="avatar-rig-template" v-pre>
  <a-entity>
    <a-entity class="camera-rig" position="0 0 0">
      <a-entity id="player-camera camera">
        <a-gltf-model class="gltfmodel" src="#avatar-0" scale="0.02 0.02 0.02"></a-gltf-model>
      </a-entity>
    </a-entity>
  </a-entity>
</template>`
}
