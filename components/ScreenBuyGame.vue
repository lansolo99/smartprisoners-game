<template>
  <div class="wrapper">
    <transition name="actions">
      <div v-if="!loading" class="buyGame">
        <!-- TITLE -->
        <div class="buyGame__title title">
          <div class="title__line"></div>
          <div class="title__logo">
            <img src="~/assets/images/removeads_logo_sm.svg" alt="" />
          </div>
          <div class="title__line"></div>
        </div>
        <!-- FEATURES -->
        <div class="buyGame__features features">
          <div class="features__feature feature">
            <img
              class="feature__icon"
              src="@/assets/images/icons/dialogs/icon_noads.svg"
            />
            <div class="feature__label">
              Remove<br />
              all ads
            </div>
          </div>
        </div>
        <!-- ACTIONS -->
        <transition name="actions">
          <div v-if="storeReady" class="buyGame__actions actions  ">
            <!-- Buy -->
            <PuzzleActions
              v-if="feature.state === 'buy'"
              :cols-num="1"
              :class="[storeState]"
              :buy-game-price="feature.price"
              :ctas="['buy']"
              context="buyGameActions"
              @click.native="buyGame()"
            />
            <!-- Owned -->
            <PuzzleActions
              v-if="feature.state === 'owned'"
              :cols-num="1"
              :ctas="['owned']"
              context="buyGameActions"
            />
          </div>
        </transition>
      </div>
    </transition>
    <BaseLoading :loading="loading" />
  </div>
</template>
<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import PuzzleActions from '@/components/PuzzleActions.vue'
import { killTimeOuts } from '@/utils'

