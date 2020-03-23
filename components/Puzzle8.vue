<template>
  <div class="puzzleContainer__gridContent">
    <div ref="puzzleContent" class="puzzleContent">
      <div
        class="puzzleContent__shapesGrid puzzleContent__flexibleArea shapesGrid"
      >
        <div
          v-for="(slot, index) in gridSlots"
          :key="index"
          :class="{ riddle: slot.isMasked }"
          class="shapeSlot"
        >
          <div class="shapeSlot__uid">
            <Puzzle8SlotNum :index="slot.id + 1" />
          </div>
          <!-- Is a riddle slot -->
          <div
            v-if="slot.isMasked"
            class="shapeSlot__riddle"
            @click="displayShapeSelector(index)"
          >
            <transition name="riddleContent">
              <Puzzle8Shape
                v-if="slot.riddle"
                :shape-attrs="slot.riddle"
                class="cell"
              />
              <div v-else class="shapeSlot__maskId">
                {{ slot.maskId }}
              </div>
            </transition>
          </div>
          <!-- Is not a riddle slot -->
          <Puzzle8Shape
            v-if="!slot.isMasked"
            :shape-attrs="slot"
            class="cell"
          />
        </div>
      </div>

      <!-- Big life icon overlay -->
      <BaseBigLifeIcon ref="bigLifeIcon" />
    </div>
    <PuzzleActions
      :cols-num="2"
      :ctas="['reset', 'valid']"
      :disable="disableValid"
      @resetPuzzleActions="resetPuzzleActions()"
      @validPuzzle="validPuzzle()"
    />
    <!-- Shape selector -->
    <Puzzle8ShapeSelector
      v-if="shapeSelector"
      @closeSelector="closeShapeSelector"
      @setRiddleSlot="setRiddleSlot"
    />
    <!-- Sounds -->
    <BaseSounds ref="puzzleError" sound-source="valid_error" />
    <BaseSounds ref="puzzleSuccess" sound-source="valid_success" />
    <BaseSounds ref="btnBasePuzzle" sound-source="btn_base_puzzle" />
  </div>
</template>
<script>
/* eslint-disable vue/no-unused-components */
import { TimelineMax } from 'gsap'
import { Expo } from 'gsap/EasePack'
import Vue from 'vue'
import { mapState } from 'vuex'
import data from '@/store/datas/puzzle8_schemas'
import PuzzleActions from '@/components/PuzzleActions.vue'
import Puzzle8Shape from '@/components/Puzzle8Shape.vue'
import Puzzle8ShapeSelector from '@/components/Puzzle8ShapeSelector.vue'
import Puzzle8SlotNum from '@/components/Puzzle8SlotNum.vue'
import BaseBigLifeIcon from '@/components/BaseBigLifeIcon'
import { EventBus } from '@/bus'
import { validPuzzle, shakePuzzle } from '@/mixins/validPuzzle.js'
import { pickStaticSchema } from '@/mixins/pickStaticSchema.js'
import { killTimeOuts } from '@/utils'

