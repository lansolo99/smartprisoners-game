<template>
  <div class="highscoresWrapper">
    <ScreenHighscores
      :pseudo="sessionData.pseudo"
      context="end"
      @noNetworkHighscores="setNoNetworkDialog('end', 'highscores')"
    />
    <div class="nav">
      <div
        class="cta cta--puzzleTopBar nav__button nav__button--close"
        @click="quitGame"
      >
        <img class="cta__icon" src="@/assets/images/icons/icon_close.svg" />
      </div>
    </div>
    <!-- DIALOGS -->
    <transition name="dialog">
      <Dialogs
        v-if="showDialogWrapper"
        ref="dialogs"
        class="dialogs"
        @abort="quitGame"
      />
    </transition>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import { mapState, mapMutations, mapGetters, mapActions } from 'vuex'
import ScreenHighscores from '@/components/ScreenHighscores'
import { showDialog } from '@/mixins/showDialog.js'
import { noNetwork } from '@/mixins/noNetwork.js'
import Dialogs from '@/components/Dialogs'
export default {
  name: 'HighscoresRoute',
  components: {
    ScreenHighscores,
    Dialogs
  },
  mixins: [showDialog, noNetwork],
  computed: {
    ...mapState({
      sessionData: state => state.session
    }),
    ...mapGetters({
      showDialogWrapper: 'dialogs/showDialogWrapper'
    })
  },
  methods: {
    ...mapMutations({
      resetSessionData: 'session/reset',
      updateDialogDisplay: 'dialogs/updateDialogDisplay',
      updateUserSession: 'session/updateUserSession'
    }),
    quitGame() {
      console.log('quitGame from highscores')
      // Reset session store
      this.resetSessionData()
      this.$router.push('/menu')
      // Refresh app
      setTimeout(() => {
        location.reload(true)
      }, 500)
    }
  }
}
</script>

<style lang="scss" scoped>
.highscoresWrapper {
  position: relative;
}
@include topNav;
@include dialogCta;
</style>

<style>
.page-enter-active,
.page-leave-active {
  transition-property: opacity;
  transition-timing-function: ease-in-out;
  transition-duration: 100ms;
}
.page-enter,
.page-leave-to {
  opacity: 0;
}
</style>
