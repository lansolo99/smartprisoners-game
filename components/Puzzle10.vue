<template>
  <div class="puzzleContainer__gridContent">
    <div ref="puzzleContent" class="puzzleContent">
      <div
        v-multi-ref:keysZones
        class="puzzleContent__railGrid puzzleContent__flexibleArea railGrid"
      >
        <!-- Tracks -->
        <div
          v-for="(track, trackIndex) in tracks"
          :id="`track${trackIndex}`"
          :key="trackIndex"
          class="railGridPolyline"
        ></div>

        <!-- Hexs -->
        <div
          v-for="hex in railGridHexs"
          :id="hex.id"
          :key="hex.id"
          :data-dropzone="hex.id"
          :data-value="hex.value.toString()"
          class="railGrid__hex dropzone"
          :class="[
            hex.draggable ? 'draggable-dropzone--occupied' : '',
            { highlighted: hex.highlighted }
          ]"
        >
          <HexagonBack :id="hex.value.toString()" :puzzle-id="10" />
          <!-- hexs id helper -->
          <!-- <HexagonBack :id="hex.id.toString()" :puzzle-id="10" /> -->

          <HexagonDraggable
            v-if="hex.draggableAtInit"
            :id="hex.draggableIdAtInit"
            :puzzle-id="10"
            :landable-zone-mirrored-id="
              getParentLandableZoneValue(hex.draggableIdAtInit)
            "
            :is-parent-landable-zone="true"
            :color="colors[series[hex.draggableIdAtInit - 1].colorId]"
            class="item railGrid__draggable"
          />
        </div>

        <!-- References / Series -->
        <div class="railGrid__references references">
          <div
            v-for="serie in shuffledSeries"
            :id="serie.id"
            :key="serie.id"
            :ref="serie.serieType"
            class="references__serie"
            :class="[`refColor${serie.colorId + 1}`, serie.serieType]"
          >
            <span
              v-for="(item, serieItemIndex) in serie.serie"
              :key="serieItemIndex"
              class="serie__item"
              :class="{ riddle: serieItemIndex === serie.serie.length - 1 }"
            >
              <span class="serie__number">
                <span
                  v-if="serieItemIndex !== serie.serie.length - 1"
                  class="basic"
                >
                  {{ item }}</span
                ><span v-else class="riddle"
                  ><span class="riddle">??</span
                  ><span class="solution">{{ item }}</span></span
                ></span
              ><span
                v-if="serieItemIndex !== serie.serie.length - 1"
                class="dash"
                >-</span
              >
            </span>
          </div>
        </div>
      </div>

      <!-- Big life icon overlay -->
      <BaseBigLifeIcon ref="bigLifeIcon" />
    </div>
    <PuzzleActions
      :cols-num="1"
      :ctas="['valid']"
      :disable="disableValid"
      @validPuzzle="validPuzzle()"
    />
    <!-- Sounds -->
    <BaseSounds ref="puzzleError" sound-source="valid_error" />
    <BaseSounds ref="puzzleSuccess" sound-source="valid_success" />
    <BaseSounds ref="dragDropped" sound-source="drag_dropped" />
  </div>
</template>
<script>
import { TimelineMax } from 'gsap'
import { Expo } from 'gsap/EasePack'
import { Droppable } from '@shopify/draggable'
import SVG from 'svg.js'
import HexagonBack from '@/components/Puzzle1HexagonBack'
import HexagonDraggable from '@/components/Puzzle1HexagonDraggable'
import PuzzleActions from '@/components/PuzzleActions.vue'
import { EventBus } from '@/bus'
import { validPuzzle, shakePuzzle } from '@/mixins/validPuzzle.js'
import { droppableRemoveMirror } from '@/mixins/droppableRemoveMirror.js'
import BaseBigLifeIcon from '@/components/BaseBigLifeIcon'
import {
  killTimeOuts,
  getUniqueRandomInts,
  getRandomIntInclusive,
  hasDuplicates,
  shuffleArray,
  rangeArray
} from '@/utils'

