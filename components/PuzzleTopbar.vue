<template>
  <div ref="topbar" class="puzzleContainer__gridTop topbar">
    <nav class="topbar__nav nav">
      <!-- Home -->
      <div
        class="cta cta--puzzleTopBar cta--puzzleTopBar-home"
        @click="setNavAction('quitGame')"
      >
        <img class="cta__icon" src="@/assets/images/icons/icon_home.svg" />
      </div>
      <!-- Settings -->
      <div
        class="cta cta--puzzleTopBar cta--puzzleTopBar-settings"
        @click="setNavAction('settings')"
      >
        <img class="cta__icon" src="@/assets/images/icons/icon_work.svg" />
      </div>
      <!-- Info -->
      <div
        class="cta cta--puzzleTopBar cta--puzzleTopBar-info"
        @click="setNavAction('infos')"
      >
        <img class="cta__icon" src="@/assets/images/icons/icon_question.svg" />
      </div>
    </nav>
    <div class="topbar__filler"></div>
    <div class="topbar__hud hud ">
      <!-- LABEL -->
      <div class="hud__label">DOOR {{ $route.params.id }}</div>
      <!-- COUNTDOWN -->
      <div class="hud__countdown">
        <div class="hud__timer">
          <!-- Countdown clock icon -->
          <puzzleTopbarIconCountdown class="hud__timer-icon" />
          <!-- Countdown timer -->
          <div ref="timerChrono" class="hud__timer-chrono">
            <client-only>
              <vac
                v-if="renderCountdown"
                ref="countdownChrono"
                :speed="1000"
                :auto-start="false"
                :left-time="$attrs.currentpuzzledata.countdown * 1000"
                @process="countDownProcess"
              >
                <span slot="before">{{
                  `${$attrs.currentpuzzledata.countdownRoundedMinutes}:00`
                }}</span>
                <span slot="process" slot-scope="{ timeObj }">{{
                  `${timeObj.m}:${timeObj.s}`
                }}</span>
                <span slot="finish" class="hud__timer-slotmessage"
                  >TIME OUT!</span
                >
              </vac>
            </client-only>
          </div>
        </div>
        <!-- Countdown Progressbar -->
        <div class="hud__countdown-progressbarContainer">
          <div
            ref="countdownProgressBarGauge"
            class="hud__countdown-progressbarGauge"
          ></div>
        </div>
      </div>
      <!-- Life counter -->
      <div :class="{ blinkin: $attrs.session.lives === 1 }" class="hud__life">
        <div class="hud__life-icon">
          <img
            ref="lifeIconPersistent"
            src="@/assets/images/icons/icon_life.svg"
          />
          <img ref="lifeIcon" src="@/assets/images/icons/icon_life.svg" />
        </div>
        <div ref="lifeLabel" class="hud__life-label">
          {{ $attrs.session.lives }}
        </div>
      </div>
    </div>
    <!-- Sounds -->

    <BaseSounds ref="tick" sound-source="tick" />
    <BaseSounds ref="puzzleNav" sound-source="btn_puzzleNav" />
    <BaseSounds ref="puzzleError" sound-source="valid_error" />
  </div>
</template>

<script>
import { TweenMax, TimelineMax } from 'gsap'
import { Expo, Linear } from 'gsap/EasePack'
import { mapMutations } from 'vuex'
import Vue from 'vue'
import vueAwesomeCountdown from 'vue-awesome-countdown'
import { showDialog } from '@/mixins/showDialog.js'
import { killTimeOuts } from '@/utils'
import puzzleTopbarIconCountdown from '@/components/PuzzleTopbarIconCountdown'
import { EventBus } from '@/bus'
TweenMax.lagSmoothing(0)
Vue.use(vueAwesomeCountdown, 'vac')

