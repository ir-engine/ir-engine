<template>
  <div class="ui active inverted dimmer">
    <div class="ui large text loader">Logging in</div>
  </div>
</template>

<script>
export default {
  name: 'authCallback',
  created () {
    this.$auth.login(this.$route.query.state, this.$route.query.code)
    .then(referrer => {
      if (referrer === '') {
        referrer = '/'
      }
      this.$router.push(referrer)
    }, e => {
      this.$router.push('/?error=' + encodeURIComponent(e.response.status))
    })
  }
}
</script>

<style scoped>
.ui.inverted.dimmer .ui.loader {
  color: black;
}
</style>
