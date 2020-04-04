<template>
  <div class="wrapperAdMob">
    <BaseLoading :loading="loading" />
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import { killTimeOuts } from '@/utils'
import { admobKeys } from '@/api'
export default {
  name: 'ScreenAdMob',
  data() {
    return {
      loading: true,
      timeOuts: [],
      admobid: admobKeys
    }
  },
  computed: {
    ...mapState({
      sessionData: state => state.session
    })
  },
  mounted() {
    console.warn('ADMOB')
    console.log(this.admobid)
    this.initAdmob()
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        this.setNextRoute(this.sessionData.admobContext)
      }, 500)
    }
  },
  beforeDestroy() {
    killTimeOuts(this.timeOuts)
  },
  methods: {
    ...mapMutations({
      resetAllDialogsDisplay: 'dialogs/reset'
    }),
    initAdmob() {
      // Fail
      document.addEventListener('onAdFailLoad', e => {
        console.log('onAdFailLoad')
        console.log(JSON.stringify(e))
        this.setNextRoute(this.sessionData.admobContext)
      })
      // Dismiss
      document.addEventListener('onAdDismiss', () => {
        console.log('onAdDismiss')
        this.setNextRoute(this.sessionData.admobContext)
      })

      // Success callback
      const displaySuccess = e => {
        console.log('success: ', e)
        killTimeOuts(this.timeOuts)
      }

      // Fail callback
      const displayFail = e => {
        console.log('failed: ', e)
        this.setNextRoute(this.sessionData.admobContext)
      }

      // Interstitial
      if (window.AdMob) {
        console.log('AdMob')
        // Set skip ad timeout if too long
        this.timeOuts.push(
          setTimeout(() => {
            console.warn('ad time out!')
            this.setNextRoute(this.sessionData.admobContext)
          }, 3000)
        )
        // beforeSkip
        window.AdMob.prepareInterstitial(
          { adId: this.admobid, autoShow: true },
          displaySuccess,
          displayFail
        )
      }
    },
    setNextRoute(nextEvent) {
      console.log('admobContext = ', this.sessionData.admobContext)
      switch (nextEvent) {
        case 'changePuzzle':
          console.log(`case change puzzle: emit ${nextEvent} event`)
          this.resetAllDialogsDisplay()
          this.$emit(nextEvent)
          break
        case 'levelup':
          this.$router.push(`/startups/${this.$route.params.id}`)
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapperAdMob {
  position: relative;
}
</style>
