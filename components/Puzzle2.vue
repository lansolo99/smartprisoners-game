<template>
  <div class="puzzleContainer__gridContent">
    <div ref="puzzleContent" class="puzzleContent">
      <div class="puzzleContent__slidersCol puzzleContent__flexibleArea">
        <div class="slidersCols">
          <div v-for="(col, index) in 5" :key="index" class="sliderCol">
            <div class="sliderCol__itemsContainer itemsContainer">
              <div
                v-for="(item, itemIndex) in 5"
                :key="itemIndex"
                class="itemsContainer__item"
              >
                <img
                  class="corner corner__tl"
                  src="~/assets/images/puzzle_2_item_corner.svg"
                />
                <img
                  class="corner corner__tr"
                  src="~/assets/images/puzzle_2_item_corner.svg"
                />
                <img
                  class="corner corner__bl"
                  src="~/assets/images/puzzle_2_item_corner.svg"
                />
                <img
                  class="corner corner__br"
                  src="~/assets/images/puzzle_2_item_corner.svg"
                />

                <div
                  v-for="(color, colorIndex) in items[index * 5 + itemIndex][
                    'colors'
                  ]"
                  :key="color + colorIndex"
                  :style="{ backgroundColor: color }"
                  class="coloredBar"
                ></div>
              </div>
            </div>

            <vue-slider
              v-model="slidersPositions[`slider${index + 1}`]"
              :data="slidersDatas"
              :height="computedSliderHeight"
              :style="{
                margin: adjustedSliderMargin + 'px 22px'
              }"
              :class="{ sliderDotHandlesHidden: sliderDotHandlesHidden }"
              :adsorb="false"
              :interval="25"
              :clickable="false"
              :marks="true"
              :hide-label="true"
              :process="false"
              :tooltip="'none'"
              :contained="true"
              :lazy="true"
              direction="ttb"
              @change="evalSliderPositions()"
            ></vue-slider>
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
    <!-- Sounds -->
    <BaseSounds ref="puzzleError" sound-source="valid_error" />
    <BaseSounds ref="puzzleSuccess" sound-source="valid_success" />
    <BaseSounds ref="dragDropped" sound-source="drag_dropped" />
  </div>
