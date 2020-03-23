<template>
  <div ref="pyramid-wrapper" class="pyramid-wrapper">
    <div
      v-for="(floor, floorIndex) in pyramidData"
      :key="floorIndex"
      class="floor"
    >
      <div
        v-for="(box, boxIndex) in floor"
        :key="boxIndex"
        :class="[
          { riddle: isBoxRiddle(floorIndex, boxIndex) },
          !isBoxRiddle(floorIndex, boxIndex) ? getRandomBoxColorClass() : '',
          `box${setCurrentBoxId(floorIndex, boxIndex)}`
        ]"
        class="box"
        v-on="
          isBoxRiddle(floorIndex, boxIndex)
            ? {
                click: () =>
                  fillinRiddleValue(setCurrentBoxId(floorIndex, boxIndex))
              }
            : {}
        "
      >
        <div v-if="!isBoxRiddle(floorIndex, boxIndex)">
          {{ box }}
        </div>
        <div v-else>
          <span class="fillin">??</span>
          <span class="solution">{{ box }}</span>
        </div>
      </div>
    </div>
    <BaseSounds ref="btnBasePuzzle" sound-source="btn_base_puzzle" />
  </div>
</template>
<script>
import { getRandomIntInclusive } from '@/utils'
import { EventBus } from '@/bus'
export default {
  name: 'Pyramid',
  props: {
    pyramidData: {
      type: Array,
      required: true
    },
    pyramidId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      hiddenBoxes: [],
      boxColorsClasses: ['blue', 'red', 'yellow']
    }
  },
  created() {
    // this.hiddenBoxes = getUniqueRandomInts(10, 6)
    this.hiddenBoxes = this.setHiddenBoxes(this.pyramidId)
  },
  mounted() {
    EventBus.$on('changeBoxValue', ({ pyramidId, pyramidBoxId, number }) => {
      // Filter action for the right pyramidId
      if (pyramidId === this.pyramidId) {
        // Box ref
        const boxReference = this.$refs['pyramid-wrapper'].querySelector(
          `.box${pyramidBoxId}`
        )
        // Change box number
        boxReference.querySelector('.fillin').innerHTML = number

        // Change box color
        boxReference.classList.add('filled')
      }
    })
    EventBus.$on('resetPyramidsBoxes', () => {
      this.resetPyramidsBoxes()
    })
  },
  methods: {
    setCurrentBoxId(currentFloor, currentBoxIndex) {
      let countPassedBox = 0
      for (let i = 0; i < currentFloor; i++) {
        countPassedBox += this.pyramidData[i].length
      }
      return countPassedBox + currentBoxIndex
    },
    isBoxRiddle(floorIndex, boxIndex) {
      return this.hiddenBoxes.includes(
        this.setCurrentBoxId(floorIndex, boxIndex)
      )
    },
    getRandomBoxColorClass() {
      const randomIndex = getRandomIntInclusive(
        0,
        this.boxColorsClasses.length - 1
      )

      return this.boxColorsClasses[randomIndex]
    },
    fillinRiddleValue(pyramidBoxId) {
      // Btn sound
      this.$refs.btnBasePuzzle.playSound()

      const pyramidId = this.pyramidId
      EventBus.$emit('displayValuesSelector', { pyramidId, pyramidBoxId })
    },
    boxesValidation() {
      const riddlesBoxes = this.$refs['pyramid-wrapper'].querySelectorAll(
        '.riddle'
      )
      const mapCheckboxesResult = v => {
        const fillin = v.querySelector('.fillin').innerHTML
        const solution = v.querySelector('.solution').innerHTML
        return fillin === solution ? 'true' : 'false'
      }
      const checkBoxesEntries = Array.prototype.map
        .call(riddlesBoxes, mapCheckboxesResult)
        .every(v => v === 'true')
      // return true
      return checkBoxesEntries
    },
    resetPyramidsBoxes() {
      // Riddle box list
      const riddleBoxes = this.$refs['pyramid-wrapper'].querySelectorAll(
        '.riddle'
      )
      riddleBoxes.forEach(node => {
        // Reset box number
        node.querySelector('.fillin').innerHTML = '??'
        // Reset box color
        node.classList.remove('filled')
      })
    },
    setHiddenBoxes(pyramidId) {
      // Order from top to bottom

      // Pyramid 1
      const setPyramid1HiddenBoxes = () => {
        // line 1 -> 0 riddles || 0
        // line 2 -> 2 riddles |xx| 1-2
        // line 3 -> 2 riddles |x| 3-4-5
        // line 4 -> 3 riddles |xxx| 6-7-8-9
        const line2 = [1, 2]
        const line3 = [5]
        const line4 = [6, 7, 8]
        return [line2, line3, line4].flat()
      }

      // Pyramid 2
      const setPyramid2HiddenBoxes = () => {
        // line 1 -> 2 riddles |xx| 0-1-2-3
        // line 2 -> 2 riddles |xx| 4-5-6
        // line 3 -> 1 riddles |x| 7-8
        // line 4 -> 1 riddles |x| 9
        const line1 = [0, 2]
        const line2 = [4, 6]
        const line3 = [8]
        const line4 = [9]
        return [line1, line2, line3, line4].flat()
      }

      return pyramidId === 1
        ? setPyramid1HiddenBoxes()
        : setPyramid2HiddenBoxes()
    }
  }
}
/* eslint-enable no-unused-vars */
</script>

<style lang="scss" scoped>
.pyramid-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.floor {
  display: inline-flex;
  margin: 5px 0;
}
.box {
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba($color-matterhorn, 0.5);
  border-radius: 10px;
  width: 40px;
  margin: 0 3px;
  padding: 5px 7px 2px;
  font-size: 1.5rem;
  transition: all 0.1s ease-out;

  .fillin {
    animation: fillinAnimation 0.6s infinite ease-out;
    @keyframes fillinAnimation {
      0% {
        color: $color-anthracite;
      }
      50% {
        color: $color-golden;
      }
      100% {
        color: $color-anthracite;
      }
    }
  }

  &.blue {
    background-color: rgba($color-cyan, 1);
  }
  &.yellow {
    background-color: rgba($color-golden, 1);
  }
  &.red {
    background-color: rgba($color-theme, 1);
  }
  &.filled {
    background-color: rgba($color-green, 1) !important;
    border-color: darken($color-green, 10%) !important;
    color: white !important;
    .fillin {
      animation: none;
      color: white;
    }
  }
  &.riddle {
    border: 3px solid $color-golden;
    background-color: white;
    color: $color-anthracite;
  }
}
.solution {
  display: none;
}
</style>
