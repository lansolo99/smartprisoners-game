<template>
  <div class="puzzleContainer__gridContent">
    <div ref="puzzleContent" class="puzzleContent">
      <div class="puzzleContent__refAndPlayground puzzleContent__flexibleArea">
        <div class="gridContent">
          <div ref="gridRef" class="gridContent__gridRef gridRef">
            <!-- REFERENCES -->

            <!-- Table -->
            <div
              v-for="(slot, index) in slots"
              :key="slot.id"
              class="gridRef__ref"
            >
              <span v-if="getRandomBooleanNumber() === 1"
                ><span class="gridRef__slotId">{{ slot.id }}</span> =
                <span class="gridRef__keyId">{{ keys[index].id }}</span></span
              >
              <span v-else
                ><span class="gridRef__keyId">{{ keys[index].id }} </span>=
                <span class="gridRef__slotId">{{ slot.id }}</span>
              </span>
            </div>

            <!-- Colors -->
            <div
              v-for="(key, index) in coloredRefs"
              ref="coloredRefs"
              :key="index"
              :class="[key.id, index < 4 ? 'firstLine' : '']"
              :style="{ 'border-left': `10px solid${key.color}` }"
              class="gridRef__coloredRef"
            >
              <span>{{ key.id }}</span>
            </div>
          </div>

          <!-- PLAYABLE STAGE -->
          <div class="gridContent__playableStage">
            <div v-multi-ref:keysZones class="dropzonesWrapper">
              <div
                v-for="(dropzone, index) in 11"
                :id="
                  dropzones.slots.landableZones.includes(index)
                    ? slotsOnStage(index, 'id')
                    : keysOnStage(index, 'id')
                "
                :ref="
                  dropzones.slots.landableZones.includes(index)
                    ? slotsOnStage(index, 'id')
                    : 'keyZone' + keysOnStage(index, 'id')
                "
                :key="dropzone"
                :class="[
                  dropzones.slots.landableZones.includes(index)
                    ? slotsOnStage(index, 'validated')
                    : '',
                  dropzones.slots.landableZones.includes(index)
                    ? slotsOnStage(index, 'error')
                    : '',
                  {
                    'draggable-dropzone--occupied': dropzones.keys.initialZones.includes(
                      index
                    )
                  },
                  {
                    'landable-zone': dropzones.slots.landableZones.includes(
                      index
                    )
                  },
                  dropzones.slots.landableZones.includes(index)
                    ? slotsOnStage(index, 'id')
                    : ''
                ]"
                class="dropzone"
              >
                <HexagonBack
                  v-if="dropzones.slots.landableZones.includes(index)"
                  :id="slotsOnStage(index, 'id')"
                />
                <HexagonBack v-else :background-color="'transparent'" />
                <HexagonDraggable
                  v-if="dropzones.keys.initialZones.includes(index)"
                  :id="keysOnStage(index, 'id')"
                  :ref="keysOnStage(index, 'id')"
                  :puzzle-id="1"
                  :landable-zone-mirrored-id="
                    keysOnStage(index, 'landableZoneMirroredId')
                  "
                  :is-parent-landable-zone="
                    keysOnStage(index, 'isParentLandableZone')
                  "
                  :class="[keysOnStage(index, 'id')]"
                  :color="keysOnStage(index, 'color')"
                  class="item"
                  @mousedown="onHexagonTouch(index)"
                />
              </div>
            </div>
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

    <BaseSounds ref="puzzleSuccess" sound-source="valid_success" />
    <BaseSounds ref="dragDropped" sound-source="drag_dropped" />
  </div>
</template>

<script>
import { Droppable } from '@shopify/draggable'
import { TimelineMax } from 'gsap'
import { Expo } from 'gsap/EasePack'
import PuzzleActions from '@/components/PuzzleActions.vue'
import { EventBus } from '@/bus'
import { validPuzzle, shakePuzzle } from '@/mixins/validPuzzle.js'
import { droppableRemoveMirror } from '@/mixins/droppableRemoveMirror.js'
import BaseBigLifeIcon from '@/components/BaseBigLifeIcon'
import HexagonBack from '@/components/Puzzle1HexagonBack'
import HexagonDraggable from '@/components/Puzzle1HexagonDraggable'
import { killTimeOuts, removeCurrentDropzoneActiveClass } from '@/utils'

