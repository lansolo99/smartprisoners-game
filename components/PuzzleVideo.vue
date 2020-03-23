<template>
  <div class="video">
    <BaseTopGui v-if="$attrs.context !== 'menu'" />

    <!-- MENU -->
    <div v-if="$attrs.context === 'menu'">
      <!-- Move -->
      <transition name="video">
        <video
          v-show="display.videoMove"
          ref="videoMove"
          :poster="
            require('@/assets/images/transitions/puzzle_moves_generic_poster.jpg')
          "
          :src="require(`@/assets/images/transitions/menu_move.mp4`)"
        ></video>
      </transition>
      <!-- Loop -->
      <video
        v-show="display.videoLoop"
        ref="videoLoop"
        :src="require(`@/assets/images/transitions/menu_loop.mp4`)"
        loop
      ></video>

      <!-- Links area -->
      <svg class="menu" x="0" y="0" viewBox="0 0 1280 720" xml:space="preserve">
        <rect
          x="684.3"
          y="272.3"
          class="cta"
          width="400"
          height="105.5"
          @click="setMenuActions('linkArea1')"
        />
        <rect
          x="684.3"
          y="379.1"
          class="cta"
          width="400"
          height="105.5"
          @click="setMenuActions('linkArea2')"
        />
        <rect
          x="684.3"
          y="486"
          class="cta"
          width="400"
          height="105.5"
          @click="setMenuActions('linkArea3')"
        />
      </svg>

      <!-- SOUNDS -->
      <BaseSounds
        ref="soundMenuLoop"
        :loop="true"
        sound-source="menu_ambient_loop"
      />
    </div>

    <!-- IN-GAME TRANSITIONS -->
    <div v-if="$attrs.context === 'transition'">
      <!-- Move -->
      <transition name="video">
        <video
          v-show="display.videoMove"
          ref="videoMove"
          :poster="
            require('@/assets/images/transitions/puzzle_moves_generic_poster.jpg')
          "
          :src="require(`@/assets/images/transitions/${routeId}_move.mp4`)"
        ></video>
      </transition>
      <!-- Loop -->
      <video
        v-show="display.videoLoop"
        ref="videoLoop"
        :src="require(`@/assets/images/transitions/${routeId}_loop.mp4`)"
        muted
        loop
      ></video>
      <!-- GoToScreen -->
      <video
        v-show="display.videoScreen"
        ref="videoScreen"
        :src="require(`@/assets/images/transitions/${routeId}_screen.mp4`)"
      ></video>
    </div>

    <!-- END -->
    <div v-if="$attrs.context === 'end'">
      <transition name="video">
        <video
          v-show="display.videoEnd"
          ref="videoEnd"
          :poster="
            require('@/assets/images/transitions/puzzle_moves_generic_poster.jpg')
          "
          :src="require(`@/assets/images/transitions/end.mp4`)"
        ></video>
      </transition>
    </div>

    <!-- ACTIONS -->
    <transition name="cta">
      <PuzzleActions
        v-if="display.actions && $attrs.context !== 'menu'"
        :cols-num="2"
        :ctas="videoCtaDisplay"
        context="video"
        @skipTransition="setNextRoute('skipTransition')"
        @goToLockScreen="goToLockScreen()"
      />
    </transition>

    <!-- DIALOGS -->
    <transition name="dialog">
      <Dialogs
        v-if="showDialogWrapper && $attrs.context !== 'menu'"
        ref="dialogs"
      />
    </transition>

    <div class="bottom-dimmer"></div>
    <BaseSounds ref="soundBtnMenuMain" sound-source="btn_menu_main" />
    <BaseSounds
      ref="soundTransitionLoopAmbient"
      :loop="true"
      sound-source="transition_ambient_loop"
    />
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
import { killTimeOuts } from '@/utils'
import { showDialog } from '@/mixins/showDialog.js'
import BaseTopGui from '@/components/BaseTopGui'
import PuzzleActions from '@/components/PuzzleActions'
import Dialogs from '@/components/Dialogs'
import { EventBus } from '@/bus'

