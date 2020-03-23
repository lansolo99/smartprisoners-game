<template>
  <div class="dimmer" @click="closeSelector">
    <div class="valuesSelector">
      <div
        v-for="(item, i) in 51"
        :key="i"
        class="item"
        @click="changeBoxValue(i)"
      >
        {{ i }}
      </div>
    </div>
  </div>
</template>

<script>
import { EventBus } from '@/bus'
import { killTimeOuts } from '@/utils'
export default {
  name: 'Puzzle4ValuesSelector',
  props: {
    pyramidId: {
      type: Number,
      required: true
    },
    pyramidBoxId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      timeOuts: []
    }
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
    changeBoxValue(i) {
      const pyramidId = this.pyramidId
      const pyramidBoxId = this.pyramidBoxId
      const number = i

      EventBus.$emit('changeBoxValue', { pyramidId, pyramidBoxId, number })
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
.valuesSelector {
  overflow: auto;
  padding: 5px 0px 0px 0px;
  font-size: 25px;
  position: absolute;
  top: 10%;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0px 0px 14px 0px rgba(0, 0, 0, 0.25);
  background-color: lighten($color-anthracite, 10%);
  z-index: 2000;

  .item {
    text-align: center;
    width: 100%;
    padding: 10px 50px;
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
</style>
