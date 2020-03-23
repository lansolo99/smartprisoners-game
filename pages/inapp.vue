<template>
  <section class="wrapper">
    <div class="menu">
      <div ref="locked" class="product">{{ stateOfProduct }}</div>
      <div
        class="cta cta--modal cta--labelOnly cta--inverted"
        @click="inAppPurchase()"
      >
        <div class="cta__label">
          BUY FULL GAME
        </div>
      </div>
    </div>
  </section>
</template>
<script>
export default {
  name: 'InAppPurchase',
  data() {
    return {
      productInfos: {
        state: null
      },
      timeOuts: []
    }
  },
  computed: {
    stateOfProduct() {
      return 'Feature ' + window.localStorage.unlocked === 'YES'
        ? 'UNLOCKED! o/'
        : 'locked :('
    }
  },
  mounted() {
    // this.$refs.locked
  },
  methods: {
    inAppPurchase() {
      console.log('inAppPurchase')
    }
  }
}
</script>

<style lang="scss">
.product {
  color: white;
}
.menu {
  height: 100vh;
  margin: 0 auto;
  padding: 5vw;
  display: flex;
  overflow: scroll;
  flex-direction: column;
  align-items: center;
  text-align: center;

  .cta {
    @include cta;
    margin: 10px;
    &--labelOnly {
      padding: 0.2rem 2rem 0.1rem;
    }

    &--inverted {
      background-color: $color-theme;
      color: white;
    }
  }
}

// Transition
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
) store
