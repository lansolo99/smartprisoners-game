<template>
  <div class="wrapper">
    <div id="highscores" ref="highscores" class="highscores">
      <div class="highscores__title title">
        <div class="title__layer layer">
          BEST PRISONERS
          <img
            class="layer__flag layer__flag--left"
            src="@/assets/images/highscores_flag-part.svg"
          />
          <img
            class="layer__flag layer__flag--right"
            src="@/assets/images/highscores_flag-part.svg"
          />
        </div>
      </div>
      <div class="highscores__table table">
        <!-- Head -->
        <div ref="head" class="table__row head">
          <div class="cell rank">
            <div class="top-layer"></div>
            <div class="label">RANK</div>
          </div>
          <div class="cell pseudo">
            <div class="top-layer"></div>
            <div class="label">PSEUDO</div>
          </div>
          <div class="cell time">
            <div class="top-layer"></div>
            <div class="label">TIME</div>
          </div>
          <div class="cell iq">
            <div class="top-layer"></div>
            <div class="label">IQ</div>
          </div>
        </div>

        <!-- Users -->
        <div id="users" ref="users">
          <BaseLoading :loading="loading" />
          <div
            v-for="(user, scoreIndex) in usersScores"
            :key="scoreIndex"
            :class="[
              { isUser: user.pseudo === pseudo },
              { hidden: loading },
              {
                isLastUserScore:
                  user.pseudo === pseudo &&
                  user.milliseconds === lastUserScoreMillisecs
              }
            ]"
            class="table__row user"
          >
            <div class="cell rank">{{ scoreIndex + 1 }}</div>
            <div class="cell name">{{ user.pseudo }}</div>
            <div class="cell time">{{ user.formatted }}</div>
            <!-- <div class="cell iq">{{ getUserIq(scoreIndex + 1) }}</div> -->
            <div class="cell iq">{{ getUserIq(user.milliseconds) }}</div>
          </div>
        </div>
        <div class="table__bottom-bar">x</div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import { killTimeOuts, numberBetween } from '@/utils'
import { computeUserScore } from '@/mixins/computeUserScore'
export default {
  name: 'Highscores',
  mixins: [computeUserScore],
  props: {
    pseudo: {
      type: String,
      required: true
    },
    context: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      timeOuts: [],
      offline: false,
      show: false,
      scores: [],
      lastUserScoreMillisecs: null
    }
  },
  computed: {
    ...mapState({
      usersState: state => state.users,
      sessionData: state => state.session
    }),
    ...mapGetters({
      showDialogWrapper: 'dialogs/showDialogWrapper',
      usersScores: 'users/usersScores',
      totalTime: 'session/totalTime'
    })
  },
  mounted() {
    // Init
    this.timeOuts.push(
      setTimeout(() => {
        switch (window.$nuxt.isOffline) {
          case false:
            this.displayHighscores()
            break
          case true:
            console.log('is offline')
            // Connexion fallback
            this.$emit('noNetworkHighscores')
            break
        }
      }, 500)
    )
  },
  beforeDestroy() {
    killTimeOuts(this.timeOuts)
  },
  methods: {
    ...mapMutations({
      updateUserSession: 'session/updateUserSession',
      updateDialogDisplay: 'dialogs/updateDialogDisplay'
    }),
    ...mapActions({
      updateUserTimes: 'users/updateUserTimes',
      getUsersData: 'users/getUsersData',
      addUserScore: 'users/addUserScore'
    }),
    displayHighscores() {
      switch (this.context) {
        case 'dialog':
          this.retrieveUsersData(this.context)
          break
        case 'end':
          // Process score
          this.computeUserScore(this.totalTime).then(totalTime => {
            console.log('computeUserScore finished')
            console.log(totalTime)
            this.lastUserScoreMillisecs = totalTime.milliseconds

            // Add new user time in Firestore
            const pseudo = this.sessionData.pseudo
            const payload = totalTime
            this.updateUserTimes({ pseudo, payload })
              .then(() => {
                console.log('updateUserTimes resolved in screenhighscores')
                this.retrieveUsersData(this.context)
              })
              .catch(err => {
                console.error(err)
                this.$emit('noNetworkHighscores')
              })
          })
          break
      }
    },
    retrieveUsersData(context) {
      console.log('retrieveUsersData')
      // loading on ...
      // Vuex api call -> fetch users data from Firestore
      const usersStoreUpdate = true
      this.getUsersData({ usersStoreUpdate })
        .then(res => {
          // Display + set scrolling to user score | if any
          this.timeOuts.push(
            setTimeout(() => {
              this.loading = false
            }, 200)
          )

          // Set highlighted user score
          this.timeOuts.push(
            setTimeout(() => {
              switch (context) {
                case 'dialog':
                  // if menu dialog -> display best user score
                  this.setBestUserScoreClass()
                  this.setUsersScrollTo('isUser1')
                  break
                case 'end':
                  // If end -> display last user score
                  this.setUsersScrollTo('isLastUserScore')
                  break
              }
            }, 500)
          )
        })
        .catch(res => {
          console.log(res)
          this.$emit('noNetworkHighscores')
        })
    },
    getUserIq(milliseconds) {
      const minutes = Math.floor(milliseconds / 1000 / 60)
      if (minutes < 15) return 'genius'
      if (numberBetween(minutes, 15, 17)) return 'very high'
      if (numberBetween(minutes, 18, 20)) return 'high'
      if (numberBetween(minutes, 21, 40)) return 'medium'
      if (minutes > 40) return 'low'
    },
    setBestUserScoreClass() {
      console.log('setBestUserScoreClass')
      const { users } = this.$refs
      const bestUserScore = users.querySelector('.isUser')
      if (bestUserScore) {
        bestUserScore.classList.add('isUser1')
      }
    },
    setUsersScrollTo(className) {
      const { users } = this.$refs
      const usersHeight = users.clientHeight
      const highlightedUserScore = users.querySelector(`.${className}`)

      if (highlightedUserScore) {
        const highlightedUserScoreOffset =
          highlightedUserScore.offsetTop - usersHeight / 2
        users.scrollTo({
          top: highlightedUserScoreOffset,
          left: 0,
          behavior: 'smooth'
        })
      }
    }
  }
}
</script>

