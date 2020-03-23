<template>
  <div class="dimmer">
    <div v-click-outside="closeSelector" class="valuesSelectorWrapper">
      <div
        :class="{ colorList: displayColorList }"
        class="valuesSelectorWrapper__listsWrapper"
      >
        <div
          class="valuesSelectorWrapper__list valuesSelectorWrapper__shapesChoice"
        >
          <div
            v-for="(shape, shapeIndex) in shapesChoiceList"
            :key="shapeIndex"
            class="item"
            @click="setColorChoiceList(shape)"
          >
            <Puzzle8Shape :shape-attrs="shape" class="shape" />
          </div>
        </div>
        <div
          class="valuesSelectorWrapper__list valuesSelectorWrapper__colorsChoice"
        >
          <div
            v-for="(color, colorIndex) in colorChoiceList"
            :key="colorIndex"
            class="item"
            @click="$emit('setRiddleSlot', color)"
          >
            <Puzzle8Shape :shape-attrs="color" class="shape" />
          </div>
        </div>
      </div>
    </div>
    <BaseSounds ref="btnBasePuzzle" sound-source="btn_base_puzzle" />
  </div>
</template>

<script>
import vClickOutside from 'v-click-outside'
import Puzzle8Shape from '@/components/Puzzle8Shape.vue'
export default {
  name: 'Puzzle8ShapeSelector',
  components: {
    Puzzle8Shape
  },
  directives: {
    clickOutside: vClickOutside.directive
  },
  props: {},
  data() {
    return {
      displayColorList: false,
      shapesChoiceList: [],
      colorChoiceList: []
    }
  },
  created() {
    this.setShapesChoiceList()
  },
  methods: {
    closeSelector() {
      setTimeout(() => {
        this.$emit('closeSelector')
      }, 100)
    },
    setColorChoiceList(shapeObject) {
      // Btn sound
      this.$refs.btnBasePuzzle.playSound()

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
    },
    setShapesChoiceList() {
      class Shape {
        constructor(shapeType, shapeDirection, shapeColor) {
          this.shape = shapeType
          this.direction = shapeDirection
          this.color = shapeColor
        }
      }
      this.shapesChoiceList.push(new Shape('triangle', 'top', 'grey'))
      this.shapesChoiceList.push(new Shape('triangle', 'right', 'grey'))
      this.shapesChoiceList.push(new Shape('triangle', 'bottom', 'grey'))
      this.shapesChoiceList.push(new Shape('triangle', 'left', 'grey'))
      this.shapesChoiceList.push(new Shape('circle', 'none', 'grey'))
      this.shapesChoiceList.push(new Shape('losange', 'none', 'grey'))
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
  width: 100px;
  max-height: 420px;
  height: 80%;
  padding: 5px 0px 0px 0px;
  font-size: 25px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  box-shadow: 0px 0px 14px 0px rgba(0, 0, 0, 0.25);
  background-color: lighten($color-anthracite, 10%);
  &__listsWrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 200px;
    height: 100%;
    transition: all 0.15s ease-out;
    &.colorList {
      transform: translateX(-50%);
    }
  }

  &__list {
    display: inline-block;
    vertical-align: top;

    &:nth-child(2) {
      margin: 0 -7px;
    }

    overflow: auto;
    width: 100px;
    height: 100%;
    .item {
      text-align: center;
      width: 100%;
      padding: 20px 30px;
      background-color: lighten($color-anthracite, 10%);
      color: rgba(white, 0.8);
      transition: all 0.2s ease;

      &:nth-child(even) {
        background-color: lighten($color-anthracite, 20%);
      }
      &:active {
        background-color: $color-theme !important;
        color: white;
      }
    }
  }

  &__shapesChoice,
  &__colorsChoice {
    .item {
      position: relative;
      padding: 10px;
    }
  }
}
</style>
