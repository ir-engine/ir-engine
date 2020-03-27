<template>
  <div id="loading-screen" class="loading-screen">
    <div class="loading-message">{{ LoadingMessage }}</div>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      LoadingMessage: "Loading..."
    }
  }
}
</script>

<style scoped>
.loading-screen {
    display: flex;
    align-items: center;
    flex-direction: column;
    background-color: black;
}

.loading-message {
    font-size: 24px;
    color: #aeaeae;
}
</style>

<!-- <style src="./LoadingScreen.scss"></style> -->
