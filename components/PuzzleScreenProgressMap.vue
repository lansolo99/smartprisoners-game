<template>
  <div id="puzzleScreenProgressMap" class="wrapper">
    <BaseLcdScreen />
    <div
      :class="{ displayContent: displayContent }"
      class="wrapper__content content"
    >
      <div class="content__col iqClass">
        <div class="iqClass__title">LOW IQ</div>
        <div v-for="(bar, barIndex) in 5" :key="barIndex" class="pattern1">
          <div class="pattern1__bar"></div>
          <div class="pattern1__bar"></div>
        </div>
      </div>
      <div class="content__col">
        <div class="iqClass__title">MEDIUM IQ</div>
        <div v-for="(bar, barIndex) in 5" :key="barIndex" class="pattern2">
          <div class="pattern2__bar"></div>
          <div class="pattern2__bar"></div>
        </div>
      </div>
      <div class="content__col">
        <div class="iqClass__title">HIGH IQ</div>
        <div v-for="(bar, barIndex) in 5" :key="barIndex" class="pattern1">
          <div class="pattern1__bar"></div>
          <div class="pattern1__bar"></div>
        </div>
        <!-- Legend -->
        <div class="content__legend legend">
          <ul>
            <li>
              <PuzzleScreenProgressMapDot class="legend__bullet" />
              Low Security Door
            </li>
            <li>
              <PuzzleScreenProgressMapDot
                class="legend__bullet"
                security-level="high"
              />
              High Security Door
            </li>
          </ul>
        </div>
      </div>
      <!-- Map details -->
      <div ref="network" class="content__network network">
        <!-- Network lines -->
        <div id="backNetwork" class="network__line"></div>
        <div id="activeNetwork" class="network__line"></div>
        <!-- Steps -->
        <PuzzleScreenProgressMapStep
          v-for="(step, index) in backTrack"
          :id="parseInt(index + 1)"
          ref="step"
          :key="index"
          :style="`left: ${parseInt(step[0] - 40)}px; top:${step[1] - 40}px`"
          :label="steps[`step${index + 1}`].label"
          :label-position="steps[`step${index + 1}`].labelPosition"
          :security-level="steps[`step${index + 1}`].securityLevel"
          :current-state="evalStepsState(parseInt(index + 1))"
          class="step"
        />
      </div>
    </div>
  </div>
</template>

<script>
import SVG from 'svg.js'
import customEasing from '@/utils/svg.easing'
import BaseLcdScreen from '@/components/BaseLcdScreen'
import { killTimeOuts } from '@/utils'
import PuzzleScreenProgressMapDot from '@/components/PuzzleScreenProgressMapDot.vue'
import PuzzleScreenProgressMapStep from '@/components/PuzzleScreenProgressMapStep.vue'
import stepDatas from '@/store/datas/steps'

