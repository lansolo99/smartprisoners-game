<template>
  <div>
    <ScreenStorytelling context="startup" />
  </div>
</template>

<script>
import ScreenStorytelling from '@/components/ScreenStorytelling'
export default {
  name: 'Startup',
  components: {
    ScreenStorytelling
  }
}
</script>

<style lang="scss" scoped>
.page-enter-active,
.page-leave-active {
  transition-property: opacity;
  transition-timing-function: ease-in-out;
  transition-duration: 500ms;
}
.page-enter,
.page-leave-to {
  opacity: 0;
}
</style>
