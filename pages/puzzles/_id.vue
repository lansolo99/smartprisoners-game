<template>
  <div class="puzzleContainer">
    <!-- TOPBAR -->
    <transition name="puzzle">
      <PuzzleTopbar
        v-if="renderTopBar"
        :currentpuzzledata="currentPuzzleData"
        :session="session"
      />
    </transition>

    <!-- PUZZLES -->
    <transition name="puzzle">
      <component :is="componentInstance" v-if="renderPuzzle" />
    </transition>

    <!-- SUCCESS -->
    <transition name="dialog">
      <PuzzleScreenSuccess
        v-if="puzzleSuccessScreen"
        :current-time="totalElapsedTime"
        :success-message="currentPuzzleSuccessMessage"
        :currenthighsecuritystep="route.currentHighSecurityStep"
        @quitGame="showDialog"
        @displayScreenAfterSuccess="displayScreenAfterSuccess()"
      />
    </transition>

    <!-- DIALOGS -->

    <transition name="dialog">
      <Dialogs
        v-if="showDialogWrapper"
        ref="dialogs"
        :route="route"
        :puzzle-success-screen="puzzleSuccessScreen"
        @quitGame="quitGame"
        @backToGame="backToGame"
        @hint="showHint"
        @noNetworkShop="setNoNetworkDialog('puzzle', 'shop')"
        @hidePuzzle="hideCurrentPuzzle"
        @changePuzzle="changePuzzle"
        @restartGame="restartGame"
      />
    </transition>

    <!-- PROGRESS MAP -->
    <transition name="dialog">
      <PuzzleScreenProgressMap v-if="progressMap" />
    </transition>

    <!-- RESET LAYER -->
    <transition name="fadeLayer">
      <PuzzleResetLayer v-if="puzzleResetLayer" />
    </transition>

    <!-- SHOW HINT INDICATOR -->
    <transition name="fadeLayer">
      <BaseFrameIndicator v-if="renderShowHintIndicator" context="showHint" />
    </transition>

    <!-- HELPERS -->
    <div v-if="displayHelper" class="dev_helper">
      <div @click="resolvePuzzle()">
        Resolve
      </div>
      <!-- <div @click="addNewPuzzleTime()">
        Add puzzle time
      </div> -->
      <!-- <div @click="setAudiosVolume()">
        Mute/Unmute sounds
      </div> -->
    </div>
    <!-- Sounds -->
    <BaseSounds ref="generalGameOver" sound-source="general_game_over" />
  </div>
</template>

