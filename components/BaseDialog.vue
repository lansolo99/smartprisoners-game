<template>
  <div :class="[bodycolor, additionnalClasses]" class="dialog">
    <BaseLcdScreen />
    <transition name="dialogContent">
      <div v-if="displayDialogContent" class="dialog__content">
        <!-- Title -->
        <div v-if="glitchTitle" ref="glitchTitle" class="glitch-wrapper label">
          <div
            :class="glitchTitle.color"
            :data-text="glitchTitle.message"
            class="glitch"
          >
            {{ glitchTitle.message }}
          </div>
        </div>
        <!-- Message -->
        <div
          ref="message"
          :class="{ narrow: $attrs.dialogname === 'noNetwork' }"
          class="message"
        >
          <span
            v-if="!glitchTitle"
            ref="messageTitle"
            :class="{ hidden: messagetitle === '' }"
            class="message__title"
          >
          </span>
          <span
            ref="messageDetail"
            :class="{ standAlone: messagetitle === '' }"
            class="message__detail"
          >
          </span>
        </div>
        <transition name="displayActions">
          <div v-show="actions && displayActions" class="actions">
            <slot name="actions"></slot>
          </div>
        </transition>
        <slot name="innerComponent"></slot>
      </div>
    </transition>

    <!-- Nav -->
    <div class="nav">
      <div
        v-if="closeicon"
        class="cta cta--puzzleTopBar nav__button nav__button--close"
        @click="$emit('closeDialog')"
      >
        <img class="cta__icon" src="@/assets/images/icons/icon_close.svg" />
      </div>
    </div>
  </div>
</template>

<script>
import BaseLcdScreen from '@/components/BaseLcdScreen'
import { killTimeOuts } from '@/utils'
export default {
  name: 'BaseDialog',
  components: {
    BaseLcdScreen
  },
  props: {
    actions: {
      type: Boolean,
      default: false
    },
    messagetitle: {
      type: String,
      default: ''
    },
    messagedetail: {
      type: String,
      default: ''
    },
    closeicon: {
      type: Boolean
    },
    bodycolor: {
      default: 'redscheme',
      type: String
    },
    additionnalClasses: {
      type: Array,
      default: () => []
    },
    glitchTitle: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      timeOuts: [],
      itemToAnimate: 'messageTitle',
      displayActions: false,
      displayDialogContent: false,
      gsap: {
        timelineGlitch: {}
      }
    }
  },
  beforeDestroy() {
    killTimeOuts(this.timeOuts)
  },
  mounted() {
    /* ==============================================================
                                EVENTS
    ================================================================ */

    this.timeOuts.push(
      setTimeout(() => {
        // Display dialogs elements
        this.displayDialogContent = true
        this.timeOuts.push(
          setTimeout(() => {
            this.displayElements()
          }, 100)
        )
      }, 200)
    )
  },
  methods: {
    displayElements() {
      // Set DOM elements
      const { messageTitle } = this.$refs
      const { messageDetail } = this.$refs

      // Feed title
      messageTitle.innerHTML = this.messagetitle

      // Feed detail
      if (this.$attrs.dialogname !== 'welcomeBackPseudo') {
        messageDetail.innerHTML = this.messagedetail
      } else {
        messageDetail.innerHTML = `${this.messagedetail} ${this.$attrs.pseudo}!`
      }

      // Display actions
      this.displayActions = true
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog {
  @include fullScreenContainer;
  background-color: transparent;

  &.settingsDialog,
  &.gameOverDialog {
    .dialog__content {
      width: 100%;
      max-width: 400px;
    }
  }

  .dialog__content {
    z-index: 2;
  }

  &.greenscheme {
    color: $color-green;
  }
  .message {
    &.hidden {
      display: none;
    }
  }
  &--intro {
    .message {
      max-width: 754px;
      max-height: none;
      text-align: justify;
      text-align-last: center;
      margin: 0 2rem;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      overflow: hidden;

      @include responsive(mobile) {
        max-width: 600px;
        max-height: 180px;
      }

      &__detail {
        font-size: 2rem;
        line-height: normal;

        @include responsive(mobile) {
          font-size: 1.2rem;
        }
      }
    }
    .actions {
      margin-top: 1rem;
    }
  }
}

.label {
  font-size: 3vw;
  transform: scale(0.3);
}
.message {
  text-transform: uppercase;
  max-width: 500px;
  margin: auto;
  @include responsive(mobile) {
    margin: 0 14vw;
  }
  &.narrow {
    margin: 0 22vw;
  }

  &__title {
    color: white;
    display: block;
    font-size: 2.5rem;
    @include responsive(mobile) {
      font-size: 3vw;
    }
  }
  &__detail {
    display: block;
    font-size: 2rem;
    padding-top: 1vw;
    margin: 1vw;

    &.standAlone {
      padding-top: 0 !important;
    }

    @include responsive(mobile) {
      font-size: 1.4rem;
      line-height: 1.7rem;
      padding-top: 0.7rem;
      margin: 0.8rem;
    }
  }
}
.actions {
  margin-top: 2rem;
  @include responsive(mobile) {
    margin-top: 4vw;
  }
  display: flex;
  justify-content: center;
}

// displayActions transition
.displayActions-enter {
  opacity: 0;
}
.displayActions-enter-active {
  transition: opacity 0.3s ease-out;
}
.displayActions-leave-active {
  transition: opacity 0.3s ease-in;
  opacity: 0;
}

@include topNav;

.label {
  opacity: 0;
  transform: scale(0.8);
  @include responsive(tablet) {
    transform: scale(0.55);
  }

  @include glitch(standard);

  .glitch {
    &.color-green {
      background-color: $color-green;
    }

    &.color-theme {
      background-color: $color-theme;
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
  &--1,
  &--2 {
    z-index: 0;
  }
  &--2 {
    animation: opacityLoop 0.1s infinite;
    @keyframes opacityLoop {
      0% {
        opacity: 0.27861;
      }
      5% {
        opacity: 0.34769;
      }
      10% {
        opacity: 0.23604;
      }
      15% {
        opacity: 0.90626;
      }
      20% {
        opacity: 0.18128;
      }
      25% {
        opacity: 0.83891;
      }
      30% {
        opacity: 0.65583;
      }
      35% {
        opacity: 0.67807;
      }
      40% {
        opacity: 0.26559;
      }
      45% {
        opacity: 0.84693;
      }
      50% {
        opacity: 0.96019;
      }
      55% {
        opacity: 0.08594;
      }
      60% {
        opacity: 0.20313;
      }
      65% {
        opacity: 0.71988;
      }
      70% {
        opacity: 0.53455;
      }
      75% {
        opacity: 0.37288;
      }
      80% {
        opacity: 0.71428;
      }
      85% {
        opacity: 0.70419;
      }
      90% {
        opacity: 0.7003;
      }
      95% {
        opacity: 0.36108;
      }
      100% {
        opacity: 0.24387;
      }
    }
  }
  &--3 {
    opacity: 0.5;
    mix-blend-mode: screen;
    z-index: 5000;
    pointer-events: none;
  }
}

// PuzzleResetLayer transition
.dialogContent-enter-active,
.dialogContent-leave-active {
  transition: opacity 0.2s ease-out;
}
.dialogContent-enter,
.dialogContent-leave-to {
  opacity: 0;
}
</style>
