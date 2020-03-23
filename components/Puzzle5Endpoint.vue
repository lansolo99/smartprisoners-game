<template>
  <div
    :class="[sliderPosition === layout ? 'on' : 'off', layout]"
    class="puzzleContent__endpoint endpoint"
  >
    <div v-if="layout === 'bottom'" class="endpoint__led"></div>
    <div class="endpoint__data">
      <span
        :class="[`endpoint__data-inner--${layout}`]"
        class="endpoint__data-inner"
        ><span class="item">{{ value }}</span></span
      >
    </div>
    <div v-if="layout === 'top'" class="endpoint__led"></div>
  </div>
</template>

<script>
export default {
  name: 'Endpoint',
  props: {
    layout: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    sliderPosition: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.endpoint {
  width: 80%;
  text-align: center;

  &.top {
    margin-bottom: 2px;
  }

  &.bottom {
    margin-top: 2px;
  }

  &__data {
    display: flex;
    border: 1px solid $color-golden;
    // animation: dataAnimation 0.1s infinite;
    // @keyframes dataAnimation {
    //   0% {
    //     border: 1px solid rgba($color-golden, 1);
    //   }
    //   50% {
    //     border: 1px solid rgba($color-golden, 0.7);
    //   }
    //   100% {
    //     border: 1px solid rgba($color-golden, 1);
    //   }
    // }

    &-inner {
      transition: all 0.15s ease-out;
      margin: 3px;
      font-size: 20px;
      width: 100%;
      height: 100%;
      background-color: transparent;
      .item {
        display: block;
      }
    }
  }
  &__led {
    margin: 3px 0;
    height: 7px;
    border: 1px solid $color-golden;
    background-color: $color-yellow-acid;
    // animation: ledAnimation 0.1s infinite;
    // @keyframes ledAnimation {
    //   0% {
    //     border: 1px solid rgba($color-golden, 1);
    //   }
    //   50% {
    //     border: 1px solid rgba($color-golden, 0.7);
    //   }
    //   100% {
    //     border: 1px solid rgba($color-golden, 1);
    //   }
    // }
  }

  &.on {
    .endpoint__data-inner {
      &--top {
        background-color: $color-blue-2;
      }

      &--bottom {
        background-color: $color-theme;
      }
    }
  }
  &.off {
    color: $color-granny-smith;
    .endpoint__data {
      animation: none;
      border: 1px dashed rgba($color-granny-smith, 0.5);
      &-inner {
        .item {
          opacity: 0.7;
        }
      }
    }
    .endpoint__led {
      border: 1px solid rgba($color-granny-smith, 0.5);
      animation: none;
      background-color: $color-anthracite;
    }
  }
}
</style>
