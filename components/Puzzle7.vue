<template>
  <div class="puzzleContainer__gridContent">
    <div ref="puzzleContent" class="puzzleContent">
      <div
        class="puzzleContent__numbersGrid puzzleContent__flexibleArea numbersGrid"
      >
        <!-- Serie grid-->
        <div
          v-for="(grid, gridIndex) in 4"
          :key="gridIndex"
          class="numbersGrid__grid"
        >
          <div
            v-for="(cell, cellIndex) in gridCells.slice(
              gridIndex * 8,
              gridIndex * 8 + 8
            )"
            :key="cell.id"
            :class="[
              cell.color,
              { selected: cell.selected },
              { animated: cell.animated }
            ]"
            class="cell"
            @click="selectCell(gridIndex, gridIndex * 8 + cellIndex)"
          >
            <div class="cell__diamond">
              <svg viewBox="0 0 50 50">
                <path
                  class="cell__diamond-rect"
                  d="M50 17.2L32.8 0H17.2L0 17.2v15.6L17.2 50h15.6L50 32.8z"
                />
              </svg>
            </div>
            <div :class="{ animated: cellAnimated }" class="cell__inner">
              {{ cell.data }}
            </div>
          </div>
        </div>
      </div>
      <!-- Big life icon overlay -->
      <BaseBigLifeIcon ref="bigLifeIcon" />
    </div>
    <PuzzleActions
      :cols-num="2"
      :ctas="['reset', 'valid']"
      :disable="disableValid"
      @resetPuzzleActions="resetPuzzleActions()"
      @validPuzzle="validPuzzle()"
    />
    <!-- Sounds -->
    <BaseSounds ref="puzzleError" sound-source="valid_error" />
    <BaseSounds ref="puzzleSuccess" sound-source="valid_success" />
    <BaseSounds ref="dragDropped" sound-source="drag_dropped" />
  </div>
</template>
<script>
import Vue from 'vue'
import { TimelineMax } from 'gsap'
import { Expo } from 'gsap/EasePack'
import PuzzleActions from '@/components/PuzzleActions.vue'
import { EventBus } from '@/bus'
import {
  killTimeOuts,
  getRandomIntInclusive,
  shuffleArray,
  rangeArray
} from '@/utils'
import { validPuzzle, shakePuzzle } from '@/mixins/validPuzzle.js'
import BaseBigLifeIcon from '@/components/BaseBigLifeIcon'

