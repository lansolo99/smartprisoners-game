<template>
  <div class="dimmer">
    <div v-click-outside="closeSelector" class="valuesSelectorWrapper">
      <div
        :class="{ colorList: displayColorList }"
        class="valuesSelectorWrapper__listsWrapper"
      >
        <!-- Choice : shapes -->
        <div
          class="valuesSelectorWrapper__list valuesSelectorWrapper__shapesChoice"
        >
          <div
            v-for="(shape, shapeIndex) in shapesChoiceList"
            :key="shapeIndex"
            class="item"
            @click="setColorChoiceList(shape)"
          >
            <!-- PuzzleShape component -->
            <component
              :is="componentInstance"
              :shape-attrs="shape"
              class="shape"
            />
          </div>
        </div>
        <!-- Choice : colors -->
        <div
          class="valuesSelectorWrapper__list valuesSelectorWrapper__colorsChoice"
        >
          <div
            v-for="(color, colorIndex) in colorChoiceList"
            :key="colorIndex"
            class="item"
            @click="$emit('setRiddleSlot', color)"
          >
            <!-- PuzzleShape component -->
            <component
              :is="componentInstance"
              :shape-attrs="color"
              class="shape"
            />
          </div>
        </div>
      </div>
    </div>
    <BaseSounds ref="btnBasePuzzle" sound-source="btn_base_puzzle" />
  </div>
</template>

<script>
/* eslint-disable vue/require-component-is */
import vClickOutside from 'v-click-outside'
import { killTimeOuts } from '@/utils'
export default {
  name: 'PuzzleShapeSelector',
  directives: {
    clickOutside: vClickOutside.directive
  },
  props: {
    puzzleId: {
      type: Number,
      required: true
    },
    shapesAttrs: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      timeOuts: [],
      displayColorList: false,
      shapesChoiceList: [],
      colorChoiceList: []
    }
  },
  computed: {
    componentInstance() {
      return () => import(`@/components/Puzzle${this.puzzleId}Shape`)
    }
  },
  created() {
    this.setShapesChoiceList()
  },
  beforeDestroy() {
    killTimeOuts(this.timeOuts)
  },
  methods: {
    closeSelector() {
      this.timeOuts.push(
        setTimeout(() => {
          this.$emit('closeSelector')
        }, 100)
      )
    },
    setColorChoiceList(shapeObject) {
      // Btn sound
      this.$refs.btnBasePuzzle.playSound()

      console.log('shapeObject', shapeObject)

      // Generate new list of colorChoice
      const colorsLists = Object.values(this.shapesAttrs.color)

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
        this.colorChoiceList.push(
          new Shape(selectedShape, selectedDirection, color)
        )
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
      this.shapesChoiceList.push(new Shape('triangle', 'bottom', 'grey'))
      this.shapesChoiceList.push(
        new Shape('triangleCollision', 'horizontal', 'grey')
      )
      this.shapesChoiceList.push(
        new Shape('triangleCollision', 'vertical', 'grey')
      )
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
  max-height: 240px;
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
      .shape {
        &::v-deep {
          #triangle,
          #circle,
          #losange {
            height: 50px;
          }
        }
      }
    }
  }
}
</style>