export default {
  name: 'ProgressMap',
  components: {
    PuzzleScreenProgressMapDot,
    PuzzleScreenProgressMapStep,
    BaseLcdScreen
  },
  data() {
    return {
      timeOuts: [],
      displayContent: false,
      routeId: this.$route.params.id,
      backTrack: [
        [37, 150],
        [101, 150],
        [164, 150],
        [164, 210],
        [280, 210],
        [280, 155],
        [280, 100],
        [380, 100],
        [380, 150],
        [460, 150]
      ],
      activeTrackPolyline: {},
      activeTrack: [],
      steps: stepDatas,
      currentStep: null
    }
  },
  computed: {
    stepRadius() {
      return typeof parseInt(this.$refs.step[0].$el.clientWidth / 2)
    }
  },
  mounted() {
    this.drawBackTrack()
    this.drawActiveTrack()
    this.timeOuts.push(
      setTimeout(() => {
        this.displayContent = true
      }, 500)
    )
    //
    if (this.currentStep !== 'intro') {
      this.timeOuts.push(
        setTimeout(() => {
          this.updateCurrentStepState()
        }, 1500)
      )
    } else {
      this.timeOuts.push(
        setTimeout(() => {
          this.currentStep = 1
        }, 2000)
      )
    }
  },
  beforeDestroy() {
    killTimeOuts(this.timeOuts)
  },
  created() {
    // Init context
    this.currentStep =
      this.$route.name === 'intro' ? 'intro' : parseInt(this.$route.params.id)

    // Import svg.js custom easings
    customEasing()
    this.setActiveTrackDatas()
  },
  methods: {
    drawBackTrack() {
      const draw = SVG('backNetwork').size(
        this.$refs.network.clientWidth,
        this.$refs.network.clientHeight
      )

      // Draw polyline
      const polyline = draw.polyline(this.backTrack)
      polyline.fill('none')
      polyline.stroke({
        color: '#3B5BB2',
        width: 3,
        linecap: 'round',
        linejoin: 'round'
      })
    },
    setActiveTrackDatas() {
      const activeTrackDatas = this.backTrack.filter((node, index) => {
        return index + 1 <= this.routeId
      })
      this.activeTrack = activeTrackDatas
    },
    drawActiveTrack() {
      const draw = SVG('activeNetwork').size(
        this.$refs.network.clientWidth,
        this.$refs.network.clientHeight
      )
      // Draw polyline
      const polyline = draw.polyline(this.activeTrack)
      polyline.fill('none')
      polyline.stroke({
        color: '#FFFFFF',
        width: 3,
        linecap: 'round',
        linejoin: 'round'
      })

      // Store polyline
      this.activeTrackPolyline = polyline
    },
    evalStepsState(stepId) {
      if (this.currentStep !== 'intro') {
        if (stepId < this.currentStep) return 'passed'
        if (stepId === this.currentStep) return 'on'
        if (stepId > this.currentStep) return 'off'
      } else {
        return 'off'
      }
    },
    updateCurrentStepState() {
      // Update currentStep
      this.timeOuts.push(
        setTimeout(() => {
          this.currentStep += 1
        }, 1300)
      )

      // Update activeTrack
      this.timeOuts.push(
        setTimeout(() => {
          this.activeTrackPolyline
            .animate(1900, 'quartOut')
            .plot([...this.activeTrack, this.backTrack[this.routeId]])
        }, 500)
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  @include fullScreenContainer;
  padding: 0px 30px;
  &__content {
    display: grid;
    gap: 15px;
    width: 100%;
    height: 270px;
    max-width: 500px;
    @include responsive(tablet) {
      transform: scale(1.75);
    }
  }
}
.content {
  transition: all 0.5s ease-in-out;
  opacity: 0;
  &.displayContent {
    opacity: 1;
  }
  grid-template-columns: repeat(3, 1fr);
  position: relative;
  &__col {
    display: grid;
    grid-template-rows: repeat(6, 1fr);
    gap: 15px;
    position: relative;
  }

  &__network {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  &__legend {
    position: absolute;
    bottom: 0;
    right: 0;
    background-color: red;
  }
}

.iqClass {
  &__title {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 8px;
    color: rgba($color-granny-smith, 0.5);
    border-top: 1px solid $color-orange;
    border-left: 1px solid $color-orange;
    border-right: 1px solid $color-orange;
  }
}

.pattern1 {
  display: flex;
  flex-direction: column;
  &__bar {
    width: 100%;
    background-color: rgba($color-granny-smith, 0.1);

    &:nth-child(1) {
      flex: 1 0 15px;
    }
    &:nth-child(2) {
      margin-top: 4px;
      flex: 1 1 auto;
    }
  }
}

.pattern2 {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  &__bar {
    width: 100%;
    background-color: rgba($color-granny-smith, 0.1);
    flex: 0 0 6px;
  }
}

.legend {
  width: 100%;
  padding: 10px;
  background: $color-anthracite;
  border: 1px dashed $color-orange;
  ul {
    list-style: none;
    color: white;
    text-transform: uppercase;
    text-align: left;
    & > li + li {
      margin-top: 10px;
    }
  }
  li {
    position: relative;
    font-size: 13px;
    padding-left: 27px;
  }
  &__bullet {
    width: 20px;
    height: 20px;
    position: absolute;
    top: -3px;
    left: 0;
  }
}
.step {
  position: absolute;
  top: 0;
  left: 0;
}

.network {
  &__line {
    position: absolute;
  }
}

// map transition
.map-enter-active,
.map-leave-active {
  transition: opacity 0.5s ease-out;
}

.map-enter,
.map-leave-to {
  opacity: 0;
}
</style>
