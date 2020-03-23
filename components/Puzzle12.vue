<template>
  <div class="puzzleContainer__gridContent">
    <div ref="puzzleContent" class="puzzleContent">
      <div
        class="puzzleContent__shapesGrid puzzleContent__flexibleArea shapesGrid"
      >
        <!-- Slots -->
        <div
          v-for="(slot, slotIndex) in 16"
          :id="getSlotObject(slotIndex).gridId"
          :key="slotIndex"
          :class="[
            `id${getSlotObject(slotIndex).id}`,
            `gridId${getSlotObject(slotIndex).gridId}`
          ]"
          class="shapeSlot cell"
        >
          <Puzzle12ShapeBack
            :shape-attrs="getSlotObject(slotIndex)"
            :no-dots-id="noDotsId"
          />
          <!-- Is a riddle slot -->
          <div
            v-if="getSlotObject(slotIndex).isMasked"
            :class="`id${getSlotObject(slotIndex).id}`"
            class="shapeSlot__riddle"
            @click="displayShapeSelector(getSlotObject(slotIndex).id)"
          >
            <transition name="riddleContent">
              <Puzzle12Shape
                v-if="getSlotObject(slotIndex).riddle"
                :shape-attrs="getSlotObject(slotIndex).riddle"
                class="cell"
              />
            </transition>
            <transition name="riddleContent">
              <div
                v-if="!getSlotObject(slotIndex).riddle"
                class="questionMarks"
              >
                <span>??</span>
              </div>
            </transition>
          </div>
          <!-- Is not a riddle slot -->
          <Puzzle12Shape
            v-if="!getSlotObject(slotIndex).isMasked"
            :shape-attrs="getSlotObject(slotIndex)"
            class="shape"
          />
        </div>

        <!-- Links -->
        <Puzzle12Links :link="1" class="shapeSlot link link1" />
        <Puzzle12Links :link="2" class="shapeSlot link link2" />
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
    <transition name="shapeSelector">
      <Puzzle12ShapeSelector
        v-if="shapeSelector"
        :puzzle-id="12"
        :shapes-attrs="shapeRefs"
        @closeSelector="closeShapeSelector"
        @setRiddleSlot="setRiddleSlot"
      />
    </transition>
    <!-- Sounds -->
    <BaseSounds ref="puzzleError" sound-source="valid_error" />
    <BaseSounds ref="puzzleSuccess" sound-source="valid_success" />
    <BaseSounds ref="btnBasePuzzle" sound-source="btn_base_puzzle" />
  </div>
</template>
<script>
import { TimelineMax } from 'gsap'
import { Expo } from 'gsap/EasePack'
import Vue from 'vue'
import { killTimeOuts, getRandomIntInclusive, shuffleArray } from '@/utils'
import Puzzle12ShapeBack from '@/components/Puzzle12ShapeBack'
import Puzzle12Shape from '@/components/Puzzle12Shape'
import Puzzle12Links from '@/components/Puzzle12Links'
import PuzzleActions from '@/components/PuzzleActions'
import Puzzle12ShapeSelector from '@/components/Puzzle12ShapeSelector'
import BaseBigLifeIcon from '@/components/BaseBigLifeIcon'
import { EventBus } from '@/bus'
import { validPuzzle, shakePuzzle } from '@/mixins/validPuzzle.js'