export default {
  name: 'PuzzleTopbar',
  components: {
    puzzleTopbarIconCountdown
  },
  mixins: [showDialog],
  data() {
    return {
      timeOuts: [],
      timer: {
        time: '00:00:00.000',
        timeBegan: null,
        timeStopped: null,
        stoppedDuration: 0,
        started: null,
        running: false
      },
      renderCountdown: true,
      gsap: {
        countdownReduceWidth: {}
      },
      countdown: {
        allowTick: true
      },
      topbarUIFlashTriggerCounter: 0
    }
  },
  mounted() {
    /* =============================================
                       Events
    ============================================= */
    EventBus.$on('puzzleSuccess', () => {
      EventBus.$emit('countdownPause')
      EventBus.$emit('countdownIconPause')
      this.timerStop()
      this.recordCurrentPuzzleTime(this.timer.time)
    })

    EventBus.$on('countDownReset', () => {
      // Force re-render countdown
      this.renderCountdown = false
      this.$nextTick(() => {
        this.renderCountdown = true
      })
    })

    /* =============================================
                  Topbar UI flashes
    ============================================= */
    EventBus.$on('topbarUIFlashes', context => {
      console.log('topbarUIFlashes on eventbus', { context })
      this.topbarUIFlashTriggerCounter = 0
      this.topbarUIFlashes(context)
    })

    /* =============================================
                       Timer
    ============================================= */
    EventBus.$on('timerStop', () => {
      this.timerStop()
    })

    EventBus.$on('timerStart', () => {
      this.timerStart()
    })
    /* =============================================
                     Countdown
    ============================================= */
    const { countdownProgressBarGauge } = this.$refs

    // Reducer
    this.gsap.countdownReduceWidth = TweenMax.fromTo(
      countdownProgressBarGauge,
      this.$attrs.currentpuzzledata.countdown,
      { width: '100%' },
      {
        width: '0%',
        ease: Linear.easeNone,
        onComplete: this.puzzleTimeOut
      }
    )

    // Init to Paused state
    this.gsap.countdownReduceWidth.pause()

    EventBus.$on('countdownRestart', () => {
      console.log('countdownRestart')
      this.topbarUIFlashTriggerCounter = 0
      this.gsap.countdownReduceWidth.play()
      this.$refs.countdownChrono.startCountdown()
      this.timeOuts.push(
        setTimeout(() => {
          this.countdown.allowTick = true
        }, 500)
      )
    })

    EventBus.$on('countdownPause', () => {
      console.log('countdownPause')
      this.countdown.allowTick = false
      this.gsap.countdownReduceWidth.pause()
      this.$refs.countdownChrono.pauseCountdown()
    })

    /* =============================================
                        Lives
    ============================================= */

    // Consume one life
    EventBus.$on('consumeOneLife', event => {
      this.$refs.puzzleError.playSound()

      // Set crtPreventBubbling to true : freeze all actions
      EventBus.$emit('crtPreventBubbling', true)

      if (this.$attrs.session.lives === 0) {
        // Prevent going negative
      } else {
        // Heart animation
        this.topbarConsumeLifeAnimation()
        // Update vuex state
        const puzzleAttempts = -1
        const context = 'updateAttempts'
        this.updateAttempts({ puzzleAttempts, context })
        this.updateLives()

        if (event === 'puzzleTimeOut') {
          // countdown is up
          if (this.$attrs.session.lives === 0) {
            EventBus.$emit('generalGameOver')
          } else {
            EventBus.$emit('puzzleGameOver')
          }
        } else if (event === 'noMatch') {
          // no-match
          if (
            this.$attrs.session.attempts === 0 &&
            this.$attrs.session.lives > 0
          ) {
            // Puzzle game over
            EventBus.$emit('puzzleGameOver')
          } else if (this.$attrs.session.lives === 0) {
            // General game over
            EventBus.$emit('generalGameOver')
          } else {
            // Lives remaining, continue
            // Set crtPreventBubbling to false : unfreeze all actions
            this.timeOuts.push(
              setTimeout(() => {
                EventBus.$emit('crtPreventBubbling', false)
              }, 1000)
            )
          }
        }
      }
    })

    /* =============================================
                     Puzzle reset 
    ============================================= */
    EventBus.$on('newPuzzleReset', payload => {
      // Set crtPreventBubbling to true : freeze all actions
      EventBus.$emit('crtPreventBubbling', true)
      // Slight topbar delay reset
      this.timeOuts.push(
        setTimeout(() => {
          // Set crtPreventBubbling to false : unfreeze all actions
          EventBus.$emit('crtPreventBubbling', false)
          // Reset attempts to n
          const puzzleAttempts = this.$attrs.currentpuzzledata
            .attemptsBeforeRemoveOneLive
          const context = 'resetAttempts'
          this.updateAttempts({ puzzleAttempts, context })

          // Reset countdown progressbar
          EventBus.$emit('countdownIconRestart')
          this.gsap.countdownReduceWidth.restart()
          // Start/Restart timer
          this.timerStart()
          // Empty timeOuts
          this.timeOuts = []
          // Reset countdown
          this.$refs.countdownChrono.startCountdown(true)
          // topbar UI flashes
          this.topbarUIFlashTriggerCounter = 0
          this.topbarUIFlashes()
        }, 1750)
      )
    })
  },
  beforeDestroy() {
    this.$refs.countdownChrono.stopCountdown()
    TweenMax.killAll()
    killTimeOuts(this.timeOuts)
    EventBus.$off('puzzleSuccess')
    EventBus.$off('newPuzzleReset')
    EventBus.$off('consumeOneLife')
    EventBus.$off('puzzleGameOver')
    EventBus.$off('generalGameOver')
    EventBus.$off('topbarUIFlashes')
    EventBus.$off('timerStop')
    EventBus.$off('timerStart')
    EventBus.$off('crtPreventBubbling')
    EventBus.$off('countdownIconPause')
    EventBus.$off('countdownIconRestart')
    EventBus.$off('countdownRestart')
    EventBus.$off('countdownPause')
    EventBus.$off('countDownReset')
    clearInterval(this.timer.started)
    this.gsap.countdownReduceWidth.kill()
  },
  methods: {
    ...mapMutations({
      updateLives: 'session/updateLives',
      recordCurrentPuzzleTime: 'session/recordCurrentPuzzleTime',
      updateAttempts: 'session/updateAttempts',
      updateDialogDisplay: 'dialogs/updateDialogDisplay'
    }),
    topbarConsumeLifeAnimation() {
      // Heart animation

      // Refs
      const { lifeLabel } = this.$refs
      const { lifeIcon } = this.$refs

      // Second heart animation at LifeConsume event
      TweenMax.fromTo(
        lifeIcon,
        3,
        { transform: 'translateY(0) scale(2)', opacity: '1' },
        {
          transform: 'translateY(-50px) scale(2)',
          opacity: '0',
          ease: Expo.easeOut
        }
      )

      // Label shake animationat LifeConsume event
      const timelineLife = new TimelineMax({ repeat: 3 })
      timelineLife.to(lifeLabel, 0.02, {
        color: '#ffffff',
        transform: 'translateX(5px)'
      })
      timelineLife.to(lifeLabel, 0.02, {
        color: '#DA112A',
        transform: 'translateX(-5px)'
      })
      timelineLife.to(lifeLabel, 0.02, {
        color: '#DA112A',
        transform: 'translateX(0px)'
      })
    },
    topbarUIFlashes(context) {
      this.topbarUIFlashTriggerCounter += 1

      const { timerChrono } = this.$refs
      const { countdownProgressBarGauge } = this.$refs
      this.timeOuts.push(
        setTimeout(() => {
          // Timer flash
          TweenMax.fromTo(
            timerChrono,
            2,
            { color: '#ffffff' },
            { color: '#DA112A', ease: Expo.easeOut }
          )
          // Progressbar flash
          TweenMax.fromTo(
            countdownProgressBarGauge,
            2,
            { backgroundColor: '#ffffff' },
            { backgroundColor: '#DA112A', ease: Expo.easeOut }
          )
        }, 100)
      )
      // Play tick
      this.$refs.tick.playSound()
      console.log('context passed :', context)
      // if (context !== 'backToGame') {
      //   this.$refs.tick.playSound()
      // } else {
      //   // if()
      // }
    },
    puzzleTimeOut() {
      const event = 'puzzleTimeOut'
      EventBus.$emit('consumeOneLife', event)
      EventBus.$emit('countdownIconKill')
      this.timerStop()
    },
    puzzleGameOver() {
      EventBus.$emit('puzzleGameOver')
      this.$refs.countdownChrono.stopCountdown()
      this.timerStop()
    },
    timerStart() {
      if (this.timer.running) return

      if (this.timer.timeBegan === null) {
        this.timerReset()
        this.timer.timeBegan = new Date()
      }

      if (this.timer.timeStopped !== null) {
        this.timer.stoppedDuration += new Date() - this.timer.timeStopped
      }

      this.timer.started = setInterval(this.timerClockRunning, 10)
      this.timer.running = true
    },
    timerClockRunning() {
      const currentTime = new Date()
      const timeElapsed = new Date(
        currentTime - this.timer.timeBegan - this.timer.stoppedDuration
      )
      const hour = timeElapsed.getUTCHours()
      const min = timeElapsed.getUTCMinutes()
      const sec = timeElapsed.getUTCSeconds()
      const ms = timeElapsed.getUTCMilliseconds()

      this.timer.time =
        this.timerZeroPrefix(hour, 2) +
        ':' +
        this.timerZeroPrefix(min, 2) +
        ':' +
        this.timerZeroPrefix(sec, 2) +
        '.' +
        this.timerZeroPrefix(ms, 3)
    },
    timerReset() {
      console.log('timerReset')
      this.timer.running = false
      clearInterval(this.timer.started)
      this.timer.stoppedDuration = 0
      this.timer.timeBegan = null
      this.timer.timeStopped = null
      this.timer.time = '00:00:00.000'
    },
    timerZeroPrefix(num, digit) {
      let zero = ''
      for (let i = 0; i < digit; i++) {
        zero += '0'
      }
      return (zero + num).slice(-digit)
    },
    timerStop() {
      console.log('timerStop')
      this.timer.running = false
      this.timer.timeStopped = new Date()
      clearInterval(this.timer.started)
    },
    countDownProcess(time) {
      if (this.countdown.allowTick) {
        const secs = time.timeObj.ceil.s

        // Tick Every 2 sec | 30 -> 15 |
        if ((secs > 15) & (secs <= 30) & (secs % 2 === 0)) {
          this.topbarUIFlashes()
        }
        // Tick Every sec | 15 -> 0 |
        if ((secs > 0) & (secs <= 15)) {
          this.topbarUIFlashes()
        }
      }
    },
    setNavAction(caller) {
      console.log('setNavAction')
      this.$refs.puzzleNav.playSound()
      this.showDialog(caller, 'puzzleTopBar')
    }
  }
}
/* eslint-enable vue/no-unused-components, no-undef, no-unused-vars */
</script>

