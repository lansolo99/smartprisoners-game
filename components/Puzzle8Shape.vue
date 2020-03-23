<template functional>
  <div class="shapeContainer">
    <!-- Triangle -->
    <svg
      v-if="props.shapeAttrs.shape === 'triangle'"
      :class="[
        props.shapeAttrs.color,
        props.shapeAttrs.shape,
        ,
        props.shapeAttrs.direction
      ]"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
    >
      <g>
        <path d="M0,93.1L25.7,6.9L47.6,80c1.9,6.5-2.9,13-9.7,13L0,93.1z" />
        <path d="M52,93.1L77.7,6.9L99.6,80c1.9,6.5-2.9,13-9.7,13L52,93.1z" />
      </g>
    </svg>

    <!-- Circle -->
    <svg
      v-if="props.shapeAttrs.shape === 'circle'"
      :class="[props.shapeAttrs.color, props.shapeAttrs.shape]"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
    >
      <path
        d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 83.3c-18.4 0-33.3-14.9-33.3-33.3S31.6 16.7 50 16.7 83.3 31.6 83.3 50 68.4 83.3 50 83.3z"
      />
    </svg>
    <!-- Losange -->
    <svg
      v-if="props.shapeAttrs.shape === 'losange'"
      :class="[props.shapeAttrs.color, props.shapeAttrs.shape]"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
    >
      <path
        d="M90.7 50L57.2 3.1c-3-4.3-9.4-4.3-12.4 0L11.4 50l33.5 46.9c3 4.3 9.4 4.3 12.4 0L90.7 50z"
      />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'Shape',
  props: {
    shapeAttrs: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="scss">
.shapeContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.circle,
.losange,
.triangle {
  height: auto;
  width: 50%;
  margin: 5px 0;
}

.triangle {
  &:not(.inverted) {
    path {
      &:nth-child(2) {
        fill: white;
      }
    }
  }
  &.inverted {
    path {
      &:first-child {
        fill: white;
      }
    }
  }
  &.left {
    transform: rotate(-90deg);
  }
  &.right {
    transform: rotate(90deg);
  }
  &.bottom {
    transform: rotate(180deg);
  }
}

.blue {
  fill: #76cccc;
}

.orange {
  fill: #ef7241;
}

.green {
  fill: #61ce8d;
}

.yellow {
  fill: #fffc8a;
}
.white {
  fill: white;
}
.grey {
  path {
    fill: rgba(white, 0.5) !important;
  }
}
</style>
