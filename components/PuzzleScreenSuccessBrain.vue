<template>
  <div class="brain-wrapper">
    <!-- Brain filled -->
    <img src="@/assets/images/screen_success_brain_filled_outlined.svg" />

    <!-- Brain base -->
    <div id="brain-base-wrapper" :style="`height: ${updateIqProgress}px`">
      <img
        id="brain-base"
        src="@/assets/images/screen_success_brain_base_outlined.svg"
      />
    </div>

    <div id="brain-iq">
      <IOdometer :value="currentIq" class="iOdometer" />
    </div>
  </div>
</template>

<script>
import IOdometer from 'vue-odometer'
import 'odometer/themes/odometer-theme-default.css'
export default {
  name: 'Brain',
  components: {
    IOdometer
  },
  props: {
    updatedIq: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      currentIq: 0
    }
  },
  computed: {
    // currentId
    updateIqProgress() {
      // new
      // 0 = full
      // 75 = empty

      // old

      // Range = 70 - 135 -> gap = 65
      const ratio = 100 / 65
      // - 70 = offset for 0 base
      // 100 - = reversed fill direction
      // return 100 - (this.currentIq - 70) * ratio
      const percent = 100 - (this.currentIq - 70) * ratio
      return (percent / 100) * 75
      // return 100 - (this.currentIq - 70) * ratio
      // 80 -> 75px
    }
  },
  mounted() {
    // Init currentIq with subsracted update gap of 5
    this.currentIq = this.updatedIq - 5
    console.log('currentIq -> ', this.currentIq)
  },
  methods: {
    updateCurrentIq() {
      this.currentIq = this.updatedIq
      console.log('set current Iq to => ', this.currentIq)
    }
  }
}
</script>

<style lang="scss" scoped>
.brain-wrapper {
  position: relative;
  width: 100px;
  height: 80px;
  transform: scale(1.18);

  img {
    position: absolute;
    top: 0;
    left: 0;
    height: 70px;
    width: 100px;
  }

  @include responsive(tablet) {
    // width: 120px;
    // height: 100px;
  }
}

svg {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
}

#brain-base-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  transition: height 1.5s ease-in-out;
  width: 100%;
  overflow: overlay;
  height: 0%;
}

#brain-filled {
  transition: all 1.5s ease-in-out;
}

#brain-iq {
  position: absolute;
  top: calc(50% - 2px);
  left: 50%;
  width: 90px;
  text-align: center;
  transform: translateX(-50%) translateY(-50%);
  font-size: 40px;
  color: $color-anthracite;
}
</style>

<style lang="scss">
// Override odometer styles
#brain-iq {
  z-index: 10;
}
.odometer.odometer-theme-default {
  font-family: $font-share-tech;
}
</style>
