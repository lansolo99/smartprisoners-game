<template>
  <div class="baseTopGui">
    <transition name="topBarGui">
      <div
        v-if="renderBaseTopGui"
        class="baseTopGui__sound"
        @click="setAudios()"
      >
        <img
          v-show="sessionData.audios.volume === 0"
          class="cta__icon"
          src="@/assets/images/icons/dialogs/icon_sound-off.svg"
        />
        <img
          v-show="sessionData.audios.volume === 1"
          class="cta__icon"
          src="@/assets/images/icons/dialogs/icon_sound-on.svg"
        />
      </div>
    </transition>
    <BaseSounds ref="BaseSounds" sound-source="btn_base" />
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
  name: 'BaseTopGui',
  data() {
    return {
      renderBaseTopGui: false
    }
  },
  computed: {
    ...mapState({
      sessionData: state => state.session
    })
  },
  mounted() {
    this.renderBaseTopGui = true
  },
  methods: {
    ...mapMutations({
      setAudiosVolume: 'session/setAudiosVolume'
    }),
    setAudios() {
      this.$refs.BaseSounds.playSound()
      this.setAudiosVolume()
    }
  }
}
</script>

<style lang="scss" scoped>
.baseTopGui {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 2500;

  &__sound {
    width: 30px;
  }
}

// video transitions
.topBarGui-enter-active,
.topBarGui-leave-active {
  transition: opacity 0.5s 0.7s ease-in-out;
}
.topBarGui-enter {
  opacity: 0;
}
</style>