export default {
  name: 'Puzzle7',
  components: {
    BaseBigLifeIcon,
    PuzzleActions
  },
  mixins: [validPuzzle, shakePuzzle],
  data() {
    return {
      disableValid: true,
      timeOuts: [],
      serieMultiplesRestriction: [3, 5, 7],
      gridCells: [],
      gridCellsTempBackup: [],
      colors: ['color1', 'color2', 'color3', 'color4'],
      selectedCells: [],
      cellAnimated: true
    }
  },
  computed: {
    randomizeColor() {
      return shuffleArray(this.colors)
    },
    intrudersHelper() {
      return this.gridCells.filter(v => v.intruder === true).map(v => v.data)
    }
  },
  created() {
    /* ==============================================================
                           Generate data
    ================================================================ */
    // Generate gridCells data
    this.generateNumbersGridData()
    // Push id references to gridCells items
    this.gridCells.forEach((v, i) => {
      Vue.set(this.gridCells[i], 'id', i)
    })
  },
  mounted() {
    /* ==============================================================
                            Show hint
    ================================================================ */

    // Helper dev -> immediatly trigger showHint (with delay to avoid asynchronous errors)
    // setTimeout(() => {
    //   this.showHint()
    // }, 1500)

    EventBus.$on('showHint', () => {
      // Record active user cells
      this.gridCellsTempBackup = JSON.parse(JSON.stringify(this.gridCells))
      // Reset selected cells
      this.resetPuzzleActions()
      // Trigger showHint with slight delay
      this.timeOuts.push(
        setTimeout(() => {
          this.showHint()
        }, 500)
      )
    })
  },
  beforeDestroy() {
    EventBus.$off('showHint')
    killTimeOuts(this.timeOuts)
  },
  methods: {
    setCustomDivisionTable(multiple, oddEven) {
      const divisibleSet = []
      ;[...Array(80)].reduce((acc, cur, i) => {
        if (oddEven === 'odd') {
          if (i % multiple !== 0) {
            divisibleSet.push(i)
          }
        } else if (i % multiple === 0) {
          divisibleSet.push(i)
        }
      })
      return divisibleSet
    },
    setNonMultipleSerie(multiple) {
      const intruderSet = []
      ;[...Array(100)].reduce((acc, cur, i) => {
        if (i % multiple !== 0) {
          intruderSet.push(i)
        }
      })
      return intruderSet
    },
    setSerie(rule, multiple) {
      let serie = []
      switch (rule) {
        case 'divisible':
          serie = this.setCustomDivisionTable(multiple)
          break
        case 'odd':
          serie = this.setCustomDivisionTable(2, 'odd')
          break
        case 'even':
          serie = this.setCustomDivisionTable(2, 'even')
          break
      }
      return serie
    },
    setIntrudersSerie(rule, multiple) {
      let intrudersSerie = []
      switch (rule) {
        case 'non-divisible':
          intrudersSerie = this.setNonMultipleSerie(multiple)
          break
        case 'non-odd':
          intrudersSerie = this.setCustomDivisionTable(2, 'even')
          break
        case 'non-even':
          intrudersSerie = this.setCustomDivisionTable(2, 'odd')
          break
      }
      return intrudersSerie
    },
    randomizeSerie(serie) {
      const shuffledSerie = shuffleArray(serie)
      return shuffledSerie
    },
    reduceSerie(serie, length) {
      const reducedSerie = serie
      reducedSerie.length = length
      return reducedSerie
    },
    generateNumbersGridData() {
      // 4 SERIES OF 8 NUMBERS
      //
      // SERIE1 -> divisibles by n
      const setRandomIndex = getRandomIntInclusive(0, 2)
      // Pick among restricted multiples
      const setRandomMultiple1 = this.serieMultiplesRestriction[setRandomIndex]
      // Set non intruders serie |1 intruders + 7 normal|
      const setSerie1 = this.reduceSerie(
        this.randomizeSerie(this.setSerie('divisible', setRandomMultiple1)),
        7
      )
      // Set single intruder
      const setIntruderSerie1 = this.reduceSerie(
        this.randomizeSerie(
          this.setIntrudersSerie('non-divisible', setRandomMultiple1)
        ),
        1
      )

      // SERIE2 -> odds
      // Set non intruders serie
      const setSerie2 = this.reduceSerie(
        this.randomizeSerie(this.setSerie('odd')),
        7
      )
      // Set single intruder
      const setIntruderSerie2 = this.reduceSerie(
        this.randomizeSerie(this.setIntrudersSerie('non-odd')),
        1
      )

      // SERIE3 -> evens
      // Set non intruders serie
      const setSerie3 = this.reduceSerie(
        this.randomizeSerie(this.setSerie('even')),
        7
      )
      // Set single intruder
      const setIntruderSerie3 = this.reduceSerie(
        this.randomizeSerie(this.setIntrudersSerie('non-even')),
        1
      )

      // SERIE4 -> divisible by n
      // Pick a multiple among 2 remainings
      const setRandomMultiple2 = shuffleArray(
        this.serieMultiplesRestriction.filter(v => {
          return v !== setRandomMultiple1
        })
      )[0]

      // Set non intruders serie
      const setSerie4 = this.reduceSerie(
        this.randomizeSerie(this.setSerie('divisible', setRandomMultiple2)),
        7
      )
      // Set intruder
      const setIntruderSerie4 = this.reduceSerie(
        this.randomizeSerie(
          this.setIntrudersSerie('non-divisible', setRandomMultiple2)
        ),
        1
      )

      const allSeries = {
        serie1: [setSerie1, setIntruderSerie1],
        serie2: [setSerie2, setIntruderSerie2],
        serie3: [setSerie3, setIntruderSerie3],
        serie4: [setSerie4, setIntruderSerie4]
      }
      // SET LOCAL STATE

      // Cell constructor
      class Cell {
        constructor(serie, data, color, intruder = false) {
          this.serie = serie
          this.data = data
          this.color = color
          this.intruder = intruder
          this.selected = false
          this.animated = true
        }
      }
      // Populate gridCells local state
      for (let i = 1; i < 5; i++) {
        const cellsSerie = allSeries[`serie${i}`][0].map((value, index) => {
          return new Cell(`serie${i}`, value, this.randomizeColor[i - 1])
        })
        // Push Intruder
        cellsSerie.push(
          new Cell(
            `serie${i}`,
            ...allSeries[`serie${i}`][1],
            this.randomizeColor[i - 1],
            true
          )
        )
        // const randomizedSerie =
        this.gridCells.push(...shuffleArray(cellsSerie))
      }
    },
    checkPuzzle() {
      const selectedCells = this.gridCells.filter(v => v.selected)
      if (selectedCells.length === 4) {
        return selectedCells.every(v => {
          return v.intruder
        })
      }
    },
    resetPuzzleActions() {
      this.gridCells.forEach(cell => {
        cell.selected = false
      })
    },
    selectCell(gridIndex, cellIndex) {
      // Enable valid btn
      this.disableValid = false

      // Dropped sound
      this.$refs.dragDropped.playSound()

      // Get all indexes of the same grid
      const currentGridCellIndexes = rangeArray(
        gridIndex * 8,
        gridIndex * 8 + 8 - 1
      )

      // Reset all selected cells from the same grid
      currentGridCellIndexes.forEach(v => {
        // Do not deselect current cellIndex so we can toggle it
        if (v !== cellIndex) {
          this.gridCells[v].selected = false
        }
      })

      // Toggle selected property
      this.gridCells[cellIndex].selected = !this.gridCells[cellIndex].selected

      // Re-sync blinking animation
      this.gridCells.forEach(v => {
        v.animated = false
      })
      this.timeOuts.push(
        setTimeout(() => {
          this.gridCells.forEach(v => {
            v.animated = true
          })
        }, 100)
      )
    },
    showHint() {
      // Complete event
      const showHintComplete = () => {
        this.timeOuts.push(
          setTimeout(() => {
            // Clean styles attributes
            cellElements.forEach(element => {
              element.removeAttribute('style')
            })
            this.gridCells = JSON.parse(
              JSON.stringify(this.gridCellsTempBackup)
            )
            EventBus.$emit('showHintComplete')
          }, 500)
        )
      }

      // Freeze cells animation
      this.cellAnimated = false

      // Get DOM elements of a single serie
      // Shapes
      const shapeElements = this.$refs.puzzleContent.querySelectorAll(
        '.numbersGrid .cell.color2 .cell__diamond-rect'
      )
      // Inner text
      const innerCellElements = this.$refs.puzzleContent.querySelectorAll(
        '.numbersGrid .cell.color2 .cell__inner'
      )
      // Concat elements
      const cellElements = [...shapeElements, ...innerCellElements]

      // Select intruder after group blink
      const selectIntruder = () => {
        //
        const intruderIndex = () => {
          let index = 0
          this.gridCells.forEach((v, i) => {
            if (v.color === 'color2' && v.intruder === true) {
              index = i
            }
          })
          return index
        }
        // Init
        this.timeOuts.push(
          setTimeout(() => {
            // Select intruder
            const intruderGridIndex = Math.floor(intruderIndex() / 8)
            this.selectCell(intruderGridIndex, intruderIndex())
            this.timeOuts.push(
              setTimeout(() => {
                // Unselect intruder
                this.selectCell(intruderGridIndex, intruderIndex())
                showHintComplete()
              }, 1300)
            )
          }, 500)
        )
      }

      // GSAP Timeline
      const timelineHint = new TimelineMax({
        repeat: 4,
        repeatDelay: 0.3,
        onComplete: selectIntruder
      })

      timelineHint.to(cellElements, 0.2, {
        fill: '#ffffff',
        color: '#182021',
        fontSize: '22px',
        ease: Expo.easeInOut
      })

      timelineHint.to(cellElements, 0.3, {
        fill: '#ffffff',
        color: '#182021',
        fontSize: '22px'
      })

      timelineHint.to(cellElements, 0.2, {
        fill: '#182021',
        color: '#ffffff',
        fontSize: '20px',
        ease: Expo.easeInOut
      })
    }
  }
}
/* eslint-enable no-unused-vars */
</script>

