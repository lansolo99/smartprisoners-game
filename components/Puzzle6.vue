<template>
  <div class="puzzleContainer__gridContent">
    <div ref="puzzleContent" class="puzzleContent">
      <div class="puzzleContent__tetrominoesGrid puzzleContent__flexibleArea">
        <div class="tetrominoesGrid">
          <div
            v-for="(cell, index) in gridCells"
            :ref="`cell${cell.id}`"
            :key="cell.id"
            :class="[
              { isjoker: cell.isJoker },
              { isShowHintExample: cell.isShowHintExample },
              { isJokerInnerColor: cell.jokerCurrentPosition !== 'subgrid' }
            ]"
            class="cell"
            @click="fillCell(index)"
          >
            <!-- Joker -->
            <Puzzle6Joker v-if="cell.isJoker" :cell="cell" class="joker" />

            <!-- Basic fillable cell -->
            <div
              v-else
              :class="[cell.color, cell.filled === true ? 'filled' : 'empty']"
              class="innerColor"
            ></div>
          </div>
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
    <transition name="colorSelector">
      <Puzzle6ColorSelector
        v-if="colorSelector"
        :colors="colors"
        @closeSelector="closeColorSelector"
        @setJokerSlot="setJokerSlot"
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
import { mapState } from 'vuex'
import { Expo } from 'gsap/EasePack'
import PuzzleActions from '@/components/PuzzleActions.vue'
import Puzzle6Joker from '@/components/Puzzle6Joker'
import Puzzle6ColorSelector from '@/components/Puzzle6ColorSelector.vue'
import { killTimeOuts } from '@/utils'
import { validPuzzle, shakePuzzle } from '@/mixins/validPuzzle.js'
import { pickStaticSchema } from '@/mixins/pickStaticSchema.js'
import BaseBigLifeIcon from '@/components/BaseBigLifeIcon'
import { EventBus } from '@/bus'
import data from '@/store/datas/puzzle6_schemas'

