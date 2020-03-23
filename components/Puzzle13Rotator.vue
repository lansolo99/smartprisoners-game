<template>
  <div ref="rotator" class="rotatorWrapper">
    <div class="gridContainer">
      <!-- Dots rail -->
      <div
        v-for="(dot, dotIndex) in railColors"
        :id="dotIndex"
        :key="dotIndex"
        :class="[
          `color_${railColors[railOrderIds[dotIndex]]}`,
          { masked: !outputIds.includes(dotIndex) }
        ]"
        :style="{
          backgroundColor: colors[railColors[railOrderIds[dotIndex]]].hex
        }"
        class="gridContainer__dot dot"
      ></div>
      <!-- CTA -->
      <div v-touch="offsetRailColors" class="gridContainer__cta cta">
        <svg
          id="Layer_1"
          version="1.1"
          x="0"
          y="0"
          viewBox="0 0 40 40"
          xml:space="preserve"
        >
          <path
            class="color1"
            d="M32.6 30.2v2.4H7.4V21.1H3.3v11.6c0 2.1 1.6 3.9 3.7 4.1h26.1v-.1c2-.3 3.6-2 3.6-4.1v-2.4h-4.1zM33.1 3.3H7c-2 .2-3.6 2-3.6 4.1v2.4h4.1V7.4h25.1v11.3h4.1V7.4c0-2.1-1.6-3.8-3.6-4.1z"
          />
          <path
            class="color1"
            d="M39.6 14.2l-5 13.5-4.9-13.5zM.4 25.8l5-13.5 4.9 13.5z"
          />
        </svg>
      </div>
    </div>
    <!-- RotatorOutputs -->
    <Puzzle13RotatorOutput
      v-if="componentOutputsId.includes(1)"
      :output-id="1"
      :color="colors[railColors[railOrderIds[outputIds[0]]]].hex"
      shape="triangleCollision"
      link="bottomLeft"
    />
    <Puzzle13RotatorOutput
      v-if="componentOutputsId.includes(2)"
      :output-id="2"
      :color="colors[railColors[railOrderIds[outputIds[1]]]].hex"
      shape="circle"
      link="bottomRight"
    />
    <Puzzle13RotatorOutput
      v-if="componentOutputsId.includes(3)"
      :output-id="3"
      :color="colors[railColors[railOrderIds[outputIds[2]]]].hex"
      shape="squareInners"
      link="bottomCenter"
    />
    <Puzzle13RotatorOutput
      v-if="componentOutputsId.includes(4)"
      :output-id="4"
      :color="colors[railColors[railOrderIds[outputIds[0]]]].hex"
      shape="triangleUp"
      link="bottomLeft"
    />
    <Puzzle13RotatorOutput
      v-if="componentOutputsId.includes(6)"
      :output-id="6"
      :color="colors[railColors[railOrderIds[outputIds[1]]]].hex"
      shape="triangleDown"
      link="bottomRight"
    />
    <Puzzle13RotatorOutput
      v-if="componentOutputsId.includes(7)"
      :output-id="7"
      :color="colors[railColors[railOrderIds[outputIds[2]]]].hex"
      shape="path"
      link="bottomCenter"
    />
    <Puzzle13RotatorOutput
      v-if="componentOutputsId.includes(8)"
      :output-id="8"
      :color="colors[railColors[railOrderIds[outputIds[0]]]].hex"
      shape="circleBarred"
      link="bottomLeft"
    />
    <Puzzle13RotatorOutput
      v-if="componentOutputsId.includes(9)"
      :output-id="9"
      :color="colors[railColors[railOrderIds[outputIds[1]]]].hex"
      shape="cross"
      link="bottomRight"
    />
    <BaseSounds ref="BaseSounds" sound-source="btn_p13_rotator" />
  </div>
</template>

