<template>
  <img
    ref="bigLifeIcon"
    class="bigLifeIcon"
    src="@/assets/images/icons/icon_life.svg"
  />
</template>

<script>
import { TweenMax } from 'gsap'
import { Expo } from 'gsap/EasePack'
export default {
  methods: {
    animateBigLifeIcon() {
      const { bigLifeIcon } = this.$refs

      TweenMax.fromTo(
        bigLifeIcon,
        3,
        {
          transform: 'translateX(-50%) translateY(calc(-50% + 5vw))',
          opacity: '1'
        },
        {
          transform: 'translateX(-50%) translateY(calc(-50% - 5vw))',
          opacity: '0',
          ease: Expo.easeOut
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.bigLifeIcon {
  position: absolute;
  pointer-events: none;
  opacity: 0;
  top: 50%;
  left: 50%;
  width: 80px;
  height: 80px;
  transform: translateX(-50%) translateY(-50%);

  @include responsive(tablet) {
    width: 160px;
    height: 160px;
    transform: translateX(-50%) translateY(-50%);
  }
}
</style>
