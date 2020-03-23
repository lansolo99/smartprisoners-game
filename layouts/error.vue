<template>
  <div class="errorWrapper">
    <h1 v-if="error.statusCode === 404" class="errorWrapper__title">
      {{ pageNotFound }}
    </h1>
    <h1 v-else class="errorWrapper__title">
      {{ otherError }}
    </h1>
    <div
      class="cta cta--modal cta--labelOnly errorWrapper__link"
      @click="$router.push('/menu')"
    >
      <div class="cta__label">
        BACK TO MENU
      </div>
    </div>
    <!-- Sounds -->
    <BaseSounds ref="generalGameOver" sound-source="general_game_over" />
  </div>
</template>

<script>
export default {
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      pageNotFound: 'PRISON BUG!',
      otherError: 'An error occurred'
    }
  },
  mounted() {
    // Btn sound
    this.$refs.generalGameOver.playSound()
  },
  head() {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError
    return {
      title
    }
  }
}
</script>

<style lang="scss">
.errorWrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  justify-content: center;
  &__link {
    margin-top: 30px;
    color: white;
  }
}
.cta {
  @include cta;
  margin: 10px;
  margin-top: 30px;
  &--labelOnly {
    padding: 0.2rem 2rem 0.1rem;
  }
  &--dev {
    border: 1px solid $color-orange;
  }
  &__label--dev {
    color: $color-orange;
  }
}
</style>