export default {
  name: 'Puzzle10',
  components: {
    HexagonBack,
    HexagonDraggable,
    BaseBigLifeIcon,
    PuzzleActions
  },
  mixins: [validPuzzle, shakePuzzle, droppableRemoveMirror],
  data() {
    return {
      disableValid: true,
      timeOuts: [],
      puzzleContentRef: '',
      droppable: {},
      series: [],
      hexsVolume: 11,
      serieTypes: ['sumUpToNext', 'fix+gaped', 'gapedx2', 'sumUp+1ToNext'],
      colors: ['#537EEA', '#b357db', '#ec5486', '#ebd245'],
      seriesSolutions: [],
      randomizedDummyValues: [],
      railGridHexs: [],
      trackJunctionsHexsIds: [1, 16, 21],
      tracks: {
        main: {
          slotsIds: [6, 7, 8, 9, 10, 5, 2, 1],
          polyline: [],
          color: '#FFA81E'
        },
        centralLeft: {
          slotsIds: [0, 3, 8],
          polyline: [],
          color: '#9EC421'
        },
        centralRight: {
          slotsIds: [4, 9],
          polyline: [],
          color: '#859CA2'
        }
      }
    }
  },
  computed: {
    shuffledSeries() {
      return shuffleArray(this.series)
    },
    parseSerieAsDashedString() {
      return this.series.map(v => {
        return v.serie
          .join('-')
          .slice(0, -2)
          .concat(' ??')
      })
    }
  },
  created() {
    this.setSeriesAsData()
    this.setHexagonsData()
  },
  mounted() {
    this.timeOuts.push(
      setTimeout(() => {
        this.setHexagonRailData()
        this.setDroppables()
      }, 500)
    )

    /* =============================================
                      Show hint
    ============================================= */

    // Helper dev -> immediatly trigger showHint (with delay to avoid asynchronous errors)
    // setTimeout(() => {
    //   this.showHint()
    // }, 1000)

    // Trigger showHint with event
    EventBus.$on('showHint', () => {
      // Delay show hint execution
      this.timeOuts.push(
        setTimeout(() => {
          this.showHint()
        }, 500)
      )
    })
  },
  beforeDestroy() {
    killTimeOuts(this.timeOuts)
    EventBus.$off('showHint')
    this.droppable.destroy()
  },
  methods: {
    setSeriesAsData() {
      // Generate references series
      let generatedSeries = this.generateSeries()
      let checkedSeries = this.checkDuplicatesInSeries(generatedSeries)
      // Eliminate duplicates
      while (!checkedSeries) {
        generatedSeries = this.generateSeries()
        checkedSeries = this.checkDuplicatesInSeries(generatedSeries)
      }

      class Serie {
        constructor(id, serie, colorId, serieType) {
          this.id = id
          this.serie = serie
          this.colorId = colorId
          this.serieType = serieType
        }
      }

      const shuffledColorsId = shuffleArray([...Array(4).keys()])
      generatedSeries.forEach((serie, i) => {
        const id = i + 1
        const colorId = shuffledColorsId[i]
        const serieType = this.serieTypes[i]
        const serieObj = new Serie(id, serie, colorId, serieType)
        this.series.push(serieObj)
      })
    },
    generateSeries() {
      // 4 SERIES OF 6 NUMBERS

      // SERIE1
      const setSerie1 = this.setSerie(1)
      // SERIE2
      const setSerie2 = this.setSerie(2)
      // SERIE3
      const setSerie3 = this.setSerie(3)
      // SERIE4
      const setSerie4 = this.setSerie(4)

      return [setSerie1, setSerie2, setSerie3, setSerie4]
    },
    setSerie(serieId) {
      switch (serieId) {
        case 1: {
          // Previous items pair sum up to next item
          // Limited to 4 to avoid big figures
          const setRandomInteger1 = getRandomIntInclusive(0, 4)
          const setRandomInteger2 = getRandomIntInclusive(1, 4)
          const serie = [setRandomInteger1, setRandomInteger2]
          while (serie.length < 6) {
            const currentIndex = serie.length
            const sum = serie[currentIndex - 1] + serie[currentIndex - 2]
            serie.push(sum)
          }
          return serie
        }
        case 2: {
          // Two Alternated series with one fixed, other is gap
          const setRandomFixedsInteger = getRandomIntInclusive(0, 9)
          const setRandomGapStarter = getRandomIntInclusive(1, 9)
          const setRandomGapInteger = getRandomIntInclusive(1, 6)
          const serie = []
          while (serie.length < 6) {
            if (serie.length % 2 === 0) {
              serie.push(setRandomFixedsInteger)
            } else if (serie.length === 1) {
              serie.push(setRandomGapStarter)
            } else {
              serie.push(serie[serie.length - 2] + setRandomGapInteger)
            }
          }
          return serie
        }
        case 3: {
          // Two Alternated series with 2 differents gaps
          const uniqueGapsStarters = getUniqueRandomInts(9, 2)
          const setRandomGapStarter1 = uniqueGapsStarters[0]
          const setRandomGapStarter2 = uniqueGapsStarters[1]
          const setRandomGapInteger1 = getRandomIntInclusive(1, 6)
          const setRandomGapInteger2 = getRandomIntInclusive(1, 6)
          const serie = []
          while (serie.length < 6) {
            if (serie.length % 2 === 0) {
              if (serie.length === 0) {
                serie.push(setRandomGapStarter1)
              } else {
                serie.push(serie[serie.length - 2] + setRandomGapInteger1)
              }
            } else if (serie.length === 1) {
              serie.push(setRandomGapStarter2)
            } else {
              serie.push(serie[serie.length - 2] + setRandomGapInteger2)
            }
          }
          return serie
        }
        case 4: {
          // Previous items pair + 1 sum up to next item
          const setRandomInteger1 = getRandomIntInclusive(0, 4)
          const setRandomInteger2 = getRandomIntInclusive(0, 4)
          const serie = [setRandomInteger1, setRandomInteger2]
          while (serie.length < 6) {
            const currentIndex = serie.length
            const sum = serie[currentIndex - 1] + serie[currentIndex - 2] + 1
            serie.push(sum)
          }
          return serie
        }
      }
    },
    checkDuplicatesInSeries(series) {
      const seriesSolutions = series.map((serie, i) => {
        return serie[serie.length - 1]
      })
      return !hasDuplicates(seriesSolutions)
    },
    generateHexagonsValues() {
      // 11 hexagons
      const hexVolumes = 7

      // Get 4 solutions from generatedSeries
      this.seriesSolutions = this.series.map(serieObj => {
        return serieObj.serie[serieObj.serie.length - 1]
      })

      // Set 7 unique random integers in a range [1-30] excluding solutions
      this.randomizedDummyValues = shuffleArray(
        rangeArray(1, 30, 1).filter(value => {
          return !this.seriesSolutions.includes(value)
        })
      ).slice(0, hexVolumes)

      // Concat & shuffle & return values to be used in setHexagonData
      return shuffleArray([
        ...this.seriesSolutions,
        ...this.randomizedDummyValues
      ])
    },
    setHexagonsData() {
      // Set Hex class
      class Hex {
        constructor(
          id,
          value,
          draggable,
          draggableId,
          draggableAtInit,
          draggableIdAtInit,
          highlighted = false
        ) {
          this.id = id
          this.value = value
          this.coordinates = []
          this.draggable = draggable
          this.draggableId = draggableId
          this.draggableAtInit = draggableAtInit
          this.draggableIdAtInit = draggableIdAtInit
          this.highlighted = highlighted
        }
        // Method here to set draggable id at each drop / drag
      }

      // Generate hexagonValues
      const hexagonsValues = this.generateHexagonsValues()

      // Set draggables positions in dropzones
      const draggablePositions = this.randomizedDummyValues.slice(0, 4)

      let incrementableDraggableId = 1
      //  Create & store each hexs base data

      // Set 11 hexs
      ;[...Array(this.hexsVolume).keys()].forEach(id => {
        const value = hexagonsValues[id]
        // Draggables at init
        let draggable = false
        let draggableAtInit = false
        draggable = draggableAtInit = draggablePositions.includes(value)
        // Draggable Id
        let draggableId = null
        let draggableIdAtInit = null
        if (draggable) {
          draggableId = draggableIdAtInit = incrementableDraggableId
          incrementableDraggableId++
        }
        const hex = new Hex(
          id,
          value,
          draggable,
          draggableId,
          draggableAtInit,
          draggableIdAtInit
        )
        this.railGridHexs.push(hex)
      })
    },
    setHexagonRailData() {
      // Store puzzle content ref
      this.puzzleContentRef = this.$refs.puzzleContent

      // Get Rail grid hexagon element
      const railGridHexEls = this.puzzleContentRef.querySelectorAll(
        '.railGrid__hex'
      )

      // Store each hexs coordinates in railGridHexs
      railGridHexEls.forEach((slot, i) => {
        const slotX = slot.offsetLeft + slot.clientWidth / 2
        const slotY = slot.offsetTop + slot.clientHeight / 2
        const hexCoordinates = [slotX, slotY]
        this.railGridHexs[i].coordinates = hexCoordinates
      })

      // Set lines
      Object.keys(this.tracks).forEach((v, i) => {
        this.setRailLines(v)
      })
    },
    setRailLines(trackName) {
      // Set draw Area
      const railGridArea = this.puzzleContentRef.querySelector(
        `#track${trackName}`
      )
      // Sizing area
      const draw = SVG(`track${trackName}`).size(
        railGridArea.clientWidth,
        railGridArea.clientHeight
      )

      // Map line coords
      this.tracks[trackName].slotsIds.forEach((v, i) => {
        const hexCoordinates = this.railGridHexs[v].coordinates
        this.tracks[trackName].polyline.push(hexCoordinates)
      })

      // Draw polyline
      const polyline = draw.polyline(this.tracks[trackName].polyline)
      polyline.fill('none')
      polyline.stroke({
        // color: '#ABD1BD',
        color: this.tracks[trackName].color,
        width: 4
      })
    },
    setDroppables() {
      this.droppable = new Droppable(this.$refs.keysZones, {
        draggable: '.railGrid__draggable',
        dropzone: '.dropzone',
        delay: 50,
        mirror: {
          appendTo: 'body'
        }
      })

      // Set vars
      let currentDraggable
      let currentParent
      let currentHexBack
      let currentDropzoneOriginId
      let nextDropzoneId
      let draggableAllowedDropzones

      // DRAG START
      this.droppable.on('drag:start', evt => {
        console.log('drag:start')
        // Resync all draggable props
        this.resyncAllDraggablesProps('start')
        // Highlight current hexagonBack
        currentDraggable = evt.originalSource
        currentParent = currentDraggable.parentNode
        currentHexBack = currentParent.querySelector('.hexagonShapeBack')
        currentHexBack.classList.add('active')
        currentDraggable = evt.originalSource
        // Set DropzoneOrigin id
        currentDropzoneOriginId = evt.originalSource.parentNode.dataset.dropzone
        // Set Draggable allowed dropzones
        draggableAllowedDropzones = this.setDraggableAllowedDropzones(
          currentDropzoneOriginId
        )
        // Highligh allowed dropzones
        this.highlightDraggableAllowedDropzones(draggableAllowedDropzones, true)
      })

      // DRAG DROPPED | hex projection |
      this.droppable.on('droppable:dropped', evt => {
        console.log('droppable:dropped')
        // Set nextDropzoneId
        nextDropzoneId = evt.dropzone.getAttribute('id')
        // Dropzones restrictions tests
        if (draggableAllowedDropzones.includes(parseInt(nextDropzoneId))) {
        } else {
          // isDraggableReturning = true
          evt.cancel()
        }
        // Resync all draggable props
        this.resyncAllDraggablesProps('dropped')
      })

      // DRAG RETURNED
      this.droppable.on('droppable:returned', evt => {
        console.log('drag:returned')
        this.resyncAllDraggablesProps('returned')
      })

      // DRAG STOPPED | drag released |
      this.droppable.on('drag:stop', evt => {
        // Enable valid btn
        this.disableValid = false

        // Dropped sound
        this.$refs.dragDropped.playSound()

        console.log('drag:stop')
        // Remove current hexagonBack highlight
        currentHexBack.classList.remove('active')
        // clear dropzones restrictions
        draggableAllowedDropzones = null
        // clear all hex highlighted props
        this.highlightDraggableAllowedDropzones(
          [...Array(this.hexsVolume).keys()],
          false
        )
        // Resync all draggable props

        this.resyncAllDraggablesProps('stop')
      })
    },
    setDraggableAllowedDropzones(currentDropzoneOriginId) {
      // Get currentTrack
      const getCurrentTracks = dropzoneId => {
        return Object.entries(this.tracks)
          .filter(track => {
            const slotsIds = track[1].slotsIds
            return slotsIds.includes(parseInt(dropzoneId))
          })
          .map(track => track[0])
      }

      // Get current tracks ids
      const getTracksIds = currentTracks => {
        return currentTracks.map(trackName => {
          return this.tracks[trackName].slotsIds
        })
      }

      const setAllowedDropzoneForAGivenDropzone = dropzoneId => {
        // Get Occupied hex ids
        const othersHexContainingIdDraggables = this.railGridHexs
          .filter(v => v.draggable)
          .map(v => v.id)
          .filter(id => id !== parseInt(dropzoneId))

        // Get dropzoneOrigin tracks
        const currentTracks = getCurrentTracks(dropzoneId)

        // Get currentTracks ids
        const tracksIds = getTracksIds(currentTracks)

        // Get current track allowed indexes
        // Set indexContainer
        const allowedIndexes = []
        tracksIds.forEach(trackIdsArray => {
          // Ex: MAIN
          // Get index of currentDropzoneOriginId inside track
          const currentIndex = trackIdsArray.indexOf(parseInt(dropzoneId))
          const prevIndex = currentIndex - 1
          const nextIndex = currentIndex + 1

          // Get indexes of occupied hexs
          const hexsInSameLine = othersHexContainingIdDraggables.filter(
            hexId => {
              return trackIdsArray.includes(hexId)
            }
          )
          // Convert occupied hex indexes in currentTrack indexes
          const hexsInSameLineOnTrackIndexes = hexsInSameLine.map(index => {
            return trackIdsArray.indexOf(parseInt(index))
          })

          const isIndexExisting = siblingIndex => {
            return (
              Math.sign(siblingIndex) !== -1 &&
              siblingIndex <= trackIdsArray.length - 1
            )
          }

          const isPrevIndexFree = !hexsInSameLineOnTrackIndexes.includes(
            prevIndex
          )

          const isNextIndexFree = !hexsInSameLineOnTrackIndexes.includes(
            nextIndex
          )

          if (isNextIndexFree && isIndexExisting(nextIndex)) {
            const upperIndex = trackIdsArray.slice(
              currentIndex + 1,
              currentIndex + 2
            )
            allowedIndexes.push(...upperIndex)
          }

          if (isPrevIndexFree && isIndexExisting(prevIndex)) {
            const lowerIndex = trackIdsArray.slice(
              currentIndex - 1,
              currentIndex
            )
            allowedIndexes.push(...lowerIndex)
          }
        })

        return allowedIndexes
      }

      // Store origin allowed dropzone
      const originAllowedDropzones = setAllowedDropzoneForAGivenDropzone(
        currentDropzoneOriginId
      )

      return originAllowedDropzones
    },
    highlightDraggableAllowedDropzones(draggableAllowedDropzones, status) {
      draggableAllowedDropzones.forEach(allowedHexId => {
        this.railGridHexs[allowedHexId].highlighted = status
      })
    },
    getParentLandableZoneValue(draggableId) {
      return this.railGridHexs
        .find(hex => hex.draggableId === draggableId)
        .value.toString()
    },
    checkPuzzle() {
      const HexContainingDraggables = this.railGridHexs.filter(v => v.draggable)
      console.log({ HexContainingDraggables })
      HexContainingDraggables.forEach(hex => {
        console.log('hexDraggableID', hex.draggableId)
      })

      return HexContainingDraggables.every(hex => {
        const hexValue = hex.value
        const draggableSerie = this.series[hex.draggableId - 1].serie
        // console.log('hexDraggableID', hex.draggableId)
        const draggableValue = draggableSerie[draggableSerie.length - 1]
        return hexValue === draggableValue
      })
    },
    showHint() {
      // Complete event
      const showHintComplete = () => {
        this.timeOuts.push(
          setTimeout(() => {
            EventBus.$emit('showHintComplete')
          }, 500)
        )
      }

      // Get gapedx2 serie
      const { gapedx2 } = this.$refs
      // Get serie item 1
      const serieItem1 = gapedx2[0].querySelector(
        '.serie__item:nth-child(2) .basic'
      )
      // Get serie item 2
      const serieItem2 = gapedx2[0].querySelector(
        '.serie__item:nth-child(4) .basic'
      )
      // Get serie solution
      const serieSolution = gapedx2[0].querySelector('.serie__item.riddle')

      // Get hexId solution
      const hexs = this.$refs.keysZones[0]
      const solutionString = serieSolution.querySelector('.solution')
        .textContent
      const hexSolutionContainer = hexs.querySelector(
        `[data-value="${solutionString}"]`
      )

      // is hex covered ?
      const isHexCovered = () => {
        return this.railGridHexs.find(hex => {
          return hex.id.toString() === hexSolutionContainer.getAttribute('id')
        }).draggable
      }

      // get proper hex solution
      const hexSolution = () => {
        if (isHexCovered()) {
          // Get draggable solution
          return hexSolutionContainer.querySelector(
            '.hexagonShapeDraggable .id div'
          )
        } else {
          // Get hex solution
          return hexSolutionContainer.querySelector('.id div')
        }
      }

      // GSAP
      const timelineHint = new TimelineMax({
        repeat: 2,
        onComplete: showHintComplete
      })

      const elementsToAnimate = [
        serieItem1,
        serieItem2,
        serieSolution,
        hexSolution()
      ]

      elementsToAnimate.forEach(item => {
        timelineHint.to(item, 0.3, {
          transform: 'scale(1.8)',
          color: '#ffffff',
          yoyo: true,
          repeat: 1,
          ease: Expo.easeOut
        })
      })
    },
    resyncAllDraggablesProps(event) {
      if (event === 'dropped') {
        console.warn(event + ' => resync')
      } else {
        console.log(event + ' => resync')
      }

      this.timeOuts.push(
        setTimeout(() => {
          // Get occupiedZones el
          const occupiedZones = [
            ...this.puzzleContentRef.querySelectorAll(
              '.draggable-dropzone--occupied'
            )
          ]

          // Get occupiedZone ids in '--occupied' el
          const occupiedZonesId = occupiedZones.map(v => {
            return parseInt(v.getAttribute('id'))
          })

          console.table(occupiedZonesId)

          // Get occupied zones containing draggable
          const occupiedZonesCurrentDraggable = occupiedZones.map(zone => {
            return zone.children[1]
          })

          // Get draggables Ids in occupied
          const occupiedZonesCurrentDraggableId = occupiedZonesCurrentDraggable.map(
            v => {
              return parseInt(v.getAttribute('id'))
            }
          )

          // Reset all hex to unoccupied
          this.railGridHexs.forEach(v => {
            v.draggableId = null
            v.draggable = null
          })

          // Reset all occupied hex to true
          occupiedZonesId.forEach((v, i) => {
            // this.railGridHexs[v].draggableId = v
            this.railGridHexs[v].draggableId =
              occupiedZonesCurrentDraggableId[i]
            this.railGridHexs[v].draggable = true
          })
          // }, 200)
        }, 0)
      )
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
      transform: scale(2);
    }
  }
}

