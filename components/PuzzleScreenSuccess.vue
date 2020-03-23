<template>
  <div id="puzzleScreenSuccess" class="wrapper">
    <BaseLcdScreen />
    <BaseTopGui />
    <div ref="contentWrapper" class="wrapper__content content">
      <!-- TITLE -->
      <div class="content__row">
        <div
          ref="glitchTitle"
          :data-text="
            `${getDoorName[1].label}: ${
              currenthighsecuritystep === 1 ? '50' : '100'
            }%`
          "
          :class="{ halfDone: currenthighsecuritystep === 1 }"
          class="glitch"
        >
          {{ getDoorName[1].label }}:
          {{ currenthighsecuritystep === 1 ? '50' : '100' }}%
        </div>
      </div>
      <!-- ARROWS -->
      <div
        v-show="elements.displayArrows"
        ref="arrows"
        class="content__row content__row--arrows arrows"
      >
        <PuzzleScreenSuccessArrow
          :arrow-animation-done="arrowAnimationDone"
          class="arrows__arrow"
        />
        <PuzzleScreenSuccessArrow
          :arrow-animation-done="arrowAnimationDone"
          class="arrows__arrow"
        />
      </div>
      <div
        v-show="elements.displayInformations"
        ref="informations"
        class="content__row content__row--informations informations"
      >
        <!-- STATS -->
        <div class="informations__col informations__stats">
          <ul class="informations__list">
            <li class="informations__item">
              <label>ELAPSED:</label
              ><span>
                <vue-typer
                  v-if="elements.informations.displayTime"
                  :text="currentTime"
                  :repeat="0"
                  :pre-type-delay="500"
                  :type-delay="75"
                  caret-animation="solid"
                  @typed-char.once="typerStarted()"
                  @completed="displayInformationsDetails('displayIq')"
                ></vue-typer>
              </span>
            </li>
            <li class="informations__item">
              <label>IQ:</label
              ><span>
                <vue-typer
                  v-if="elements.informations.displayIq"
                  :text="setIq.toString()"
                  :repeat="0"
                  :pre-type-delay="500"
                  :type-delay="75"
                  caret-animation="solid"
                  @typed-char.once="typerStarted()"
                  @completed="displayInformationsDetails('displayRank')"
                ></vue-typer>
              </span>
            </li>
            <li class="informations__item">
              <label>RANK:</label
              ><span>
                <vue-typer
                  v-if="elements.informations.displayRank"
                  :text="setRank"
                  :repeat="0"
                  :pre-type-delay="500"
                  :type-delay="75"
                  caret-animation="solid"
                  @typed-char.once="typerStarted()"
                  @completed="displayInformationsDetails('displayMessage')"
                ></vue-typer>
              </span>
            </li>
          </ul>
        </div>
        <!-- BRAIN -->
        <div class="informations__col informations__brain">
          <PuzzleScreenSuccessBrain ref="brain" :updated-iq="parseInt(setIq)" />
        </div>
        <!-- MESSAGE -->
        <div class="informations__col informations__message">
          <vue-typer
            v-if="elements.informations.displayMessage"
            :text="successMessage"
            :repeat="0"
            :pre-type-delay="500"
            :type-delay="75"
            caret-animation="solid"
            @typed-char.once="typerStarted()"
            @completed="displayInformationsDetails('end')"
          ></vue-typer>
        </div>
      </div>
      <!-- ACTIONS -->
      <div
        v-show="elements.displayActions"
        ref="actions"
        class="content__row content__row--actions"
      >
        <PuzzleActions
          :cols-num="2"
          :success-half-done="currenthighsecuritystep === 1 ? true : false"
          :ctas="['quit', 'gotonextdoor']"
          context="success"
          @quit="$emit('quitGame', 'quitGame', 'screenSuccess')"
          @gotonextdoor="gotonextdoor"
        />
      </div>
      <!-- END CONTENT -->
    </div>

    <!-- Sounds -->
    <BaseSounds ref="soundTypeAuto" :loop="true" sound-source="type_auto" />
    <BaseSounds ref="soundSuccessBrain" sound-source="success_brain" />
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */

