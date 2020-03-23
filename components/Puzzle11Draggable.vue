<template>
  <img
    v-show="!hex.isPlaced"
    :class="[`schema${schema.id}`, `hex${hex.id}`]"
    :src="
      require(`@/assets/images/puzzles/11/schema${schema.id}/part_${hex.id}.svg`)
    "
    class="draggable"
  />
</template>

<script>
export default {
  name: 'Draggable',
  props: {
    hex: {
      type: Object,
      required: true
    },
    schema: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.draggable {
  position: absolute;
  width: 70%;
  height: auto;
  transform: translateX(-50%) translateY(-50%);
  top: 50%;
  left: 50%;

  &.draggable-mirror {
    position: fixed;
    z-index: 8000;
    transform-origin: center center !important;
    top: -75px !important;
    left: -75px !important;
    width: 230px;
    height: 230px;
    transform: scale(0.3);
    @include responsive(tablet) {
      width: 370px;
      height: 370px;
      top: -145px !important;
      left: -145px !important;
    }
  }
}
</style>
