<template>
  <div class="puzzleContainer__gridContent">
    <div ref="puzzleContent" class="puzzleContent">
      <div class="puzzleContent__sliders puzzleContent__flexibleArea">
        <div class="sliders">
          <div
            v-for="(slider, index) in sliders"
            :key="index"
            class="puzzleContent__slider"
          >
            <Puzzle5Endpoint
              :class="
                slider.endpoints[0] === slidersPairs[0] ? 'isValidPair' : ''
              "
              :value="slider.endpoints[0]"
              :slider-position="slider.position"
              layout="top"
              @click.native="setSliderPosition(index, 'top')"
            />
            <vue-slider
              v-model="sliders[index].position"
              :data="slidersDatas"
              :height="adjustedSliderHeight"
              :width="adjustedSliderWidth"
              :style="`padding:${adjustedSliderHeightPadding}px 0px;`"
              :adsorb="false"
              :clickable="false"
              :tooltip="'none'"
              :interval="25"
              :marks="false"
              direction="ttb"
              @change="changeSlider"
              @drag-start="changeIsSlidingStore(index, true)"
              @drag-end="changeIsSlidingStore(index, false)"
            ></vue-slider>

            <Puzzle5Endpoint
              :class="
                slider.endpoints[1] === slidersPairs[0] ? 'isValidPair' : ''
              "
              :value="slider.endpoints[1]"
              :slider-position="slider.position"
              layout="bottom"
              @click.native="setSliderPosition(index, 'bottom')"
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
    <!-- Sounds -->
    <BaseSounds ref="puzzleError" sound-source="valid_error" />
    <BaseSounds ref="puzzleSuccess" sound-source="valid_success" />
    <BaseSounds ref="dragDropped" sound-source="drag_dropped" />
    <BaseSounds ref="btnBasePuzzle" sound-source="btn_base_puzzle" />
  </div>
</template>
<script>
import VueSlider from 'vue-slider-component'
import Vue from 'vue'
import { TimelineMax } from 'gsap'
import { Expo } from 'gsap/EasePack'
import PuzzleActions from '@/components/PuzzleActions.vue'
import Puzzle5Endpoint from '@/components/Puzzle5Endpoint'
import Puzzle5SliderArrow from '@/components/Puzzle5SliderArrow'
import { killTimeOuts, getUniqueRandomInts, shuffleArray } from '@/utils'
import { EventBus } from '@/bus'
import { validPuzzle, shakePuzzle } from '@/mixins/validPuzzle.js'
import BaseBigLifeIcon from '@/components/BaseBigLifeIcon'
const ArrowClass = Vue.extend(Puzzle5SliderArrow)

