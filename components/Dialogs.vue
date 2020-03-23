<template>
  <div
    :class="[
      { small: isDialogSmall },
      { createPseudoFocus: createPseudoFocus }
    ]"
    class="dialogWrapper"
  >
    <!-- INFOS -->
    <transition name="dialog">
      <BaseDialog
        v-if="dialogs.infos"
        :messagedetail="
          textData.startups[`puzzle${sessionData.currentpuzzle}`].text2
        "
        :actions="true"
        :closeicon="true"
        class="dialog infosDialog"
        messagetitle="Instructions:"
        @closeDialog="manageDialogEvents('infos', false, 'close')"
      >
        <template v-slot:actions>
          <!-- Show hint -->
          <div
            v-if="currentPuzzleData.showHint !== false"
            :class="{ disabled: sessionData.lives < 2 }"
            class="cta cta--modal"
            @click="manageDialogEvents('infos', false, 'hint')"
          >
            <img class="cta__icon" src="@/assets/images/icons/icon_bulb.svg" />
            <div class="cta__label">
              Show hint
            </div>
          </div>
          <!-- Change puzzle -->
          <div
            :class="{
              disabled: hasRouteOnlyOnePuzzleUnsolved()
            }"
            class="cta cta--modal"
            @click="manageDialogEvents('infos', false, 'changePuzzle')"
          >
            <img
              class="cta__icon"
              src="@/assets/images/icons/icon_change_puzzle.svg"
            />
            <div class="cta__label">
              Change puzzle
            </div>
          </div>
        </template>
      </BaseDialog>
    </transition>

    <!-- HIGHSCORES -->
    <transition name="dialog">
      <BaseDialog
        v-if="dialogs.highscores"
        :closeicon="true"
        class="dialog highscoresDialog"
        dialogname="highscores"
        @closeDialog="manageDialogEvents('highscores', false, 'close')"
      >
        <template v-slot:innerComponent>
          <ScreenHighscores
            :pseudo="sessionData.pseudo"
            context="dialog"
            @noNetworkHighscores="$emit('noNetworkHighscores')"
          />
        </template>
      </BaseDialog>
    </transition>

    <!-- ADMOB -->
    <transition name="dialog">
      <BaseDialog
        v-if="dialogs.admob"
        :actions="false"
        class="dialog admobDialog"
      >
        <template v-slot:innerComponent>
          <ScreenAdMob @changePuzzle="$emit('changePuzzle')" />
        </template>
      </BaseDialog>
    </transition>

    <!-- Settings -->
    <transition name="dialog">
      <BaseDialog
        v-if="dialogs.settings"
        :actions="true"
        :closeicon="true"
        class="dialog settingsDialog"
        messagetitle="SETTINGS"
        messagedetail=""
        @closeDialog="manageDialogEvents('settings', false, 'close')"
      >
        <template v-slot:actions>
          <div class="cta cta--modal cta--narrow" @click="setAudiosVolume()">
            <img
              v-show="sessionData.audios.volume === 0"
              class="cta__icon"
              src="@/assets/images/icons/dialogs/icon_sound-off.svg"
            />
            <img
              v-show="sessionData.audios.volume === 1"
              class="cta__icon"
              src="@/assets/images/icons/dialogs/icon_sound-on.svg"
            />

            <div class="cta__label">
              Sounds {{ sessionData.audios.volume === 1 ? 'ON' : 'OFF' }}
            </div>
          </div>
          <div
            class="cta cta--modal cta--narrow"
            @click="manageDialogEvents('removeads', true, '')"
          >
            <img
              class="cta__icon"
              src="@/assets/images/icons/dialogs/icon_noads.svg"
            />
            <div class="cta__label">
              Get full game
            </div>
          </div>
        </template>
      </BaseDialog>
    </transition>

    <!-- REMOVE ADS -->
    <transition name="dialog">
      <BaseDialog
        v-if="dialogs.removeads"
        :closeicon="true"
        class="dialog removeadsDialog"
        dialogname="removeads"
        @closeDialog="manageDialogEvents('removeads', false, 'close')"
      >
        <template v-slot:innerComponent>
          <ScreenBuyGame
            context="dialog"
            @noNetworkShop="$emit('noNetworkShop')"
          />
        </template>
      </BaseDialog>
    </transition>

    <!-- SET PSEUDO -->
    <transition name="dialog">
      <BaseDialog v-if="dialogs.createPseudo" class="dialog createPseudoDialog">
        <template v-slot:innerComponent>
          <ScreenCreatePseudo
            context="dialog"
            @inputDialog="createPseudoFocus = !createPseudoFocus"
            @closeDialog="manageDialogEvents('createPseudo', false, 'close')"
          />
        </template>
      </BaseDialog>
    </transition>

    <!-- WELCOME BACK PSEUDO -->
    <transition name="dialog">
      <BaseDialog
        v-if="dialogs.welcomeBackPseudo"
        :pseudo="sessionData.pseudo"
        :actions="false"
        class="dialog welcomeBackPseudoDialog"
        messagedetail="WELCOME BACK"
        dialogname="welcomeBackPseudo"
      >
      </BaseDialog>
    </transition>

    <!-- GameOver -->
    <transition name="dialog">
      <BaseDialog
        v-if="dialogs.gameOver"
        :actions="true"
        class="dialog gameOverDialog"
        messagetitle="GAME OVER"
        messagedetail="Lives out of stock!"
      >
        <template v-slot:actions>
          <div
            class="cta cta--modal cta--narrow"
            @click="manageDialogEvents('quitGame', true, '')"
          >
            <img
              class="cta__icon"
              src="@/assets/images/icons/dialogs/icon_home.svg"
            />
            <div class="cta__label">
              Quit
            </div>
          </div>
          <div
            class="cta cta--modal cta--narrow"
            @click="manageDialogEvents('restartGame', true, '')"
          >
            <img
              class="cta__icon"
              src="@/assets/images/icons/dialogs/icon_retry.svg"
            />
            <div class="cta__label">
              Restart game
            </div>
          </div>
        </template>
      </BaseDialog>
    </transition>

    <!-- QUITGAME -->
    <transition name="dialog">
      <BaseDialog
        v-if="dialogs.quitGame"
        :actions="true"
        class="dialog quitGameDialog"
        messagetitle="QUIT ?"
        messagedetail="All progression will be lost"
      >
        <template v-slot:actions>
          <div
            class="cta cta--modal cta--narrow"
            @click="manageDialogEvents('quitGame', false, 'confirm', 1000)"
          >
            <div class="cta__label">
              Confirm
            </div>
          </div>
          <div
            class="cta cta--modal cta--narrow"
            @click="manageDialogEvents('quitGame', false, 'cancel')"
          >
            <div class="cta__label">
              Cancel
            </div>
          </div>
        </template>
      </BaseDialog>
    </transition>

    <!-- RESTART GAME -->
    <transition name="dialog">
      <BaseDialog
        v-if="dialogs.restartGame"
        :actions="true"
        class="dialog restartGameDialog"
        messagetitle="RESTART ?"
        messagedetail="All progression will be lost"
      >
        <template v-slot:actions>
          <div
            class="cta cta--modal cta--narrow"
            @click="manageDialogEvents('restartGame', false, 'confirm', 1000)"
          >
            <div class="cta__label">
              Confirm
            </div>
          </div>
          <div
            class="cta cta--modal cta--narrow"
            @click="manageDialogEvents('restartGame', false, 'cancel')"
          >
            <div class="cta__label">
              Cancel
            </div>
          </div>
        </template>
      </BaseDialog>
    </transition>

    <!-- NO NETWORK -->
    <transition name="dialog">
      <BaseDialog
        v-if="dialogs.noNetwork"
        :messagedetail="setNoNetworkMessageDetail"
        :actions="true"
        class="dialog noNetworkDialog"
        messagetitle="NO NETWORK!"
        dialogname="noNetwork"
      >
        <template v-slot:actions>
          <div
            v-if="noNetworkContextHasAbort.includes(sessionData.offlineContext)"
            class="cta cta--modal cta--narrow"
            @click="manageDialogEvents('noNetwork', false, 'abort')"
          >
            <div class="cta__label">
              Abort
            </div>
          </div>
          <div
            class="cta cta--modal cta--narrow"
            @click="manageDialogEvents('noNetwork', false, 'retry')"
          >
            <div class="cta__label">
              Try again
            </div>
          </div>
        </template>
      </BaseDialog>
    </transition>

    <!-- Sounds -->
    <BaseSounds ref="soundBtnClose" sound-source="btn_close" />
    <BaseSounds ref="soundBtnBase" sound-source="btn_base" />
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { killTimeOuts } from '@/utils'
import { EventBus } from '@/bus'
import { showDialog } from '@/mixins/showDialog.js'
import BaseDialog from '@/components/BaseDialog'
import ScreenHighscores from '@/components/ScreenHighscores'
import ScreenBuyGame from '@/components/ScreenBuyGame'
import ScreenAdMob from '@/components/ScreenAdMob'
import ScreenCreatePseudo from '@/components/ScreenCreatePseudo'

