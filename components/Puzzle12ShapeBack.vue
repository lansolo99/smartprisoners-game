<template functional>
  <div class="shapeBackContainer">
    <svg
      id="Layer_1"
      version="1.1"
      x="0"
      y="0"
      viewBox="0 0 100 100"
      xml:space="preserve"
    >
      <path
        class="grey"
        d="M86.1 12.1c3.8 0 6.8 3.1 6.8 6.8v5.9h7.1v-5.9C100 11.2 93.8 5 86.1 5h-8.2v7.1h8.2zM92.9 81.5c0 3.8-3.1 6.8-6.8 6.8h-8.2v7.1h8.2c7.7 0 13.9-6.2 13.9-13.9v-5.9h-7.1v5.9zM13.9 88.3a6.8 6.8 0 01-6.8-6.8v-5.9H0v5.9c0 7.7 6.2 13.9 13.9 13.9h8.9v-7.1h-8.9zM7.1 18.9c0-3.8 3.1-6.8 6.8-6.8h8.9V5h-8.9C6.2 5 0 11.2 0 18.9v5.9h7.1v-5.9z"
      />
      <path id="area" fill="#0f1010" d="M6.4 11.4h87.3v77.7H6.4z" />
      <path
        id="stroke"
        class="grey"
        d="M92.9 88.3H7.1V12.1H93m1.3-1.4H5.7V89.8H94.4V10.7h-.1z"
      />
    </svg>
    <div
      v-if="!props.noDotsId.includes(props.shapeAttrs.gridId)"
      class="shapeBackContainer__dotLink"
    >
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShapeBack',
  props: {
    shapeAttrs: {
      type: Object,
      required: true
    },
    noDotsId: {
      type: Array,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.shapeBackContainer {
  .grey {
    fill: #b3e8e3;
  }
  position: absolute;
  width: 100%;
  height: 100%;
  top: calc(50% + 2px);
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  &__dotLink {
    position: absolute;
    right: -5px;
    top: calc(50% - 3px);
    transform: translateY(-50%);
    .dot {
      background-color: #b3e8e3;
      width: 4px;
      height: 4px;
      &:not(:first-child) {
        margin-top: 4px;
      }
    }
  }
}
</style>
