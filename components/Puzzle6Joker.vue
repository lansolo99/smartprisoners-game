<template>
  <div v-if="cell.isJoker" class="joker">
    <transition name="jokerItem">
      <div class="joker__subgridContainer">
        <Puzzle6JokerSubgrid
          :joker-current-position="cell.jokerCurrentPosition"
        />
      </div>
    </transition>
  </div>
</template>

<script>
import Puzzle6JokerSubgrid from '@/components/Puzzle6JokerSubgrid.vue'
export default {
  name: 'Joker',
  components: {
    Puzzle6JokerSubgrid
  },
  props: {
    cell: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.joker {
  display: flex;
  height: 100%;
  width: 100%;

  &__innerColor {
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-anthracite;
    font-size: 18px;
    height: 100%;
    transform-origin: center;
    width: 100%;
    @include responsive(tablet) {
      font-size: 25px;
    }

    &.color1 {
      background-color: #357ab4;
    }
    &.color2 {
      background-color: #d28abc;
    }
    &.color3 {
      background-color: #f1a744;
    }
    &.color4 {
      background-color: #6bc174;
    }
  }
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
    &--1 {
      border-color: #357ab4;
      background-color: #357ab4;
    }

    &--2 {
      background-color: #d28abc;
    }

    &--3 {
      background-color: #f1a744;
    }

    &--4 {
      background-color: #6bc174;
    }
  }
  &.color1 {
    border-color: #357ab4;
    background-color: #357ab4;
  }
  &.color2 {
    border-color: #d28abc;
    background-color: #d28abc;
  }
  &.color3 {
    border-color: #f1a744;
    background-color: #f1a744;
  }
  &.color4 {
    border-color: #6bc174;
    background-color: #6bc174;
  }
}

.jokerItem-enter-active,
.jokerItem-leave-active {
  transition: all 0.1s ease-in-out;
}
.jokerItem-enter,
.jokerItem-leave-to {
  opacity: 0;
  transform: scale(0);
}
</style>