export default {
  name: 'Puzzle6',
  components: {
    BaseBigLifeIcon,
    PuzzleActions,
    Puzzle6Joker,
    Puzzle6ColorSelector
  },
  mixins: [validPuzzle, shakePuzzle, pickStaticSchema],
  data() {
    return {
      disableValid: true,
      timeOuts: [],
      schema: data,
      gridCells: [],
      gridCellsTempBackup: [],
      colors: ['color1', 'color2', 'color3', 'color4'],
      tempNamedColors: {
        color1: 'blue',
        color2: 'pink',
        color3: 'yellow',
        color4: 'green'
      },
      colorSelector: false,
      jokerSlotIndexSelected: 0
    }
  },
  computed: {
    ...mapState({
      previousSchemaUsed: state => state.session.staticSchemasCycling.puzzle6
    }),
    getCellSize() {
      return this.$refs.puzzleContent.querySelector('.cell').clientHeight
    },
    jokerRightColors() {
      return this.gridCells
        .filter(v => v.isJoker === true)
        .map(v => this.tempNamedColors[v.color])
    }
  },
  created() {
    // Generate data
    this.pickStaticSchema(6, this.previousSchemaUsed, data)
    this.generateTetrominoesGrid()
  },
  mounted() {
    /* ==============================================================
                            Show hint
    ================================================================ */

    // Helper dev -> immediatly trigger showHint (with delay to avoid asynchronous errors)
    // setTimeout(() => {
    //   // Backup current gridCell positions
    //   this.gridCellsTempBackup = JSON.parse(JSON.stringify(this.gridCells))
    //   this.resetPuzzleActions()
    //   setTimeout(() => {
    //     this.showHint()
    //   }, 300)
    // }, 4000)

    EventBus.$on('showHint', () => {
      // Record active user cells
      this.gridCellsTempBackup = JSON.parse(JSON.stringify(this.gridCells))
      // Reset grid
      this.resetPuzzleActions()
      // Trigger showHint with slight delay
      this.timeOuts.push(
        setTimeout(() => {
          this.showHint()
        }, 300)
      )
    })
  },
  beforeDestroy() {
    EventBus.$off('showHint')
    killTimeOuts(this.timeOuts)
  },
  methods: {
    generateTetrominoesGrid() {
      // Cell constructor
      class Cell {
        constructor(id, color, isJoker = false, isShowHintExample = false) {
          this.id = id
          this.color = color
          this.filled = false
          this.isJoker = isJoker
          this.isShowHintExample = isShowHintExample
          if (isJoker) {
            this.jokerCurrentPosition = 'subgrid'
          }
        }
      }

      // Generate cell datas
      this.schema.forEach((value, index) => {
        const isValueAString = typeof value === 'string'
        const getCellColor = value => (isValueAString ? value[0] : value)
        const isJoker = isValueAString && value.includes('j')
        const isShowHintExample = isValueAString && value.includes('e')

        const cell = new Cell(
          index,
          this.colors[parseInt(getCellColor(value)) - 1],
          isJoker,
          isShowHintExample
        )
        this.gridCells.push(cell)
      })
    },
    fillCell(cellIndex) {
      // Enable valid btn
      this.disableValid = false

      // Btn sound
      this.$refs.btnBasePuzzle.playSound()
      // Logic
      if (this.gridCells[cellIndex].isJoker) {
        // IS A JOKER

        this.displayColorSelector(cellIndex)
      } else {
        // is not a joker -> toggle fill class
        this.gridCells[cellIndex].filled = !this.gridCells[cellIndex].filled
      }
    },
    checkPuzzle() {
      // Is not a joker -> must be filled
      const allNotJokerAreFilled = this.gridCells
        .filter(v => !v.isJoker)
        .every(v => v.filled === true)

      // Is a joker -> compare color to currentJokerPosition
      const jokerMustBeOnRightColor = this.gridCells
        .filter(v => v.isJoker === true)
        .every(v => {
          return v.color === v.jokerCurrentPosition
        })

      // checkGrid return
      if (allNotJokerAreFilled && jokerMustBeOnRightColor) {
        return true
      } else {
        return false
      }
      // return true
    },
    resetPuzzleActions() {
      // All non joker cells -> set filled to false
      this.gridCells
        .filter(v => v.isJoker === false)
        .forEach(v => {
          this.gridCells[v.id].filled = false
        })
      // All joker cells -> set jokerCurrentPosition to subgrid
      this.gridCells
        .filter(v => v.isJoker === true)
        .forEach(v => {
          this.gridCells[v.id].jokerCurrentPosition = 'subgrid'
        })
    },
    showHint() {
      // Complete event
      const showHintComplete = () => {
        this.timeOuts.push(
          setTimeout(() => {
            this.gridCells = JSON.parse(
              JSON.stringify(this.gridCellsTempBackup)
            )
            EventBus.$emit('showHintComplete')
          }, 700)
        )
      }

      // Fill sequentially all the example
      const fillExamplesSequentially = () => {
        // Get elements
        const examplesCells = this.gridCells.filter(v => v.isShowHintExample)

        // "Fill-squares" sequence
        // Interator
        let currentExampleIndex = 0
        // Interval
        const fillExamplesSequentiallyInterval = setInterval(() => {
          // Set element
          const currentCell = examplesCells[currentExampleIndex]

          // Joker or basic cell ternary
          currentCell.filled = true
          currentCell.isJoker
            ? (currentCell.jokerCurrentPosition = currentCell.color)
            : (currentCell.filled = true)
          // Increment
          currentExampleIndex++
          // End of sequence
          if (currentExampleIndex === 4) {
            clearInterval(fillExamplesSequentiallyInterval)
            this.timeOuts.push(
              setTimeout(() => {
                timelineHint.play()
              }, 500)
            )
          }
        }, 500)
      }
      fillExamplesSequentially()

      // Blink all example together -> either opacity or white

      // Get DOM elements
      const examples = this.$refs.puzzleContent.querySelectorAll(
        '.isShowHintExample'
      )

      // GSAP Timeline
      const timelineHint = new TimelineMax({
        repeat: 6,
        onComplete: showHintComplete
      })

      timelineHint.pause()

      timelineHint.to(examples, 0.3, {
        opacity: 0.3,
        ease: Expo.easeInOut,
        yoyo: true,
        repeat: 1
      })
    },
    displayColorSelector(cellIndex) {
      // Store current cell Index
      this.jokerSlotIndexSelected = cellIndex
      // Display selector component
      this.colorSelector = true
    },
    closeColorSelector() {
      this.colorSelector = false
    },
    setJokerSlot(color) {
      // Btn sound
      this.$refs.btnBasePuzzle.playSound()

      this.colorSelector = false
      // Here set joker color subgrid
      this.gridCells[this.jokerSlotIndexSelected].jokerCurrentPosition = color
      // Vue.set(this.gridSlots[this.riddleSlotIndexSelected], 'riddle', payload)
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
      transform: scale(1.55);
    }
  }
  &__tetrominoesGrid {
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    margin: 0 100px;
    width: 100%;
    height: 100%;
    max-width: 500px;
    max-height: 250px;
  }

  .tetrominoesGrid {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(8, 1fr);
    grid-template-rows: repeat(5, 1fr);
    gap: 5px;
    @include responsive(tablet) {
      gap: 10px;
    }

    .cell {
      border: 2px solid rgba($color-granny-smith, 0.5);
      background: transparent;
      padding: 4px;
      transition: all 0.15s ease;

      &.isjoker {
        padding: 4px;
        border-width: 3px;
        border-style: dashed;
        border-top-color: rgba(#357ab4, 1);
        border-right-color: rgba(#d28abc, 1);
        border-bottom-color: rgba(#6bc174, 1);
        border-left-color: rgba(#f1a744, 1);
      }

      .innerColor {
        width: 100%;
        height: 100%;
        transition: all 0.12s ease-in-out;
        border-style: solid;

        &.empty {
          border-width: 3px;
          background-color: transparent !important;
        }

        &.filled {
          border-width: 0px;
        }

        &.color1 {
          border-color: #357ab4;
          background-color: #357ab4;
        }
        &.color2 {
          border-color: #d28abc;
          background-color: #d28abc;
        }
        &.color3 {
          border-color: #f1a744;
          background-color: #f1a744;
        }
        &.color4 {
          border-color: #6bc174;
          background-color: #6bc174;
        }
      }

      .joker {
        display: flex;
        height: 100%;
        width: 100%;

        &__innerColor {
          display: flex;
          align-items: center;
          justify-content: center;
          color: $color-anthracite;
          font-size: 18px;
          height: 100%;
          transform-origin: center;
          width: 100%;
          @include responsive(tablet) {
            font-size: 25px;
          }

          &.color1 {
            background-color: #357ab4;
          }
          &.color2 {
            background-color: #d28abc;
          }
          &.color3 {
            background-color: #f1a744;
          }
          &.color4 {
            background-color: #6bc174;
          }
        }

        &__subgrid {
          flex-grow: 1;
          display: grid;
          width: 100%;
          height: 100%;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 2px;
        }

        .subColor {
          &--1 {
            border-color: #357ab4;
            background-color: #357ab4;
          }

          &--2 {
            background-color: #d28abc;
          }

          &--3 {
            background-color: #f1a744;
          }

          &--4 {
            background-color: #6bc174;
          }
        }
        &.color1 {
          border-color: #357ab4;
          background-color: #357ab4;
        }
        &.color2 {
          border-color: #d28abc;
          background-color: #d28abc;
        }
        &.color3 {
          border-color: #f1a744;
          background-color: #f1a744;
        }
        &.color4 {
          border-color: #6bc174;
          background-color: #6bc174;
        }
      }
    }
  }
}
// jokerItem transitions
.jokerItem-enter-active,
.jokerItem-leave-active {
  transition: all 0.1s ease-in-out;
}
.jokerItem-enter,
.jokerItem-leave-to {
  opacity: 0;
  transform: scale(0);
}
// colorSelector transitions
.colorSelector-enter-active,
.colorSelector-leave-active {
  transition: all 0.1s cubic-bezier(0.02, 0.85, 0.8, 0.99);
}
.colorSelector-enter,
.colorSelector-leave-to {
  opacity: 0;
  transform: scale(0);
}
</style>
