<template>
  <div :class="context" class="actionContent">
    <div
      :class="{ stripped: context === 'buyGameActions' }"
      class="actionContent__filler"
    >
      <div v-if="context === 'buyGameActions'" class="bars">
        <div
          v-for="(bar, barIndex) in 8"
          :key="barIndex"
          :class="{ disabled: ctas.includes('owned') }"
          class="bar"
        ></div>
      </div>
    </div>
    <div :class="['actionContent__ctas-wrapper', `colNum${colsNumOnLayout}`]">
      <!-- Reset -->
      <BaseCta
        v-if="ctas.includes('reset')"
        :class="{ disabled: $attrs.disable }"
        label="Reset"
        class="cta cta--action cta--reset"
        @click.native="$emit('resetPuzzleActions')"
      />

      <!-- Valid -->
      <BaseCta
        v-if="ctas.includes('valid')"
        :class="{ disabled: $attrs.disable }"
        label="Valid"
        class="cta cta--action cta--valid"
        @click.native="$emit('validPuzzle')"
      />

      <!-- Quit -->
      <BaseCta
        v-if="ctas.includes('quit')"
        label="Quit"
        class="cta cta--action cta--quit"
        @click.native="$emit('quit')"
      />

      <!-- GoToNextDoor -->
      <BaseCta
        v-if="ctas.includes('gotonextdoor')"
        :label="setGotToNextDoorLabel()"
        :class="{ successHalfDone: successHalfDone }"
        class="cta cta--action cta--gotonextdoor"
        @click.native="$emit('gotonextdoor')"
      />

      <!-- Buy game -->
      <BaseCta
        v-if="ctas.includes('buy')"
        id="ctaBuy"
        label="Buy"
        class="cta cta--action cta--buy"
      >
        <template v-slot:innerComponent>
          <div class="buyLabelWrapper">
            <div class="buyLabelWrapper__main">BUY NOW</div>
            <div class="buyLabelWrapper__price">
              for <span>{{ buyGamePrice }}</span>
            </div>
          </div>
        </template>
      </BaseCta>

      <!-- Game owned -->
      <BaseCta
        v-if="ctas.includes('owned')"
        label="Game owned"
        class="cta cta--action cta--owned"
      />

      <!-- GoToLockScreen -->
      <transition name="cta">
        <BaseCta
          v-if="ctas.includes('lockscreen')"
          label="Play"
          class="cta cta--action cta--gotolockscreen"
          @click.native="$emit('goToLockScreen')"
        />
      </transition>

      <!-- Skip/transition -->
      <BaseCta
        v-if="ctas.includes('skipTransition')"
        label="Skip"
        class="cta cta--action cta--skipIntro cta--skipTransition"
        @click.native="$emit('skipTransition')"
      />

      <!-- Skip/intro -->
      <BaseCta
        v-if="ctas.includes('skipIntro')"
        label="Skip"
        class="cta cta--action cta--skip"
        @click.native="$emit('skip')"
      />

      <!-- Resolve puzzle/startup -->
      <BaseCta
        v-if="ctas.includes('resolvepuzzle')"
        label="Start now"
        class="cta cta--action cta--skip"
        @click.native="$emit('skip')"
      />
    </div>
    <div
      :class="{ stripped: context === 'buyGameActions' }"
      class="actionContent__filler"
    >
      <div v-if="context === 'buyGameActions'" class="bars">
        <div
          v-for="(bar, barIndex) in 8"
          :key="barIndex"
          :class="{ disabled: ctas.includes('owned') }"
          class="bar"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseCta from '@/components/BaseCta'
export default {
  name: 'PuzzleActions',
  components: {
    BaseCta
  },
  props: {
    context: {
      type: String,
      default: 'puzzle'
    },
    colsNum: {
      type: Number,
      required: true
    },
    ctas: {
      type: Array,
      required: true
    },
    successHalfDone: {
      type: Boolean,
      default: false
    },
    buyGamePrice: {
      type: String,
      default: '0€'
    }
  },
  data() {
    return {
      routeId: this.$route.params.id,
      displaySkip: false,
      timeout: undefined
    }
  },
  computed: {
    colsNumOnLayout() {
      return this.ctas.length
    }
  },
  watch: {
    context: {
      handler(val, oldVal) {
        console.log('context has changed')
      }
    },
    ctas: {
      handler(val, oldVal) {
        // console.log('ctasval: ', val)
        // console.log('ctas has changed')
      }
    }
  },
  mounted() {
    this.timeout = setTimeout(() => {
      this.displaySkip = true
    }, 1300)
  },
  beforeDestroy() {
    clearTimeout(this.timeout)
  },
  methods: {
    setGotToNextDoorLabel() {
      if (this.routeId !== '10' && this.successHalfDone) return 'Next puzzle'
      if (this.routeId !== '10' && !this.successHalfDone)
        return 'Go to next door'
      if (this.routeId === '10') return 'Exit prison'
    }
  }
}
</script>

<style lang="scss" scoped>
.actionContent {
  display: flex;
  justify-content: center;

  // Contexts
  &.video {
    position: absolute;
    top: auto;
    right: 1rem;
    left: 1rem;
    bottom: 1rem;
    height: 30px;
    z-index: 3000;
    background-color: transparent;
    @include responsive(tablet) {
      height: 3rem;
    }
  }

  &.success,
  &.video {
    .actionContent__filler {
      background-color: transparent;
    }
  }

  &.success {
    .actionContent__ctas-wrapper {
      gap: 20px;
    }
  }

  &__filler {
    flex-grow: 1;
    background-color: rgba(black, 0.3);
    &.stripped {
      align-self: center;
      padding: 0 10px;
      &:first-child {
        padding-right: 25px;
      }
      &:last-child {
        padding-left: 25px;
      }

      background-color: transparent;
      .bars {
        display: grid;
        align-items: center;
        grid-template-rows: 5fr;
        gap: 5px;
        .bar {
          background-color: $color-theme;
          &.disabled {
            background-color: rgba($color-granny-smith, 0.4);
          }
          width: 100%;
          height: 2px;
        }
      }
    }
  }
  &__ctas-wrapper {
    display: grid;
    transition: all 0.2s ease;
    &.colNum1 {
      grid-template-columns: 1fr;
    }
    &.colNum2 {
      grid-template-columns: 1fr 1fr;
    }
    gap: 10px;
    margin: 0 5px;
  }

  .cta {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #ctaBuy {
    .buyLabelWrapper {
      display: flex;
      flex-direction: column;
      &__main {
        font-weight: bold;
      }
      &__price {
        font-size: 0.8em;
      }
    }
  }
}

// Transtions
.cta-enter-active,
.cta-leave-active {
  transition: opacity 0.5s ease-out;
}
.cta-enter,
.cta-leave-to {
  opacity: 0;
}

// Skip custom delayed transition
.cta--skipTransition {
  background: rgba(black, 0.3);
  /deep/ {
    .cta__label {
      color: white !important;
    }
  }
}

.cta--skip {
  transition: all 0.15s ease-out;
  &.show {
    opacity: 1;
  }
}
</style>
