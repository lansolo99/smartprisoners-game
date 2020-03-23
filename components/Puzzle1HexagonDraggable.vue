<template v-bind="data.attrs" :ref="data.ref">
  <div
    :class="puzzleId === 10 ? 'puzzle10' : 'puzzle1'"
    class="hexagonShapeDraggable"
  >
    <svg
      id="Layer_1"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 100 87"
      style="enable-background:new 0 0 100 87;"
      xml:space="preserve"
    >
      <style type="text/css">
        .handle {
          opacity: 0.7;
        }
        .handleParts {
          fill: #182021;
        }
      </style>

      <g id="shape_1_">
        <polygon
          :style="{ fill: color }"
          points="72.1,5 27.9,5 5.8,43.3 27.9,81.6 72.1,81.6 94.2,43.3 	"
        />
      </g>

      <g id="handle" :class="{ hide: hasIdOverlay }" class="handle">
        <path class="handleParts" d="M50,62l8.1-8.1H41.9L50,62z" />
        <path class="handleParts" d="M41.9,32.1h16.3L50,24L41.9,32.1z" />
        <path class="handleParts" d="M39.1,51.1V34.9L31,43L39.1,51.1z" />
        <path class="handleParts" d="M60.9,34.9v16.3L69,43L60.9,34.9z" />
      </g>
    </svg>

    <!-- ID -->
    <div v-if="mirroredIdPuzzles.includes(puzzleId)" class="id">
      <transition name="element">
        <div v-show="hasIdOverlay">
          {{ landableZoneMirroredId }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    puzzleId: {
      type: Number,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    landableZoneMirroredId: {
      type: String,
      default: null
    },
    isParentLandableZone: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      mirroredIdPuzzles: [1, 10]
    }
  },
  computed: {
    hasIdOverlay() {
      return (
        this.landableZoneMirroredId !== 'undefined' && this.isParentLandableZone
      )
    }
  },
  mounted() {
    console.log('draggable mounted')
  }
}
</script>

<style lang="scss" scoped>
#line_1_ {
  transform: translateY(-8px);
}

@mixin innerId {
  pointer-events: none;
  position: absolute;
  top: calc(50% + 1px);
  left: 50%;
  font-weight: bold;
  transform: translateX(-50%) translateY(-50%);
  color: $color-anthracite;
  font-size: 27px;
}

.hexagonShapeDraggable {
  position: absolute;
  overflow: hidden;
  top: 0;
  left: 0;

  &.puzzle1 {
    width: 100px;
    height: 87px;

    .id {
      @include innerId;
    }
  }

  &.puzzle10 {
    width: 100%;
    height: auto;

    .id {
      @include innerId;
      font-size: 18px;
      top: calc(50% - 1px) !important;
    }
    &.draggable-mirror {
      width: 67px;
    }
  }

  &.draggable-mirror {
    width: 65px;
    z-index: 8000;
  }
}
.handle {
  transform: scale(1.1);
  transform-origin: center;
  &.hide {
    opacity: 0;
  }
}
// Dragged element
.draggable-source--is-dragging {
  .handleParts {
    fill: white;
  }
}
.draggable-mirror {
  .handle {
    &.hide {
      opacity: 1;
    }
  }
  .handleParts {
    fill: white;
  }
  .id {
    display: none;
  }
}

// Transition
.element-enter-active,
.element-leave-active {
  transition: opacity 0.15s ease-out;
}
.element-enter,
.element-leave-to {
  opacity: 0;
}
</style>
