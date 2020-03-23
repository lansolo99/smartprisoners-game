<template>
  <div class="dimmer" @click="closeSelector">
    <div v-click-outside="closeSelector" class="valuesSelectorWrapper">
      <div class="valuesSelectorWrapper__listsWrapper">
        <div class="valuesSelectorWrapper__list">
          <div
            v-for="(color, index) in colors"
            :key="index"
            class="item"
            @click="$emit('setJokerSlot', color)"
          >
            <div
              :class="['item__innerColor', `item__innerColor--${color}`]"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import vClickOutside from 'v-click-outside'
import { killTimeOuts } from '@/utils'
export default {
  name: 'Puzzle6ValuesSelector',
  directives: {
    clickOutside: vClickOutside.directive
  },
  props: {
    colors: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      displayColorList: false,
      shapesChoiceList: [],
      colorChoiceList: [],
      timeOuts: []
    }
  },
  beforeDestroy() {
    killTimeOuts(this.timeOuts)
  },
  methods: {
    closeSelector() {
      console.log('closeSelector')
      this.timeOuts.push(
        setTimeout(() => {
          this.$emit('closeSelector')
        }, 100)
      )
    },
    setColorChoiceList(shapeObject) {
      // Generate new list of colorChoice
      const colorsLists = ['orange', 'blue', 'yellow', 'green', 'white']

      // Constructor
      class Shape {
        constructor(shapeType, shapeDirection, shapeColor) {
          this.shape = shapeType
          this.direction = shapeDirection
          this.color = shapeColor
        }
      }

      // Selected attrs
      const selectedShape = shapeObject.shape
      const selectedDirection = shapeObject.direction

      // List generation
      colorsLists.forEach(color => {
        if (selectedShape === 'triangle' && color !== 'white') {
          this.colorChoiceList.push(
            new Shape(selectedShape, selectedDirection, color)
          )
          this.colorChoiceList.push(
            new Shape(selectedShape, selectedDirection, `${color} inverted`)
          )
        } else if (selectedShape !== 'triangle') {
          this.colorChoiceList.push(
            new Shape(selectedShape, selectedDirection, color)
          )
        }
      })
      this.displayColorList = true
    }
  }
}
</script>

<style lang="scss" scoped>
.dimmer {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba($color-anthracite, 0.5);

  @include responsive(tablet) {
    top: -80px;
    bottom: -80px;
  }
}

.valuesSelectorWrapper {
  overflow: hidden;
  width: 55px;
  max-height: 200px;
  height: 80%;
  padding: 5px 0px 0px 0px;
  font-size: 25px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  box-shadow: 0px 0px 14px 0px rgba(0, 0, 0, 0.8);
  background-color: lighten($color-anthracite, 10%);

  @include responsive(tablet) {
    width: 90px;
    max-height: 320px;
  }

  &__listsWrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: all 0.15s ease-out;
    &.colorList {
      transform: translateX(-50%);
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    overflow: auto;
    width: 100%;
    height: 100%;

    &:nth-child(2) {
      margin: 0 -7px;
    }

    .item {
      text-align: center;
      width: 100%;
      padding: 15px;
      flex: 1 0 auto;
      background-color: lighten($color-anthracite, 10%);
      color: rgba(white, 0.8);
      transition: all 0.2s ease;

      &__innerColor {
        height: 100%;
        &--color1 {
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

      &:nth-child(even) {
        background-color: lighten($color-anthracite, 20%);
      }
      &:active {
        background-color: $color-theme !important;
        color: white;
      }
    }
  }
}
</style>
