<template>
  <div class="puzzleContainer__gridContent">
    <div ref="puzzleContent" class="puzzleContent">
      <div
        v-multi-ref:keysZones
        class="puzzleContent__ideogramGrid puzzleContent__flexibleArea ideogram"
      >
        <!-- Left parts -->
        <Puzzle11Parts v-if="puzzle11Data" :schema="schema" :slice="[0, 8]" />

        <!-- Central shape -->
        <div
          ref="centralShapeParent"
          class="ideogram__centralShape centralShape"
        >
          <Puzzle11CentralShape
            v-if="puzzle11Data"
            ref="centralShape"
            :schema="schema"
          />
        </div>

        <!-- Right parts -->
        <Puzzle11Parts v-if="puzzle11Data" :schema="schema" :slice="[8, 16]" />
      </div>
      <!-- Big life icon overlay -->
      <BaseBigLifeIcon ref="bigLifeIcon" />
    </div>
    <!-- Sounds -->
    <BaseSounds ref="puzzleError" sound-source="valid_error" />
    <BaseSounds ref="puzzleSuccess" sound-source="valid_success" />
    <BaseSounds ref="dragDropped" sound-source="drag_dropped" />
  </div>
</template>
<script>
import { Droppable } from '@shopify/draggable'
import { mapState } from 'vuex'
import data from '@/store/datas/puzzle11_schemas'
import Puzzle11Parts from '@/components/Puzzle11Parts.vue'
import Puzzle11CentralShape from '@/components/Puzzle11CentralShape'
import { validPuzzle, shakePuzzle } from '@/mixins/validPuzzle.js'
import { pickStaticSchema } from '@/mixins/pickStaticSchema.js'
import { droppableRemoveMirror } from '@/mixins/droppableRemoveMirror.js'
import BaseBigLifeIcon from '@/components/BaseBigLifeIcon'
import { killTimeOuts } from '@/utils'

export default {
  name: 'Puzzle11',
  components: {
    Puzzle11CentralShape,
    Puzzle11Parts,
    BaseBigLifeIcon
  },
  mixins: [validPuzzle, shakePuzzle, droppableRemoveMirror, pickStaticSchema],
  data() {
    return {
      test: 'mydata',
      puzzle11Data: true,
      timeOuts: [],
      schema: {},
      puzzleContentRef: '',
      droppable: {}
    }
  },
  computed: {
    ...mapState({
      previousSchemaUsed: state => state.session.staticSchemasCycling.puzzle11
    })
  },
  created() {
    this.pickStaticSchema(11, this.previousSchemaUsed, data)
  },
  mounted() {
    this.timeOuts.push(
      setTimeout(() => {
        this.setDroppables()
      }, 500)
    )
  },
  beforeDestroy() {
    killTimeOuts(this.timeOuts)
    this.droppable.destroy()
    this.schema = null
    this.puzzle11Data = false
  },
  methods: {
    setDroppables() {
      this.droppable = new Droppable(this.$refs.keysZones, {
        draggable: '.draggable',
        dropzone: '.dropzone',
        delay: 50,
        distance: 100,
        mirror: {
          appendTo: 'body'
        }
      })

      // Set vars
      let currentDropzoneOriginId
      let nextDropzoneId
      let isSource

      // DRAG START
      this.droppable.on('drag:start', evt => {
        // Set DropzoneOrigin id
        currentDropzoneOriginId = evt.originalSource.parentNode.dataset.dropzone
      })

      // DRAG DROPPED | hex projection |
      this.droppable.on('droppable:dropped', evt => {
        isSource = evt.dropzone.classList.contains('source')
        nextDropzoneId = evt.dropzone.dataset.dropzone

        if (currentDropzoneOriginId !== nextDropzoneId) {
          evt.cancel()
          if (!isSource) {
          }
        } else if (!isSource) {
        }
      })

      // DRAG RETURNED
      this.droppable.on('droppable:returned', evt => {
        nextDropzoneId = currentDropzoneOriginId
        setTimeout(() => {
          isSource = true
        }, 0)
      })

      // DRAG STOPPED | drag released |
      this.droppable.on('drag:stop', evt => {
        const stoppedDropzone = nextDropzoneId
        this.$refs.dragDropped.playSound()
        if (currentDropzoneOriginId === stoppedDropzone && !isSource) {
          // Dropped sound

          // Update centralShapeDropzone filled status
          this.schema.parts[stoppedDropzone - 1].isPlaced = true
          // Set source Dropzone element
          const sourceDropzoneEl = this.$refs.keysZones[0].querySelector(
            `.dropzone.source[data-dropzone="${stoppedDropzone}"]`
          )
          // Disable dropzone
          sourceDropzoneEl.setAttribute('data-dropzone', 'none')
          // Remove draggable if still present
          sourceDropzoneEl.querySelector('.draggable').remove()
          // Silent check puzzle
          console.log('silentCheckPuzzle')

          this.silentCheckPuzzle()
        }
      })
    },
    silentCheckPuzzle() {
      this.timeOuts.push(
        setTimeout(() => {
          if (this.checkPuzzle()) {
            this.validPuzzle()
          }
        }, 200)
      )
    },
    checkPuzzle() {
      // Get sourceDropzones matching with centralShapeDropzones
      const sourceDropzoneWithMatchingId = this.schema.parts
        .filter(v => v.matchingId)
        .map(v => v.id)

      // Check if all centralShapeDropzones with matching are filled
      return sourceDropzoneWithMatchingId.every(dropzoneId => {
        // Get matching centralShape el
        const centralShapeMatchingEl = this.$refs.centralShape.$el.querySelector(
          `#dropzone${dropzoneId}`
        )

        // Check classes
        const classesToCheck = ['draggable-dropzone--occupied', 'filled']
        const checkcentralShapeMatchingElClasses = classesToCheck.some(
          classe => {
            return centralShapeMatchingEl.classList.contains(classe)
          }
        )

        return checkcentralShapeMatchingElClasses
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@include puzzleContainerGridContent;
.puzzleContainer {
  &__gridContent {
    grid-template-rows: auto;

    @include responsive(mobile) {
      grid-template-rows: auto;
    }
  }
}

// Puzzle content
.puzzleContent {
  @include puzzleContentBaseProperties;
  &__flexibleArea {
    @include responsive(tablet) {
      transform: scale(1.6);
    }
  }
}

.ideogram {
  outline: none;
  position: relative;
  width: 530px;
  height: 230px;
  display: grid;
  grid-template-columns: 1fr 260px 1fr;
  gap: 10px;
  &__parts {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    align-content: center;
    justify-items: center;
  }
}

.centralShape {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 260px;
  width: 100%;
  height: 100%;
  &__back,
  &__part {
    position: absolute;
    width: 100%;
    height: 100%;
  }
}
</style>