<style lang="scss" scoped>
.puzzleContainer {
  &__gridTop {
    z-index: 200;
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    max-height: 100px;
  }
}

.topbar {
  &__filler {
    flex-shrink: 1;
    min-width: 20px;
  }
  &__hud {
    flex-grow: 1;
    display: inline-flex;
  }
}

.nav {
  height: 100%;
  display: flex;

  .cta {
    @include cta;
    &:not(:last-child) {
      margin-right: 0.7rem;
    }
  }

  div {
    display: inline;
  }
}

.hud {
  color: $color-theme;
  height: 100%;
  display: flex;
  align-items: center;
  background-color: rgba(black, 0.5);
  padding: 0 0.8rem;

  &__label {
    font-size: 1.5rem;
    @include responsive(mobile) {
      font-size: 1.1rem;
    }
  }
  // Timer
  &__timer {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    &-icon {
      width: 1.8rem;
      position: relative;
      top: -0.1rem;
      @include responsive(mobile) {
        width: 1.2rem;
        top: -0.1rem;
      }
      margin-right: 0.3rem;
    }
    &-chrono {
      font-size: 1.5rem;
      @include responsive(mobile) {
        font-size: 1.1rem;
      }
    }
    &-slotmessage {
      text-transform: uppercase;
      font-size: 1.3rem;
      @include responsive(mobile) {
        font-size: 1rem;
      }
    }
  }

  // Countdown
  &__countdown {
    display: flex;
    padding: 0 1rem;
    align-items: center;
    flex-grow: 1;
    &-label {
      font-size: 1.5rem;
      @include responsive(mobile) {
        font-size: 1.1rem;
      }
    }
    &-progressbarContainer {
      position: relative;
      background-color: rgba($color-theme, 0.5);
      flex-grow: 2;
      height: 10px;
      margin-left: 1.2rem;
    }

    &-progressbarGauge {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background-color: $color-theme;
      width: 100%;
    }
  }
  // Life
  &__life {
    display: inline-flex;
    align-items: center;

    &.blinkin {
      animation: blinkinLife 0.5s infinite;

      @keyframes blinkinLife {
        0%,
        49% {
          opacity: 0.5;
        }

        50%,
        100% {
          opacity: 1;
        }
      }
    }
    &-icon {
      img {
        &:nth-child(2) {
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0;
        }
      }

      width: 2rem;
      position: relative;
      @include responsive(mobile) {
        width: 1.3rem;
      }
      margin-right: 0.2rem;
    }
    &-label {
      font-size: 1.5rem;
      @include responsive(mobile) {
        font-size: 1.1rem;
      }
    }
  }
}
</style>
