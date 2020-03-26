<template>
  <div id="loading-screen" class="loading-screen">
    <div class="loading-message">{{ LoadingMessage }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      LoadingMessage: "Loading..."
    };
  }
};
</script>

<!-- <style src="./LoadingScreen.scss"></style> -->
