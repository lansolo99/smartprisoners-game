<template>
  <div class="cta" @click="ctaAction()">
    <div v-if="label !== 'Buy'" class="cta__label">
      {{ label }}
    </div>
    <div v-if="label === 'Buy'">
      <slot name="innerComponent"></slot>
    </div>
    <BaseSounds ref="soundBtnBase" sound-source="btn_base" />
    <BaseSounds ref="soundBtnReset" sound-source="valid_reset" />
  </div>
</template>

<script>
export default {
  name: 'CtaSkip',
  props: {
    label: {
      type: String,
      default: 'label'
    },
    route: {
      default: '',
      type: String
    },
    events: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    ctaAction() {
      if (this.label !== 'Reset') {
        this.$refs.soundBtnBase.playSound()
      } else {
        this.$refs.soundBtnReset.playSound()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.cta {
  @include cta;
  &--goToLockScreen {
    color: white;
    position: absolute;
    bottom: 30px;

    @include responsive(mobile) {
      bottom: 10px;
    }
    left: 0;
    transform: translateX(-50%);
    left: 50%;
    border-color: rgba(white, 0.7);
    background: rgba(black, 0.5);

    &:active {
      box-shadow: inset 0px 0px 0px 2px white;
      .cta__label {
        color: white;
      }
    }
    &__label {
      color: white;
    }
    animation: opacityFliker 1s infinite;
    @keyframes opacityFliker {
      0%,
      100% {
        opacity: 0.75;
      }

      50% {
        opacity: 1;
      }
    }
  }

  &--narrow {
    padding: 0.5rem 0.5rem 0.4rem;
  }
  &--action {
    padding: 0 30px;
  }
  &--valid,
  &--gotolockscreen {
    background-color: $color-theme;
    border: none;
    color: $color-anthracite;
  }
  &--reset,
  &--skip,
  &--quit,
  &--buy {
    border: 1px solid rgba($color-granny-smith, 0.5);
    color: $color-granny-smith;
    &:active {
      background: transparent;
      box-shadow: inset 0px 0px 0px 1px $color-granny-smith;
      .cta__label {
        color: lighten($color-granny-smith, 30%);
      }
    }
  }
  &--skip {
    background: rgba(black, 0.3);
    color: white;
    width: 150px;
  }
  &--gotolockscreen {
    width: 150px;
  }
  &--gotolockscreen,
  &--unlock {
    .cta__label {
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
    }
  }
  &--gotonextdoor {
    background-color: $color-green;
    border: none;
    color: $color-anthracite;
    &:active {
      box-shadow: none;
      .cta__label {
        color: white !important;
      }
    }
  }
  &.successHalfDone {
    background-color: $color-orange;
    color: white;
  }
}
</style>