<style lang="scss">
@mixin thickBar {
}

.wrapper {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
}
.highscores {
  display: grid;
  overflow: hidden;
  width: 100%;
  height: 100%;
  max-width: 500px;
  max-height: 275px;
  grid-template-rows: 60px auto;
  gap: 15px;
  flex-direction: column;
  color: $color-theme;

  @include responsive(tablet) {
    transform: scale(1.5);
  }
}

.title {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  font-size: 27px;
  &__layer {
    border: 2px solid #da112a;
    padding: 4px 20px 2px;
    position: relative;
    top: 5px;
  }
  .layer {
    position: relative;
    &__flag {
      display: block;
      position: absolute;
      width: 51px;
      &--left {
        left: -40px;
        top: 10px;
      }
      &--right {
        right: -40px;
        top: 10px;
        transform: scaleX(-1);
      }
    }
  }
}
.table {
  position: relative;
  &__row {
    text-align: center;
    display: grid;
    grid-template-columns: 64px auto 125px 100px;
    gap: 5px;
    font-size: 1.2rem;
    text-transform: uppercase;
    margin-top: 0.5px;
    transition: opacity 0.2s ease-out;

    &.head {
      margin-bottom: 10px;
      font-size: 1rem;

      .cell {
        position: relative;
        .top-layer {
          position: relative;
          top: 2px;
          height: 4px;
          width: 100%;
          background-color: $color-theme;
        }
        .label {
          position: relative;
          top: 4px;
        }
        &:before,
        &:after {
          position: absolute;
          content: '';
          background-color: $color-theme;
          height: 2px;
          width: 4px;
          top: 0;
        }
        &:before {
          left: 0;
        }
        &:after {
          right: 0;
        }
      }
    }

    .cell {
      padding: 2px 4px 1px;
      border-left: 1px solid $color-theme;
      border-right: 1px solid $color-theme;
    }
  }
  &__bottom-bar {
    position: absolute;
    overflow: overlay;
    left: 0px;
    bottom: 0px;
    width: 100%;
    height: 5px;
    background-color: $color-theme;
  }
}

// Users
#users {
  position: relative;
  overflow: scroll;
  scroll-behavior: smooth;
  height: 166px;
  padding-bottom: 5px;

  .hidden {
    opacity: 0;
  }

  .user {
    color: rgba($color-granny-smith, 0.8);
    font-size: 1.1rem;
    // First three ranked
    &:nth-child(-n + 3) {
      color: $color-theme;
      font-size: 1.25rem;
    }
    // User pseudo
    &.isUser {
      color: rgba(white, 0.6);
      background-color: rgba($color-granny-smith, 0.1);
    }
    &.isUser1,
    &.isLastUserScore {
      color: white !important;
      background-color: rgba($color-granny-smith, 0.15);
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
