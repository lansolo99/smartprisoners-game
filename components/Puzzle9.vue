<template>
  <div class="puzzleContainer__gridContent">
    <div ref="puzzleContent" class="puzzleContent">
      <div
        :style="convertToGridTemplateArea"
        class="puzzleContent__labyrinthGrid puzzleContent__flexibleArea labyrinthGrid"
      >
        <!-- Base tiles -->
        <div
          v-for="(tile, index) in splitGridSchema"
          :key="index"
          :class="[tile]"
          class="labyrinthGrid__tile"
        ></div>

        <!-- Sliders area -->
        <div
          v-for="slider in schema.sliders"
          :ref="slider.id"
          :key="slider.id"
          :class="['tile', slider.id, 'sliderArea']"
          :style="{ gridArea: slider.id }"
        >
          <vue-slider
            v-model="slider.positions.current"
            :class="[slider.color]"
            :data="getSliderDatas(slider.steps)"
            :adsorb="true"
            :clickable="false"
            :direction="slider.direction"
            :height="slider.parentHeigth"
            :width="slider.parentWidth"
            :dot-size="[slider.dotSizeWidth, slider.dotSizeHeight]"
            :contained="true"
            :tooltip="'none'"
            @change="setSlideEvent()"
          ></vue-slider>
        </div>
      </div>

      <!-- Big life icon overlay -->
      <BaseBigLifeIcon ref="bigLifeIcon" />
    </div>
    <PuzzleActions
      :cols-num="1"
      :ctas="['valid']"
      :disable="disableValid"
      @validPuzzle="validPuzzle()"
    />
    <!-- Sounds -->
    <BaseSounds ref="puzzleError" sound-source="valid_error" />
    <BaseSounds ref="puzzleSuccess" sound-source="valid_success" />
    <BaseSounds ref="dragDropped" sound-source="drag_dropped" />
  </div>
</template>
<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import VueSlider from 'vue-slider-component'
import data from '@/store/datas/puzzle9_schemas'
import PuzzleActions from '@/components/PuzzleActions.vue'
import { validPuzzle, shakePuzzle } from '@/mixins/validPuzzle.js'
import { pickStaticSchema } from '@/mixins/pickStaticSchema.js'
import BaseBigLifeIcon from '@/components/BaseBigLifeIcon'
import { killTimeOuts } from '@/utils'

export default {
  name: 'Puzzle9',
  components: {
    BaseBigLifeIcon,
    PuzzleActions,
    VueSlider
  },
  mixins: [validPuzzle, shakePuzzle, pickStaticSchema],
  data() {
    return {
      disableValid: true,
      timeOuts: [],
      schema: {},
      puzzleContentRef: ''
    }
  },
  computed: {
    ...mapState({
      previousSchemaUsed: state => state.session.staticSchemasCycling.puzzle9
    }),
    splitGridSchema() {
      // Re-arrange datas for grid generation
      return this.schema.grid
        .flat()
        .reduce((acc, curr) => {
          return acc + ' ' + curr
        })
        .split(' ')
        .filter(v => {
          return v === 'T1' || v === 'T0'
        })
    },
    convertToGridTemplateArea() {
      // Re-arrange datas for grid-template-areas
      const convertedLines = this.schema.grid.flat().map(line => {
        return line
          .split(' ')
          .map(v => {
            if (v === 'T1' || v === 'T0') {
              return '.'
            } else {
              return v
            }
          })
          .join(' ')
      })

      return `grid-template-areas: '${convertedLines[0]}' '${convertedLines[1]}' '${convertedLines[2]}' '${convertedLines[3]}' '${convertedLines[4]}' '${convertedLines[5]}' '${convertedLines[6]}' '${convertedLines[7]}' '${convertedLines[8]}' '${convertedLines[9]}' '${convertedLines[10]}' '${convertedLines[11]}' '${convertedLines[12]}' '${convertedLines[13]}' '${convertedLines[14]}' '${convertedLines[15]}' ;`
    }
  },
  created() {
    /* ==============================================================
                                Init
    =================================================================== */
    this.pickStaticSchema(9, this.previousSchemaUsed, data)
  },
  mounted() {
    // Display sliders
    this.timeOuts.push(
      setTimeout(() => {
        Object.values(this.schema.sliders).forEach(slider => {
          const sliderParentContainer = this.$refs[`${slider.id}`][0]
          const tileWidth = this.$refs.puzzleContent.querySelector(
            '.labyrinthGrid__tile'
          ).clientWidth

          const tileHeight = this.$refs.puzzleContent.querySelector(
            '.labyrinthGrid__tile'
          ).clientHeight

          // Bind slider parent container dimensions
          Vue.set(slider, 'parentHeigth', sliderParentContainer.clientHeight)
          Vue.set(slider, 'parentWidth', sliderParentContainer.clientWidth)

          // Bind slider dotSize dimensions
          if (slider.direction === 'btt') {
            Vue.set(slider, 'dotSizeWidth', 2 * tileWidth)
            Vue.set(slider, 'dotSizeHeight', 3 * tileHeight)
          } else {
            Vue.set(slider, 'dotSizeWidth', 3 * tileWidth)
            Vue.set(slider, 'dotSizeHeight', 2 * tileHeight)
          }
        })
      }, 1000)
    )
  },
  beforeDestroy() {
    killTimeOuts(this.timeOuts)
  },
  methods: {
    checkPuzzle() {
      // sliders.positions.valid should includes sliders.positions.current
      return Object.values(this.schema.sliders).every(slider => {
        return slider.positions.valid.includes(slider.positions.current)
      })
    },
    resetPuzzleActions() {},
    getSliderDatas(stepsNumber) {
      return [...Array(parseInt(stepsNumber)).keys()]
    },
    setSlideEvent(event) {
      // Enable valid btn
      this.disableValid = false

      // Btn sound
      this.$refs.dragDropped.playSound()
    }
  }
}
/* eslint-enable no-unused-vars */
</script>

