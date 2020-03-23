<template functional>
  <div
    :class="[`puzzle${props.puzzleId}`, { highlighted: props.highlighted }]"
    class="hexagonShapeBack"
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
        .pol0 {
          fill: #121213;
        }
      </style>
      <g id="shape">
        <polygon
          :style="{ fill: props.backgroundColor }"
          class="pol0"
          points="75,0 25,0 0,43.3 25,86.6 75,86.6 100,43.3 	"
        />
      </g>
      <g id="dashed">
        <polygon
          class="st1"
          points="72.1,5 76.2,12.1 80.5,9.5 75,0 63,0 63,5 	"
        />
        <polygon
          class="st1"
          points="72.1,81.6 63,81.6 63,86.6 75,86.6 80.3,77.4 76,74.9 	"
        />
        <polygon
          class="st1"
          points="94.2,43.3 89.5,51.6 93.8,54.1 100,43.3 94,32.8 89.7,35.4 	"
        />
        <polygon
          class="st1"
          points="80.2,67.6 84.5,70.1 89.5,61.4 85.2,58.9 	"
        />
        <polygon class="st1" points="85.4,28 89.7,25.5 84.7,16.9 80.4,19.4 	" />
        <polygon
          class="st1"
          points="14.5,58.5 10.2,61.1 15.2,69.7 19.5,67.1 	"
        />
        <rect x="44.6" class="st1" width="10" height="5" />
        <polygon
          class="st1"
          points="5.8,43.3 9.8,36.2 5.5,33.7 0,43.3 6,53.7 10.3,51.1 	"
        />
        <polygon
          class="st1"
          points="27.9,81.6 23.8,74.5 19.5,77 25,86.6 36.1,86.6 36.1,81.6 	"
        />
        <rect x="44.6" y="81.6" class="st1" width="10" height="5" />
        <polygon class="st1" points="19.1,20.3 14.8,17.7 9.8,26.4 14.1,28.9 	" />
        <polygon
          class="st1"
          points="27.9,5 36.1,5 36.1,0 25,0 19,10.4 23.3,12.9 	"
        />
      </g>
      <path
        id="border"
        class="border"
        d="M72.1,5l22.1,38.3L72.1,81.6H27.9L5.8,43.3L27.9,5H72.1 M75,0H25L0,43.3l25,43.3h50l25-43.3L75,0
	L75,0z"
      />
    </svg>
    <!-- ID -->
    <div class="id">
      <div>{{ props.id }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      default: ''
    },
    backgroundColor: {
      type: String,
      default: '#121213'
    },
    puzzleId: {
      type: Number,
      default: 1
    },
    highlighted: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss">
.hexagonShapeBack {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;

  &.puzzle10 {
    .id {
      font-size: 18px;
      @include responsive(tablet) {
        font-size: 15px;
      }
    }
  }

  &.puzzle11 {
    .id {
      display: none;
    }
  }

  .id {
    position: absolute;
    top: calc(50% - 1px);
    left: 50%;
    font-weight: bold;
    transform: translateX(-50%) translateY(-50%);
    color: $color-granny-smith;
    font-size: 27px;
    @include responsive(tablet) {
      top: calc(50% - 1px);
    }
  }
  .st1 {
    fill: purple;
    transition: fill 0.1s ease;
  }
}
.dropzone {
  .hexagonShapeBack {
    .border {
      fill: #ffffff;
      opacity: 0;
    }
    .st1 {
      fill: #353535;
    }

    &.active {
      .st1 {
        fill: #ffffff !important;
      }
    }
  }
  &.error {
    .border {
      fill: red;
    }
  }
  &.validated,
  &.error {
    .border {
      opacity: 1;
    }
  }
  &.active {
    .hexagonShapeBack {
      .st1 {
        fill: #c6bfa1 !important;
      }
    }
  }
  &.highlighted {
    .hexagonShapeBack {
      .st1 {
        fill: $color-golden;
      }
    }
  }

  &.draggable-dropzone--occupied.draggable-dropzone--active {
    .hexagonShapeBack {
      .st1 {
        fill: #c6bfa1 !important;
        fill: #ffffff !important;
      }
    }
  }
}
</style>