.railGrid {
  outline: none;
  position: relative;
  width: 100%;
  height: 100%;
  width: 375px;
  max-width: 530px;
  max-height: 200px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(3, 1fr);
  grid-template-areas: 'ref ref . . .' 'ref ref . . .' '. . . . .';
  gap: 12px;

  &__references {
    grid-area: ref;
  }

  .references {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    margin: auto;
    height: 85%;
    width: 85%;
    &__serie {
      font-weight: bold;
      margin: 2px 0;
      padding: 2px 10px;
      font-size: 14px;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .serie {
      &__item {
        .serie__number {
          .basic {
            display: inline-block;
          }
        }
        .riddle {
          .riddle {
            display: inline-block;
          }
          .solution {
            display: none;
          }
        }
      }
    }
  }

  &__hex {
    z-index: 0;
    position: relative;
  }

  .refColor1 {
    background-color: $color-blue-4;
  }

  .refColor2 {
    background-color: #b357db;
  }

  .refColor3 {
    background-color: #ec5486;
  }

  .refColor4 {
    background-color: #ebd245;
  }
}

.railGridPolyline {
  pointer-events: none;
  position: absolute;
  top: 1px;
  right: 0;
  bottom: 0;
  left: 0;
  @include responsive(tablet) {
    top: 1px;
  }
}

// Draggable
.railGrid__draggable {
  position: absolute;
  top: 0;
  left: 0;
  &.draggable--is-dragging {
    z-index: 100;
    transform: scale(0.3);
  }
  &.draggable-source--is-dragging {
    z-index: 1000;
  }
  &.draggable-mirror {
    z-index: 8000;
    transform: scale(0.3);

    @include responsive(tablet) {
      min-width: 110px;
      min-height: 110px;
    }
  }
  &:focus {
    outline: none !important;
  }
}

.hexagonShapeBack {
  &::v-deep {
    position: absolute;
  }
}
</style>
