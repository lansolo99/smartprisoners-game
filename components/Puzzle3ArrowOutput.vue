<template>
  <div>
    <!-- arrow off -->
    <svg
      v-show="!activeStatus"
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
      <g class="arrowGroup">
        <polygon
          class="arrow"
          points="18.9,66 49.2,44.6 80.1,66 80.1,88.5 49.2,67.1 18.9,88.5 	"
        />
        <polygon
          class="arrow"
          points="18.9,32.9 49.2,11.5 80.1,32.9 80.1,55.4 49.2,34 18.9,55.4 	"
        />
      </g>
    </svg>
    <!-- arrow on -->
    <svg
      v-show="activeStatus"
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
      <g class="arrowGroup">
        <polygon
          ref="arrow1"
          class="arrow activeStatus"
          points="18.9,66 49.2,44.6 80.1,66 80.1,88.5 49.2,67.1 18.9,88.5 	"
        />
        <polygon
          ref="arrow2"
          class="arrow activeStatus"
          points="18.9,32.9 49.2,11.5 80.1,32.9 80.1,55.4 49.2,34 18.9,55.4 	"
        />
      </g>
    </svg>
  </div>
</template>

<script>
import { TimelineMax } from 'gsap'
import { Expo } from 'gsap/EasePack'
import { EventBus } from '@/bus'
export default {
  name: 'Puzzle3ArrowOutput',
  props: {
    nodeId: {
      type: String,
      default: '0'
    }
  },
  data() {
    return {
      activeStatus: false
    }
  },
  mounted() {
    if (this.nodeId === '21') {
      this.animateArrow('init')
    }
    /* ==============================================================
                                  Event listener                
    ================================================================ */
    EventBus.$on('endPointAtOutput', nodeId => {
      if (nodeId === this.nodeId) {
        this.animateArrow('init')
      }
    })

    EventBus.$on('stopOutputAnimation', () => {
      if (this.activeStatus === true && this.nodeId !== '21') {
        this.animateArrow('stopAnimation')
      }
    })
  },
  beforeDestroy() {
    EventBus.$off('endPointAtOutput')
    EventBus.$off('stopOutputAnimation')
  },
  methods: {
    animateArrow(context) {
      // toggle svg on/off
      if (context === 'init') {
        this.activeStatus = true
      } else if (context === 'stopAnimation') {
        this.activeStatus = false
      }

      // Set arrow elements to animate
      const { arrow1, arrow2 } = this.$refs

      // GSAP timelines
      const timelineArrow1 = new TimelineMax({
        repeat: -1
      })
      const timelineArrow2 = new TimelineMax({
        repeat: -1
      })
      timelineArrow1.to(arrow1, 0.3, {
        fill: '#00d4ff',
        ease: Expo.easeOut
      })
      timelineArrow1.to(arrow1, 0.3, {
        fill: '#ffffff',
        ease: Expo.easeOut
      })
      timelineArrow2.to(arrow2, 0.3, {
        fill: '#ffffff',
        ease: Expo.easeOut
      })
      timelineArrow2.to(arrow2, 0.3, {
        fill: '#00d4ff',
        ease: Expo.easeOut
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.arrowGroup {
  .arrow {
    fill: $color-granny-smith;
    &.activeStatus {
      fill: white;
    }
  }
}
</style>
