<template>
  <div class="ideogram__parts partsWrapper">
    <div
      v-for="(hex, hexIndex) in schema.parts.slice(slice[0], slice[1])"
      :key="hexIndex"
      :class="{ matchingId: hex.matchingId }"
      :data-dropzone="hex.id"
      class="dropzone source"
    >
      <Puzzle11HexagonBack :id="hex.id.toString()" :puzzle-id="11" />
      <Puzzle11Draggable :schema="schema" :hex="hex" />
    </div>
  </div>
</template>

<script>
import Puzzle11Draggable from '@/components/Puzzle11Draggable'
import Puzzle11HexagonBack from '@/components/Puzzle1HexagonBack.vue'
export default {
  name: 'Parts',
  components: {
    Puzzle11Draggable,
    Puzzle11HexagonBack
  },
  props: {
    schema: {
      type: Object,
      required: true
    },
    slice: {
      type: Array,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.partsWrapper {
  .dropzone {
    outline: none;
    width: 100%;
    height: 50px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.hexagonShapeBack {
  &::v-deep {
    position: relative;
    svg {
      height: 50px;
    }
    outline: none;
    height: 50px;
  }
}
</style>