export default {
  name: 'Puzzle1',
  components: {
    BaseBigLifeIcon,
    PuzzleActions,
    HexagonBack,
    HexagonDraggable
  },
  mixins: [validPuzzle, shakePuzzle, droppableRemoveMirror],
  data() {
    return {
      disableValid: true,
      renderHoldIndicator: false,
      timeOuts: [],
      droppable: {},
      slots: [],
      keys: [],
      dropzones: {
        slots: {
          landableZones: [0, 3, 4, 7, 8],
          droppedDropzone: '',
          keyReturnZone: ''
        },
        keys: {
          initialZones: [1, 2, 5, 6, 9, 10],
          droppedKey: ''
        }
      }
    }
  },
  computed: {
    randomizedSlotsOnStage() {
      return this.slots
        .filter(v => {
          return v.displayOnStage === true
        })
        .concat()
        .sort(() => Math.random() - 0.5)
    },
    coloredRefs() {
      const keysOnColoredRefs = this.keys.filter(v => {
        return v.displayOnColoredRefs === true
      })
      return keysOnColoredRefs
    }
  },
  created() {
    /* =============================================
                    Generate pairs
    ============================================= */

    const generateRandomLetter = () => {
      const excludeLetters = ['G', 'S']
      let letter = ''

      do {
        letter = String.fromCharCode(
          Math.floor(Math.random() * 26) + 97
        ).toUpperCase()
      } while (excludeLetters.includes(letter))

      return letter
    }

    const generateRandomNumber = () => {
      const excludeNumbers = [5, 6]
      let number = 0
      do {
        number = Math.floor(Math.random() * 9)
      } while (excludeNumbers.includes(number))

      return number
    }
    const generateItemsColors = () => {
      const colorsSuite = [
        '#634295', // Purple
        '#A81D41', // Dark red
        '#2A7337', // Green
        '#2bffdf', // Green-Cyan
        '#E08E2C', // Orange-brown
        '#FF6B35', // Organge-red
        '#E5E5E7', // Grey
        '#db0000', // Red
        '#859CA2', // Granny Smith
        '#027DFD' // Blue
      ]
      const shuffle = array => {
        colorsSuite.sort(() => Math.random() - 0.5)
      }
      shuffle(colorsSuite)
      return colorsSuite
    }
    const generateItemIds = () => {
      const slotsSuite = []
      for (let i = 0; i < 10; i++) {
        let randomLetter = ''
        let randomNumber = ''
        let pair = ''
        do {
          randomLetter = generateRandomLetter()
          randomNumber = generateRandomNumber()
          pair = randomLetter + randomNumber
        } while (slotsSuite.includes(pair))

        if (!slotsSuite.includes(pair)) {
          slotsSuite.push(pair)
        }
      }
      return slotsSuite
    }

    /* =============================================
                      Create Items
    ============================================= */

    const generateItems = itemType => {
      // Constructors
      const SlotConstructor = function(id, key) {
        this.id = id
        this.key = key
        this.displayOnStage = false
        this.validated = false
        this.error = false
      }
      const KeyConstructor = function(id, color) {
        this.id = id
        this.color = color
        this.displayOnStage = false
        this.displayOnColoredRefs = false
        this.landableZoneMirroredId = 'undefined'
        this.isParentLandableZone = false
      }
      // Create pairsArray
      const itemIds = generateItemIds()
      // Populate "slots" data with new slots objects
      for (let i = 0; i < itemIds.length; i++) {
        if (itemType === 'slots') {
          const item = new SlotConstructor(itemIds[i], '')
          this.slots.push(item)
        }

        if (itemType === 'keys') {
          const item = new KeyConstructor(itemIds[i], '')
          this.keys.push(item)
        }
      }
    }
    // Generate items
    generateItems('slots')
    generateItems('keys')

    // Slot<->Key association
    this.slots.forEach((slot, index) => {
      slot.key = this.keys[index].id
    })

    /* =============================================
       Randomly set "displayOnStage" to 5 items
    ============================================= */
    const setItemsOnStage = (itemType, number) => {
      // SLOTS
      if (itemType === 'slots') {
        // Pick randomly (number) items
        const selectedSlots = []
        do {
          // eslint-disable-next-line
          const randomItem = this.slots[
            Math.floor(Math.random() * this.slots.length)
          ]
          if (!selectedSlots.includes(randomItem)) {
            selectedSlots.push(randomItem)
          }
        } while (selectedSlots.length < number)
        // Set slots displayOnStage
        selectedSlots.forEach(v => {
          v.displayOnStage = true
        })
      }
      // KEYS
      if (itemType === 'keys') {
        // Create random colors array
        const keyColors = generateItemsColors()
        // Set keys color
        this.keys.forEach((v, index) => {
          v.color = keyColors[index]
        })
        // Set keys displayOnStage
        const setKeysOnStage = () => {
          // Set keys matching with set slots
          this.slots
            .filter(v => {
              return v.displayOnStage === true
            })
            .map(v => {
              return v.key
            })
            .forEach(key => {
              const keyObj = this.keys.find(v => {
                return v.id === key
              })
              keyObj.displayOnStage = true
            })
          // Add +1 more random key on stage
          const unstagedKeys = this.keys.filter(v => {
            return v.displayOnStage === false
          })
          const randomUnstagedKey =
            unstagedKeys[Math.floor(Math.random() * unstagedKeys.length)]
          this.keys.find(v => {
            return v.id === randomUnstagedKey.id
          }).displayOnStage = true
        }
        setKeysOnStage()
      }
    }
    setItemsOnStage('slots', 5)
    setItemsOnStage('keys')

    /* =============================================
                Set coloredRefs grid
    ============================================= */
    const setKeysOnColoredRefs = () => {
      // Build coloredRefs array
      const coloredRefsSuite = []
      // StagedKeys push
      this.keys
        .filter(v => {
          return v.displayOnStage === true
        })
        .forEach(v => {
          coloredRefsSuite.push(v)
        })

      // Build UnStagedKeys array
      const randomUnstagedKeys = number => {
        const selectedUnstagedKeys = []
        const unStagedKeys = this.keys.filter(v => {
          return v.displayOnStage === false
        })

        do {
          const randomUnstagedKey =
            unStagedKeys[Math.floor(Math.random() * unStagedKeys.length)]
          if (!selectedUnstagedKeys.includes(randomUnstagedKey)) {
            selectedUnstagedKeys.push(randomUnstagedKey)
          }
        } while (selectedUnstagedKeys.length < number)
        return selectedUnstagedKeys
      }
      // Unstaged keys push
      randomUnstagedKeys(2).forEach(v => {
        coloredRefsSuite.push(v)
      })

      // Set keys displayOnColoredRefs
      coloredRefsSuite.forEach(key => {
        const keyObj = this.keys.find(v => {
          return v.id === key.id
        })
        keyObj.displayOnColoredRefs = true
      })
    }
    setKeysOnColoredRefs()
  },
  mounted() {
    /* =============================================
                   MouseDown events
    ============================================= */
    // const dropzones = this.$refs.keysZones[0].querySelectorAll('.dropzone')
    // dropzones.forEach(dropzone => {
    //   dropzone.addEventListener('mousedown', event => {
    //     console.log('mousedown')
    //     console.log(event)
    //     this.renderHoldIndicator = true
    //   })
    // })

    /* =============================================
                   Droppable events
    ============================================= */
    this.droppable = new Droppable(this.$refs.keysZones, {
      draggable: '.item',
      dropzone: '.dropzone',
      delay: 0,
      mirror: {
        appendTo: 'body'
      }
    })

    // Set vars
    let currentDraggable
    let currentParent
    let currentHexBack

    this.droppable.on('droppable:dropped', () => this.dragDropped(event))
    this.droppable.on('drag:stop', () => this.dragStopped(event))
    // DRAG START
    this.droppable.on('drag:start', evt => {
      console.log('drag:start')
      // this.renderHoldIndicator = true
      // Highlight current hexagonBack
      currentDraggable = evt.originalSource
      currentParent = currentDraggable.parentNode
      currentHexBack = currentParent.querySelector('.hexagonShapeBack')
      currentHexBack.classList.add('active')
    })

    this.droppable.on('drag:stop', evt => {
      this.renderHoldIndicator = false
      // Remove current hexagonBack highlight
      currentHexBack.classList.remove('active')
    })

    /* =============================================
                      Show hint
    ============================================= */

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
    this.droppable.off('droppable:dropped', () => this.dragDropped(event))
    this.droppable.off('droppable:returned', () => this.dragReturned(event))
    this.droppable.off('drag:start', () => this.dragStarted(event))
    this.droppable.off('drag:stop', () => this.dragStopped(event))
    this.droppable.destroy()
    killTimeOuts(this.timeOuts)
    EventBus.$off('showHint')
  },
  destroyed() {},
  methods: {
    getRandomBooleanNumber() {
      const rand = Math.round(Math.random())
      return rand
    },
    slotsOnStage(index, prop) {
      const slotsOnStage = this.randomizedSlotsOnStage
      const initialZoneIndex = this.dropzones.slots.landableZones.indexOf(index)

      if (prop === 'validated') {
        // prop to test : 'validated'
        if (slotsOnStage[initialZoneIndex][prop] === true) {
          return 'validated'
        } else {
          return 'not-yet-validated'
        }
      } else if (prop === 'id') {
        // prop to test : 'id'
        return slotsOnStage[initialZoneIndex][prop]
      } else if (prop === 'error') {
        // prop to test : 'error'
        if (slotsOnStage[initialZoneIndex][prop] === true) {
          this.setWrongSlotEvent(slotsOnStage[initialZoneIndex])
          return 'error'
        }
      }
    },
    keysOnStage(index, prop) {
      const keysOnStage = this.keys.filter(v => {
        return v.displayOnStage === true
      })
      const initialZoneIndex = this.dropzones.keys.initialZones.indexOf(index)
      return keysOnStage[initialZoneIndex][prop]
    },
    updateDraggablesParentLandableZoneId(index) {
      this.timeOuts.push(
        setTimeout(() => {
          const draggables = this.$refs.keysZones[0].querySelectorAll(
            '.hexagonShapeDraggable'
          )
          // console.log(draggables)

          draggables.forEach(draggable => {
            // console.log({ draggable })
            // Retrieve id
            const draggableId = draggable.getAttribute('id')
            console.log({ draggableId })
            // Retrieve parent ID
            const parentId = draggable.parentElement.id
            // console.warn({ parentId })

            const isParentLandableZone = draggable.parentElement.classList.contains(
              'landable-zone'
            )
            console.error({ isParentLandableZone })
            // Set landableZoneMirroredId prop
            const keyObj = this.keys.find(key => {
              return key.id === draggableId
            })
            // console.log({ keyObj })
            // Update draggable datas
            keyObj.landableZoneMirroredId = parentId
            keyObj.isParentLandableZone = isParentLandableZone
          })
        }, 50)
      )
    },
    dragDropped(event) {
      // Remove all 'active' classes
      removeCurrentDropzoneActiveClass(this.$refs.keysZones[0])

      // Get next dropzone Ref
      const getNextDropZone = () => {
        const currentNextDropZone = this.$refs.keysZones[0].querySelectorAll(
          '.dropzone.draggable-dropzone--active.draggable-dropzone--occupied'
        )

        if (currentNextDropZone[0]) {
          // If this is a landable zone

          if (currentNextDropZone[0].classList.contains('landable-zone')) {
            // Store dropzone ID to check
            this.dropzones.slots.droppedDropzone = currentNextDropZone[0].getAttribute(
              'id'
            )
          } else {
            // Store not 'landable-zone' string
            this.dropzones.slots.droppedDropzone = [
              'not-landable-zone',
              currentNextDropZone[0].getAttribute('id')
            ]
          }

          // Store key ID to check
          this.dropzones.keys.droppedKey = currentNextDropZone[0]
            .querySelector('.hexagonShapeDraggable')
            .getAttribute('id')

          // Change border color of next dropzone before stopdrag
          currentNextDropZone[0].classList.add('active')
        }
      }
      this.timeOuts.push(setTimeout(getNextDropZone, 10))
    },
    dragStopped(event) {
      // Enable valid btn
      this.disableValid = false

      // Dropped sound
      this.$refs.dragDropped.playSound()

      // Remove current 'active' class
      removeCurrentDropzoneActiveClass(this.$refs.keysZones[0])

      // Update parent landableZoneMirroredId datas for draggables
      this.updateDraggablesParentLandableZoneId()
    },
    dragMove(event) {
      console.log('dragMove')

      // Get dragged key id
      const draggedKeyId = this.$refs.keysZones[0]
        .querySelectorAll('.draggable-source--is-dragging')[0]
        .getAttribute('id')

      // Get current dragged parent dropzone id
      const getCurrentParentNode = this.$refs[draggedKeyId][0].$el.parentNode
      this.dropzones.slots.keyReturnZone = getCurrentParentNode.getAttribute(
        'id'
      )

      // highlight current selected dropzone
      getCurrentParentNode.classList.add('active')
    },

    showHint() {
      // is first hex covered ?
      const isFirstHexCovered = () => {
        return this.$refs.keysZones[0].firstChild.classList.contains(
          'draggable-dropzone--occupied'
        )
      }

      // Get proper first slot id element
      const getFirstPlayableStageSlotNumber = () => {
        if (isFirstHexCovered()) {
          // Get draggable solutions
          return this.$refs.keysZones[0].firstChild.querySelector(
            '.hexagonShapeDraggable .id div'
          )
        } else {
          // Get hex solution
          return this.$refs.keysZones[0].firstChild.querySelector('.id div')
        }
      }

      const firstPlayableStageSlotNumber = this.$refs.keysZones[0].firstChild.querySelector(
        '.id div'
      )
      // Get matching slot id in ref table
      const slotRefIndexTable = this.slots.findIndex((v, index) => {
        return v.id === firstPlayableStageSlotNumber.innerHTML
      })

      // Get maching slot and key in gridRef according to slotRefIndexTable
      const gridRef = this.$refs.gridRef.childNodes.item(slotRefIndexTable)
      const gridRefSlot = gridRef.querySelector('.gridRef__slotId')
      const gridRefKey = gridRef.querySelector('.gridRef__keyId')
      const gridRefKeyId = gridRefKey.innerHTML

      const coloredRefItemNumber = this.$refs.gridRef
        .querySelectorAll(`div .gridRef__coloredRef.${gridRefKeyId}`)[0]
        .querySelector('span')

      // Complete event
      const showHintComplete = () => {
        this.timeOuts.push(
          setTimeout(() => {
            EventBus.$emit('showHintComplete')
          }, 500)
        )
      }

      // GSAP
      const timelineHint = new TimelineMax({
        repeat: 2,
        onComplete: showHintComplete
      })

      const elementsToAnimate = [
        getFirstPlayableStageSlotNumber(),
        gridRefSlot,
        gridRefKey,
        coloredRefItemNumber
      ]

      elementsToAnimate.forEach(item => {
        timelineHint.to(item, 0.3, {
          transform: 'scale(1.3)',
          color: '#ffffff',
          yoyo: true,
          repeat: 1,
          ease: Expo.easeOut
        })
      })
    },
    checkPuzzle() {
      // Each slot should have a child with its matching key
      const validations = []
      this.slots.forEach(v => {
        const slotId = v.id
        const slotKey = v.key
        const slotsWrapper = this.$refs.keysZones
        const slotRef = slotsWrapper[0].querySelector(
          `.landable-zone.${slotId}`
        )

        if (slotRef !== null) {
          if (slotRef.querySelector(`.${slotKey}`) !== null) {
            validations.push(true)
          }
        }
      })
      return validations.length === 5
    },
    onHexagonTouch(index) {
      console.log('onHexagonTouch', index)
    }
  }
}
</script>