</template>
<script>
import VueSlider from 'vue-slider-component'
import { TimelineMax } from 'gsap'
import { Expo } from 'gsap/EasePack'
import PuzzleActions from '@/components/PuzzleActions.vue'
import { EventBus } from '@/bus'
import { validPuzzle, shakePuzzle } from '@/mixins/validPuzzle.js'
import BaseBigLifeIcon from '@/components/BaseBigLifeIcon'
import 'vue-slider-component/theme/material.css'
import {
  getUniqueRandomInts,
  getRandomIntInclusive,
  shuffleArray,
  killTimeOuts
} from '@/utils'
export default {
  name: 'Puzzle2',
  components: {
    BaseBigLifeIcon,
    PuzzleActions,
    VueSlider
  },
  mixins: [validPuzzle, shakePuzzle],
  data() {
    return {
      disableValid: true,
      timeOuts: [],
      slidersDatas: [1, 2, 3, 4, 5],
      sliderDotHandlesHidden: false,
      slidersPositions: {
        slider1: 3,
        slider2: 1,
        slider3: 1,
        slider4: 1,
        slider5: 1
      },
      gridContentHeight: 0,
      items: [],
      validSchemaId: '',
      validations: [false, false, false, false, false]
    }
  },

  computed: {
    computedSliderHeight() {
      // return 100
      // return 50
      return this.gridContentHeight - this.adjustedSliderMargin * 2
    },
    adjustedSliderMargin() {
      // gridContentHeight / items length / both side - vue-slider-component padding
      return this.gridContentHeight / 5 / 2 - 7
    },
    validationCheck() {
      if (
        this.validations.some(v => {
          return v === false
        })
      ) {
        return false
      } else {
        return true
      }
    }
  },
  created() {
    /* =============================================
            Randomize sliders handle positions
    ============================================= */
    Object.keys(this.slidersPositions).forEach((value, index) => {
      this.slidersPositions[`slider${index + 1}`] = getRandomIntInclusive(1, 5)
    })

    /* =============================================
              Create colors combinations
    ============================================= */
    const colorsSuite = ['#EF8032', '#CD5A91', '#418CCB']

    const getCombinations = (colorsSuiteArray, size, initialStuff) => {
      const output = []
      // Build
      const buildCombinations = (
        colorsSuiteArray,
        size,
        initialStuff,
        output
      ) => {
        if (initialStuff.length >= size) {
          output.push(initialStuff)
        } else {
          for (let i = 0; i < colorsSuiteArray.length; ++i) {
            buildCombinations(
              colorsSuiteArray,
              size,
              initialStuff.concat(colorsSuiteArray[i]),
              output
            )
          }
        }
      }
      // Init build
      buildCombinations(colorsSuite, size, initialStuff, output)
      // Return
      return output
    }

    const colorsCombinations = getCombinations(colorsSuite, 4, [])
    const randomizedCombinationsIndex = getUniqueRandomInts(
      colorsCombinations.length,
      25
    )
    /* =============================================
                    Generate items
    ============================================= */

    // Generate all items from constructor
    const generateItems = () => {
      const generatedItems = []
      // Item constructor
      const ItemConstructor = function(id, colors) {
        this.id = id
        this.colors = colors
      }
      // Populate generatedItems array with new item objects
      for (let i = 0; i < 25; i++) {
        const colors = colorsCombinations[randomizedCombinationsIndex[i]]
        const item = new ItemConstructor(i, colors)
        generatedItems.push(item)
      }
      return generatedItems
    }

    /* =============================================
                Build final items Serie
    ============================================= */
    const buildFinalItemsSerie = () => {
      // Temp generated serie
      const generatedItems = generateItems()

      // Pick one valid schema
      const pickValidSchemaIndex = getRandomIntInclusive(
        1,
        generatedItems.length
      )
      // Mute generatedItems by assigning validSchema to extracted object
      const validSchema = Object.assign(
        {},
        generatedItems.splice(pickValidSchemaIndex, 1)
      )[0]
      this.validSchemaId = validSchema.id

      // Take first 8 items from generatedItems
      const reducedGeneratedItems = generatedItems.slice(0, 8)
      // Extract 4 items to be repeated from reducedGeneratedItems
      const itemSetToBeRepeated = reducedGeneratedItems.splice(0, 4)
      // Concat remaining items in reducedGeneratedItems with itemSetToBeRepeated x4 = 20 items
      const newGeneratedItems = [
        ...reducedGeneratedItems,
        ...itemSetToBeRepeated,
        ...itemSetToBeRepeated,
        ...itemSetToBeRepeated,
        ...itemSetToBeRepeated,
        ...itemSetToBeRepeated
      ]
      const shufflednewGeneratedItems = shuffleArray(newGeneratedItems)

      // New temp generated serie
      const regeneratedItemsWithValidSchema = []

      let currentGeneratedItemsIndex = 0

      // Build 5 columns set of 5 items
      for (let colIndex = 0; colIndex < 5; colIndex++) {
        // Set random integer for validSchema position inside each col
        const randomValidIndexInsideCol = getRandomIntInclusive(1, 5 - 1)

        // Build column
        for (let itemIndex = 0; itemIndex < 5; itemIndex++) {
          if (itemIndex === randomValidIndexInsideCol) {
            // push validshema standalone array at defined randomValidIndex
            regeneratedItemsWithValidSchema.push(validSchema)
          } else {
            // push item from generatedItems
            regeneratedItemsWithValidSchema.push(
              shufflednewGeneratedItems[currentGeneratedItemsIndex]
            )
            currentGeneratedItemsIndex++
          }
        }
      }
      /// Push final serie as local data
      regeneratedItemsWithValidSchema.forEach(v => {
        this.items.push(v)
      })
    }
    buildFinalItemsSerie()
  },
  mounted() {
    // Assign gridContent container's height as data
    this.gridContentHeight = this.$refs.puzzleContent.querySelector(
      '.puzzleContent__slidersCol'
    ).clientHeight

    /* =============================================
                      Show hint
    ============================================= */
    // Helper dev -> immediatly trigger showHint (with delay to avoid asynchronous errors)
    // setTimeout(() => {
    //   this.showHint()
    // }, 500)

    EventBus.$on('showHint', () => {
      // Hide slider dot handles
      this.sliderDotHandlesHidden = true
      // Trigger showHint with slight delay
      this.timeOuts.push(
        setTimeout(() => {
          this.showHint()
        }, 500)
      )
    })
  },
  beforeDestroy() {
    killTimeOuts(this.timeOuts)
    EventBus.$off('showHint')
  },
  methods: {
    evalSliderPositions() {
      console.log('evalSliderPositions')

      // Enable valid btn
      this.disableValid = false

      // Dropped sound
      this.$refs.dragDropped.playSound()
      // Update validations state
      Object.values(this.slidersPositions).forEach((value, index) => {
        // if item'id under the slider position is equal to validSchema item's id :
        if (this.items[index * 5 + value - 1].id === this.validSchemaId) {
          // Set validations index to true
          this.validations[index] = true
        } else {
          // Set validations index to false
          this.validations[index] = false
        }
      })
    },
    checkPuzzle() {
      return !this.validations.some(v => {
        return v === false
      })
    },
    showHint() {
      // Get elements to highlight
      const validSchemaIndexes = () => {
        const indexes = []
        Object.values(this.items).forEach((v, i) => {
          if (v.id === this.validSchemaId) {
            indexes.push(i)
          }
        })
        return indexes.splice(0, 2)
      }

      const singleItemsNodeList = this.$refs.puzzleContent.querySelectorAll(
        '.itemsContainer__item'
      )

      // First 2 valid items:
      const valideNode1 = singleItemsNodeList[validSchemaIndexes()[0]]
      const valideNode2 = singleItemsNodeList[validSchemaIndexes()[1]]

      // Last 3 slider columns:
      const lastThreeSliderCols = Array.from(
        this.$refs.puzzleContent.querySelectorAll('.sliderCol')
      ).splice(-3)

      // Complete event
      const showHintComplete = () => {
        this.sliderDotHandlesHidden = false
        this.timeOuts.push(
          setTimeout(() => {
            EventBus.$emit('showHintComplete')
          }, 500)
        )
      }

      // GSAP
      const timelineHint = new TimelineMax({
        repeat: 2,
        onComplete: showHintComplete
      })

      const elementsToAnimate = [
        valideNode1,
        valideNode2,
        lastThreeSliderCols[0],
        lastThreeSliderCols[1],
        lastThreeSliderCols[2]
      ]

      elementsToAnimate.forEach(item => {
        timelineHint.to(item, 0.3, {
          transform: 'scale(1.2)',
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
      transform: scale(1.3);
    }
  }

  &__slidersCol {
    display: flex;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    max-width: 550px;
    height: 190px;
    @include responsive(tablet) {
      height: 300px;
    }
  }
  .slidersCols {
    @include responsive(tablet) {
      width: 600px;
    }
    max-width: 900px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
  }
}

.sliderCol {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  @include responsive(tablet) {
    height: 300px;
  }
  &__itemsContainer {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .itemsContainer {
    pointer-events: none;
    &__item {
      font-size: 12px;
      position: relative;
      padding: 4px 10px;
      border: 3px solid transparent;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      & > .coloredBar + .coloredBar {
        margin-top: 3px;
        @include responsive(tablet) {
          margin-top: 5px;
        }
      }
      .coloredBar {
        height: 3px;
        width: 100%;
        border-radius: 2px;
        @include responsive(tablet) {
          height: 4px;
          width: calc(100% - 18px);
        }
      }
      .corner {
        position: absolute;
        width: 13px;
        height: 13px;
        &__tl {
          top: 0;
          left: 0;
        }
        &__tr {
          top: 0;
          right: 0;
          transform: rotate(90deg);
        }
        &__bl {
          bottom: 0;
          left: 0;
          transform: rotate(-90deg);
        }
        &__br {
          bottom: 0;
          right: 0;
          transform: rotate(180deg);
        }
      }
    }
  }

  // Vue-slider-component overwrite
  .vue-slider {
    width: 18px !important;
    margin-left: 28px;
    margin-right: 28px;

    &::v-deep {
      .vue-slider-dot {
        transition: opacity 0.3s ease;
        width: 58px !important;
        height: 37px !important;
        @include responsive(tablet) {
          width: 99px !important;
          height: 56px !important;
        }
      }
      .vue-slider-dot-handle::after {
        background: rgba($color-yellow, 0.2);
        width: 110%;
        height: 110%;
        border-radius: 0;
      }

      .vue-slider-dot-handle {
        transition: opacity 0.3s ease;
        border-radius: 0px !important;
        background-color: rgba($color-yellow, 0.01);
        border: 3px solid $color-yellow;
        @include responsive(tablet) {
          border: 4px solid $color-yellow;
        }
        animation: dotBlinking 1s infinite;
        @keyframes dotBlinking {
          0% {
            border-color: $color-yellow;
          }
          49% {
            border-color: $color-yellow;
          }
          50% {
            border-color: white;
          }
          100% {
            border-color: white;
          }
        }
      }
      .vue-slider-rail {
        background: transparent;
      }
      .vue-slider-marks {
        opacity: 0;
      }
    }
    &.sliderDotHandlesHidden {
      &::v-deep {
        .vue-slider-dot {
          .vue-slider-dot-handle {
            opacity: 0;
          }
        }
      }
    }
  }

  .vue-slider-handle {
    border-radius: 5px !important;
  }
}
.actionCol {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}
.cta {
  @include cta;
  padding: 0.5rem 1rem !important;
}
</style>
