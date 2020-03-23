<template>
  <div>
    <!-- LOW -->
    <svg
      v-if="securityLevel === 'low'"
      :class="currentState"
      viewBox="0 0 40 40"
    >
      <path
        stroke-width="2.8"
        stroke-miterlimit="10"
        d="M16.2 8.7h7.6l7.5 7.6v7.5l-7.5 7.6h-7.6l-7.6-7.6v-7.5z"
      />
    </svg>
    <!-- HIGH -->
    <svg
      v-if="securityLevel === 'high'"
      :class="currentState"
      viewBox="0 0 40 40"
    >
      <path
        fill="#182021"
        d="M14 2.3h11.9L37.8 14v11.9L25.9 37.8H14L2.3 25.9V14z"
      />
      <path d="M16.2 8.7h7.6l7.6 7.5v7.6l-7.6 7.6h-7.6l-7.5-7.6v-7.6z" />
      <path
        fill="none"
        stroke-width="3.7"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-miterlimit="10"
        d="M14.1 2.4h11.8l11.8 11.8V26L25.9 37.7H14.1L2.3 26V14.2z"
      />
    </svg>
    <BaseSounds ref="soundMapDotBip" sound-source="map_dot_bip" />
  </div>
</template>

<script>
export default {
  name: 'Dot',
  props: {
    securityLevel: {
      type: String,
      default: 'low'
    },
    currentState: {
      type: String,
      default: 'off'
    }
  },
  data() {
    return {
      states: ['on', 'off', 'passed']
    }
  },
  watch: {
    currentState: {
      handler(val, oldval) {
        if (val === 'on') {
          this.$refs.soundMapDotBip.playSound()
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
svg {
  transition: all 0.4s ease-in-out;

  &.off {
    fill: $color-blue-3;
    stroke: $color-blue-3;
  }
  &.on {
    fill: $color-yellow;
    stroke: white;
    transform: scale(1.5);
  }
  &.passed {
    fill: $color-cyan;
    stroke: white;
  }
}
</style>
