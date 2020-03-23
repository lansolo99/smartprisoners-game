<template>
  <div class="holdIndicator">
    <svg class="progress-ring">
      <circle
        class="progress-ring__circle"
        stroke-width="4"
        stroke="white"
        fill="transparent"
        r="10"
        cx="18"
        cy="18"
      />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'Puzzle1HoldIndicator',
  data() {
    return {
      progress: Number
    }
  }
}
</script>

<style lang="scss" scoped>
.holdIndicator {
  position: absolute;
  width: 34px;
  height: 34px;
  background-color: red;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
}
.progress-ring {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
