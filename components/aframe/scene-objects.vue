<template>
  <v-fragment>
    <aframeAsset v-for="(item) in listItems" v-bind:key="item.id" src="item.src" />
  </v-fragment>
</template>


<script lang="ts">
import aframeAsset from "./asset";
import Fragment from "vue-fragment";

const listItems: aframeAsset[] = [
        <a-gltf-model class="boundry" src=""></a-gltf-model>

  new aframeAsset("a-gltf-model", "boundry", "#scene", "boundry")];

export default {};
</script>