<script>
/* eslint-disable vue/require-component-is */
/* eslint-disable vue/attributes-order */
import { mapState, mapGetters, mapMutations } from 'vuex'
import { EventBus } from '@/bus'
import { killTimeOuts } from '@/utils'
import { noNetwork } from '@/mixins/noNetwork.js'
import { showDialog } from '@/mixins/showDialog.js'
import { hideDialog } from '@/mixins/hideDialog.js'
import PuzzleTopbar from '@/components/PuzzleTopbar'
import PuzzleResetLayer from '@/components/PuzzleResetLayer'
import PuzzleScreenSuccess from '@/components/PuzzleScreenSuccess'
import PuzzleScreenProgressMap from '@/components/PuzzleScreenProgressMap'
import BaseFrameIndicator from '@/components/BaseFrameIndicator'
import Dialogs from '@/components/Dialogs'
export default {
  name: 'PuzzleRouteId',
  components: {
    PuzzleTopbar,
    PuzzleResetLayer,
    PuzzleScreenSuccess,
    PuzzleScreenProgressMap,
    BaseFrameIndicator,
    Dialogs
  },
  mixins: [showDialog, noNetwork, hideDialog],
  data() {
    return {
      routeId: this.$route.params.id,
      route: {
        id: this.$route.params.id,
        level: '',
        security: '',
        currentHighSecurityStep: null
      },
      timeOuts: [],
      renderTopBar: false,
      renderPuzzle: false,
      renderShowHintIndicator: false,
      topBarKey: 1,
      puzzleResetLayer: false,
      puzzleSuccessScreen: false,
      progressMap: false,
      displayHelper: false
    }
  },
  computed: {
    componentInstance() {
      return () => import(`@/components/Puzzle${this.session.currentpuzzle}`)
    },
    ...mapState({
      session: state => state.session,
      puzzlesData: state => state.puzzles,
      doorsData: state => state.doors
    }),
    ...mapGetters({
      totalTime: 'session/totalTime',
      showDialogWrapper: 'dialogs/showDialogWrapper'
    }),
    currentPuzzleData() {
      return this.puzzlesData[`puzzle${this.session.currentpuzzle}`]
    },
    currentPuzzleTime() {
      return this.session.currentPuzzleTime.substring(3)
    },
    totalElapsedTime() {
      const regex = /:/gi
      return this.totalTime.formatted.slice(0, 11).replace(regex, "'")
    },
    currentPuzzleSuccessMessage() {
      return this.currentPuzzleData.successMessage
    }
  },
  created() {
    // Set door data
    this.route.level = this.doorsData[`door${this.route.id}`].level
    this.route.security = this.doorsData[`door${this.route.id}`].security
    this.route.currentHighSecurityStep = this.session.currentHighSecurityStep
  },
  mounted() {
    this.initPuzzle()

    /* =============================================
                   DEV HELPERS 
    ============================================= */
    // ------- > Display helpers
    // this.displayHelper = true

    // ------- > Quickly Display puzzle
    // this.topBarKey += 1
    // this.renderTopBar = true
    // this.renderPuzzle = true

    // ------- > Display ShowHint indicator
    // this.renderShowHintIndicator = true

    // ------- > Start current puzzle
    // this.topBarKey += 1
    // this.renderTopBar = true
    // this.renderPuzzle = true
    // this.timeOuts.push(
    //   setTimeout(() => {
    //     this.startPuzzle()
    //   }, 500)
    // )

    // ------- > Start puzzle + success dialog
    // this.topBarKey += 1
    // this.renderTopBar = true
    // this.renderPuzzle = true
    // setTimeout(() => {
    //   this.startPuzzle()
    // }, 500)
    // setTimeout(() => {
    //   EventBus.$emit('puzzleSuccess')
    // }, 6000)

    // ------- > Stop bubbling
    // setTimeout(() => {
    //   EventBus.$emit('crtPreventBubbling', true)
    // }, 3000)

    // ------- > Display reset layer
    // this.puzzleResetLayer = true

    // ------- > Display puzzleGameOver layer
    // this.timeOuts.push(
    //   setTimeout(() => {
    //     this.startPuzzle()
    //   }, 500)
    // )
    // setTimeout(() => {
    //   EventBus.$emit('countdownPause')
    //   EventBus.$emit('countdownIconPause')
    //   EventBus.$emit('timerStop')
    //   EventBus.$emit('puzzleGameOver')
    // }, 3000)

    // ------- > Display generalGameOver layer
    // this.timeOuts.push(
    //   setTimeout(() => {
    //     this.startPuzzle()
    //   }, 500)
    // )

    // this.timeOuts.push(
    //   setTimeout(() => {
    //     EventBus.$emit('generalGameOver')
    //   }, 3000)
    // )

    // ------- > Display progress map
    // this.progressMap = true

    // ------- > display success dialog
    // setTimeout(() => {
    //   this.startPuzzle()
    // }, 500)
    // setTimeout(() => {
    //   EventBus.$emit('puzzleSuccess')
    // }, 2000)

    /* =============================================
                        EVENTS
    ============================================= */

    // PUZZLE SUCCESS
    EventBus.$on('puzzleSuccess', () => {
      this.puzzleSuccess()
    })

    // PUZZLE GAME OVER
    EventBus.$on('puzzleGameOver', () => {
      // Delay
      this.timeOuts.push(
        setTimeout(() => {
          // Display dialog resetLayer
          this.puzzleResetLayer = true
          // Hide crt
          this.timeOuts.push(
            setTimeout(() => {
              EventBus.$emit('crtPreventBubbling', false)
            }, 300)
          )
        }, 700)
      )
      // rerender puzzle
      this.timeOuts.push(
        setTimeout(() => {
          this.forcePuzzleRerender()
        }, 1400)
      )
    })

    // PUZZLE GENERAL GAME OVER
    EventBus.$on('generalGameOver', () => {
      console.log('generalGameOver')
      EventBus.$emit('countdownPause')
      EventBus.$emit('countdownIconPause')
      EventBus.$emit('timerStop')

      // Display dialog gameOver with delay
      this.timeOuts.push(
        setTimeout(() => {
          EventBus.$emit('crtPreventBubbling', false)
          // Display dialog
          const dialog = 'gameOver'
          const status = true
          this.updateDialogDisplay({ dialog, status })
          // General gameOver sound
          this.$refs.generalGameOver.playSound()
        }, 700)
      )
    })

    // SHOWINT COMPLETE
    EventBus.$on('showHintComplete', () => {
      this.renderShowHintIndicator = false
      this.backToGame()
      // Set crtPreventBubbling to false : unfreeze all actions
      EventBus.$emit('crtPreventBubbling', false)
    })

    // HIDE SHOWHINT INDICATOR
    EventBus.$on('hideShowHintIndicator', () => {
      this.renderShowHintIndicator = false
    })
  },
  beforeDestroy() {
    this.resetAllDialogsDisplay()
    // Refresh app
    console.log('app will reload in 200ms')
    setTimeout(() => {
      location.reload(true)
    }, 200)

    killTimeOuts(this.timeOuts)
    EventBus.$off('puzzleSuccess')
    EventBus.$off('puzzleGameOver')
    EventBus.$off('generalGameOver')
    EventBus.$off('showHintComplete')
    EventBus.$off('hideShowHintIndicator')
    this.renderTopBar = false
    this.renderPuzzle = false
    this.progressMap = false
  },
  methods: {
    ...mapMutations({
      resetAllDialogsDisplay: 'dialogs/reset',
      resetSessionData: 'session/reset',
      updateDialogDisplay: 'dialogs/updateDialogDisplay',
      updateUserSession: 'session/updateUserSession',
      updateUserIQ: 'session/updateUserIQ',
      updatePuzzleSolved: 'session/updatePuzzleSolved',
      resetPuzzlePlayed: 'session/resetPuzzlePlayed',
      resetPuzzleSolved: 'session/resetPuzzleSolved',
      setAudiosVolume: 'session/setAudiosVolume',
      recordCurrentPuzzleTime: 'session/recordCurrentPuzzleTime'
    }),
    initPuzzle() {
      this.topBarKey += 1
      this.renderTopBar = true
      this.renderPuzzle = false
      this.$nextTick(() => {
        // Add puzzle component back in
        this.renderPuzzle = true
      })
      this.timeOuts.push(
        setTimeout(() => {
          this.startPuzzle()
        }, 500)
      )
    },
    puzzleSuccess() {
      // Display success dialog
      this.puzzleSuccessScreen = true
      // Update puzzleSolved
      this.updatePuzzleSolved(this.session.currentpuzzle)
      // Update IQ -> +5
      this.updateUserIQ()
    },
    startPuzzle() {
      // Launch timer
      EventBus.$emit('newPuzzleReset')
    },
    forcePuzzleRerender() {
      EventBus.$emit('countDownReset')
      // Remove puzzle component from the DOM
      this.renderPuzzle = false
      this.$nextTick(() => {
        // Add puzzle component back in
        this.renderPuzzle = true
      })
      // Display new puzzle back in
      this.timeOuts.push(
        setTimeout(() => {
          // Redisplay puzzle
          this.puzzleResetLayer = false
          // New Puzzle reset
          EventBus.$emit('newPuzzleReset')
        }, 1000)
      )
    },
    displayScreenAfterSuccess() {
      console.log('displayScreenAfterSuccess')
      // Reset puzzleSolved before upgrading route category
      if (this.routeId === '4' || this.routeId === '7') {
        this.resetPuzzlePlayed()
        this.resetPuzzleSolved()
      }

      if (this.routeId !== '10') {
        // display map first
        this.displayMap()
      } else {
        // display last transition
        this.timeOuts.push(
          setTimeout(() => {
            this.$router.push('/transitions/end')
          }, 200)
        )
      }
    },
    displayMap() {
      if (this.route.currentHighSecurityStep === 1) {
        console.warn('currentHighSecurityStep = 1, skip map')
        // High security door step1 -> skip map
        this.timeOuts.push(
          setTimeout(() => {
            this.setNextRoute()
          }, 200)
        )
      } else {
        console.warn('currentHighSecurityStep != 1, show map')
        // Low security door || High security step 2
        this.timeOuts.push(
          setTimeout(() => {
            this.progressMap = true
          }, 200)
        )
        this.timeOuts.push(
          setTimeout(() => {
            // Change route
            this.setNextRoute()
          }, 6500)
        )
      }
    },
    showHint() {
      // Set crtPreventBubbling to true : freeze all actions during showHint sequence
      EventBus.$emit('crtPreventBubbling', true)
      // Display show int indicator
      this.timeOuts.push(
        setTimeout(() => {
          this.renderShowHintIndicator = true
        }, 500)
      )
      // Trigger showHint method in current puzzle
      this.timeOuts.push(
        setTimeout(() => {
          // Trigger event
          EventBus.$emit('showHint')
        }, 1000)
      )
    },
    changePuzzle() {
      console.log(
        'changepuzzle method is triggered, go to startup/ with same route'
      )
      this.$router.push('/startups/' + parseInt(this.$route.params.id))
    },
    setNextRoute() {
      if (
        this.route.security === 'high' &&
        this.route.currentHighSecurityStep === 1
      ) {
        // Same route for high security step2
        this.$router.push('/startups/' + parseInt(this.$route.params.id))
      } else {
        // Increment route id
        this.$router.push(
          '/transitions/' + (parseInt(this.$route.params.id) + 1)
        )
        // this.$router.push('/startups/' + (parseInt(this.$route.params.id) + 1))
      }
    },
    restartGame() {
      // Reset session store
      this.resetSessionData()
      // to change for intermediate route intro
      this.$router.push('/intro')
    },
    quitGame() {
      // Reset session store
      console.log('quitGame method in ID')
      this.puzzleSuccessScreen = false
      this.resetSessionData()
      this.$router.push('/menu')
      this.renderTopBar = false
      this.renderPuzzle = false
      // Refresh app
      // setTimeout(() => {
      //   location.reload(true)
      // }, 500)
    },
    backToGame() {
      // Unpause countdown
      EventBus.$emit('timerStart')
      EventBus.$emit('countdownRestart')
      EventBus.$emit('countdownIconRestart')
    },
    hideCurrentPuzzle() {
      console.warn('hideCurrentPuzzle')
      this.renderPuzzle = false
      this.renderTopBar = false
    },
    resolvePuzzle() {
      EventBus.$emit('puzzleSuccess')
    },
    addNewPuzzleTime() {
      console.log('addNewPuzzleTime')
      // this.recordCurrentPuzzleTime('00:00:02.941')
      console.log('totaltime', this.totalTime)
    }
  }
}
</script>