export default {
  name: 'ScreenBuyGame',
  components: {
    PuzzleActions
  },
  data() {
    return {
      loading: true,
      timeOuts: [],
      storeReady: false,
      storeState: 'valid',
      feature: {
        state: 'buy',
        price: '0€'
      }
    }
  },
  computed: {
    ...mapState({
      sessionData: state => state.session
    }),
    ...mapGetters({
      showDialogWrapper: 'dialogs/showDialogWrapper'
    })
  },
  mounted() {
    // Init
    if (process.env.NODE_ENV === 'development') {
      // Dev
      if (!window.$nuxt.isOffline) {
        this.setOwnedState()
        this.timeOuts.push(
          setTimeout(() => {
            this.loading = false
          }, 300)
        )
      } else {
        console.log('buygame Connexion fallback')
        // Connexion fallback
        this.timeOuts.push(
          setTimeout(() => {
            this.$emit('noNetworkShop')
          }, 300)
        )
      }
    } else {
      // Prod
      switch (this.sessionData.premium) {
        case true:
          console.log('premium is true -> setOwnedState')
          this.setOwnedState()
          this.timeOuts.push(
            setTimeout(() => {
              this.loading = false
            }, 300)
          )
          break
        case false:
          console.log('premium is not true -> initstore')
          if (!window.$nuxt.isOffline) {
            this.initStore()
          } else {
            console.log('buygame Connexion fallback')
            // Connexion fallback
            this.timeOuts.push(
              setTimeout(() => {
                this.$emit('noNetworkShop')
              }, 300)
            )
          }
          break
      }
    }
  },
  beforeDestroy() {
    // this.initStore('storeOff')
    killTimeOuts(this.timeOuts)
  },
  methods: {
    ...mapActions({
      updateUserPremium: 'session/updateUserPremium'
    }),
    ...mapMutations({
      updateUserSession: 'session/updateUserSession',
      updateUserFirstShopLaunch: 'session/updateUserFirstShopLaunch',
      updateDialogDisplay: 'dialogs/updateDialogDisplay'
    }),

    setOwnedState() {
      console.log('set owned state')
      this.storeState = 'finished'
      this.feature.state = 'owned'
      this.storeReady = true
    },
    initStore() {
      console.log('initStore')

      if (!window.store) {
        console.log('Store not available')
        return
      }

      console.log(`firstShopLaunch: ${this.sessionData.firstShopLaunch}`)

      if (this.sessionData.firstShopLaunch) {
        console.log('FirstShopLaunch is true -> register')
        window.store.register({
          id: 'smartprisoners_fullgame',
          // type: window.store.NON_CONSUMABLE
          type: window.store.CONSUMABLE
        })
        window.store.error(function(error) {
          console.log('ERROR ' + error.code + ': ' + error.message)
        })
        this.updateUserFirstShopLaunch()
      }

      const refreshProductUI = product => {
        console.log('refreshProductUI')
        this.storeReady = true

        // Product
        if (product.loaded) {
          const { price } = product
          console.log(price)
          this.feature.price = price
          this.loading = false
        }

        if (product.owned) {
          // OWNED
          console.log('product is owned')
          this.feature.state = 'owned'
        } else {
          // BUY
          console.log('product is not owned')
          this.feature.state = 'buy'
          if (product.canPurchase) {
            // cta buy
            console.log('product can be purchased')
          } else {
            // cta owned
            console.log('product can not be purchased')
          }
        }
      }

      const initiatePurchase = () => {
        console.log('initiatePurchase')
        this.storeState = 'initiated'
        this.loading = true
      }

      const approvePurchase = p => {
        console.log('approved')
        p.verify()
      }

      const cancelPurchase = p => {
        console.log('cancelPurchase')
        this.storeState = 'valid'
        this.loading = false
      }

      const finishPurchase = p => {
        console.log('finishPurchase')

        // Set GooglePlay Store
        p.finish()
        window.store.off(refreshProductUI)

        // Set premium state in Firestore
        const pseudo = this.sessionData.pseudo
        const payload = true
        this.updateUserPremium({ pseudo, payload })
          .then(() => {
            console.log('firestore updated -> setOwnedState')

            // Set local storage
            window.localStorage.setItem('premium', 'true')

            // Update UI
            this.setOwnedState()
            this.loading = false
          })
          .catch(rej => {
            console.log('firestore update has failed')
            this.loading = false
          })
      }
      // Calls
      window.store.when('smartprisoners_fullgame').loaded(refreshProductUI)
      window.store.when('smartprisoners_fullgame').updated(refreshProductUI)
      window.store.when('smartprisoners_fullgame').initiated(initiatePurchase)
      window.store.when('smartprisoners_fullgame').approved(approvePurchase)
      window.store.when('smartprisoners_fullgame').verified(finishPurchase)
      window.store.when('smartprisoners_fullgame').cancelled(cancelPurchase)
      window.store.refresh()

      setTimeout(() => {
        const product = window.store.products.byId.smartprisoners_fullgame
        refreshProductUI(product)
      }, 200)
    },
    buyGame() {
      console.log('buyGame')
      // If feature.state = buy
      switch (window.$nuxt.isOffline) {
        case false:
          window.store.order('smartprisoners_fullgame')
          break
        case true:
          // Connexion fallback
          this.$emit('noNetworkShop')
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
}
.buyGame {
  display: grid;
  overflow: hidden;
  width: 100%;
  height: 100%;
  max-width: 430px;
  max-height: 200px;
  grid-template-rows: 55px auto 55px;
  gap: 15px;
  flex-direction: column;
  color: $color-theme;

  @include responsive(tablet) {
    transform: scale(1.5);
  }
}

.title {
  // background-color: green;
  display: flex;
  gap: 20px;
  align-items: center;

  &__line {
    height: 2px;
    width: 100%;
    background-color: $color-theme;
  }

  &__logo {
    flex: 0 0 160px;
    margin: 0 25px;
    img {
      display: block;
    }
  }
}

// Features
.features {
  display: flex;
  align-items: center;
  justify-content: center;
  &__feature {
    flex: 1 1 auto;
  }
}

.feature {
  display: flex;
  position: relative;
  top: -4px;
  max-width: 113px;
  margin: 0 10px;

  &__icon {
    width: 40px;
  }
  &__label {
    text-align: left;
    margin-left: 10px;
    font-size: 20px;
    text-transform: uppercase;
    color: lighten($color-granny-smith, 10%);
  }
}

// Actions
.actions {
  height: 55px;
}

.buyGame__actions.initiated {
  opacity: 0.5;
  pointer-events: none;
}

// Transitions

// PuzzleResetLayer transition
.actions-enter-active,
.actions-leave-active {
  transition: opacity 0.2s ease-out;
}
.actions-enter,
.actions-leave-to {
  opacity: 0;
}

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
