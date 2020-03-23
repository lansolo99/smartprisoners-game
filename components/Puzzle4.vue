<template>
  <div class="puzzleContainer__gridContent">
    <div ref="puzzleContent" class="puzzleContent">
      <div class="puzzleContent__pyramids puzzleContent__flexibleArea">
        <div class="pyramids">
          <Puzzle4Pyramid
            ref="pyramid1"
            :pyramid-data="pyramids[0]"
            :pyramid-id="1"
            class="puzzleContent__pyramid puzzleContent__pyramid--1"
          />
          <Puzzle4Pyramid
            ref="pyramid2"
            :pyramid-data="reversedPyramidData"
            :pyramid-id="2"
            class="puzzleContent__pyramid puzzleContent__pyramid--2"
          />
        </div>
        <!-- Selector -->
        <transition name="valuesSelector">
          <Puzzle4ValuesSelector
            v-if="selectValueDatas.display"
            :pyramid-id="selectValueDatas.pyramidId"
            :pyramid-box-id="selectValueDatas.pyramidBoxId"
            @closeSelector="closeValuesSelector"
          />
        </transition>
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
    <!-- Sounds -->
    <BaseSounds ref="puzzleError" sound-source="valid_error" />
    <BaseSounds ref="puzzleSuccess" sound-source="valid_success" />
    <BaseSounds ref="btnBasePuzzle" sound-source="btn_base_puzzle" />
  </div>
</template>
<script>
import { TimelineMax } from 'gsap'
import { Expo } from 'gsap/EasePack'
import {
  killTimeOuts,
  getRandomIntInclusive,
  getRandomCombinationSum
} from '@/utils'
import PuzzleActions from '@/components/PuzzleActions.vue'
import Puzzle4ValuesSelector from '@/components/Puzzle4ValuesSelector.vue'
import Puzzle4Pyramid from '@/components/Puzzle4Pyramid'

import { EventBus } from '@/bus'
import { validPuzzle, shakePuzzle } from '@/mixins/validPuzzle.js'
import BaseBigLifeIcon from '@/components/BaseBigLifeIcon'