export default {
  name: 'Puzzle12',
  components: {
    Puzzle12ShapeBack,
    Puzzle12Shape,
    Puzzle12Links,
    Puzzle12ShapeSelector,
    BaseBigLifeIcon,
    PuzzleActions
  },
  mixins: [validPuzzle, shakePuzzle],
  data() {
    return {
      disableValid: true,
      gridSlots: [],
      shapeRefs: {
        shape: {
          t: 'triangle',
          tc: 'triangleCollision'
        },
        direction: {
          t: 'top',
          b: 'bottom',
          h: 'horizontal',
          v: 'vertical'
        },
        color: {
          p: 'pink',
          g: 'green',
          c: 'cyan',
          y: 'yellow',
          b: 'blue'
        }
      },
      tracks: {
        main: {
          name: 'main',
          slotsIds: [6, 5, 4, 3, 2, 1, 0, 7, 8, 9, 15, 14, 13, 12],
          maskedIds: [8, 9, 10, 12, 13]
        },
        side: {
          name: 'side',
          slotsIds: [11, 10],
          maskedIds: [11],
          offsetedSuiteId: 3
        }
      },
      invertedShapeIds: [7, 8, 9],
      noDotsId: [6, 9, 11, 15],
      shapeSelector: false,
      riddleSlotIndexSelected: '',
      timeOuts: []
    }
  },
  created() {
    /* ==============================================================
                           Generate data
    ================================================================ */
    this.generateSlotsData()
    // Re-setup slot ids
    this.gridSlots.forEach((slot, index) => {
      slot.id = index
    })
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
    generateSuite() {
      // Shape constructor
      class Shape {
        constructor(id, shapeType, shapeDirection, shapeColor) {
          this.id = 0
          this.shape = shapeType
          this.direction = shapeDirection
          this.color = shapeColor
        }
      }
      // Set shapeTypes
      const generatedShapes = this.getShapes()
      // Set colors
      const generatedColor = this.getColors()
      // Set suite
      const suite = [...Array(5).keys()].map((slot, index) => {
        const shapeType = generatedShapes[index]
        const shapeDirection = this.getDirection(shapeType)
        const shapeColor = generatedColor[index]
        const shape = new Shape(index, shapeType, shapeDirection, shapeColor)
        return shape
      })

      return suite
    },
    generateSlotsData() {
      // Set suite
      const suite = this.generateSuite()
      // Set main track
      const mainTrack = this.tracks.main.slotsIds.map((slotId, index) => {
        const slot = JSON.parse(JSON.stringify(suite[index % 5]))
        slot.gridId = slotId
        slot.isMasked = this.tracks.main.maskedIds.includes(slotId)
        // Invert shape directions for specific slotIds
        if (this.invertedShapeIds.includes(slotId)) {
          if (slot.shape === 'triangle') {
            slot.direction === 'top'
              ? (slot.direction = 'bottom')
              : (slot.direction = 'top')
          }
        }
        return slot
      })
      // Set side track
      const sideTrack = this.tracks.side.slotsIds.map((slotId, index) => {
        const offset = this.tracks.side.offsetedSuiteId
        const slot = JSON.parse(JSON.stringify(suite[offset + index]))
        slot.gridId = slotId
        slot.isMasked = this.tracks.side.maskedIds.includes(slotId)
        return slot
      })
      // Concat tracks
      this.gridSlots.push(...mainTrack, ...sideTrack)
    },
    getShapes() {
      const propDatas = Object.entries(this.shapeRefs.shape)
      const generateBinariesArray = () => {
        return [...Array(5).keys()].map(v => {
          return getRandomIntInclusive(0, 1)
        })
      }
      let randomInts = generateBinariesArray()
      // Recursive until 0 and 1 are both present
      while (!randomInts.includes(0)) {
        randomInts = generateBinariesArray()
      }
      return randomInts.map(index => propDatas[index][1])
    },
    getDirection(shapeType) {
      const propDatas = Object.entries(this.shapeRefs.direction)
      switch (shapeType) {
        case 'triangle':
          return propDatas[getRandomIntInclusive(0, 1)][1]
        case 'triangleCollision':
          return propDatas[getRandomIntInclusive(2, 3)][1]
      }
    },
    getColors() {
      return shuffleArray(Object.values(this.shapeRefs.color))
    },
    getSlotObject(slotIndex) {
      return this.gridSlots.find(slot => slot.gridId === slotIndex)
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

.shapesGrid {
  width: 430px;
  height: 190px;
  max-width: 530px;
  max-height: 190px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(3, 1fr);
  grid-template-areas: 'l1 . . . . . . .' 'l1 . . . l2 l2 . .' '. . . . l2 l2 . .';
  gap: 17px 5px;
}

.shapeSlot {
  &__riddle {
    .questionMarks {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translateX(-50%) translateY(-50%);
      font-size: 22px;
      span {
        position: relative;
        top: 1px;
      }
    }
  }
  &.link {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &.link1 {
    grid-area: l1;
  }
  &.link2 {
    grid-area: l2;
  }
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
}
.shapeSlot {
  padding: 2px;
  overflow: visible;

  &__maskId {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
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
  transition: all 0.2s cubic-bezier(0.02, 0.85, 0.8, 0.99);
}
.riddleContent-enter,
.riddleContent-leave-to {
  opacity: 0;
  transform: scale(0);
}
</style>
