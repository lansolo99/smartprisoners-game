<template>
  <div>
    <!-- Top-left link -->
    <svg
      v-if="link === 1"
      id="Layer_1"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 50 120"
      style="enable-background:new 0 0 50 120;"
      xml:space="preserve"
    >
      <g id="dash">
        <path
          class="back"
          d="M66.1,113.4l-18.7,0.1c-24,0-43.5-19.5-43.5-43.5V50c0-24,19.5-43.5,43.5-43.5l18.7,0.1"
        />
        <path
          class="front blue"
          d="M66.1,113.4l-18.7,0.1c-24,0-43.5-19.5-43.5-43.5V50c0-24,19.5-43.5,43.5-43.5l18.7,0.1"
        />
      </g>
      <g id="dash">
        <path
          class="back"
          d="M66.2,102.5l-18.8,0.1c-18,0-32.6-14.6-32.6-32.6V50c0-18,14.6-32.6,32.6-32.6l18.8,0.1"
        />
        <path
          class="front cyan"
          d="M66.2,102.5l-18.8,0.1c-18,0-32.6-14.6-32.6-32.6V50c0-18,14.6-32.6,32.6-32.6l18.8,0.1"
        />
      </g>
      <g id="dash">
        <path
          class="back"
          d="M66.2,91.6l-18.8,0.1c-12,0-21.8-9.7-21.8-21.8V50c0-12,9.7-21.8,21.8-21.8l18.8,0.1"
        />
        <path
          class="front pink"
          d="M66.2,91.6l-18.8,0.1c-12,0-21.8-9.7-21.8-21.8V50c0-12,9.7-21.8,21.8-21.8l18.8,0.1"
        />
      </g>
      <g id="dash">
        <path
          class="back"
          d="M66.2,80.7l-18.8,0.1c-6,0-10.9-4.9-10.9-10.9V50c0-6,4.9-10.9,10.9-10.9l18.8,0.1"
        />
        <path
          class="front yellow"
          d="M66.2,80.7l-18.8,0.1c-6,0-10.9-4.9-10.9-10.9V50c0-6,4.9-10.9,10.9-10.9l18.8,0.1"
        />
      </g>
    </svg>
    <!-- Bottom-center link -->
    <svg
      v-if="link === 2"
      id="_x32_"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 100 120"
      style="enable-background:new 0 0 100 120;"
      xml:space="preserve"
    >
      <!-- Side -->
      <g>
        <path class="back" d="M53.7,22.2c8-9.7,20.2-15.9,33.8-15.9h8.9" />
        <path class="front blue" d="M53.7,22.2c8-9.7,20.2-15.9,33.8-15.9h8.9" />

        <path class="back" d="M61.1,30.6c6-8,15.6-13.3,26.3-13.3h8.9" />
        <path class="front cyan" d="M61.1,30.6c6-8,15.6-13.3,26.3-13.3h8.9" />

        <path class="back" d="M65.5,50.1c0-12.1,9.8-21.9,21.9-21.9h8.9" />
        <path class="front pink" d="M65.5,50.1c0-12.1,9.8-21.9,21.9-21.9h8.9" />

        <path
          class="back"
          d="M3,115.6c1,0,21.2,0,22.2,0c23.8-0.4,50.9-24.3,50.9-49.4V51c0-6,4.9-10.9,10.9-10.9H96"
        />
        <path
          class="front yellow"
          d="M3,115.6c1,0,21.2,0,22.2,0c23.8-0.4,50.9-24.3,50.9-49.4V51c0-6,4.9-10.9,10.9-10.9H96"
        />
      </g>
      <!-- Main -->
      <g class="bottom-main">
        <path
          class="back mask"
          d="M3,6.5l18.7-0.1c24,0,43.5,19.5,43.5,43.5v11.9c0,24-19.5,43.5-43.5,43.5L3,105.4"
        />
        <path
          class="back"
          d="M3,6.5l18.7-0.1c24,0,43.5,19.5,43.5,43.5v11.9c0,24-19.5,43.5-43.5,43.5L3,105.4"
        />
        <path
          class="front blue"
          d="M3,6.5l18.7-0.1c24,0,43.5,19.5,43.5,43.5v11.9c0,24-19.5,43.5-43.5,43.5L3,105.4"
        />
        <path
          class="back"
          d="M2.9,17.4l18.8-0.1c18,0,32.6,14.6,32.6,32.6v11.9c0,18-14.6,32.6-32.6,32.6L2.9,94.3"
        />
        <path
          class="front cyan"
          d="M2.9,17.4l18.8-0.1c18,0,32.6,14.6,32.6,32.6v11.9c0,18-14.6,32.6-32.6,32.6L2.9,94.3"
        />
        <path
          class="back"
          d="M2.9,28.3l18.8-0.1c12,0,21.8,9.7,21.8,21.8v11.9c0,12-9.7,21.8-21.8,21.8L2.9,83.6"
        />
        <path
          class="front pink"
          d="M2.9,28.3l18.8-0.1c12,0,21.8,9.7,21.8,21.8v11.9c0,12-9.7,21.8-21.8,21.8L2.9,83.6"
        />
        <path class="back" d="M2.9,39.1L21.7,39c6,0,10.9,4.9,10.9,10.9" />
        <path
          class="front yellow"
          d="M2.9,39.1L21.7,39c6,0,10.9,4.9,10.9,10.9"
        />
      </g>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'Puzzle12Links',
  props: {
    link: {
      type: Number,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.link1 {
  svg {
    width: 45px;
    position: relative;
    left: -5px;
  }
}
.link2 {
  svg {
    width: 90px;
  }
}
.bottom-main {
  path {
    &.front {
      &.blue {
        animation-direction: reverse;
      }
    }
  }
}
path {
  fill: none;
  &.back {
    stroke: #b8dede;
    stroke-width: 3;
    &.mask {
      //stroke: $color-anthracite;
      stroke: #11171f;
      stroke-width: 12;
    }
  }
  &.front {
    stroke-width: 5;
    // animation: dash 20s linear infinite;

    &.blue {
      stroke: #2a5ab0;
      stroke-dasharray: 250;
      animation: dash 4s linear infinite;
    }
    &.cyan {
      stroke: #7cd4e8;
      stroke-dasharray: 60;
    }
    &.pink {
      stroke: #ec5586;
      stroke-dasharray: 40;
    }
    &.yellow {
      stroke: #ecd245;
      stroke-dasharray: 20;
    }
  }
}
@keyframes dash {
  to {
    stroke-dashoffset: 1000;
  }
}
</style>
