<template functional>
  <div :class="props.outputId | extractId" class="box output">
    <!-- LINKS -->
    <!-- Bottom links -> 3+7 -->
    <svg
      v-if="[3, 7].includes(props.outputId)"
      :class="props.link"
      width="13.4"
      height="15.4"
      class="link"
    >
      <path class="stroke3" d="M1 0v14.6M6.7 0v15.4M12.4 0v14.6" />
    </svg>
    <!-- Side links -> 1+2+8+9 -->
    <svg
      v-if="[1, 2, 4, 6, 8, 9].includes(props.outputId)"
      id="Layer_1"
      :class="props.link"
      class="link"
      version="1.1"
      x="0"
      y="0"
      viewBox="0 0 53.2 30"
      xml:space="preserve"
    >
      <path class="stroke1" d="M26.3 1.6h25M26.3 7.7h25.1M26.3 13.8h25.1" />
      <path
        class="stroke2"
        d="M26.3 1.6c-13.5 0-24.5 11-24.5 24.5M26.3 7.7A18.4 18.4 0 007.9 26.1M26.3 13.8c-6.8 0-12.3 5.5-12.3 12.3"
      />
      <path class="stroke1" d="M14.1 26.1v3.7M7.9 29.8v-3.7M1.8 26.1v3.7" />
    </svg>
    <!-- Shape -->
    <div :style="{ backgroundColor: props.color }" class="svgWrapper">
      <svg
        id="Layer_1"
        version="1.1"
        x="0"
        y="0"
        viewBox="0 0 30 30"
        xml:space="preserve"
      >
        <path
          v-if="props.shape === 'triangleCollision'"
          id="triangleCollision"
          class="shape"
          d="M23.5 6.5L15 15l8.5 8.5v-17zm-17 0v17L15 15 6.5 6.5z"
        />
        <path
          v-if="props.shape === 'circle'"
          id="circle"
          class="shape"
          d="M15 25.9a11 11 0 010-21.8 11 11 0 010 21.8zm0-17.8a7 7 0 000 13.8 7 7 0 000-13.8z"
        />
        <path
          v-if="props.shape === 'squareInners'"
          id="squareInners"
          d="M10 10v10h10V10H10zm6 6h-2v-2h2v2zm5-7v12H9V9h12m4-4H5v20h20V5z"
          class="shape"
        />
        <path
          v-if="props.shape === 'arc'"
          id="arc"
          class="shape"
          d="M25.6 24.6H4.4v-4h21.2v4zM23.8 11h-4c0 2.5-2.1 4.6-4.6 4.6a4.7 4.7 0 01-4.6-4.6h-4a8.6 8.6 0 1017.2 0zm1.8-5.6H4.4v4h21.2v-4z"
        />
        <path
          v-if="props.shape === 'circleBarred'"
          id="circleBarred"
          class="shape"
          d="M15 3.6a11.4 11.4 0 100 22.8 11.4 11.4 0 000-22.8zm0 4c3.4 0 6.3 2.3 7.1 5.4H7.9A7.3 7.3 0 0115 7.6zm0 14.8A7.3 7.3 0 017.9 17h14.2a7.3 7.3 0 01-7.1 5.4z"
        />
        <path
          v-if="props.shape === 'triangleUp'"
          id="triangleUp_1_"
          class="shape"
          d="M14.8 14.1l3.5 6.5h-6.7l3.2-6.5m-.1-8.8L5.1 24.7H25L14.7 5.3z"
        />
        <path
          v-if="props.shape === 'triangleDown'"
          id="triangleDown"
          class="shape"
          d="M18.9 8.9l-3.7 7.4-3.9-7.4h7.6m6.5-4H4.6l10.7 20.2L25.4 4.9z"
        />
        <path
          v-if="props.shape === 'path'"
          class="shape"
          d="M25.6 25.6H6.4v-4h15.2V8.4H8.4v7.5h7.5v-1.8h-5.2V10H20v10H4.4V4.4h21.2z"
        />
        <path
          v-if="props.shape === 'cross'"
          id="cross"
          class="shape"
          d="M18.9 15c3.9-1.6 6.8-5.4 6.8-9.9h-4a6.7 6.7 0 01-13.4 0h-4c0 4.5 2.8 8.4 6.8 9.9a10.8 10.8 0 00-6.8 9.9h4a6.7 6.7 0 0113.4 0h4c0-4.5-2.8-8.3-6.8-9.9z"
        />
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Puzzle13Output',
  filters: {
    extractId(value) {
      return `output${value}`
    }
  },
  props: {
    outputId: {
      type: Number,
      required: true
    },
    shape: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    link: {
      type: String,
      default: 'none'
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  position: absolute;
  border: 2px solid #687a7a;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 5px;
  background-color: $color-anthracite;

  &.output1,
  &.output4,
  &.output8 {
    bottom: 0;
    right: calc(100% + 10px);
  }

  &.output2,
  &.output6,
  &.output9 {
    bottom: 0;
    left: calc(100% + 10px);
  }

  &.output3,
  &.output7 {
    bottom: -39px;
    left: calc(50% - 1px);
    transform: translateX(-50%);
  }
}
.svgWrapper {
  display: flex;
  margin: 2px;
  transition: background-color 0.15s ease-out;
}
svg {
  width: 100%;
  height: 100%;
}
.shape {
  fill: #182121;
}

.link {
  position: absolute;
  path {
    fill: none;
  }

  .stroke1 {
    stroke: #b7dede;
    stroke-width: 1.8764;
  }
  .stroke2 {
    stroke: #6aa2bb;
  }
  .stroke3 {
    fill: none;
    stroke: #b3e8e3;
    stroke-width: 1;
    stroke-miterlimit: 10;
  }
  &.bottomLeft {
    top: -23px;
    left: 8px;
    width: 115%;
  }
  &.bottomRight {
    top: -23px;
    left: -12px;
    transform: scaleX(-1);
    width: 115%;
  }
  &.bottomCenter {
    top: -16px;
    left: 5px;
    transform: scale(0.7);
  }
}
</style>
