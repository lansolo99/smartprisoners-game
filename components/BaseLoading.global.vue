<template>
  <div :class="position" class="baseLoading">
    <!-- Loading -->
    <transition name="validations">
      <img
        v-if="loading"
        class="createPseudo__spinner"
        src="~/assets/images/spinner.svg"
        width="20"
        alt=""
      />
    </transition>
  </div>
</template>

<script>
export default {
  name: 'BaseLoading',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    position: {
      type: String,
      default: 'center'
    }
  }
}
</script>

<style lang="scss" scoped>
.baseLoading {
  &.center {
    position: absolute;
    top: calc(50% - 5px);
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
}

.loading-enter-active,
.loading-leave-active {
  transition: opacity 0.15s ease-out;
}
.loading-enter,
.loading-leave-to {
  opacity: 0;
}
</style>
