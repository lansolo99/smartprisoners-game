<template functional>
  <div class="shapeContainer">
    <!-- Triangle -->
    <svg
      v-if="props.shapeAttrs.shape === 'triangle'"
      :class="[
        props.shapeAttrs.shape,
        props.shapeAttrs.color,
        props.shapeAttrs.direction
      ]"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
    >
      <path
        d="M50.5 11.4l-49 73.5h98l-49-73.5zM23.9 72.8L50.4 33 77 72.8H23.9z"
      />
    </svg>

    <!-- TriangleCollision -->
    <svg
      v-if="props.shapeAttrs.shape === 'triangleCollision'"
      :class="[
        props.shapeAttrs.shape,
        props.shapeAttrs.color,
        props.shapeAttrs.direction
      ]"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
    >
      <path
        d="M50.5 32.9L5.2 2.8v94.5L50.5 67l45.3 30.3V2.8L50.5 32.9zm-34.3-9.5l24.3 16.2L25 50l15.5 10.4-24.3 16.2V23.4zm34.3 22.9l5.6 3.7-5.6 3.7-5.6-3.7 5.6-3.7zm10-6.7l24.3-16.2v53.2L60.5 60.4 76 50 60.5 39.6z"
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

<style lang="scss" scoped>
.shapeContainer {
  display: flex;
  align-items: center;
  justify-content: center;
}
.triangle,
.triangleCollision {
  width: 50%;
  height: auto;
}

svg {
  transform-origin: center;
  transform: rotate(0deg);
}
// Directions
.vertical {
  transform: rotate(-90deg);
}
.horizontal {
  transform: rotate(0deg);
}
.top {
  transform: rotate(0deg);
}
.bottom {
  transform: rotate(180deg);
}

// Colors
.pink {
  fill: #ec5586;
}
.green {
  fill: #60db56;
}
.cyan {
  fill: #7cd4e8;
}
.yellow {
  fill: #ecd245;
}
.blue {
  fill: #2a5ab0;
}
.grey {
  fill: rgba(white, 0.5) !important;
}
</style>
