<template>
  <v-fragment>
    <aframeAsset v-for="(item) in listItems" v-bind:key="item.id" src="item.src" />
  </v-fragment>
</template>


<script lang="ts">
import aframeAsset from "./asset";
import Fragment from "vue-fragment";

// TODO: Replace with server hooks

const listItems: aframeAsset[] = [
  new aframeAsset("a-gltf-model", "scene", "/gltf/scenes/gallery/gallery.gltf"),
  new aframeAsset("a-gltf-model", "avatar-0", "/gltf/avatars/head/scene.gltf")
];

export default {};
</script>