import { mapState } from 'vuex'
import { VueTyper } from 'vue-typer'
import { TimelineMax } from 'gsap'
import stepsData from '@/store/datas/steps'
import { killTimeOuts } from '@/utils'
import BaseLcdScreen from '@/components/BaseLcdScreen'
import BaseTopGui from '@/components/BaseTopGui'
import PuzzleScreenSuccessArrow from '@/components/PuzzleScreenSuccessArrow.vue'
import PuzzleScreenSuccessBrain from '@/components/PuzzleScreenSuccessBrain.vue'
import PuzzleActions from '@/components/PuzzleActions.vue'
export default {
  name: 'ScreenSuccess',
  components: {
    BaseLcdScreen,
    BaseTopGui,
    PuzzleScreenSuccessArrow,
    PuzzleScreenSuccessBrain,
    PuzzleActions,
    VueTyper
  },
  props: {
    currentTime: {
      type: String,
      required: true
    },
    successMessage: {
      type: String,
      required: true
    },
    currenthighsecuritystep: {
      required: true,
      validator: prop => typeof prop === 'number' || prop === null
    }
  },
  data() {
    return {
      timeOuts: [],
      routeId: this.$route.params.id,
      stepData: {},
      elements: {
        displayArrows: false,
        displayInformations: false,
        displayActions: false,
        informations: {
          displayTime: false,
          displayIq: false,
          displayRank: false,
          displayMessage: false
        }
      },
      arrowAnimationDone: false,
      successScreenLeft: false
    }
  },
  computed: {
    ...mapState({
      session: state => state.session
    }),
    getDoorName() {
      return Object.entries(this.stepData).find(step => {
        return step[0] === `step${this.routeId}`
      })
    },
    setIq() {
      // 70 = base | puzzlesSolved.length = factor | 5 = gap
      return this.session.iq
    },
    setRank() {
      const evalRank = () => {
        if (this.routeId < 4) {
          return 'LOW'
        }
        if (this.routeId >= 4 && this.routeId < 7) {
          return 'MEDIUM'
        }
        if (this.routeId >= 7) {
          return 'HIGH'
        }
      }
      return evalRank()
    }
  },
  mounted() {
    /* ==============================================================
                                INIT
    ================================================================ */
    // Display dialogs elements
    this.timeOuts.push(
      setTimeout(() => {
        this.displayElements()
      }, 800)
    )
  },
  beforeDestroy() {
    killTimeOuts(this.timeOuts)
  },
  created() {
    this.stepData = stepsData
  },
  methods: {
    displayElements(elementTrigger) {
      const fadeDisplayTimeline = (timeline, elementToAnimate) => {
        timeline.to(elementToAnimate, 1, {
          opacity: 1
        })
      }

      const displayActions = () => {
        this.elements.displayActions = true
      }

      const displayInformations = () => {
        this.elements.displayArrows = true
        this.elements.displayInformations = true

        // Init informations typer
        this.timeOuts.push(
          setTimeout(() => {
            // Update brain currentIq
            this.$refs.brain.updateCurrentIq()
            console.log('updateCurrentIq')
            if (!this.successScreenLeft) {
              this.$refs.soundSuccessBrain.playSound()
            }
          }, 1400)
        )
        this.timeOuts.push(
          setTimeout(() => {
            this.displayInformationsDetails('displayTime')
            // Stop arrow
            this.arrowAnimationDone = true
          }, 3400)
        )
      }

      const displayContentWrapper = () => {
        const { contentWrapper } = this.$refs
        const timelineContentWrapper = new TimelineMax()
        fadeDisplayTimeline(timelineContentWrapper, contentWrapper)
      }

      // Init display
      displayContentWrapper()
      displayInformations()
      displayActions()
    },
    typerStarted() {
      if (!this.successScreenLeft) {
        this.setSoundTypeAuto(true)
      }
    },
    setSoundTypeAuto(status) {
      if (status) {
        this.$refs.soundTypeAuto.playSound()
      } else {
        this.$refs.soundTypeAuto.stopSound()
      }
    },
    displayInformationsDetails(stringData) {
      this.setSoundTypeAuto(false)
      if (stringData !== 'displaySequenceComplete') {
        this.elements.informations[stringData] = true
      }
    },
    gotonextdoor() {
      console.log('gotonextdoor fn')
      this.successScreenLeft = true
      this.setSoundTypeAuto(false)
      this.$refs.soundSuccessBrain.stopSound()
      this.$emit('displayScreenAfterSuccess')
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  @include fullScreenContainer;

  padding: 0px 55px;
  &__content {
    opacity: 0;
    display: grid;
    width: 100%;
    max-width: 500px;
    z-index: 100;
    @include responsive(tablet) {
      transform: scale(1.75);
    }
  }
}
.content {
  &__row {
    &--informations {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
    }
    &--arrows,
    &--actions {
      margin-top: 30px;
      @include responsive(tablet) {
        // Re-scale down
        transform: scale(calc(100 / 175));
      }
    }
    &--informations {
      margin-top: 10px;
    }

    &--actions {
      .actionContent {
        height: 30px;
        @include responsive(tablet) {
          height: 3rem;
        }
      }
    }
  }

  // GLITCH
  @include glitch(standard);
  .glitch {
    // -> Init to transparent
    .pc {
      font-size: 23px;
    }
    &.halfDone {
      color: lighten($color-orange, 10%);
      &:before,
      &:after {
        text-shadow: -2px 0 $color-orange;
      }
    }
    &:before,
    &:after {
      text-shadow: -2px 0 $color-green;
    }
    // opacity: 0;
    opacity: 1;
    color: $color-green;
    font-size: 27px;
    @include responsive(tablet) {
      font-size: 35px;
    }
  }
}
// ARROWS
.arrows {
  display: flex;
  justify-content: center;
  align-items: center;
  &__arrow {
    margin: 0 10px;
    @include responsive(tablet) {
      margin: 0 30px;
    }
  }
}
// INFORMATIONS
.informations {
  &__col {
    text-align: left;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
  }

  &__list {
    width: 100%;
    list-style: none;
    @include stack(4);
  }
  &__item {
    &:not(:first-child) {
      padding-top: 4px;
    }
    &:not(:first-child) {
      border-top: 1px dashed rgba($color-granny-smith, 0.3);
    }
    label {
      color: rgba($color-granny-smith, 0.6);
    }
    span {
      color: $color-granny-smith;
      margin-left: 5px;
    }
  }
  &__brain {
    justify-content: center;
  }
  &__message {
    color: $color-granny-smith;
    line-height: 1.4rem;
    text-align: center;
  }
}
</style>

<style lang="scss">
//1
#puzzleScreenSuccess {
  .vue-typer {
    //white-space: pre;
    .custom.char {
      &.typed {
        color: $color-granny-smith;
      }
    }
    .custom.caret {
      &.typing,
      &.pre-type,
      &.idle,
      &.complete {
        background-color: $color-granny-smith;
      }
    }
  }
}
</style>
