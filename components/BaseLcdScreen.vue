<template functional>
  <div class="lcdScreen-wrapper">
    <div class="lcdScreen">
      <img class="transitionEndFixed" src="@/assets/images/tv_screen.jpg" />
      <img
        class="transitionEndFixed transitionEndFixed--1"
        src="@/assets/images/tv_screen3.jpg"
      />
    </div>
    <div class="lcdScreen">
      <img
        class="transitionEndFixed transitionEndFixed--2"
        src="@/assets/images/tv_screen3.jpg"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'LcdScreen'
}
</script>

<style lang="scss" scoped>
.lcdScreen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  .transitionEndFixed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    &--1 {
      z-index: 0;
    }

    &--2 {
      opacity: 0.5;
      mix-blend-mode: lighten;
      z-index: 5000;
      pointer-events: none;
    }
  }
}
</style>