<style lang="scss" scoped>
@include puzzleContainerGridContent;

// Puzzle content
.puzzleContent {
  @include puzzleContentBaseProperties;
  &__flexibleArea {
    @include responsive(tablet) {
      transform: scale(1.5);
    }
  }
  &__action {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .cta {
    margin: 5px;
    width: 100px;
    &--reset {
      border-color: grey;
      color: grey;
    }
  }
}

.numbersGrid {
  width: 420px;
  height: 190px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 18px;
  margin: 0px 0px;

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: 1fr 1fr;
    gap: 5px;
  }
}

.cell {
  display: flex;
  border-radius: 2px;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.15s ease-in-out;
  &.animated {
    &:not(.selected) {
      .cell__inner {
        &.animated {
          animation: blinking infinite 1s;
          @keyframes blinking {
            0% {
              opacity: 1;
            }
            49% {
              opacity: 1;
            }
            50% {
              opacity: 0.8;
            }
            100% {
              opacity: 0.8;
            }
          }
        }
      }
    }
  }

  &.color1 {
    background-color: #35c5bf;
  }
  &.color2 {
    background-color: #a1c9c9;
  }
  &.color3 {
    background-color: #e09b57;
  }
  &.color4 {
    background-color: #7ed37f;
  }

  &__diamond {
    transition: all 0.15s ease-out;
    &-rect {
      fill: $color-anthracite;
    }
    position: absolute;
    width: 100%;
    height: 100%;
    // top: 50%;
    // left: 50%;
    // transform: translateX(-50%) translateY(-50%);
    // width: 120%;
    // height: 120%;
  }
  &__inner {
    position: absolute;
    transition: font-size 0.25s cubic-bezier(0.06, 1.45, 0.77, 1.08);
    top: calc(50% - (-2px));
    left: 50%;
    font-size: 20px;
    transform: translateX(-50%) translateY(-50%);
    color: white;
    text-align: center;
  }
  &.selected {
    border: 4px solid #cec849;
    .cell__diamond {
      &-rect {
        fill: white;
      }
    }
    .cell__inner {
      font-size: 22px;
      font-weight: bold;
      color: $color-anthracite;
    }
  }
}
</style>
