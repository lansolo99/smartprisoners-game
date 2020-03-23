<template>
  <div :class="context" class="BaseFrameIndicator">
    <div :class="context" class="label">
      <span :class="context">{{ label }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    context: {
      type: String,
      required: true
    },
    route: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      label: ''
    }
  },
  created() {
    switch (this.context) {
      case 'showHint':
        this.label = 'HINT SHOWING'
        break

      case 'highSecurityDoor':
        this.label = `HIGH SECURITY DOOR: PUZZLE ${this.route.currentHighSecurityStep}/2`
        break
    }
  }
}
</script>

<style lang="scss" scoped>
.BaseFrameIndicator {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 300;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  border: 7px solid rgba($color-theme, 1);
  pointer-events: all;

  .label {
    font-size: 18px;
    color: white;
    position: relative;

    &.showHint {
      padding: 5px 15px;
      top: -1px;
      background-color: $color-theme;
      span {
        animation: labelBlinking 0.5s infinite;
        @keyframes labelBlinking {
          0% {
            color: white;
          }
          49% {
            color: white;
          }
          50% {
            color: rgba(white, 0.5);
          }
          100% {
            color: rgba(white, 0.5);
          }
        }
      }
    }
    &.highSecurityDoor {
      background-color: lighten($color-theme, 0.5);
      padding: 10px 17px 5px;
      top: -6px;
    }
  }

  &.highSecurityDoor {
    border: 4px solid lighten($color-theme, 0.5);
  }
}
</style>
