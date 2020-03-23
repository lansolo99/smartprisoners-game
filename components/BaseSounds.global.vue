<template>
  <div class="baseSound">
    <audio
      v-if="soundSource"
      ref="sound"
      :src="require(`@/assets/sounds/${soundSource}.mp3`)"
    ></audio>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'BaseSounds',
  props: {
    soundSource: {
      type: String,
      required: true
    },
    loop: {
      type: Boolean,
      required: false
    }
  },
  data() {
    return {
      soundEl: null
    }
  },
  computed: {
    ...mapState({
      sessionData: state => state.session
    }),
    getSoundCurrentTime() {
      return this.soundEl.currentTime
    }
  },
  watch: {
    'sessionData.audios.volume': {
      handler(val, oldVal) {
        this.soundEl.volume = val
      },
      deep: true
    }
  },
  mounted() {
    // Set sound element
    this.soundEl = this.$refs.sound
    this.soundEl.volume = this.sessionData.audios.volume

    // Loop
    if (this.loop) {
      this.soundEl.setAttribute('loop', '')
    }
  },
  methods: {
    playSound() {
      this.soundEl.volume = this.sessionData.audios.volume
      this.soundEl.play()
    },
    pauseSound() {
      this.soundEl.pause()
    },
    stopSound() {
      this.soundEl.pause()
      this.soundEl.currentTime = 0
    },
    updateVolume() {
      this.soundEl.volume = this.sessionData.audios.volume
    }
  }
}
</script>

<style lang="scss" scoped>
.baseSound {
  position: absolute;
}
</style>
