<template>
  <div class="puzzleContainer__gridContent">
    <div ref="puzzleContent" class="puzzleContent">
      <div
        class="puzzleContent__rotatorsGrid puzzleContent__flexibleArea rotatorsGrid"
      >
        <!-- Bottom links -->
        <img
          class="link bottom main"
          src="@/assets/images/puzzle13_links_bottom.svg"
        />
        <img
          class="link bottom central"
          src="@/assets/images/puzzle13_links_bottom_central.svg"
        />

        <!-- Row -->
        <div class="rotatorsGrid__row">
          <div class="rotatorsGrid__rotator">
            <Puzzle13Rotator
              id="rotator1"
              :rail-colors-init="schema.rotators.rotator1"
              :shapes="shapeRefs.shapes"
              :colors="shapeRefs.colors"
              :output-ids="rotators.rotator1.dotRailOutputIds"
              :component-outputs-id="rotators.rotator1.componentOutputIds"
              name="Rotator1"
              class="rotator1"
              @updateOutputs="updateRotatorOutput"
              @enableValid="disableValid = false"
            />
          </div>
          <!-- Riddle -->
          <div class="rotatorsGrid__riddle">
            <div class="riddle" @click="displayShapeSelector()">
              <!-- Default -->
              <transition name="riddleContent">
                <div v-if="!riddle.solution" class="text">??</div>
              </transition>
              <!-- Colored box solution -->
              <transition name="riddleContent">
                <div
                  v-if="riddle.solution"
                  :class="[
                    { showBackground: riddle.showBackgroundColor },
                    riddle.solution.colorSolution
                  ]"
                  class="coloredBoxSolution"
                >
                  <Puzzle13Shape :shape-attrs="riddle.solution" class="shape" />
                </div>
              </transition>
            </div>
          </div>
          <div class="rotatorsGrid__rotator">
            <Puzzle13Rotator
              id="rotator4"
              :rail-colors-init="schema.rotators.rotator4"
              :shapes="shapeRefs.shapes"
              :colors="shapeRefs.colors"
              :output-ids="rotators.rotator4.dotRailOutputIds"
              :component-outputs-id="rotators.rotator4.componentOutputIds"
              name="Rotator4"
              class="rotator4"
              @updateOutputs="updateRotatorOutput"
              @enableValid="disableValid = false"
            />
          </div>
        </div>
        <!-- Row -->
        <div class="rotatorsGrid__row rotatorsGrid__row--bottom ">
          <div class="rotatorsGrid__rotator rotatorsGrid__rotator2">
            <Puzzle13Rotator
              id="rotator2"
              :rail-colors-init="schema.rotators.rotator2"
              :shapes="shapeRefs.shapes"
              :colors="shapeRefs.colors"
              :output-ids="rotators.rotator2.dotRailOutputIds"
              :component-outputs-id="rotators.rotator2.componentOutputIds"
              name="Rotator2"
              class="rotator2"
              @updateOutputs="updateRotatorOutput"
              @enableValid="disableValid = false"
            />
          </div>
          <div class="rotatorsGrid__commonRotatorOutput">
            <Puzzle13RotatorOutput
              :output-id="5"
              :color="setCommonRotatorOutputColor"
              shape="arc"
            />
          </div>
          <div
            id="rotator3"
            class="rotatorsGrid__rotator rotatorsGrid__rotator3"
          >
            <Puzzle13Rotator
              id="rotator3"
              :rail-colors-init="schema.rotators.rotator3"
              :shapes="shapeRefs.shapes"
              :colors="shapeRefs.colors"
              :output-ids="rotators.rotator3.dotRailOutputIds"
              :component-outputs-id="rotators.rotator3.componentOutputIds"
              name="Rotator3"
              class="rotator3"
              @updateOutputs="updateRotatorOutput"
              @enableValid="disableValid = false"
            />
          </div>
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
    <!-- Shape selector -->
    <transition name="shapeSelector">
      <Puzzle13ShapeSelector
        v-if="shapeSelector"
        :puzzle-id="13"
        :shapes-attrs="shapeRefs"
        :solution="schema.solution"
        @closeSelector="closeShapeSelector"
        @setRiddleBox="setRiddleBox"
      />
    </transition>
    <!-- Sounds -->
    <BaseSounds ref="puzzleError" sound-source="valid_error" />
    <BaseSounds ref="puzzleSuccess" sound-source="valid_success" />
    <BaseSounds ref="btnBasePuzzle" sound-source="btn_base_puzzle" />
  </div>
