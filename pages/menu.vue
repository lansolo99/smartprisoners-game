<template>
  <section class="wrapper">
    <BaseTopGui />
    <!-- MENU VIDEO -->
    <PuzzleVideo
      context="menu"
      dialog-over="dialogOver"
      @showHighscore="showDialog('highscores')"
      @showRemoveAds="showDialog('removeads')"
      @videoLoopStarted="initUser"
    />

    <!-- DIMMER -->
    <transition name="dialog">
      <div v-if="display.dimmer" class="dimmer"></div>
    </transition>

    <!-- DIALOGS -->
    <transition name="dialog">
      <Dialogs
        v-if="showDialogWrapper"
        ref="dialogs"
        class="dialogs"
        @noNetworkShop="setNoNetworkDialog('menu', 'shop')"
        @noNetworkHighscores="setNoNetworkDialog('menu', 'highscores')"
        @closeCreatePseudo="display.dimmer = false"
      />
    </transition>

    <!-- HELPERS -->
    <div v-if="display.devHelper" class="dev_helper">
      <div @click="$router.push('/dev')">Dev</div>
    </div>

    <!-- LOADING -->
    <BaseLoading :loading="display.loading" />

    <!-- USER HUD -->
    <transition name="dialog">
      <TheUserHud
        v-if="session.pseudo"
        :user="session.pseudo"
        class="TheUserHud"
      />
    </transition>
  </section>
</template>
<script>
/* eslint-disable no-unused-vars */
import { webClientId } from '@/api'
import { mapState, mapMutations, mapGetters, mapActions } from 'vuex'
import { killTimeOuts } from '@/utils'
import { EventBus } from '@/bus'
import { showDialog } from '@/mixins/showDialog.js'
import { noNetwork } from '@/mixins/noNetwork.js'
import BaseTopGui from '@/components/BaseTopGui'
import PuzzleVideo from '@/components/PuzzleVideo'
import TheUserHud from '@/components/TheUserHud'
import Dialogs from '@/components/Dialogs'