<style lang="scss" scoped>
@include puzzleContainerGridContent;

// Puzzle content
.puzzleContent {
  @include puzzleContentBaseProperties;

  &__flexibleArea {
    @include responsive(tablet) {
      transform: scale(1.6);
    }
  }

  &__refAndPlayground {
    display: flex;
    align-items: stretch;
    // justify-content: stretch;
    justify-content: center;
    width: 100%;
    height: 100%;
    max-width: 550px;
    max-height: 250px;
  }
}
.gridContent {
  display: grid;
  //grid-template-columns: 155px 350px;
  grid-template-columns: 155px 295px;
  grid-column: 1/3;
  grid-column-gap: 1.5rem;

  &__gridRef {
    grid-column: 1 / 2;
  }
  &__playableStage {
    position: relative;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gridRef {
    z-index: 200;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: repeat(7, 0fr);
    align-content: center;
    grid-gap: 3px;
    padding: 0px 0px;
    text-align: center;
    font-weight: bold;
    color: $color-anthracite;
    font-size: 1.04rem;

    &__ref {
      font-size: 16px;
      border: 1px dashed rgba($color-granny-smith, 0.6);
      color: $color-granny-smith;
      grid-column: 1 / span 2;
      padding: 5px;
      @media screen and (max-height: 350px) {
        padding: 3px;
      }
      display: flex;
      align-items: center;
      justify-content: center;
      &:nth-child(even) {
        grid-column: 3 / span 2;
      }
      > span {
        display: flex;
        border-width: 2.5px;
        @media screen and (max-height: 350px) {
          border-width: 1.5px;
          padding-bottom: 0;
        }
      }
    }

    &__slotId,
    &__keyId {
      margin: 0 4px;
    }

    &__coloredRef {
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $color-granny-smith;
      padding: 0px 5px;
      &.firstLine {
        margin-top: 5px;
      }
    }
  }
}

// Draggable
.item {
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
.dropzonesWrapper {
  position: absolute;
  width: 437px;
  height: 280px;
  transform: scale(0.67);
  transform-origin: center;
  outline: none !important;
}
.dropzone {
  position: absolute;
  width: 100px;
  height: 87px;
  &.error {
    background-color: transparent !important;
  }
  &:focus {
    outline: none !important;
  }

  &.validated {
    pointer-events: none;

    .hexagonShapeDraggable {
      &::v-deep {
        .handle {
          animation: none;
        }
        .handleParts {
          fill: none;
        }
      }
    }
  }

  // Dropzones Positions helper : h += 84px / v += 96px

  // Col1
  &:nth-child(1) {
    top: 48px;
    left: 30px;
    left: 0px;
  }
  &:nth-child(2) {
    top: 144px;
    left: 30px;
    left: 0px;
  }
  // Col2
  &:nth-child(3) {
    top: 0px;
    left: 114px;
    left: 84px;
  }
  &:nth-child(4) {
    top: 96px;
    left: 114px;
    left: 84px;
  }
  &:nth-child(5) {
    top: 192px;
    left: 114px;
    left: 84px;
  }
  // Col3
  &:nth-child(6) {
    top: 48px;
    left: 198px;
    left: 168px;
  }
  &:nth-child(7) {
    top: 144px;
    left: 198px;
    left: 168px;
  }
  // Col4
  &:nth-child(8) {
    top: 0px;
    left: 282px;
    left: 252px;
  }
  &:nth-child(9) {
    top: 96px;
    left: 282px;
    left: 252px;
  }
  &:nth-child(10) {
    top: 192px;
    left: 282px;
    left: 252px;
  }
  // Col 5
  &:nth-child(11) {
    top: 48px;
    left: 366px;
    left: 336px;
  }
}
</style>
