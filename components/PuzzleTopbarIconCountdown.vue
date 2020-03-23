<template>
  <svg
    id="Layer_1"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    viewBox="0 0 100 100"
    style="enable-background:new 0 0 100 100;"
    xml:space="preserve"
  >
    <style type="text/css">
      .st0 {
        fill: #da1f2b;
      }
      .st1 {
        fill: #182021;
      }
      .st2 {
        display: none;
        opacity: 0.6;
        fill: #5ec9d1;
      }
      .st3 {
        display: none;
        fill: #182021;
      }
    </style>
    <circle class="st0" cx="50.3" cy="60" r="35.2" />
    <path
      class="st0"
      d="M61.9,20.1H38.8c-2,0-3.7-1.7-3.7-3.7v-4.8c0-2,1.7-3.7,3.7-3.7h23.1c2,0,3.7,1.7,3.7,3.7v4.8
	C65.5,18.5,63.9,20.1,61.9,20.1z"
    />
    <path
      id="hand_1_"
      ref="hand"
      class="st1"
      d="M53.4,37.1l2,20.7c0.2,2.8-1.9,5.2-4.7,5.4c-2.8,0.2-5.2-1.9-5.4-4.7c0-0.3,0-0.6,0-0.8l2.2-20.6
	c0.1-1.6,1.7-2.8,3.3-2.7C52.2,34.5,53.3,35.7,53.4,37.1z"
    />
    <circle class="st2" cx="50.3" cy="58.2" r="5.1" />
    <rect x="45.1" y="34.4" class="st3" width="5.2" height="23.8" />
  </svg>
</template>

<script>
import { TweenMax, Linear } from 'gsap'
import { EventBus } from '@/bus'
export default {
  name: 'IconCountdown',
  data() {
    return {
      handAnimation: {}
    }
  },
  mounted() {
    this.animateHand()
  },
  beforeDestroy() {
    EventBus.$off('countdownIconRestart')
    EventBus.$off('countdownIconPause')
    EventBus.$off('countdownIconKill')
    this.handAnimation.kill()
  },
  methods: {
    animateHand() {
      const { hand } = this.$refs
      this.handAnimation = TweenMax.to(hand, 2, {
        rotation: -360,
        transformOrigin: '5px 24px',
        ease: Linear.easeNone,
        repeat: -1
      })
      // Init to paused state
      this.handAnimation.pause()

      // handAnimation.play()
      EventBus.$on('countdownIconRestart', () => {
        this.handAnimation.play()
      })
      EventBus.$on('countdownIconPause', () => {
        console.log('countdownIconPause')
        this.handAnimation.pause()
      })
      EventBus.$on('countdownIconKill', () => {
        this.handAnimation.kill()
      })
    }
  }
}
/* eslint-enable vue/no-unused-components, no-undef, no-unused-vars */
</script>

<style lang="scss" scoped>
#hand_1_ {
  transform-origin: 5px 24px;
}
</style>