export default {
  name: 'Puzzle4',
  components: {
    BaseBigLifeIcon,
    PuzzleActions,
    Puzzle4Pyramid,
    Puzzle4ValuesSelector
  },
  mixins: [validPuzzle, shakePuzzle],
  data() {
    return {
      disableValid: true,
      pyramids: [],
      selectValueDatas: {
        display: false,
        pyramidId: 0,
        pyramidBoxId: 0
      },
      pyramidsValidations: {
        pyramid1: false,
        pyramid2: false
      },
      timeOuts: []
    }
  },
  computed: {
    reversedPyramidData() {
      return [...this.pyramids[1]].reverse()
    }
  },
  created() {
    const populatePyramidsData = () => {
      while (this.pyramids.length < 2) {
        this.generatePyramidsData()
      }
    }
    populatePyramidsData()
  },
  mounted() {
    EventBus.$on('displayValuesSelector', ({ pyramidId, pyramidBoxId }) => {
      // Passing box data
      this.selectValueDatas.pyramidId = pyramidId
      this.selectValueDatas.pyramidBoxId = pyramidBoxId
      // Display component
      this.selectValueDatas.display = true
    })
    /* ==============================================================
                            Show hint
    ================================================================ */

    // Helper dev -> immediatly trigger showHint (with delay to avoid asynchronous errors)
    // setTimeout(() => {
    //   this.showHint()
    // }, 500)

    EventBus.$on('showHint', () => {
      // Trigger showHint with slight delay
      this.timeOuts.push(
        setTimeout(() => {
          this.showHint()
        }, 500)
      )
    })
  },
  beforeDestroy() {
    EventBus.$off('showHint')
    EventBus.$off('displayValuesSelector')
    killTimeOuts(this.timeOuts)
  },
  methods: {
    generatePyramidsData() {
      // Vars
      const pyramids = [] // Data wrapper
      const sumLength = 2 // Sum length

      // FLOOR1
      // -> Generate random number between 20 - 30
      const topSum = getRandomIntInclusive(20, 30)

      // Push data
      pyramids.push([topSum])

      // FLOOR2
      // -> Get random sum for topSum
      const integerLength = 2 // Addition Integers must have a length of 2
      const floor2Sum = getRandomCombinationSum(
        topSum,
        sumLength,
        integerLength
      )
      // Push data
      pyramids.push([...floor2Sum])

      // FLOOR3
      // -> Get random sums for each superior floor sums
      let floor3SumItem

      const floor3Sums = floor2Sum.map((v, i) => {
        if (i === 0) {
          // Above floor first item

          // return combination with last integer that should not be superior than following mapped item
          floor3SumItem = getRandomCombinationSum(v, sumLength)

          // While superior -> re-eval with a new pair
          while (floor3SumItem[1] > floor2Sum[i + 1]) {
            floor3SumItem = getRandomCombinationSum(v, sumLength)
          }
          // else return pair
          return floor3SumItem
        } else {
          // Remainings above floor indexes
          const lastSumPair = floor2Sum[i] - floor3SumItem[1]
          return [floor3SumItem[1], lastSumPair]
        }
      })

      const flattenedFloor3Sums = floor3Sums.reduce((acc, cur) => {
        return [...acc, cur[1]]
      })
      // Push data
      pyramids.push([...flattenedFloor3Sums])

      // FLOOR4
      // -> Get random sums for each superior floor sums
      let floor4SumItem
      let floor4SumLastGeneratedItem

      const floor4Sums = flattenedFloor3Sums.map((v, i) => {
        // const floor4Sums = floor3Sums.map((v, i) => {

        if (i === 0) {
          // Above floor first item

          // return combination with last integer that should not be superior than following mapped item
          floor4SumItem = getRandomCombinationSum(v, sumLength)

          // While superior -> re-eval with a new pair
          while (floor4SumItem[1] > flattenedFloor3Sums[i + 1]) {
            floor4SumItem = getRandomCombinationSum(v, sumLength)
          }
          // else return pair
          floor4SumLastGeneratedItem = floor4SumItem
          return floor4SumItem
        } else {
          // Remainings above floor indexes

          const lastSumPair =
            flattenedFloor3Sums[i] - floor4SumLastGeneratedItem[1]

          const pairReturn = [floor4SumLastGeneratedItem[1], lastSumPair]
          floor4SumLastGeneratedItem = pairReturn

          return pairReturn
        }
      })

      const flattenedFloor4Sums = floor4Sums.reduce((acc, cur) => {
        return [...acc, cur[1]]
      })
      // Push data
      pyramids.push([...flattenedFloor4Sums])

      // Pyramid validation
      for (const [index, floor] of pyramids.entries()) {
        const hasFloorNegativeValue = floor.some(v => {
          return Math.sign(v) === -1
        })
        if (hasFloorNegativeValue) {
          // Invalid pyramid -> rebuild
          break
          // this.generatePyramidsData(1) // nein!!
        } else if (index === pyramids.length - 1) {
          // Valid pyramid -> push as local data
          this.pyramids.push(pyramids)
        }
      }
    },
    closeValuesSelector() {
      // Enable valid btn
      this.disableValid = false

      // Btn sound
      this.$refs.btnBasePuzzle.playSound()

      this.selectValueDatas.display = false
    },
    checkPuzzle() {
      // Perform pyramids checks

      this.pyramidsValidations.pyramid1 = this.$refs.pyramid1.boxesValidation()
      this.pyramidsValidations.pyramid2 = this.$refs.pyramid2.boxesValidation()
      // Check local datas returned
      const AllPyramidsOk = Object.values(this.pyramidsValidations).every(
        v => v === true
      )
      return AllPyramidsOk
    },
    resetPuzzleActions() {
      EventBus.$emit('resetPyramidsBoxes')
    },
    showHint() {
      // Get DOM elements
      const boxElements = this.$refs.puzzleContent.querySelectorAll(
        '.pyramid-wrapper .box'
      )
      // Set references
      const threeFirstBoxes = Array.prototype.filter.call(
        boxElements,
        (v, i) => {
          return i < 3
        }
      )
      const [item1, item2, item3] = threeFirstBoxes

      // Complete event
      const showHintComplete = () => {
        this.timeOuts.push(
          setTimeout(() => {
            EventBus.$emit('showHintComplete')
          }, 500)
        )
      }

      const timelineHint = new TimelineMax({
        repeat: 2,
        onComplete: showHintComplete
      })

      const elementsToAnimate = [item1, item2, item3]
      elementsToAnimate.forEach(item => {
        timelineHint.to(item, 0.3, {
          transform: 'scale(1.3)',
          color: '#ffffff',
          opacity: 1,
          zindex: 100,
          yoyo: true,
          repeat: 1,
          ease: Expo.easeInOut
        })
      })
    }
  }
}
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

  &__pyramids {
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    width: 100%;
    height: 100%;
    max-width: 550px;

    max-height: 250px;
  }
  .pyramids {
    position: relative;
    width: 100%;
    max-width: 400px;
    margin: auto;
  }
  &__pyramid {
    position: absolute;
    top: 50%;
    transform: translateY(-50%) scale(0.9);
    @include responsive(tablet) {
      transform: translateY(-50%) scale(1);
    }
    &--1 {
      left: 15px;
    }
    &--2 {
      right: 15px;
    }
  }
  &__action {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 10px;
  }
  .actionsWrapper {
    .cta {
      margin: 15px 0px;
      &--reset {
        border-color: grey;
        color: grey;
      }
    }
  }
}
// puzzleResetLayer transition
.valuesSelector-enter-active,
.valuesSelector-leave-active {
  transition: all 0.1s cubic-bezier(0.02, 0.85, 0.8, 0.99);
}
.valuesSelector-enter,
.valuesSelector-leave-to {
  opacity: 0;
  transform: scale(0);
}
</style>
