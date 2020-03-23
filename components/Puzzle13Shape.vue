<template functional>
  <div class="shapeContainer">
    <svg
      id="Layer_1"
      version="1.1"
      x="0"
      y="0"
      viewBox="0 0 30 30"
      xml:space="preserve"
    >
      <path
        v-if="props.shapeAttrs.shape === 'triangleCollision'"
        id="triangleCollision"
        class="shape"
        d="M23.5 6.5L15 15l8.5 8.5v-17zm-17 0v17L15 15 6.5 6.5z"
      />
      <path
        v-if="props.shapeAttrs.shape === 'circle'"
        id="circle"
        class="shape"
        d="M15 25.9a11 11 0 010-21.8 11 11 0 010 21.8zm0-17.8a7 7 0 000 13.8 7 7 0 000-13.8z"
      />
      <path
        v-if="props.shapeAttrs.shape === 'squareInners'"
        id="squareInners"
        d="M10 10v10h10V10H10zm6 6h-2v-2h2v2zm5-7v12H9V9h12m4-4H5v20h20V5z"
        class="shape"
      />
      <path
        v-if="props.shapeAttrs.shape === 'arc'"
        id="arc"
        class="shape"
        d="M25.6 24.6H4.4v-4h21.2v4zM23.8 11h-4c0 2.5-2.1 4.6-4.6 4.6a4.7 4.7 0 01-4.6-4.6h-4a8.6 8.6 0 1017.2 0zm1.8-5.6H4.4v4h21.2v-4z"
      />
      <path
        v-if="props.shapeAttrs.shape === 'circleBarred'"
        id="circleBarred"
        class="shape"
        d="M15 3.6a11.4 11.4 0 100 22.8 11.4 11.4 0 000-22.8zm0 4c3.4 0 6.3 2.3 7.1 5.4H7.9A7.3 7.3 0 0115 7.6zm0 14.8A7.3 7.3 0 017.9 17h14.2a7.3 7.3 0 01-7.1 5.4z"
      />
      <path
        v-if="props.shapeAttrs.shape === 'triangleUp'"
        id="triangleUp_1_"
        class="shape"
        d="M14.8 14.1l3.5 6.5h-6.7l3.2-6.5m-.1-8.8L5.1 24.7H25L14.7 5.3z"
      />
      <path
        v-if="props.shapeAttrs.shape === 'triangleDown'"
        id="triangleDown"
        class="shape"
        d="M18.9 8.9l-3.7 7.4-3.9-7.4h7.6m6.5-4H4.6l10.7 20.2L25.4 4.9z"
      />
      <path
        v-if="props.shapeAttrs.shape === 'path'"
        class="shape"
        d="M25.6 25.6H6.4v-4h15.2V8.4H8.4v7.5h7.5v-1.8h-5.2V10H20v10H4.4V4.4h21.2z"
      />
      <path
        v-if="props.shapeAttrs.shape === 'cross'"
        id="cross"
        class="shape"
        d="M18.9 15c3.9-1.6 6.8-5.4 6.8-9.9h-4a6.7 6.7 0 01-13.4 0h-4c0 4.5 2.8 8.4 6.8 9.9a10.8 10.8 0 00-6.8 9.9h4a6.7 6.7 0 0113.4 0h4c0-4.5-2.8-8.3-6.8-9.9z"
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

svg {
  width: 50%;
  height: auto;
  transform-origin: center;
  transform: rotate(0deg);
}
path {
  fill: $color-anthracite;
}
</style>