export default {
  name: 'Puzzle5',
  components: {
    BaseBigLifeIcon,
    PuzzleActions,
    VueSlider,
    Puzzle5Endpoint
  },
  mixins: [validPuzzle, shakePuzzle],
  data() {
    return {
      disableValid: true,
      timeOuts: [],
      sliders: [],
      slidersDatas: ['top', 'bottom'],
      slidersPairs: '',
      puzzleContent: '',
      puzzleContentSlidersEl: '',
      sliderEndpointEl: '',
      sliderEl: '',
      sliderDotEl: ''
    }
  },
  computed: {
    adjustedSliderHeight() {
      return (
        this.puzzleContentSlidersEl.clientHeight -
        this.sliderEndpointEl.clientHeight * 2 -
        4
      )
    },
    adjustedSliderWidth() {
      return this.sliderEl.clientWidth
    },
    adjustedSliderHeightPadding() {
      return this.sliderDotEl.clientHeight / 2 + 5
    }
  },
  created() {
    this.generateSlidersData()
  },
  mounted() {
    /* ==============================================================
    Set puzzleContent DOM elements as data            
    ================================================================ */

    // Set parent reference
    this.puzzleContent = this.$refs.puzzleContent

    // Set elements
    this.puzzleContentSlidersEl = this.puzzleContent.querySelector(
      '.puzzleContent__sliders'
    )
    this.sliderEndpointEl = this.puzzleContent.querySelector(
      '.puzzleContent__endpoint'
    )
    this.sliderEl = this.puzzleContent.querySelector('.puzzleContent__slider')
    this.sliderDotEl = this.puzzleContent.querySelector('.vue-slider-dot')

    const sliderDotsCollection = this.puzzleContent.querySelectorAll(
      '.vue-slider-dot'
    )

    /* ==============================================================
    Insert arrows in vue-slider markup       
    ================================================================ */

    // SliderArrows props store
    const sliderArrowPropsStore = Vue.observable({
      slider0: { isSliding: false },
      slider1: { isSliding: false },
      slider2: { isSliding: false },
      slider3: { isSliding: false },
      slider4: { isSliding: false },
      slider5: { isSliding: false },
      slider6: { isSliding: false },
      slider7: { isSliding: false },
      slider8: { isSliding: false },
      slider9: { isSliding: false }
    })

    // Update slideArrow props store
    EventBus.$on('changeIsSliding', ({ index, isSlidingStatus }) => {
      sliderArrowPropsStore[`slider${index}`].isSliding = isSlidingStatus
    })

    sliderDotsCollection.forEach((slider, index) => {
      // Insert x2 instances of arrow for each slider
      ;[...Array(2)].forEach(v => {
        const arrow = new ArrowClass({
          parent: this,
          propsData: { isSliding: this.sliders[index].isSliding }
        })
        // Reactive props workaround
        arrow._props = sliderArrowPropsStore[`slider${index}`]
        arrow.$mount() // pass nothing
        slider.appendChild(arrow.$el)
      })
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
    EventBus.$off('changeIsSliding')
    killTimeOuts(this.timeOuts)
  },
  methods: {
    setUniqueValues() {
      // 8 unique integers
      let randomUniqueIntegers = getUniqueRandomInts(9, 8)
      while (randomUniqueIntegers.includes(0)) {
        randomUniqueIntegers = getUniqueRandomInts(9, 8)
      }

      // 7 unique letters
      const indexOfLetterO = 14
      let randomUniqueLetters = getUniqueRandomInts(25, 7)
      while (randomUniqueLetters.includes(indexOfLetterO)) {
        randomUniqueLetters = getUniqueRandomInts(25, 7)
      }
      randomUniqueLetters = randomUniqueLetters.map(v => {
        return String.fromCharCode(v + 97).toUpperCase()
      })

      const randomUniqueValues = shuffleArray([
        ...randomUniqueIntegers,
        ...randomUniqueLetters
      ])
      return randomUniqueValues
    },
    setPairs(uniqueValues) {
      const pairs = uniqueValues
        .splice(-5, 5)
        .map(v => {
          return [v, v]
        })
        .flat()
      return shuffleArray(pairs)
    },
    generateSlidersData() {
      // Set 15 unique values (letters || integers)
      const uniqueValues = this.setUniqueValues()

      // Extract 5 pairs from uniqueValues (10 items)
      const pairs = this.setPairs(uniqueValues)

      // Destructurate pairs
      this.slidersPairs = [...pairs]

      // Constructor
      class SliderConstructor {
        constructor(endpoints, position) {
          this.endpoints = endpoints
          this.position = position
          this.isSliding = false
        }
      }

      // Set sliders data
      const slidersLength = 10
      ;[...Array(slidersLength)].forEach((_, i) => {
        // Set endpoints -> 1 unique value, 1 pair
        const endpoints = shuffleArray([
          ...uniqueValues.splice(-1),
          ...pairs.splice(-1)
        ])
        const positions = shuffleArray(['top', 'bottom'])
        // Build slider
        const slider = new SliderConstructor(endpoints, positions[0])

        // Push slider as component data
        this.sliders.push(slider)
      })
    },
    checkPuzzle() {
      // Set relation between position & endpoint
      const positionEndpointRelation = {
        top: 0,
        bottom: 1
      }
      // Check if highlighted values are pairs
      return this.sliders
        .map(v => v.endpoints[positionEndpointRelation[v.position]])
        .every((selectedValue, _, array) => {
          return array.filter(v => v === selectedValue).length > 1
        })
    },
    changeIsSlidingStore(index, isSlidingStatus) {
      EventBus.$emit('changeIsSliding', { index, isSlidingStatus })
    },
    changeSlider() {
      // Enable valid btn
      this.disableValid = false
      // Dropped sound
      this.$refs.dragDropped.playSound()
    },
    showHint() {
      // Set elements
      const pairs = this.$refs.puzzleContent.querySelectorAll(
        '.isValidPair .endpoint__data-inner .item'
      )
      const item1 = pairs[0]
      const item2 = pairs[1]

      // Complete event
      const showHintComplete = () => {
        pairs[0].removeAttribute('style')
        pairs[1].removeAttribute('style')
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

      const elementsToAnimate = [item1, item2]

      elementsToAnimate.forEach(item => {
        timelineHint.to(item, 0.5, {
          transform: 'scale(1.5)',
          color: '#ffffff',
          opacity: 1,
          zindex: 100,
          yoyo: true,
          repeat: 1,
          ease: Expo.easeInOut
        })
      })
    },
    setSliderPosition(sliderIndex, position) {
      // Enable valid btn
      this.disableValid = false

      // Dropped sound
      this.$refs.dragDropped.playSound()

      // Set slider
      this.sliders[sliderIndex].position = position
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
      transform: scale(1.6);
    }
  }

  &__sliders {
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    width: 100%;
    height: 100%;
    max-width: 550px;
    max-height: 250px;
  }
  .sliders {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 10px;
    margin: 0 30px;
    width: 100%;
  }

  &__slider {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__action {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
  }
}
.vue-slider {
  border: 2px solid $color-granny-smith;
  border-radius: 10px;

  &::v-deep {
    .vue-slider-process,
    .vue-slider-rail {
      background: transparent;
    }
    .vue-slider-process {
      pointer-events: none !important;
    }
    .vue-slider-dot {
      padding: 5px 3px;
      z-index: 0 !important;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-radius: 5px;
      width: 70% !important;
      height: 60px !important;
      background: lighten($color-granny-smith, 30%);
      &-handle {
        display: none;
      }
      .slider-arrow {
        &:nth-child(3) {
          transform: rotate(180deg);
        }
      }
    }
  }
}
.cta {
  width: 100px;
}
</style>