</template>
<script>
import { mapState } from 'vuex'
import data from '@/store/datas/puzzle13_schemas'
import PuzzleActions from '@/components/PuzzleActions'
import Puzzle13RotatorOutput from '@/components/Puzzle13RotatorOutput'
import Puzzle13Rotator from '@/components/Puzzle13Rotator'
import Puzzle13ShapeSelector from '@/components/Puzzle13ShapeSelector'
import Puzzle13Shape from '@/components/Puzzle13Shape'
import BaseBigLifeIcon from '@/components/BaseBigLifeIcon'
import { EventBus } from '@/bus'
import { validPuzzle, shakePuzzle } from '@/mixins/validPuzzle.js'
import { pickStaticSchema } from '@/mixins/pickStaticSchema.js'
import { killTimeOuts } from '@/utils'

export default {
  name: 'Puzzle13',
  components: {
    Puzzle13Rotator,
    Puzzle13RotatorOutput,
    Puzzle13ShapeSelector,
    Puzzle13Shape,
    BaseBigLifeIcon,
    PuzzleActions
  },
  mixins: [validPuzzle, shakePuzzle, pickStaticSchema],
  data() {
    return {
      disableValid: true,
      preventClick: false,
      timeOuts: [],
      schema: {},
      shapeRefs: {
        shapes: {
          shape1: 'triangleCollision',
          shape2: 'circle',
          shape3: 'squareInners',
          shape4: 'triangleUp',
          shape5: 'arc',
          shape6: 'triangleDown',
          shape7: 'path',
          shape8: 'circleBarred',
          shape9: 'cross'
        },
        colors: {
          y: {
            name: 'yellow',
            hex: '#fffc89'
          },
          b: {
            name: 'blue',
            hex: '#76CCCC'
          },
          g: {
            name: 'green',
            hex: '#61CE8D'
          },
          w: {
            name: 'white',
            hex: '#ffffff'
          },
          o: {
            name: 'orange',
            hex: '#EE7141'
          }
        }
      },
      rotators: {
        rotator1: {
          dotRailOutputIds: [7, 8, 13],
          componentOutputIds: [1, 2, 3],
          currentOutputsColors: []
        },
        rotator2: {
          dotRailOutputIds: [7, 8],
          componentOutputIds: [4, 5],
          currentOutputsColors: []
        },
        rotator3: {
          dotRailOutputIds: [7, 8],
          componentOutputIds: [6],
          currentOutputsColors: []
        },
        rotator4: {
          dotRailOutputIds: [7, 8, 13],
          componentOutputIds: [7, 8, 9],
          currentOutputsColors: []
        }
      },
      shapeSelector: false,
      riddle: {
        solution: null,
        showBackgroundColor: false
      }
    }
  },
  computed: {
    ...mapState({
      previousSchemaUsed: state => state.session.staticSchemasCycling.puzzle13
    }),
    setCommonRotatorOutputColor() {
      // get colors of right output ids rotator 2 & 3
      const defaultColor = '#4f6060'
      const rotatorOutput2 = this.rotators.rotator2.currentOutputsColors[1]
      const rotatorOutput3 = this.rotators.rotator3.currentOutputsColors[0]
      if (rotatorOutput2 === undefined) {
        return defaultColor
      } else {
        if (rotatorOutput2 === rotatorOutput3) return rotatorOutput2
        if (rotatorOutput2 !== rotatorOutput3) return '#4f6060'
      }

      return ''
    }
  },
  created() {
    this.pickStaticSchema(13, this.previousSchemaUsed, data)
  },
  mounted() {
    /* ==============================================================
                            Show hint
    ================================================================ */

    // Helper dev -> immediatly trigger showHint (with delay to avoid asynchronous errors)
    // setTimeout(() => {
    //   this.showFirstRiddle()
    // }, 1000)

    EventBus.$on('showHint', () => {
      this.timeOuts.push(
        setTimeout(() => {
          this.showFirstRiddle()
        }, 500)
      )
    })
  },
  beforeDestroy() {
    killTimeOuts(this.timeOuts)
    EventBus.$off('showHint')
  },
  methods: {
    checkPuzzle() {
      // Get currentOutputColors
      const currentOutputColors = Object.values(this.rotators)
        .map((rotator, index) => rotator.currentOutputsColors)
        .flat()
        .map(hex => {
          const matchingColor = Object.entries(this.shapeRefs.colors).find(
            color => {
              return color[1].hex === hex
            }
          )
          return matchingColor[0]
        })

      // Get solutions
      const solutions = this.schema.solution.split(' ')
      // Compare
      const checkMatch = currentOutputColors.every((color, index) => {
        return color === solutions[index]
      })
      console.log({ currentOutputColors })
      console.log({ solutions })
      console.log({ checkMatch })
      return checkMatch
    },
    resetPuzzleActions() {
      // resetPuzzleActions
    },
    displayShapeSelector() {
      if (!this.preventClick) {
        // Btn sound
        this.$refs.btnBasePuzzle.playSound()

        this.preventClick = true
        this.shapeSelector = true
      }
    },
    closeShapeSelector(source) {
      this.shapeSelector = false
      if (source === 'dimmer') {
        this.preventClick = false
      }
    },
    setRiddleBox(payload) {
      // Btn sound
      this.$refs.btnBasePuzzle.playSound()

      // Freeze action
      EventBus.$emit('crtPreventBubbling', true)
      console.log({ payload })
      this.riddle.solution = payload
      // Show riddle
      this.timeOuts.push(
        setTimeout(() => {
          this.riddle.showBackgroundColor = true
        }, 300)
      )
      this.timeOuts.push(
        setTimeout(() => {
          this.riddle.solution = null
          this.riddle.showBackgroundColor = false
          EventBus.$emit('crtPreventBubbling', false)
          this.preventClick = false
        }, 1300)
      )
    },
    showHint() {
      // Showhint
    },
    updateRotatorOutput({ rotatorName, outputColors }) {
      this.rotators[
        `rotator${rotatorName.slice(-1)}`
      ].currentOutputsColors = outputColors
    }
  }
}
/* eslint-enable no-unused-vars, vue/no-unused-components */
</script>

