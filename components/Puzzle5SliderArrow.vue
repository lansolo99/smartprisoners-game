<template>
  <svg
    id="Layer_1"
    class="slider-arrow"
    version="1.1"
    x="0px"
    y="0px"
    viewBox="0 0 30 24.1"
    style="enable-background:new 0 0 30 24;"
    xml:space="preserve"
  >
    <g :class="isSliding ? 'on' : 'off'">
      <polygon points="0.3,8.5 14.9,0.5 29.6,8.5 	" />
      <polygon points="0.5,13.5 0.5,10.6 29.8,10.7 29.8,13.5 	" />
      <polygon points="0.5,20.2 0.5,17.3 29.8,17.5 29.8,20.2 	" />
    </g>
  </svg>
</template>

<script>
export default {
  name: 'SliderArrow',
  props: {
    isSliding: {
      type: Boolean,
      required: true,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
g {
  &.on {
    polygon {
      fill: $color-theme;
    }
  }

  &.off {
    polygon {
      fill: $color-anthracite;
    }
  }
}
</style>