<style lang="scss" scoped>
.puzzleContainer {
  //background-color: $color-anthracite;
  display: grid;
  height: 100vh;
  padding: 1rem;
  grid-row-gap: 1rem;
  grid-template-columns: auto;
  grid-template-rows: 3rem auto;
  @include responsive(mobile) {
    grid-template-rows: 2rem auto;
  }
  .dev_helper {
    position: absolute;
    color: white;
    bottom: 10px;
    right: 10px;
    z-index: 200;
    div {
      text-align: center;
      padding: 5px 10px;
      margin: 2px;
      background-color: red;
      color: white;
      border: none;
      font-size: 1rem;
    }
  }
}

// PuzzleResetLayer transition
.fadeLayer-enter-active,
.fadeLayer-leave-active {
  transition: opacity 0.1s ease-out;
}
.fadeLayer-enter,
.fadeLayer-leave-to {
  opacity: 0;
}

// startup transition
.startup-enter-active {
  transition: opacity 0.2s ease-in;
}
.startup-leave-active {
  transition: opacity 0.5s ease-out;
}

.startup-enter,
.startup-leave-to {
  opacity: 0;
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

// puzzle transition
.puzzle-enter-active,
.puzzle-leave-active {
  opacity: 1;
  transition: opacity 0.5s 1s ease-in-out;
}

.puzzle-enter,
.puzzle-leave-to {
  opacity: 0;
}
</style>

<style>
.page-enter-active,
.page-leave-active {
  transition-property: opacity;
  transition-timing-function: ease-in-out;
  transition-duration: 100ms;
}
.page-enter,
.page-leave-to {
  opacity: 0;
}
</style>
