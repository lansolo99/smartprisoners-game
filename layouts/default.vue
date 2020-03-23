<template>
  <div id="#app" class="container">
    <!-- LCD Background -->
    <BaseLcdScreen />

    <!-- Views -->
    <nuxt class="content" />

    <!-- CRT effect -->
    <div :class="{ stopBubbling: crtPreventBubbling }" class="layer crt" />

    <!-- Sounds -->
    <BaseSounds
      ref="soundDialogsAmbient"
      :loop="true"
      sound-source="dialogs_ambient"
    />
    <BaseSounds
      ref="soundPuzzleAmbientTransitions"
      :loop="true"
      sound-source="puzzle_ambient_transitions"
    />
    <BaseSounds
      ref="soundPuzzleAmbientScreens"
      :loop="true"
      sound-source="puzzle_ambient_screens"
    />
    <BaseSounds ref="soundEnd" sound-source="end" />
  </div>
</template>
<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
import BaseLcdScreen from '@/components/BaseLcdScreen'
import { EventBus } from '@/bus'
import { killTimeOuts } from '@/utils'
export default {
  name: 'Layout',
  components: {
    BaseLcdScreen
  },
  data() {
    return {
      crtPreventBubbling: false,
      timeOuts: []
    }
  },
  computed: {
    ...mapGetters({
      showDialogWrapper: 'dialogs/showDialogWrapper'
    }),
    ...mapState({
      dialogs: state => state.dialogs
    })
  },
  watch: {
    $route: {
      handler(val, oldVal) {
        switch (val.name) {
          case 'menu':
          case 'dev':
          case 'highscores':
            killTimeOuts(this.timeOuts)
            this.setAmbientLoop(false)
            if (!val.name === 'highscores') {
              this.$refs.soundEnd.stopSound()
            }
            break
          case 'transitions-id':
          case 'end':
            console.log('case transition-id')
            this.setAmbientLoop(true)
            break
          default:
            this.setAmbientLoop(true)
            break
        }
      }
    },
    showDialogWrapper: {
      handler(val, oldVal) {
        if (val) {
          if (!this.dialogs.admob) {
            this.$refs.soundDialogsAmbient.playSound()
          }
          this.setAmbientLoop(false)
        } else {
          this.$refs.soundDialogsAmbient.stopSound()
          this.setAmbientLoop(true)
        }
      }
    }
  },
  mounted() {
    EventBus.$on('setAmbientLoopTransition', () => {
      this.setAmbientLoop(true)
    })

    // CORDOVA EVENTS
    const onPause = () => {
      console.log('onPause')
      this.setAudiosVolume(0)

      // Set cordovaAppStatus
      const update = {
        cordovaAppStatus: 'paused'
      }
      this.updateUserSession(update)
    }

    const onResume = () => {
      console.log('onResume')
      this.setAudiosVolume(1)

      // Set cordovaAppStatus
      const update = {
        cordovaAppStatus: 'resumed'
      }
      this.updateUserSession(update)
    }

    // Build startup
    const onDeviceReady = () => {
      console.log('deviceReady')

      // Event listeners
      document.addEventListener('pause', onPause, false)
      document.addEventListener('resume', onResume, false)
    }
    document.addEventListener('deviceready', onDeviceReady, false)

    // PREVENT BUBBLING
    EventBus.$on('crtPreventBubbling', status => {
      this.crtPreventBubbling = status
    })

    // END SOUND
    EventBus.$on('playEndSound', status => {
      this.$refs.soundEnd.playSound()
    })
  },
  beforeDestroy() {
    EventBus.$off('crtPreventBubbling')
    EventBus.$off('playEndSound')
  },
  methods: {
    ...mapMutations({
      setAudiosVolume: 'session/setAudiosVolume',
      updateUserSession: 'session/updateUserSession'
    }),
    setAmbientLoop(status) {
      console.warn('SETAMBIENTLOOP')

      const NoAmbientRoutes = ['menu', 'dev']
      const isNoAmbientRoute = NoAmbientRoutes.includes(this.$route.name)

      if (status && !isNoAmbientRoute) {
        if (this.$route.name !== 'transitions-id') {
          // startups-id
          // puzzle-id
          // intro
          // end
          this.$refs.soundPuzzleAmbientScreens.playSound()
          this.$refs.soundPuzzleAmbientTransitions.stopSound()
        } else {
          // transitions-id
          console.warn('play soundPuzzleAmbientTransitions')
          this.$refs.soundPuzzleAmbientTransitions.playSound()
          this.$refs.soundPuzzleAmbientScreens.stopSound()
        }
      } else {
        this.$refs.soundPuzzleAmbientTransitions.stopSound()
        this.$refs.soundPuzzleAmbientScreens.stopSound()
      }
    }
  }
}
</script>

<style scoped lang="scss">
.yo {
  position: absolute;
  top: 10px;
  left: 10px;
  color: white;
}
#app {
  min-width: 568px;
  background-color: $color-anthracite;
}
.content {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.crt {
  @include crtEffect;
  overflow: hidden;
  z-index: 10000;
  &.stopBubbling {
    pointer-events: all;
  }
}

.transitionEndFixed {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  &--1 {
    z-index: 0;
  }
  &--2 {
    opacity: 0.2;
    mix-blend-mode: screen;
    z-index: 5000;
    pointer-events: none;
  }
}
</style>
