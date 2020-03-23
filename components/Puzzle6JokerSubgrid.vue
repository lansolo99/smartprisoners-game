<template>
  <div ref="jokerSubgridContainer" class="joker__subgridContainer">
    <div v-if="jokerCurrentPosition === 'subgrid'" class="joker__subgrid">
      <div
        v-for="(jokerSubColor, jokerSubColorIndex) in 4"
        :key="jokerSubColorIndex"
        :class="['joker__subColor', `subColor--color${jokerSubColorIndex + 1}`]"
      ></div>
    </div>

    <div v-else class="joker__subgrid">
      <div
        v-for="(jokerSubColor, jokerSubColorIndex) in 4"
        :key="jokerSubColorIndex"
        :class="['joker__subColor', `subColor--${jokerCurrentPosition}`]"
      ></div>
    </div>
  </div>
</template>

<script>
import { TweenMax } from 'gsap'
import { Back } from 'gsap/EasePack'
export default {
  name: 'JokerSubgrid',
  props: {
    jokerCurrentPosition: {
      type: String,
      required: true
    }
  },
  watch: {
    jokerCurrentPosition() {
      this.animateSubgrid()
    }
  },
  methods: {
    animateSubgrid() {
      // Subgrid reference
      const jokerSubgrid = this.$refs.jokerSubgridContainer.querySelector(
        '.joker__subgrid'
      )

      // Subgrid animation
      TweenMax.fromTo(
        jokerSubgrid,
        0.25,
        { transform: 'scale(0)' },
        {
          transform: 'scale(1)',
          ease: Back.easeOut
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.joker {
  &__subgridContainer {
    width: 100%;
    height: 100%;
  }
  &__subgrid {
    flex-grow: 1;
    display: grid;
    width: 100%;
    height: 100%;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 2px;
  }
  .subColor {
    &--color1 {
      border-color: #357ab4;
      background-color: #357ab4;
    }

    &--color2 {
      background-color: #d28abc;
    }

    &--color3 {
      background-color: #f1a744;
    }

    &--color4 {
      background-color: #6bc174;
    }
  }
}
</style>
