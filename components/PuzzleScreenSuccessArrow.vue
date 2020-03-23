<template>
  <div class="arrow-wrapper">
    <svg
      id="arrow-base"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 35 45"
      style="enable-background:new 0 0 35 45;"
      xml:space="preserve"
    >
      <style type="text/css">
        .arrowBase {
          fill: #fbc512;
          opacity: 0.5;
        }
      </style>
      <path
        class="arrowBase"
        d="M16.9,0.3L0.2,20.8c-0.4,0.5,0,1.2,0.6,1.2h6.9c0.4,0,0.7,0.3,0.8,0.6l4.3,21.8c0.1,0.4,0.4,0.6,0.8,0.6h7.9
	c0.4,0,0.7-0.3,0.8-0.6l4.3-21.8c0.1-0.4,0.4-0.6,0.8-0.6h6.9c0.6,0,1-0.7,0.6-1.2L18.1,0.3C17.8-0.1,17.2-0.1,16.9,0.3z"
      />
    </svg>

    <svg
      id="arrow-filled"
      :class="{ arrowAnimationDone: arrowAnimationDone }"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 35 45"
      style="enable-background:new 0 0 35 45;"
      xml:space="preserve"
    >
      <style type="text/css">
        .arrowFilled {
          fill: #fbc512;
        }
      </style>
      <path
        class="arrowFilled"
        d="M16.9,0.3L0.2,20.8c-0.4,0.5,0,1.2,0.6,1.2h6.9c0.4,0,0.7,0.3,0.8,0.6l4.3,21.8c0.1,0.4,0.4,0.6,0.8,0.6h7.9
	c0.4,0,0.7-0.3,0.8-0.6l4.3-21.8c0.1-0.4,0.4-0.6,0.8-0.6h6.9c0.6,0,1-0.7,0.6-1.2L18.1,0.3C17.8-0.1,17.2-0.1,16.9,0.3z"
      />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'PuzzleSuccessArrow',
  props: {
    arrowAnimationDone: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.arrow-wrapper {
  position: relative;
  height: 30px;
  width: 30px;

  @include responsive(tablet) {
    height: 50px;
  }
}
svg {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 30px;

  @include responsive(tablet) {
    height: 60px;
  }
}

// #arrow-base {}
#arrow-filled {
  // First value will be animated 0 -> 100%
  clip-path: inset(100% 0px 0px 0px);
  animation: arrowFillingAnimation 1s ease-in-out infinite;
  animation-delay: 1.4s;
  @keyframes arrowFillingAnimation {
    0% {
      clip-path: inset(100% 0px 0px 0px);
    }
    100% {
      clip-path: inset(0% 0px 0px 0px);
    }
  }

  &.arrowAnimationDone {
    animation-iteration-count: 1;
    clip-path: inset(0% 0px 0px 0px);
  }
}
</style>