<style lang="scss" scoped>
@include puzzleContainerGridContent;

// Puzzle content
.puzzleContent {
  @include puzzleContentBaseProperties;
  &__flexibleArea {
    @include responsive(tablet) {
      transform: scale(2);
    }
  }
}

.labyrinthGrid {
  width: 100%;
  height: 100%;
  width: 420px;
  max-width: 530px;
  max-height: 200px;
  display: grid;
  grid-template-columns: repeat(31, 1fr);
  grid-template-rows: repeat(16, 1fr);
  gap: 1px;

  &__tile {
    width: 100%;
    height: 100%;
  }
  .T0 {
    border-radius: 2px;
  }
  .T1 {
    background-color: white;
    border-radius: 2px;
  }

  .vue-slider {
    &::v-deep {
      .vue-slider-process,
      .vue-slider-rail {
        background: transparent;
      }
      .vue-slider-dot-handle {
        display: none;
      }
      &.slider-color1 {
        .vue-slider-dot {
          // background-color: $color-blue-4;
          background-color: $color-granny-smith;
          &-focus {
            background-color: white;
          }
        }
      }
      &.slider-color2 {
        .vue-slider-dot {
          // background-color: $color-green-2;
          background-color: $color-cyan;
          &-focus {
            background-color: white;
          }
        }
      }
      &.slider-color3 {
        .vue-slider-dot {
          // background-color: $color-yellow-2;
          background-color: $color-blue-3;
          &-focus {
            background-color: white;
          }
        }
      }
      .vue-slider-process {
        pointer-events: none !important;
      }

      .vue-slider-dot {
        z-index: 0;
        border-radius: 4px;
        overflow: hidden;
        // Grip marks as pseudo objects
        &:before,
        &:after {
          content: '';
          display: block;
          position: relative;
          margin: auto;
        }
      }

      // Grip marks directions
      &.vue-slider-btt {
        // Verticals
        .vue-slider-dot {
          &:before,
          &:after {
            transition: all 0.2s ease;
            height: 2px;
            width: 70%;
          }
          &:before {
            border-top: 2px solid $color-anthracite;
            border-bottom: 1px solid $color-anthracite;
            margin-top: 4px;
            //@include gripBlinkingAnimation(posBefore, dirBtt);
          }
          &:after {
            border-top: 1px solid $color-anthracite;
            border-bottom: 2px solid $color-anthracite;
            position: absolute;
            bottom: 4px;
            left: 50%;
            transform: translateX(-50%);
            margin: auto;
            //@include gripBlinkingAnimation(posAfter, dirBtt);
          }
        }
      }

      &.vue-slider-ltr {
        // Horizontals
        .vue-slider-dot {
          &:before,
          &:after {
            height: 70%;
            width: 2px;
            top: 50%;
            transform: translateY(-50%);
          }
          &:before {
            margin-left: 4px;
            border-left: 2px solid $color-anthracite;
            border-right: 1px solid $color-anthracite;
            //@include gripBlinkingAnimation(posBefore, dirLtr);
          }
          &:after {
            position: absolute;
            margin-left: 0px;
            right: 4px;
            border-left: 1px solid $color-anthracite;
            border-right: 2px solid $color-anthracite;
            //@include gripBlinkingAnimation(posAfter, dirLtr);
          }
        }
      }
    }
  }
}
</style>