export default {
  name: 'Dialogs',
  components: {
    BaseDialog,
    ScreenHighscores,
    ScreenBuyGame,
    ScreenCreatePseudo,
    ScreenAdMob
  },
  mixins: [showDialog],
  props: {
    route: {
      type: Object,
      default: () => {}
    },
    puzzleSuccessScreen: {
      type: Boolean
    }
  },
  data() {
    return {
      timeOuts: [],
      updateDelay: 0,
      createPseudoFocus: false,
      noNetworkContextHasAbort: ['highscores', 'shop'],
      customMessageDetail: {
        noNetwork: {
          base: 'Please check your connexion \nto continue...',
          highscoreEnd: 'Please check your connexion \nto record your score...'
        }
      }
    }
  },
  computed: {
    ...mapState({
      dialogs: state => state.dialogs,
      puzzlesData: state => state.puzzles,
      sessionData: state => state.session,
      textData: state => state.scenario
    }),
    setNoNetworkMessageDetail() {
      if (this.$route.name === 'highscores') {
        return this.customMessageDetail.noNetwork.highscoreEnd
      } else {
        return this.customMessageDetail.noNetwork.base
      }
    },
    isDialogSmall() {
      const smallDialogs = ['createPseudo', 'welcomeBackPseudo']
      const currentDialog = Object.entries(this.dialogs).find(
        dialog => dialog[1] === true
      )
      return smallDialogs.includes(currentDialog[0])
    },
    currentPuzzleData() {
      return this.puzzlesData[`puzzle${this.sessionData.currentpuzzle}`]
    },
    getPuzzlesForRouteLevel() {
      return Object.values(this.puzzlesData)
        .filter(puzzle => puzzle.level === this.route.level)
        .map(puzzle => puzzle.id)
    }
  },
  watch: {
    dialogs: {
      handler(val, oldVal) {
        this.timeOuts.push(
          setTimeout(() => {
            EventBus.$emit('crtPreventBubbling', false)
          }, 500)
        )
      },
      deep: true
    }
  },
  beforeDestroy() {
    killTimeOuts(this.timeOuts)
  },
  methods: {
    ...mapMutations({
      updateUserSession: 'session/updateUserSession',
      updateDialogDisplay: 'dialogs/updateDialogDisplay',
      togglePuzzleChanged: 'session/togglePuzzleChanged',
      setAudiosVolume: 'session/setAudiosVolume'
    }),
    manageDialogEvents(dialog, status, event, delay = 10) {
      // Action from inside dialogs only
      // Update delay
      this.updateDelay = delay

      // Sound btnBase for every click except close
      if (event !== 'close') {
        this.$refs.soundBtnBase.playSound()
      }
      // Update store
      this.timeOuts.push(
        setTimeout(() => {
          this.updateDialogDisplay({ dialog, status })
          if (event === 'close') {
            this.$refs.soundBtnClose.playSound()
          }
        }, this.updateDelay)
      )

      // Dialogs callbacks
      switch (dialog) {
        case 'noNetwork':
          if (event === 'abort') {
            switch (this.sessionData.offlineContext) {
              case 'highscores':
                // if menu
                if (this.$route.name === 'menu') {
                  this.manageDialogEvents('highscores', false, 'close')
                }
                // if end
                if (this.$route.name === 'highscores') {
                  this.$emit('abort')
                }
                break
              case 'shop':
                this.manageDialogEvents('removeads', false, 'close')
                break
            }
          }
          if (event === 'retry') {
            switch (this.sessionData.offlineContext) {
              case 'initUser':
                this.$router.go()
                break
              case 'highscores':
                // if menu
                if (this.$route.name === 'menu') {
                  this.manageDialogEvents('highscores', false, 'close')
                  setTimeout(() => {
                    console.log('reshow highscores')
                    this.showDialog('highscores')
                  }, 20)
                }
                // if end
                if (this.$route.name === 'highscores') {
                  this.$router.go()
                }
                break
              case 'shop':
                this.manageDialogEvents('removeads', false, 'close')
                setTimeout(() => {
                  console.log('reshow removeads')
                  this.showDialog('removeads')
                }, 20)
                break
            }
          }
          break
        case 'quitGame':
          if (event === 'confirm') {
            this.$emit('quitGame')
          }
          if (event === 'cancel') {
            if (!this.puzzleSuccessScreen) {
              this.$emit('backToGame')
            }
          }
          break
        case 'settings':
          if (event === 'removeads') {
            // display removeads
            console.log('display removeads dialog')
          }
          if (event === 'close') {
            // Manage here backToGame or backToMenu
            this.$emit('backToGame')
          }
          break
        case 'infos':
          if (event === 'hint') {
            // Display admob + showhint
            // this.displayAdMob('hint')
            this.$emit(event)
          }
          if (event === 'changePuzzle') {
            console.log('ispremium?: ', this.sessionData.premium)
            // Store new puzzleChange state
            this.togglePuzzleChanged(true)

            // Hide currentPuzzle
            this.$emit('hidePuzzle')

            // Display admob if non premium
            if (!this.sessionData.premium) {
              // Set admob context
              const update = {
                admobContext: 'changePuzzle'
              }
              this.updateUserSession(update)

              // Display admob
              this.showDialog('admob', 'puzzle')
            } else {
              this.$emit('changePuzzle')
            }
          }
          if (event === 'close') {
            this.$emit('backToGame')
          }
          break
        case 'restartGame':
          if (event === 'confirm') {
            this.$emit('restartGame')
          }
          if (event === 'cancel') {
          }
          break
        case 'createPseudo':
          if (event === 'close') {
            this.$emit('closeCreatePseudo')
          }
          break
      }
    },
    hasRouteOnlyOnePuzzleUnsolved() {
      const puzzlesForRouteLevel = Object.values(this.puzzlesData)
        .filter(puzzle => puzzle.level === this.route.level)
        .map(puzzle => puzzle.id)
      const puzzlesSolved = this.sessionData.puzzlesSolved
      //  [1/2/3/6/11] -> 5 === [1] + 1
      if (puzzlesForRouteLevel.length === puzzlesSolved.length + 1) {
        console.log('only one puzzle to solve -> return false')
        return true
      } else {
        console.log('still multiple puzzles to solve -> return true')
        return false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog {
  overflow: hidden;
  transition: opacity 0.2s ease;

  &::v-deep {
    @include dialogCta;
  }

  &::v-deep .actions > * + * {
    margin-left: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    @include responsive(mobile) {
      margin-left: 3vw;
    }
  }

  &.isHidden {
    opacity: 0;
    pointer-events: all;
  }
}

.dialogWrapper {
  position: absolute;
  z-index: 1000;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transition: transform 0.2s ease, width 0.2s ease;

  &.small {
    --dialogEdgeMargins: 100px;
    top: auto;
    right: auto;
    bottom: auto;
    left: auto;
    width: calc(100% - var(--dialogEdgeMargins));
    max-width: 400px;
    height: calc(100% - var(--dialogEdgeMargins));
    max-height: 200px;
    background-color: red;
    &.createPseudoFocus {
      transform: translateY(-110px);
      width: 100%;
      max-width: none;
    }
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
    opacity: 0.5;
    mix-blend-mode: lighten;
    z-index: 5000;
    pointer-events: none;
  }
}

// Transitions
.dialog-enter-active {
  // transition: all 0.2s cubic-bezier(0, 1.37, 0.39, 1.04);
  transition: all 0.1s ease-out;
}
.dialog-leave-active {
  transition: all 0.2s ease-out;
}
.dialog-enter,
.dialog-leave-to {
  opacity: 0;
  transform: scale(0);
}
</style>