<script>
import { TweenMax, TimelineMax } from 'gsap'
import { Expo } from 'gsap/EasePack'
import { EventBus } from '@/bus'
import Puzzle13RotatorOutput from '@/components/Puzzle13RotatorOutput'
export default {
  components: {
    Puzzle13RotatorOutput
  },
  props: {
    id: {
      type: String,
      required: true
    },
    railColorsInit: {
      type: String,
      required: true
    },
    colors: {
      type: Object,
      required: true
    },
    outputIds: {
      type: Array,
      required: true
    },
    componentOutputsId: {
      type: Array,
      required: true
    },
    shapes: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      preventClick: false,
      railOrderIds: [0, 1, 2, 3, 4, 15, 5, 14, 6, 13, 7, 12, 11, 10, 9, 8],
      railOrderIdsGsap: [5, 0, 1, 2, 3, 4, 6, 10, 15, 14, 12, 11, 9],
      railColors: []
    }
  },
  computed: {},
  created() {
    this.parseRailColors()
    // Init update event
    this.updateOutputEvent()
  },
  methods: {
    parseRailColors() {
      this.railColors = this.railColorsInit.split(' ')
    },
    offsetRailColors() {
      // Enable valid btn
      this.$emit('enableValid')

      this.$refs.BaseSounds.playSound()
      // Freeze action
      EventBus.$emit('crtPreventBubbling', true)
      // Animate current rotator
      if (!this.preventClick) {
        this.preventClick = true
        this.animateRotatorElements()
        // Offset railColors values
        const currentLastItem = this.railColors.slice(-1)
        const offsetedRailColor = this.railColors
          .reverse()
          .map((item, index) => {
            if (index === this.railColors.length - 1)
              return currentLastItem.toString()
            if (index !== this.railColors.length - 1)
              return this.railColors[index + 1]
          })
          .reverse()

        // Update rail
        this.railColors = offsetedRailColor

        // Update output event
        this.updateOutputEvent()
      }
    },
    updateOutputEvent() {
      const rotatorName = this.$attrs.name
      let outputColors = this.outputIds.map(id => {
        return this.colors[this.railColors[this.railOrderIds[id]]].hex
      })
      // Special uses-cases
      if (rotatorName === 'Rotator3') {
        // outputColors.splice(1)
      }
      if (rotatorName === 'Rotator4') {
        outputColors = [outputColors[2], outputColors[0], outputColors[1]]
      }
      this.$emit('updateOutputs', { rotatorName, outputColors })
    },
    animateRotatorElements() {
      const rotator = this.$refs
      const rotatorCtaArea = rotator.rotator.querySelector('.cta')
      const rotatorCtaSvg = rotator.rotator.querySelector('svg')
      const rotatorCtaInnerIcons = rotator.rotator.querySelectorAll(
        '.cta svg path'
      )
      const outputBoxes = rotator.rotator.querySelectorAll('.box')
      const rotatorDots = rotator.rotator.querySelectorAll('.dot')
      const reOrderedDots = Array.prototype.map.call(
        this.railOrderIdsGsap,
        railOrderId => {
          return rotatorDots[railOrderId]
        }
      )

      // outputBoxes
      outputBoxes.forEach(box => {
        TweenMax.fromTo(
          box,
          1.5,
          { border: '2px solid #fff' },
          {
            border: '2px solid #687a7a',

            ease: Expo.easeOut
          }
        )
      })

      // Dots
      const unfreezeAction = () => {
        // Freeze action
        EventBus.$emit('crtPreventBubbling', false)
        this.preventClick = false
      }
      const timelineDots = new TimelineMax({
        onComplete: unfreezeAction
      })
      reOrderedDots.forEach(dot => {
        timelineDots.to(dot, 0.03, {
          border: '3px solid #fff !important',
          yoyo: true,
          repeat: 1,
          ease: Expo.easeInOut
        })
      })

      // Cta
      TweenMax.fromTo(
        rotatorCtaArea,
        1,
        { backgroundColor: '#4e5656' },
        {
          backgroundColor: '#000',
          ease: Expo.easeOut
        }
      )

      // Cta SVG
      TweenMax.fromTo(
        rotatorCtaSvg,
        1,
        { transform: 'scale(1.2)' },
        {
          transform: 'scale(1)',
          ease: Expo.easeOut
        }
      )

      // Cta Inner Icon
      rotatorCtaInnerIcons.forEach(path => {
        TweenMax.fromTo(
          path,
          3,
          { fill: '#fff' },
          {
            fill: '#4e5656',

            ease: Expo.easeOut
          }
        )
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.rotatorWrapper {
  position: relative;
}
.gridContainer {
  width: 95px;
  height: 85px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 2px;
  grid-template-areas: '. . . . .' '. c c c .' '. c c c .' '. c c c .' '. . . . .';
  &__cta {
    grid-area: c;
  }
}
.dot {
  transition: background-color 0.15s ease-out;
  border-radius: 5px;
  border: 2px solid #b7dede;
  &.masked {
    border: 1px solid $color-granny-smith;
    background-color: transparent !important;
  }
}
.cta {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: black;
  border-radius: 5px;
  border: 3px solid grey;
  //animation: ctaBorderLoop 1s infinite;
  @keyframes ctaBorderLoop {
    0%,
    80%,
    100% {
      border: 3px solid $color-granny-smith;
    }
    40% {
      border: 3px solid lighten($color-granny-smith, 30%);
    }
  }
  svg {
    width: 27px;
    height: 27px;
  }
  .color1 {
    fill: #4e5656;
  }
}
</style>