export default {
  name: 'Puzzle8',
  components: {
    BaseBigLifeIcon,
    Puzzle8Shape,
    Puzzle8ShapeSelector,
    Puzzle8SlotNum,
    PuzzleActions
  },
  mixins: [validPuzzle, shakePuzzle, pickStaticSchema],
  data() {
    return {
      disableValid: true,
      timeOuts: [],
      schema: [],
      gridSlots: [],
      shapeRefs: {
        shape: {
          t: 'triangle',
          c: 'circle',
          l: 'losange'
        },
        direction: {
          t: 'top',
          r: 'right',
          b: 'bottom',
          l: 'left'
        },
        color: {
          o: 'orange',
          b: 'blue',
          y: 'yellow',
          g: 'green',
          w: 'white'
        }
      },
      gridSlotsMasked: [],
      shapeSelector: false,
      riddleSlotIndexSelected: ''
    }
  },
  computed: {
    ...mapState({
      previousSchemaUsed: state => state.session.staticSchemasCycling.puzzle8
    })
  },
  created() {
    this.pickStaticSchema(8, this.previousSchemaUsed, data)

    /* ==============================================================
                           Generate data
    ================================================================ */
    this.generateSlotsData()
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
    EventBus.$off('showHint')
    killTimeOuts(this.timeOuts)
  },
  methods: {
    generateSlotsData() {
      // Shape constructor
      class Shape {
        constructor(id, shapeType, shapeDirection, shapeColor, isMasked) {
          this.id = id
          this.shape = shapeType
          this.direction = shapeDirection
          this.color = shapeColor
          this.isMasked = isMasked
        }
      }
      // Push slot as local state
      this.schema.forEach((slot, index) => {
        const shapeType = this.getSlotShape(slot[0])
        const shapeDirection = this.getSlotDirection(slot)
        const shapeColor = this.getSlotColor(slot)
        const isMasked = this.getSlotDisplay(slot)

        const shape = new Shape(
          index,
          shapeType,
          shapeDirection,
          shapeColor,
          isMasked
        )
        this.gridSlots.push(shape)
      })

      // Push maskId references to masks
      const maskedSlots = this.gridSlots.filter(v => v.isMasked)
      maskedSlots.forEach((v, i) => {
        Vue.set(this.gridSlots[v.id], 'maskId', i + 1)
      })
    },
    getSlotShape(slotAbbr) {
      return this.shapeRefs.shape[slotAbbr]
    },
    getSlotDirection(slot) {
      return slot[0] === 't' ? this.shapeRefs.direction[slot[1]] : 'none'
    },
    getSlotColor(slot) {
      const isInverted = slot => {
        if (slot[0] === 't') {
          return slot.includes('i') ? 'inverted' : ''
        }
      }
      return slot[0] === 't'
        ? `${this.shapeRefs.color[slot[2]]} ${isInverted(slot)}`
        : this.shapeRefs.color[slot[1]]
    },
    getSlotDisplay(slot) {
      return !!slot.includes('m')
    },
    checkPuzzle() {
      const riddleSlots = this.gridSlots.filter(slot => slot.isMasked)
      const isAllRiddleSlotFilled = riddleSlots.every(v => v.riddle)

      if (!isAllRiddleSlotFilled) {
        return false
      } else {
        const isAllShapesOk = riddleSlots.every(slot => {
          return slot.shape === slot.riddle.shape
        })

        const isAllDirectionsOk = riddleSlots.every(slot => {
          return slot.direction === slot.riddle.direction
        })

        const isAllColorOk = riddleSlots.every(slot => {
          return slot.color.trim() === slot.riddle.color.trim()
        })

        if (isAllShapesOk && isAllDirectionsOk && isAllColorOk) {
          return true
        } else {
          return false
        }
      }
    },
    resetPuzzleActions() {
      this.gridSlots
        .filter(slot => slot.riddle)
        .forEach(slot => Vue.delete(this.gridSlots[slot.id], 'riddle'))
    },
    displayShapeSelector(slotIndex) {
      // Btn sound
      this.$refs.btnBasePuzzle.playSound()

      this.riddleSlotIndexSelected = slotIndex
      this.shapeSelector = true
    },
    closeShapeSelector() {
      this.shapeSelector = false
    },
    setRiddleSlot(payload) {
      // Enable valid btn
      this.disableValid = false

      // Btn sound
      this.$refs.btnBasePuzzle.playSound()
      this.shapeSelector = false
      Vue.set(this.gridSlots[this.riddleSlotIndexSelected], 'riddle', payload)
    },
    showFirstRiddle() {
      // Display the solution for first slot
      const firstMaskedSlot = this.gridSlots.find(v => v.isMasked)

      const riddleDatas = {
        color: firstMaskedSlot.color,
        direction: firstMaskedSlot.direction,
        shape: firstMaskedSlot.shape
      }
      Vue.set(firstMaskedSlot, 'riddle', riddleDatas)
      this.timeOuts.push(
        setTimeout(() => {
          this.showHint(firstMaskedSlot)
        }, 1000)
      )
    },
    showHint(firstMaskedSlot) {
      // Complete event
      const showHintComplete = () => {
        this.timeOuts.push(
          setTimeout(() => {
            // Erase firstMasked solution
            Vue.delete(firstMaskedSlot, 'riddle')
            this.timeOuts.push(
              setTimeout(() => {
                // Display modal back
                EventBus.$emit('showHintComplete')
              }, 500)
            )
          }, 800)
        )
      }

      // Blink it
      const slotElement = this.$refs.puzzleContent.querySelector(
        '.shapesGrid .shapeSlot__riddle .cell'
      )

      // GSAP Timeline
      const timelineHint = new TimelineMax({
        repeat: 5,
        repeatDelay: 0.3,
        onComplete: showHintComplete
      })

      timelineHint.to(slotElement, 0.2, {
        transform: 'scale(4.5)',
        ease: Expo.easeInOut,
        yoyo: true,
        repeat: 1
      })
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
      transform: scale(1.5);
    }
  }
}

.shapesGrid {
  width: 100%;
  height: 100%;
  max-width: 470px;
  max-height: 180px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 5px;
  margin: 10px;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.15s ease-in-out;
  &.animated {
    &:not(.selected) {
      .cell__inner {
        animation: blinking infinite 1s;
        @keyframes blinking {
          0% {
            opacity: 1;
          }
          49% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0.8;
          }
        }
      }
    }
  }

  &.color1 {
    background-color: #8db9bc;
  }
  &.color2 {
    background-color: #49b5ea;
  }
  &.color3 {
    background-color: #6bc174;
  }
  &.color4 {
    background-color: #de9c45;
  }

  &__diamond {
    transition: all 0.15s ease-out;
    &-rect {
      fill: $color-anthracite;
    }
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: 120%;
    height: 120%;
  }
  &__inner {
    position: absolute;
    transition: font-size 0.25s cubic-bezier(0.06, 1.45, 0.77, 1.08);
    top: calc(50% - (-2px));
    left: 50%;
    font-size: 20px;
    transform: translateX(-50%) translateY(-50%);
    color: white;
    text-align: center;
  }
  &.selected {
    background-color: $color-theme;
    .cell__diamond {
      transform: translateX(-50%) translateY(-50%) scale(0) rotate(180deg);
    }
    .cell__inner {
      font-size: 26px;
    }
  }
}
.shapeSlot {
  padding: 2px;
  display: flex;
  border: 3px dotted rgba($color-granny-smith, 0.2);
  border-radius: 15px;
  position: relative;
  &:nth-child(odd) {
    background-color: rgba($color-granny-smith, 0.2);
  }

  &__maskId {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
  }
  &__uid {
    position: absolute;
    top: 5px;
    left: 5px;
    width: 9px;
    height: 9px;
    font-size: 11px;
    opacity: 0.75;
    svg {
      width: 100%;
      height: 100%;
    }
  }
  &.riddle {
    border: 3px dashed rgba(white, 1);
    border-radius: 15px;
  }
  &__riddle {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba($color-granny-smith, 0.75);
    font-size: 25px;
    width: 100%;
    height: 100%;
  }
}

// puzzleResetLayer transition
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
  transition: opacity 0.2s transform 0.2s ease;
}
.riddleContent-enter,
.riddleContent-leave-to {
  opacity: 0;
  transform: scale(0);
}
</style>
