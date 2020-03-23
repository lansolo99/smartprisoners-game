<template>
  <div class="layer">
    <BaseLcdScreen />
    <transition name="resetLabel">
      <div v-if="displayLabel" class="glitch-wrapper label">
        <div class="glitch" data-text="REGENERATING NEW PUZZLE">
          REGENERATING NEW PUZZLE
        </div>
      </div>
    </transition>
    <BaseSounds
      ref="soundPuzzleRegenerating"
      sound-source="puzzle_regenerating"
    />
  </div>
</template>

<script>
import BaseLcdScreen from '@/components/BaseLcdScreen'
export default {
  components: {
    BaseLcdScreen
  },
  data() {
    return {
      displayLabel: false
    }
  },
  mounted() {
    this.displayLabel = true
    this.$refs.soundPuzzleRegenerating.playSound()
  }
}
</script>

<style lang="scss" scoped>
.layer {
  position: absolute;
  z-index: 2500;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
  color: $color-theme;
}
.label {
  transform: scale(0.65);
  @include responsive(tablet) {
    transform: scale(0.45);
  }
}
</style>

<style lang="scss" scoped>
@include glitch(standard);
.glitch {
  background-color: $color-theme;
}

.resetLabel-enter-active,
.resetLabel-leave-active {
  opacity: 1;
  transition: opacity 0.15s 0.2s ease-out;
}

.resetLabel-enter,
.resetLabel-leave-to {
  opacity: 0;
}
</style>