export default {
  name: 'PuzzleVideo',
  components: {
    PuzzleActions,
    BaseTopGui,
    Dialogs
  },
  mixins: [showDialog],
  data() {
    return {
      timeOuts: [],
      routeId: this.$route.params.id,
      advertisedRoutes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      menu: {
        preventClick: true
      },
      display: {
        videoMove: false,
        videoLoop: false,
        videoScreen: false,
        videoEnd: false,
        actions: true,
        cta: false
      },
      currentVideoPlaying: null,
      admob: false,
      videosEls: {
        videoMove: null,
        videoLoop: null,
        videoScreen: null
      }
    }
  },
  computed: {
    ...mapState({
      sessionData: state => state.session
    }),
    ...mapGetters({
      showDialogWrapper: 'dialogs/showDialogWrapper'
    }),
    audiosVolume() {
      return this.sessionData.audios.volume
    },
    cordovaAppStatus() {
      return this.sessionData.cordovaAppStatus
    },
    videoCtaDisplay() {
      const displayLockscreenStatus = this.display.cta
      return displayLockscreenStatus ? ['lockscreen'] : ['skipTransition']
    }
  },
  watch: {
    cordovaAppStatus: {
      handler(val, oldVal) {
        // Handle Cordova paused/resumed events

        if (this.currentVideoPlaying) {
          // If in menu and no dialog open -> pause video & reset time
          if (val === 'paused' && !this.showDialogWrapper) {
            this.videosEls[this.currentVideoPlaying].pause()
          } else {
            this.timeOuts.push(
              setTimeout(() => {
                this.videosEls[this.currentVideoPlaying].currentTime = 0
                this.videosEls[this.currentVideoPlaying].play()
              }, 1000)
            )
          }
        }
      }
    },
    audiosVolume: {
      handler(val, oldVal) {
        this.setVideosVolumes()
      }
    },
    showDialogWrapper: {
      handler(val, oldVal) {
        if (this.$attrs.context === 'menu') {
          if (val) {
            this.videosEls.videoLoop.pause()
            this.videosEls.videoLoop.currentTime = 0
            this.$refs.soundMenuLoop.pauseSound()
          } else {
            setTimeout(() => {
              this.videosEls.videoLoop.play()
            }, 500)
            this.$refs.soundMenuLoop.playSound()
          }
        }
      }
    }
  },
  mounted() {
    if (Object.keys(this.$route.params).length) {
      console.log('video mounted -> routeid:', this.routeId)
    }

    this.setVideosEls()

    switch (this.$attrs.context) {
      case 'menu':
        this.$refs.soundMenuLoop.playSound()
        this.videoControl('menu')
        break
      case 'transition':
        this.timeOuts.push(
          setTimeout(() => {
            EventBus.$emit('setAmbientLoopTransition')
          }, 200)
        )
        this.videoControl('transition')
        break
      case 'end':
        this.videoEnd()
        setTimeout(() => {
          EventBus.$emit('setAmbientLoopTransition')
        }, 200)
        break
    }
  },
  beforeDestroy() {
    killTimeOuts(this.timeOuts)
  },
  methods: {
    ...mapMutations({
      updateUserSession: 'session/updateUserSession',
      updateDialogDisplay: 'dialogs/updateDialogDisplay'
    }),
    setVideosEls() {
      this.videosEls.videoMove = this.$refs.videoMove
      this.videosEls.videoLoop = this.$refs.videoLoop
      this.videosEls.videoScreen = this.$refs.videoScreen
      this.videosEls.videoEnd = this.$refs.videoEnd
      this.setVideosVolumes()
    },
    setVideosVolumes() {
      Object.entries(this.videosEls).forEach(videoEl => {
        if (this.videosEls[videoEl[0]]) {
          this.videosEls[videoEl[0]].volume = this.sessionData.audios.volume
        }
      })
    },
    videoControl(context) {
      const videoMove = this.videosEls.videoMove
      const videoLoop = this.videosEls.videoLoop
      const videoScreen = this.$refs.videoScreen

      // Init play
      videoMove.onloadeddata = event => {
        this.timeOuts.push(
          setTimeout(() => {
            this.display.videoMove = true
            videoMove.play()
            videoMove.removeAttribute('muted')
            this.currentVideoPlaying = 'videoMove'
          }, 200)
        )
      }
      videoLoop.onloadeddata = event => {
        videoLoop.currentTime = 0
      }
      if (context === 'transition')
        videoScreen.onloadeddata = event => {
          videoScreen.currentTime = 0
        }

      // VideoMove ended event listener
      videoMove.onended = () => {
        this.display.videoMove = false
        console.warn('videoMove onended')
        if (!this.admob) {
          this.display.videoLoop = true
          videoLoop.play()
          this.currentVideoPlaying = 'videoLoop'
          if (context !== 'menu') {
            this.$refs.soundTransitionLoopAmbient.playSound()
          }
          this.$emit('videoLoopStarted')
        }

        this.menu.preventClick = false
        if (context === 'menu') {
          this.menu.preventClick = false
        }
        this.display.cta = context === 'transition'
      }
    },
    videoEnd() {
      const videoEnd = this.videosEls.videoEnd

      // Init play
      videoEnd.onloadeddata = event => {
        this.timeOuts.push(
          setTimeout(() => {
            this.display.videoEnd = true
            videoEnd.play()
            this.currentVideoPlaying = 'videoEnd'
          }, 200)
        )

        this.timeOuts.push(
          setTimeout(() => {
            EventBus.$emit('playEndSound')
          }, 4200)
        )
      }

      // VideoEnd route-change trigger 1s before end
      const videoEndOnTimeUpdate = () => {
        const videoBeforeEndTimeMarker = videoEnd.duration - 1

        if (videoEnd.currentTime > videoBeforeEndTimeMarker) {
          videoEnd.removeEventListener('timeupdate', videoEndOnTimeUpdate)
          // New route
          this.$router.push('/end')
        }
      }
      videoEnd.addEventListener('timeupdate', videoEndOnTimeUpdate)
    },
    goToLockScreen() {
      this.display.actions = false
      this.display.cta = false
      const videoLoop = this.videosEls.videoLoop
      const videoScreen = this.$refs.videoScreen

      videoLoop.removeAttribute('loop')

      this.$refs.soundTransitionLoopAmbient.stopSound()

      // VideoLoop event listener
      videoLoop.onended = () => {
        'videoloop has ended'
        this.display.videoLoop = false
        this.display.videoScreen = true
        videoScreen.play()
        this.currentVideoPlaying = 'videoScreen'
      }

      // VideoScreen route-change trigger 1sec before end
      const videoScreenOnTimeUpdate = () => {
        const videoBeforeEndTimeMarker = videoScreen.duration - 1

        if (videoScreen.currentTime > videoBeforeEndTimeMarker) {
          videoScreen.removeEventListener('timeupdate', videoScreenOnTimeUpdate)
          this.setNextRoute()
        }
      }
      videoScreen.addEventListener('timeupdate', videoScreenOnTimeUpdate)
      videoScreen.onended = () => {
        this.display.videoScreen = false
      }
    },
    setNextRoute(context) {
      console.log('setNextRoute')

      if (this.$attrs.context !== 'end') {
        // Cut off videos
        const videoMove = this.videosEls.videoMove
        videoMove.setAttribute('muted', '')
        videoMove.remove()
        this.currentVideoPlaying = null
      }
      console.log('routeid: ', this.routeId)
      console.log('ispremium?: ', this.sessionData.premium)

      // Display admob if non premium & if advertisedRoutes
      console.log('window.$nuxt.isOffline:', window.$nuxt.isOffline)
      switch (window.$nuxt.isOffline) {
        case false:
          if (
            !this.sessionData.premium &&
            this.advertisedRoutes.includes(this.routeId)
          ) {
            this.admob = true
            // Cut off all videos
            this.undisplayVideos()
            // Display Admob
            this.setAdmob()
          } else {
            // Levelup
            this.setLevelUpRoute(context)
          }
          break
        case true:
          console.warn('offline skip admob')
          // Levelup (bypass ad)
          this.setLevelUpRoute(context)
          break
      }
    },
    setLevelUpRoute(context) {
      // eslint-disable-next-line
        if (context === 'skipTransition' && this.routeId === 'end') {
        console.log('levelup from skip + last transition')
        this.$router.push('/end')
      } else {
        this.$router.push(`/startups/${this.routeId}`)
      }
    },
    undisplayVideos() {
      Object.keys(this.display).forEach(element => {
        console.log(element)
        this.display[element] = false
      })
    },
    setAdmob() {
      // Set admob context
      const update = {
        admobContext: 'levelup'
      }
      this.updateUserSession(update)

      // Display admob
      this.showDialog('admob', 'dialogs')
    },
    setMenuActions(linkArea) {
      if (!this.menu.preventClick) {
        this.$refs.soundBtnMenuMain.playSound()
        switch (linkArea) {
          case 'linkArea1':
            this.$router.push('/intro')
            break
          case 'linkArea2':
            this.$emit('showHighscore')
            break
          case 'linkArea3':
            this.$emit('showRemoveAds')
            break

          default:
            break
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.video {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: black;
  z-index: 2000;
  height: 100vh;

  video {
    position: fixed;
    width: 100%;
    right: 0;
    bottom: 0;
    min-width: 100%;
    min-height: 100%;
  }
}

// .video {
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: black;
//   z-index: 2000;
//   height: 100vh;

//   video {
//     position: absolute;
//     width: 103%;
//     left: 50%;
//     transform: translateX(-50%);
//     min-width: 100%;
//     min-height: 100%;
//   }
// }

.menu {
  position: fixed;
  width: 100%;
  right: 0;
  bottom: 0;
  z-index: 3000;
  min-width: 100%;
  min-height: 100%;

  .cta {
    fill: transparent;
  }
}

.bottom-dimmer {
  position: absolute;
  width: 100%;
  height: 30vh;
  left: 0;
  bottom: 0;
  background: linear-gradient(rgba(black, 0) 0%, rgba(black, 0.4) 90%);
}

// "got to lockscreen" cta transition
.cta-enter-active,
.cta-leave-active {
  transition: opacity 0.2s ease-out;
}
.cta-enter,
.cta-leave-to {
  opacity: 0;
}

// video transitions
.video-enter-active,
.video-leave-active {
  transition: opacity 1.5s ease-in-out;
}
.video-enter {
  opacity: 0;
}
</style>