import { db } from '~/plugins/firebase.js'
export default {
  name: 'Menu',
  components: {
    Dialogs,
    PuzzleVideo,
    BaseTopGui,
    TheUserHud
  },
  mixins: [showDialog, noNetwork],
  data() {
    return {
      timeOuts: [],
      display: {
        devHelper: false,
        dimmer: false,
        dialog: false,
        loading: false
      }
    }
  },
  computed: {
    ...mapState({
      session: state => state.session
    }),
    ...mapGetters({
      showDialogWrapper: 'dialogs/showDialogWrapper'
    })
  },
  mounted() {
    this.resetAllDialogsDisplay()
    this.resetSessionData()
    window.localStorage.removeItem('vuex')

    // ------- > APP INIT:
    // Triggers from <PuzzleVideos/>

    // ------- > FIREBASE:
    // SetDummyUserDatas (Firestore reset purpose only)
    // this.setDummyUsersDatas()
  },
  beforeDestroy() {
    killTimeOuts(this.timeOuts)
  },
  methods: {
    ...mapMutations({
      resetAllDialogsDisplay: 'dialogs/reset',
      resetSessionData: 'session/reset',
      setDirectAccessToPuzzle: 'session/setDirectAccessToPuzzle',
      updatePuzzlePlayed: 'session/updatePuzzlePlayed',
      updateCurrentPuzzle: 'session/updateCurrentPuzzle',
      updateDialogDisplay: 'dialogs/updateDialogDisplay',
      updateUserSession: 'session/updateUserSession'
    }),
    ...mapActions({
      setDummyUsersDatas: 'users/setDummyUsersDatas',
      getUsersData: 'users/getUsersData',
      updateUserPremium: 'session/updateUserPremium'
    }),
    initUser() {
      if (process.env.NODE_ENV === 'development') {
        this.initFakeUser('autosetinfos')
        // this.initFakeUser('mocksetpseudo')
        // this.initRealUser()
      }

      if (process.env.NODE_ENV === 'production') {
        this.initRealUser()
      }
    },
    initFakeUser(action) {
      switch (action) {
        case 'autosetinfos':
          const update = {
            firstLaunch: false,
            email: 'email9@gmail.com',
            pseudo: 'LEMMINGS',
            premium: false
            // premium: true
          }
          this.updateUserSession(update)
          break
        case 'mocksetpseudo':
          // Display CreatePseudo dialog
          this.timeOuts.push(
            setTimeout(() => {
              this.showDialog('createPseudo', 'menu')
            }, 200)
          )
          break
      }
    },

    initRealUser() {
      // Check localStorage
      if (window.localStorage.getItem('userPseudo') !== null) {
        console.log('CASE 1: USER RETRIEVED FROM LOCAL STORAGE')

        // CASE 1: USER RETRIEVED FROM LOCAL STORAGE
        this.setSessionFromLocalStorage()
      } else {
        console.log('CASE 2: USER NOT RETRIEVED FROM LOCALSTORAGE')
        // CASE 2: USER NOT RETRIEVED FROM LOCALSTORAGE
        console.log('offline mode', window.$nuxt.isOffline)

        switch (window.$nuxt.isOffline) {
          case false:
            // Set dimmer
            this.display.dimmer = true
            this.display.loading = true
            this.showDialog('empty', 'menu')
            // Assign Google account
            this.googlePlusSignIn()
            break
          case true:
            // Temp !!
            this.display.dimmer = true
            this.showDialog('empty', 'menu')
            // Connexion fallback
            this.setNoNetworkDialog('menu', 'initUser')
            break
        }
      }
    },
    setSessionFromLocalStorage() {
      console.log(
        `Case1: user retrieved: ${window.localStorage.getItem('userPseudo')}`
      )

      // Set UserData with localStorage
      const premiumReconverted =
        window.localStorage.getItem('premium') === 'true'
      console.log('premiumReconverted ', premiumReconverted)
      console.log('type of premiumReconverted : ', typeof premiumReconverted)

      const update = {
        firstLaunch: false,
        email: window.localStorage.getItem('email'),
        pseudo: window.localStorage.getItem('userPseudo'),
        premium: premiumReconverted
      }
      this.updateUserSession(update)
      console.log('user data update in store silently')
      // ...
    },
    googlePlusSignIn() {
      console.log('googlePlusSignIn')
      // Display Google User account dialog + set obj

      window.plugins.googleplus.login(
        {
          // webClientId,
          // offline: true
          offline: false
        },
        obj => {
          // Success callback
          console.log('success -> display user account dialog')
          this.checkIfUserExists(obj)
        },
        msg => {
          // Error callback
          console.log('error: ' + msg)
          // Connexion fallback
          this.setNoNetworkDialog('menu', 'initUser')
        }
      )
    },
    checkIfUserExists(obj) {
      console.log('checkIfUserExists')
      const retrievedGoogleEmail = obj.email
      const usersStoreUpdate = false

      this.getUsersData({ usersStoreUpdate })
        .then(users => {
          // this.loading = false ...
          console.log('getUsersData -> users datas retrieved')
          // Retrieve all users emails
          const usersEmail = users.docs.map(doc => {
            return doc.data().email
          })

          if (usersEmail.includes(retrievedGoogleEmail)) {
            // CASE 1: USER EXISTS
            console.log('Case 1: user email exists -> bail')

            // Set usersData array
            const usersData = users.docs.map(doc => {
              return doc.data()
            })

            // Get retrieved user object
            const retrievedUserInfos = usersData.find(doc => {
              return doc.email === retrievedGoogleEmail
            })

            // Update user data in vuex
            const update = {
              firstLaunch: false,
              email: retrievedUserInfos.email,
              pseudo: retrievedUserInfos.pseudo,
              premium: retrievedUserInfos.premium
            }
            this.updateUserSession(update)

            window.localStorage.setItem('email', retrievedUserInfos.email)
            window.localStorage.setItem('userPseudo', retrievedUserInfos.pseudo)
            window.localStorage.setItem('premium', retrievedUserInfos.premium)

            this.display.loading = false
            // Close empty dialog
            this.closeEmptyDialog()

            // Display welcomeBackPseudo dialog
            console.log('Display welcome back dialog with pseudo')
            this.timeOuts.push(
              setTimeout(() => {
                this.showDialog('welcomeBackPseudo', 'menu')
                // TimeOut -> dimmer off + Unpause menu video
                this.timeOuts.push(
                  setTimeout(() => {
                    console.log('TimeOut -> dimmer off + Unpause menu video')
                    const dialog = 'welcomeBackPseudo'
                    const status = false
                    this.updateDialogDisplay({ dialog, status })
                    this.display.dimmer = false
                  }, 2500)
                )
              }, 200)
            )
          } else {
            // CASE 2: USER DOESN'T EXISTS
            console.log('Case 2: user doesnt exists -> udpate email')

            // Update user captured email
            const update = {
              email: obj.email
            }
            this.updateUserSession(update)

            this.display.loading = false
            // Close empty dialog
            this.closeEmptyDialog()

            // Display CreatePseudo dialog
            this.timeOuts.push(
              setTimeout(() => {
                this.showDialog('createPseudo', 'menu')
              }, 200)
            )
          }
        })
        .catch(err => {
          // Connexion fallback
          console.log(err)
          this.display.loading = false
          this.setNoNetworkDialog('menu', 'initUser')
        })
    },
    closeEmptyDialog() {
      const dialog = 'empty'
      const status = false
      this.updateDialogDisplay({ dialog, status })
    }
  }
}
</script>

<style lang="scss" scoped>
.TheUserHud {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 2200;
  text-transform: uppercase;
}

.baseLoading {
  z-index: 9999;
}
.menu {
  position: absolute;
  position: fixed;
  top: 21vw;
  right: 15vw;
  width: auto;
  height: 40vw;
  z-index: 4000;
  background-color: rgba(purple, 0.5);

  .cta {
    background-color: rgba(blue, 0.5);
    height: 8.5vw;
    width: 33vw;
  }
}

.dialogs {
  z-index: 2500;
  box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.3);
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

.dimmer {
  @include dimmer;
}

.dev_helper {
  position: absolute;
  color: white;
  bottom: 10px;
  right: 10px;
  z-index: 7000;
  div {
    text-align: center;
    padding: 5px 10px;
    margin: 2px;
    background-color: red;
    color: white;
    border: none;
    font-size: 1rem;
  }
}
</style>
