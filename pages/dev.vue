<template>
  <section class="wrapper">
    <div class="menu">
      <!-- RELOAD -->
      <div
        class="cta cta--modal cta--labelOnly cta--inverted"
        @click="reloadPage()"
      >
        <div class="cta__label">
          RELOAD PAGE FIRST
        </div>
      </div>
      <!-- MENU -->
      <div class="cta cta--modal cta--labelOnly" @click="$router.push('/menu')">
        <div class="cta__label">
          MENU
        </div>
      </div>
      <!-- INTRO -->
      <div
        class="cta cta--modal cta--labelOnly"
        @click="$router.push('/intro')"
      >
        <div class="cta__label">
          INTRO
        </div>
      </div>
      <!-- PUZZLES -->
      <div
        v-for="(puzzle, index) in puzzleNames"
        :key="puzzle.text1"
        class="cta cta--modal cta--labelOnly"
        @click="setPuzzleShortcut(parseInt(index.substring(6)))"
      >
        <div class="cta__label">{{ puzzle.text1 }}</div>
      </div>
      <!-- TRANSITIONS -->
      <div
        class="cta cta--modal cta--labelOnly cta--inverted"
        @click="goToTransiton(5)"
      >
        <div class="cta__label">
          TRANSITION 5
        </div>
      </div>
      <div
        class="cta cta--modal cta--labelOnly cta--inverted"
        @click="goToTransiton(8)"
      >
        <div class="cta__label">
          TRANSITION 8
        </div>
      </div>
      <div
        class="cta cta--modal cta--labelOnly cta--inverted"
        @click="goToTransiton(10)"
      >
        <div class="cta__label">
          TRANSITION 10
        </div>
      </div>
    </div>
  </section>
</template>
<script>
import { mapMutations, mapGetters } from 'vuex'
import sourceData from '@/store/datas/scenario'
export default {
  name: 'Dev',
  data() {
    return {
      timeOuts: [],
      show: false,
      puzzleNames: null
    }
  },
  computed: {
    ...mapGetters({
      totalTime: 'session/totalTime'
    })
  },
  created() {
    this.puzzleNames = sourceData.startups
  },
  mounted() {
    this.resetAllDialogsDisplay()
    this.resetSessionData()
    window.localStorage.removeItem('vuex')

    // Mock user pseudo in vuex ...
    if (process.env.NODE_ENV === 'development') {
      const update = {
        pseudo: 'LEMMINGS',
        premium: false
      }
      this.updateUserSession(update)
    }
  },
  methods: {
    ...mapMutations({
      resetAllDialogsDisplay: 'dialogs/reset',
      resetSessionData: 'session/reset',
      setDirectAccessToPuzzle: 'session/setDirectAccessToPuzzle',
      updateUserSession: 'session/updateUserSession',
      updatePuzzlePlayed: 'session/updatePuzzlePlayed',
      updateCurrentPuzzle: 'session/updateCurrentPuzzle'
    }),
    setPuzzleShortcut(puzzleId) {
      // Set direct access in store
      this.setDirectAccessToPuzzle(true)
      this.updatePuzzlePlayed(puzzleId)
      this.updateCurrentPuzzle(puzzleId)
      // Select matching route
      if ([1, 2, 3, 6, 10].includes(puzzleId)) {
        // this.$router.push(`/startups/1`)
        this.$router.push(`/puzzles/1`)
      }
      if ([4, 5, 7, 9].includes(puzzleId)) {
        this.$router.push(`/startups/5`)
      }
      if ([8, 11, 12, 13].includes(puzzleId)) {
        this.$router.push(`/startups/8`)
      }
    },
    reloadPage() {
      location.reload(true)
    },
    goToTransiton(transition) {
      this.$router.push(`/transitions/${transition}`)
    }
  }
}
</script>

<style lang="scss">
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