<style lang="scss" scoped>
@include puzzleContainerGridContent;

// Puzzle content
.puzzleContent {
  @include puzzleContentBaseProperties;
  &__flexibleArea {
    @include responsive(tablet) {
      transform: scale(1.5);
    }
  }
}

.rotatorsGrid {
  //background-color: purple;
  position: relative;
  width: 500px;
  height: 190px;
  text-align: center;
  &__row {
    display: flex;
    height: 50%;
    &--bottom {
      margin-top: 10px;
    }
  }
  &__rotator {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1 0 100px;
    height: 90px;

    &2,
    &4 {
      justify-content: flex-end;
    }
    &1,
    &3 {
      justify-content: flex-start;
    }
  }
  &__riddle {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 70px;
  }
  &__commonRotatorOutput {
    // background-color: pink;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 40px;
  }
}
.rotator {
  &1 {
    right: 20px;
  }
  &2 {
    right: 10px;
  }
  &3 {
    left: 10px;
  }
  &4 {
    left: 20px;
  }
}
.riddle {
  display: flex;
  position: relative;
  align-items: center;
  padding: 4px;
  justify-content: center;
  font-size: 27px;
  background-color: black;
  border-radius: 5px;
  color: $color-granny-smith;
  width: 70px;
  height: 65px;
  animation: riddleLoop 1s infinite;
  @keyframes riddleLoop {
    0%,
    80%,
    100% {
      border: 3px solid $color-granny-smith;
      color: $color-granny-smith;
    }
    40% {
      border: 3px solid lighten($color-granny-smith, 20%);
      color: white;
    }
  }
  .text {
    position: absolute;
    top: calc(50% + 2px);
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    // top: 1px;
  }
  .coloredBoxSolution {
    display: flex;
    height: 100%;
    /deep/ {
      path {
        fill: #4e5656;
      }
      svg {
        width: 65%;
      }
    }
    &.showBackground {
      /deep/ {
        path {
          fill: #182021;
        }
      }
      &.yellow {
        background-color: #fffc89;
      }
      &.blue {
        background-color: #76cccc;
      }
      &.green {
        background-color: #61ce8d;
      }
      &.white {
        background-color: white;
      }
      &.orange {
        background-color: #ee7141;
      }
    }
  }
  svg {
    width: 27px;
    height: 27px;
  }
  .col1 {
    fill: #3b3d3d;
  }
  .col2 {
    fill: #777;
  }
}
.link.bottom {
  position: absolute;
  pointer-events: none;
  width: 100%;
  left: 0;
  &.main {
    height: 208px;
    top: -7px;
  }
  &.central {
    height: 178px;
    top: 30px;
  }
}

// Transitions
.shapeSelector-enter-active,
.shapeSelector-leave-active {
  transition: all 0.1s cubic-bezier(0.02, 0.85, 0.8, 0.99);
}
.shapeSelector-enter,
.shapeSelector-leave-to {
  opacity: 0;
  transform: scale(0);
}

.riddleContent-enter-active,
.riddleContent-leave-active {
  transition: all 0.2s cubic-bezier(0.02, 0.85, 0.8, 0.99);
}
.riddleContent-enter,
.riddleContent-leave-to {
  opacity: 0;
  transform: scale(0);
}
</style>
