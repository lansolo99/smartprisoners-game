<template>
  <div class="puzzleContainer">
    <BaseTopGui />
    <!-- <transition name="startup"> -->
    <div :class="context" class="intro-wrapper">
      <!-- Frame indicator -->
      <transition name="frameIndicator">
        <BaseFrameIndicator
          v-if="displayFrameIndicator"
          :route="route"
          context="highSecurityDoor"
        />
      </transition>
      <!-- Startup glitch title -->
      <transition name="startup">
        <div
          v-if="displayGlitchTitle && currentpuzzle"
          class="glitch-wrapper glitch-wrapper--title label"
        >
          <img
            :src="
              require(`@/assets/images/icons/startups/puzzle_${currentpuzzle}.svg`)
            "
            class="puzzleIcon"
          />
          <div :data-text="data.text1" class="glitch">
            {{ data.text1 }}
          </div>
        </div>
      </transition>
      <!-- Typers -->
      <div class="vue-typer-wrapper">
        <!-- Intro / Title -->
        <vue-typer
          v-if="displayTyperYear"
          :class="context"
          :repeat="0"
          :pre-type-delay="1000"
          :erase-on-complete="false"
          :type-delay="50"
          class="introTyperYear"
          text="2086"
          caret-animation="solid"
          @typed-char.once="typerStarted()"
          @typed="typerTyped()"
          @completed="initTyper()"
        ></vue-typer>
        <!-- End / Title -->
        <vue-typer
          v-if="displayTyperEndTitle"
          :class="context"
          :text="`Congrats ${sessionData.pseudo}!`"
          :repeat="0"
          :pre-type-delay="500"
          :erase-on-complete="false"
          :type-delay="50"
          class="introTyperEnd"
          caret-animation="solid"
          @typed-char.once="typerStarted()"
          @typed="typerTyped()"
          @completed="initTyper()"
        ></vue-typer>
      </div>
      <div class="vue-typer-wrapper">
        <!-- Main -->
        <vue-typer
          v-if="displayTyper"
          :class="context"
          :text="concatBlockTextString"
          :repeat="0"
          :pre-type-delay="introMainTextPreTypeDelay"
          :erase-on-complete="false"
          :type-delay="50"
          caret-animation="solid"
          @typed-char.once="typerStarted()"
          @typed="typerTyped()"
          @erased="mainTextErased()"
          @completed="displayCta()"
        ></vue-typer>
      </div>

      <!-- Start now CTA -->
      <transition name="mainCta">
        <div
          v-if="displayCtaMain"
          :class="context"
          class="cta cta--modal cta--unlock"
          @click="goToNextScreen(context)"
        >
          <!-- <img
            class="cta__icon cta__icon--startPuzzle"
            src="@/assets/images/icons/icon_work_dark-red.svg"
          /> -->
          <div class="cta__label">
            {{ pickRightCtaLabel }}
          </div>
        </div>
      </transition>

      <!-- Actions -->
      <PuzzleActions
        v-if="displayActions"
        :cols-num="2"
        :ctas="actionsCtaDisplay"
        context="video"
        @skip="goToNextScreen(context)"
      />
    </div>
    <!-- </transition> -->

    <!-- ProgressMap -->
    <transition name="mapprogress">
      <PuzzleScreenProgressMap v-if="displayProgressMap" class="progressMap" />
    </transition>

    <!-- DIALOGS -->
    <transition name="dialog">
      <Dialogs
        v-if="showDialogWrapper"
        ref="dialogs"
        :route="route"
        class="dialogsInScreenStoryTelling"
        @quitGame="quitGame"
      />
    </transition>

    <!-- Sounds -->
    <BaseSounds ref="soundTypeAuto" :loop="true" sound-source="type_auto" />
    <BaseSounds ref="soundBtnBase" sound-source="btn_base" />
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { VueTyper } from 'vue-typer'
import BaseTopGui from '@/components/BaseTopGui'
import Dialogs from '@/components/Dialogs'
import PuzzleActions from '@/components/PuzzleActions'
import BaseFrameIndicator from '@/components/BaseFrameIndicator'
import PuzzleScreenProgressMap from '@/components/PuzzleScreenProgressMap'
import { killTimeOuts, shuffleArray } from '@/utils'
import { showDialog } from '@/mixins/showDialog.js'
import { computeUserScore } from '@/mixins/computeUserScore'
export default {
  name: 'ScreenStoryTelling',
  components: {
    VueTyper,
    BaseTopGui,
    PuzzleActions,
    BaseFrameIndicator,
    PuzzleScreenProgressMap,
    Dialogs
  },
  mixins: [showDialog, computeUserScore],
  props: {
    context: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      route: {
        id: this.$route.params.id,
        level: '',
        security: '',
        currentHighSecurityStep: null
      },
      currentpuzzle: null,
      data: {},
      displayProgressMap: false,
      displayFrameIndicator: false,
      displayGlitchTitle: false,
      displayTyperYear: false,
      displayTyperEndTitle: false,
      displayTyper: false,
      displayCtaMain: false,
      displayCtaSkip: false,
      displayActions: false,
      displayResolvePuzzle: false,
      mainCtaLabel: ['Start game', 'Resolve puzzle'],
      timeOuts: [],
      introMainTextPreTypeDelay: 800,
      screenStoryTellingLeft: false,
      endTextFallback: false,
      endFormattedTotalTime: ''
    }
  },
  computed: {
    ...mapState({
      textData: state => state.scenario,
      doorsData: state => state.doors,
      puzzlesData: state => state.puzzles,
      sessionData: state => state.session
    }),
    ...mapGetters({
      usersLength: 'users/usersLength',
      showDialogWrapper: 'dialogs/showDialogWrapper',
      totalTime: 'session/totalTime'
    }),
    concatBlockTextString() {
      if (this.context === 'intro') return Object.values(this.data)
      if (this.context === 'startup') return Object.values(this.data).splice(1)
      if (this.context === 'end') {
        const string1 = Object.values(this.data)[0]
        const string2 = `Your total time is: \n${this.endFormattedTotalTime}`
        let string3 = ''
        switch (this.endTextFallback) {
          case false:
            /* eslint-disable prettier/prettier */
            string3 = `You are the ${this.usersLength}th prisonner \nto escape.`    
            /* eslint-enable prettier/prettier */
            break
          case true:
            string3 = Object.values(this.data)[2]
            break
        }
        /* eslint-enable prettier/prettier */
        return [string1, string2, string3]
      }
      return ''
    },
    pickRightCtaLabel() {
      if (this.context === 'intro') return this.mainCtaLabel[0]
      if (this.context === 'startup') return this.mainCtaLabel[1]
      return ''
    },
    actionsCtaDisplay() {
      return ['skipIntro']
    },
    getPuzzlesForRouteLevel() {
      return Object.values(this.puzzlesData)
        .filter(puzzle => puzzle.level === this.route.level)
        .map(puzzle => puzzle.id)
    }
  },
  created() {
    console.warn('SCREENSTORYTELLING')
    this.resetAllDialogsDisplay()
    // Set data
    switch (this.context) {
      case 'intro':
        this.introMainTextPreTypeDelay = 800
        this.data = this.textData.intro
        break
      case 'startup':
        this.timeOuts.push(
          setTimeout(() => {
            // Set door data
            this.route.level = this.doorsData[`door${this.route.id}`].level
            this.route.security = this.doorsData[
              `door${this.route.id}`
            ].security
            this.route.currentHighSecurityStep = this.sessionData.currentHighSecurityStep

            if (this.route.security === 'high') {
              this.displayFrameIndicator = true
            }

            if (!this.sessionData.directAccess) {
              // ? NORMAL ACCESS

              // -> Pick an unplayed & unsolved puzzle in the route level remaining list
              if (this.getUnPlayedPuzzles().length) {
                console.log('routeLevel', this.route.level)
                console.log(
                  'getPuzzlesForRouteLevel,',
                  this.getPuzzlesForRouteLevel
                )
                console.log(
                  'sessiondata.puzzlesSolved = ',
                  this.sessionData.puzzlesSolved
                )
                console.warn('unsolved puzzles = ', this.getUnsolvedPuzzles())
                console.warn('unplayed puzzles = ', this.getUnPlayedPuzzles())
                // Puzzles unplayed remainings
                console.log('Puzzles unplayed remainings')
                // Pick first puzzle from unplayed puzzles list
                this.currentpuzzle = this.getUnPlayedPuzzles()[0]
                console.log('set puzzle to : ', this.currentpuzzle)
              } else {
                // No puzzles unplayed remainings
                console.warn('No puzzles unplayed remainings')

                // Reset puzzled played list
                this.resetPuzzlePlayed()
                console.warn('unsolved puzzles = ', this.getUnsolvedPuzzles())
                console.warn('unplayed puzzles = ', this.getUnPlayedPuzzles())
                this.currentpuzzle = this.getUnPlayedPuzzles()[0]
              }

              // Set puzzle data
              this.data = this.textData.startups[`puzzle${this.currentpuzzle}`]
              // Store currentpuzzle + as puzzlePlayed in store session
              this.updatePuzzlePlayed(this.currentpuzzle)
              this.updateCurrentPuzzle(this.currentpuzzle)

              // Set currentHighSecurityStep for routes 3|6|9
              if (
                this.route.security === 'high' &&
                !this.route.currentHighSecurityStep
              ) {
                // High security step1
                this.route.currentHighSecurityStep = 1
                this.updateCurrentHighSecurityStep(
                  this.route.currentHighSecurityStep
                )
              } else if (
                this.route.security === 'high' &&
                this.route.currentHighSecurityStep
              ) {
                // Puzzle has just been changed
                if (!this.sessionData.puzzleChanged) {
                  // High security increment -> to step2
                  this.route.currentHighSecurityStep = 2
                  this.updateCurrentHighSecurityStep(
                    this.route.currentHighSecurityStep
                  )
                }
              } else {
                // Low security door -> set to null
                this.route.currentHighSecurityStep = null
                this.updateCurrentHighSecurityStep(
                  this.route.currentHighSecurityStep
                )
              }
            } else {
              // ? DIRECT ACCESS
              // Bypass standard logic for direct access
              this.currentpuzzle = this.sessionData.currentpuzzle
              this.data = this.textData.startups[`puzzle${this.currentpuzzle}`]
              // Reset direct access
              this.setDirectAccessToPuzzle(false)
            }
          }, 500)
        )
        break
      case 'end':
        this.computeUserScore(this.totalTime).then(totalTime => {
          this.endFormattedTotalTime = totalTime.human
        })
        break
    }

    setTimeout(() => {
      this.togglePuzzleChanged(false)
    }, 550)
  },
  mounted() {
    console.log('startup storytelling')
    // Display elements
    switch (this.context) {
      case 'intro':
        setTimeout(() => {
          this.displayTyperYear = true
          this.displayActions = true
        }, 1000)
        break
      case 'startup':
        // Display elements
        this.displayGlitchTitle = true

        this.timeOuts.push(
          setTimeout(() => {
            this.initTyper()
            this.displayActions = true
          }, 500)
        )

        break
      case 'end':
        switch (window.$nuxt.isOffline) {
          case false:
            this.introMainTextPreTypeDelay = 800
            this.fetchUsersData()
            break
          case true:
            this.endTextFallback = true
            this.data = this.textData.end
            this.displayTyperEndTitle = true
            this.displayActions = true
            break
        }

        break
    }
  },
  beforeDestroy() {
    killTimeOuts(this.timeOuts)
  },
  methods: {
    ...mapActions({
      getUsersData: 'users/getUsersData'
    }),
    ...mapMutations({
      resetAllDialogsDisplay: 'dialogs/reset',
      resetSessionData: 'session/reset',
      updatePuzzlePlayed: 'session/updatePuzzlePlayed',
      resetPuzzlePlayed: 'session/resetPuzzlePlayed',
      updateCurrentPuzzle: 'session/updateCurrentPuzzle',
      updateDialogDisplay: 'dialogs/updateDialogDisplay',
      updateCurrentHighSecurityStep: 'session/updateCurrentHighSecurityStep',
      setDirectAccessToPuzzle: 'session/setDirectAccessToPuzzle',
      togglePuzzleChanged: 'session/togglePuzzleChanged'
    }),
    typerStarted() {
      if (!this.screenStoryTellingLeft) {
        this.setSoundTypeAuto(true)
      }
    },
    typerTyped() {
      this.setSoundTypeAuto(false)
    },
    initTyper() {
      setTimeout(() => {
        this.displayTyper = true
      }, 500)
    },
    mainTextErased() {
      console.log('mainTextErased')

      // relaunch soundTypeAuto
      this.timeOuts.push(
        setTimeout(() => {
          if (!this.screenStoryTellingLeft) {
            this.setSoundTypeAuto(true)
          }
        }, 800)
      )

      // Hide title
      switch (this.context) {
        case 'intro':
          this.displayTyperYear = false
          break
        case 'end':
          this.displayTyperEndTitle = false
          break
      }
    },
    setSoundTypeAuto(status) {
      if (status) {
        this.$refs.soundTypeAuto.playSound()
      } else {
        this.$refs.soundTypeAuto.stopSound()
      }
    },
    displayCta() {
      // Typer texts completed
      console.log('displayCta')
      this.timeOuts.push(
        setTimeout(() => {
          if (this.context === 'intro') {
            this.displayTyper = false
            this.displayCtaMain = true
            this.displayActions = false
          }
          if (this.context === 'startup') {
            this.displayResolvePuzzle = true
          }
          if (this.context === 'end') {
            this.timeOuts.push(
              setTimeout(() => {
                this.$router.push('/highscores')
              }, 1500)
            )
          }
        }, 1400)
      )
    },
    hideTypers() {
      this.$refs.soundTypeAuto.stopSound()
      killTimeOuts(this.timeOuts)
    },
    goToNextScreen(context) {
      this.hideTypers()
      this.screenStoryTellingLeft = true

      switch (context) {
        case 'intro':
          this.$refs.soundBtnBase.playSound()
          this.displayProgressMap = true
          this.timeOuts.push(
            setTimeout(() => {
              this.$router.push('/transitions/1')
            }, 6500)
          )
          break
        case 'startup':
          console.log(`goToNextScreen: /puzzles/${this.route.id}`)

          this.$router.push(`/puzzles/${this.route.id}`)
          break
        case 'end':
          this.$router.push(`/highscores`)
          break
      }
    },
    getUnsolvedPuzzles() {
      return this.getPuzzlesForRouteLevel.filter(puzzle => {
        return !this.sessionData.puzzlesSolved.includes(puzzle)
      })
    },
    getUnPlayedPuzzles() {
      return shuffleArray(
        this.getUnsolvedPuzzles()
          .filter(puzzle => {
            // all puzzles but the current one
            return !this.sessionData.puzzlesPlayed.includes(puzzle)
          })
          .filter(puzzle => {
            return puzzle !== this.sessionData.currentPuzzle
          })
      )
    },
    quitGame() {
      console.log('quitGame')
      // Reset session store
      this.resetSessionData()
      this.$router.push('/menu')
      // Refresh app
      setTimeout(() => {
        location.reload(true)
      }, 500)
    },
    fetchUsersData() {
      // Vuex api call -> fetch users data
      const usersStoreUpdate = true
      this.getUsersData({ usersStoreUpdate })
        .then(res => {
          console.log('users updated in store')
          this.data = this.textData.end
          this.displayTyperEndTitle = true
          this.displayActions = true
        })
        .catch(res => {
          console.log('users update error')

          // this.data = ...
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.puzzleContainer {
  height: 100vw;
  display: grid;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 1rem;
}
.intro-wrapper {
  max-width: 400px;
  width: 350px;
  &.startup {
    width: 400px;
    @media only screen and (min-width: 730px) {
      width: 500px;
      min-width: 500px;
    }
  }
  max-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.cta {
  @include cta;

  &--unlock {
    background-color: $color-theme;
    color: white;
    animation: labelBlinking 1s infinite;
    @keyframes labelBlinking {
      0% {
        color: $color-anthracite;
      }
      49% {
        color: $color-anthracite;
      }
      50% {
        color: rgba(white, 0.8);
      }
      100% {
        color: rgba(white, 0.8);
      }
    }
    @include responsive(tablet) {
      transform: scale(1.2);
    }
  }
  &.startup {
    margin-top: 20px;
  }
}

// GLITCH
.glitch-wrapper {
  @include glitch(puzzleTitle);
  display: flex;
  flex-direction: column;
  align-items: center;
  @include responsive(tablet) {
    margin-bottom: 15px;
  }

  .glitch {
    color: $color-theme;
    padding: 10px 30px 5px;
    font-size: 30px;
    @include responsive(tablet) {
      font-size: 2.6rem;
    }
  }
}

// Icon
.puzzleIcon {
  width: 130px;
  @media only screen and (min-width: 730px) {
    width: 190px;
  }
}

.dialogsInScreenStoryTelling {
  z-index: 3500;
}

// startup transition
.startup-enter-active,
.startup-leave-active {
  transition: opacity 0.5s 0s ease-out;
}

.startup-enter,
.startup-leave-to {
  opacity: 0;
}
</style>
<style lang="scss">
.intro-wrapper {
  .vue-typer-wrapper {
    text-align: center;
    @include responsive(tablet) {
      transform: scale(1.7);
    }
  }
  .vue-typer {
    &-wrapper {
      display: block;
    }
    display: block;

    &.introTyperYear,
    &.introTyperEnd {
      @include responsive(tablet) {
        margin-bottom: 20px;
      }
      .custom.char {
        &.typed {
          font-size: 30px;
          color: $color-theme;
        }
      }
    }

    .custom.char {
      &.typed {
        font-size: 20px;
        text-transform: uppercase;
        color: $color-granny-smith;
      }
      &.selected {
        font-size: 20px;
        color: $color-anthracite;
        text-transform: uppercase;
        background-color: $color-theme;
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

.high-security-door {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 1rem;
  right: 1rem;
  left: 1rem;
  height: 30px;
  z-index: 3000;
  color: $color-orange;
  background-color: rgba(black, 0.2);
  span {
    color: lighten($color-orange, 30%);
    margin-left: 7px;
  }
}

.progressMap {
  z-index: 8000 !important;
}

// TRANSITONS

.mainCta-enter-active,
.mainCta-leave-active {
  transition: all 0.5s 0.2s cubic-bezier(0, 1.32, 0.27, 1.05);
}
.mainCta-enter,
.mainCta-leave-to {
  opacity: 0;
  transform: scale(0);
}

.mapprogress-enter-active,
.mapprogress-leave-active {
  transition: opacity 0.2s ease-out;
}
.mapprogress-enter,
.mapprogress-leave-to {
  opacity: 0;
}

.frameIndicator-enter-active {
  transition: opacity 0.8s ease-in-out;
}
.frameIndicator-enter {
  opacity: 0;
}
</style>
