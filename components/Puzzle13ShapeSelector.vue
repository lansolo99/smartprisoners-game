<template>
  <div class="dimmer">
    <div
      v-click-outside="closeSelector"
      :class="{ boxSolution: displayColorBoxList }"
      class="valuesSelectorWrapper"
    >
      <div
        :class="{ boxSolution: displayColorBoxList }"
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
            @click="showColoredBoxSolution(shape)"
          >
            <!-- PuzzleShape component -->
            <component
              :is="componentInstance"
              :shape-attrs="shape"
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
    },
    solution: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      timeOuts: [],
      shapesChoiceList: [],
      coloredBoxSolution: [],
      displayColorBoxList: false,
      closedFromDimmer: false
    }
  },
  computed: {
    componentInstance() {
      return () => import(`@/components/Puzzle${this.puzzleId}Shape`)
    },
    parseColorSolution() {
      // Trim index 5 solution because shape 5 match two colors
      return this.solution.split(' ').filter((color, index) => index !== 5)
    }
  },
  created() {
    this.setShapesChoiceList()
  },
  beforeDestroy() {
    killTimeOuts(this.timeOuts)
  },
  methods: {
    closeSelector(event) {
      const source = event ? event.target.className : 'sequence'
      this.timeOuts.push(
        setTimeout(() => {
          this.$emit('closeSelector', source)
        }, 100)
      )
    },
    showColoredBoxSolution(shapeObject) {
      // Btn sound
      this.$refs.btnBasePuzzle.playSound()

      // Constructor
      class Box {
        constructor(shapeType, colorSolution) {
          this.shape = shapeType
          this.colorSolution = colorSolution
        }
      }
      // Selected attrs
      const selectedShape = shapeObject.shape
      const shapeIndex = Object.values(this.shapesAttrs.shapes).indexOf(
        selectedShape
      )

      const getColorSolution = shapeOutputIndex => {
        return this.shapesAttrs.colors[
          this.parseColorSolution[shapeOutputIndex]
        ].name
      }
      const colorSolution = getColorSolution(shapeIndex)
      // Pass shape datas to parent
      this.$emit('setRiddleBox', new Box(selectedShape, colorSolution))
      this.coloredBoxSolution.push(new Box(selectedShape, colorSolution))
      this.closeSelector()
    },
    setShapesChoiceList() {
      class Shape {
        constructor(shapeType, shapeColor) {
          this.shape = shapeType
          this.color = shapeColor
        }
      }
      Object.values(this.shapesAttrs.shapes).forEach(shape => {
        this.shapesChoiceList.push(new Shape(shape, 'grey'))
      })
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
  &.boxSolution {
    height: 60px;
    animation: selectorWrapperBounce 0.25s ease-in-out;
    transform-origin: center;
    @keyframes selectorWrapperBounce {
      0% {
        transform: translateX(-50%) translateY(-50%) scale(1);
      }
      30% {
        transform: translateX(-50%) translateY(-50%) scale(1.3);
      }
      50% {
        transform: translateX(-50%) translateY(-50%) scale(1);
      }
    }
  }
  &__listsWrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 200px;
    height: 100%;
    //transition: all 0.05s ease-in-out;
    &.boxSolution {
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
