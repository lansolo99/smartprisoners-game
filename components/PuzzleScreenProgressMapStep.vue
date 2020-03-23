<template>
  <div class="stepContainer">
    <div class="dotWrapper">
      <!-- Illustration -->
      <img
        v-if="id === 1"
        class="illustration prison-cell"
        src="~/assets/images/progressmap_step_prison-cell.svg"
      />
      <img
        v-if="id === 10"
        class="illustration freedom-station"
        src="~/assets/images/progressmap_step_train.svg"
      />
      <!-- Dot -->
      <PuzzleScreenProgressMapDot
        :security-level="securityLevel"
        :current-state="currentState"
        class="dot"
      />
      <!-- Label -->
      <div :class="[`step${id}`, labelPosition, currentState]" class="label">
        <div v-if="currentState === 'on'" :data-text="label" class="glitch">
          {{ label }}
        </div>
        <div v-else>
          {{ label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PuzzleScreenProgressMapDot from '@/components/PuzzleScreenProgressMapDot.vue'
export default {
  name: 'Step',
  components: {
    PuzzleScreenProgressMapDot
  },
  props: {
    id: {
      type: Number,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    labelPosition: {
      type: String,
      required: true
    },
    securityLevel: {
      type: String,
      required: true
    },
    currentState: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.stepContainer {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dotWrapper {
  position: relative;
}
.dot {
  width: 20px;
  height: 20px;
}
.illustration {
  position: absolute;
  width: 37px;
  top: -46px;
  left: 50%;
  transform: translateX(-50%);
}
.label {
  transition: color 0.2s ease-in-out;
  color: lighten($color-blue-3, 20%);
  text-transform: uppercase;
  font-size: 14px;
  position: absolute;

  &.passed {
    color: rgba($color-granny-smith, 0.8);
  }
  &.on {
    color: white;
  }

  &.top {
    top: -37px;
    left: 50%;
    transform: translateX(-50%);
  }
  &.bottom {
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
    .glitch {
      &:before,
      &:after {
        top: 0px;
      }
    }

    &.step1 {
      .glitch {
        &:before,
        &:after {
          text-align: center;
          //left: 2px;
          top: 0px;
          width: auto;
        }
      }
    }
  }

  &.left {
    top: -5px;
    right: 30px;
  }

  &.right {
    top: 0;
    left: 40px;
  }
}

// GLITCH
@include glitch(standard);
.glitch {
  color: white;
  font-size: 14px;
  padding: 0;

  &:before,
  &:after {
    top: 0px;
    width: auto;
    height: 30px;
    text-shadow: -0px 0 white;
  }
  &:before {
    left: -2px;
  }
  &:after {
    left: 2px;
  }
}
</style>
