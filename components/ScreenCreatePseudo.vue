<template>
  <div class="wrapper">
    <div class="createPseudo">
      <form @submit.prevent="createUserData">
        <h1 class="createPseudo__title">Choose a name</h1>
        <!-- fields -->
        <div class="createPseudo__fieldset">
          <input
            ref="pseudoInput"
            :value="pseudo"
            class="createPseudo__field"
            type="text"
            @keypress="preventTyping"
            @input="checkNetwork"
            @focus="setFocusState"
            @blur="setFocusState"
          />
          <button
            :class="{
              enabled: !$v.pseudo.$invalid && pseudoAvailability.status
            }"
            type="submit"
            class="createPseudo__submit"
          >
            OK
          </button>

          <BaseLoading
            :loading="loading"
            position="static"
            class="pseudoLoading"
          />

          <!-- Errors -->
          <transition name="validations">
            <div v-if="$v.pseudo.$error" class="createPseudo__error">
              <div v-if="!$v.pseudo.required">
                Your name must be non-empty!
              </div>
              <div v-if="!$v.pseudo.minLength">
                Your name must be 3 chars min!
              </div>
              <div v-if="!$v.pseudo.maxLength">
                Your name must be 17 chars max!
              </div>
              <div v-if="!$v.pseudo.alphaNum">
                Only alphanumerics!
              </div>
            </div>
          </transition>

          <!-- Availability status -->
          <transition name="validations">
            <div
              v-if="pseudoAvailability.display"
              class="createPseudo__pseudoCheck"
            >
              <div
                v-if="pseudoAvailability.status"
                class="text text--available"
              >
                Name Available
              </div>
              <div v-else class="text text--notavailable">
                Name not Available
              </div>
            </div>
          </transition>
        </div>
      </form>
    </div>
    <BaseSounds ref="BaseSounds" sound-source="btn_base" />
    <BaseSounds ref="soundTypeInput" sound-source="type_input" />
  </div>
</template>
<script>
import { validationMixin } from 'vuelidate'
import { mapState, mapMutations, mapActions } from 'vuex'
import {
  required,
  minLength,
  maxLength,
  alphaNum
} from 'vuelidate/lib/validators'
import { killTimeOuts } from '@/utils'
import { db } from '~/plugins/firebase.js'

export default {
  name: 'ScreenCreatePseudo',
  filters: {
    uppercase(value) {
      if (!value) return ''
      value = value.toString()
      return value.toUpperCase()
    }
  },
  mixins: [validationMixin],
  data() {
    return {
      timeOuts: [null],
      loading: false,
      pseudoInputEl: null,
      pseudo: null,
      pseudoKeyDown: true,
      pseudoAvailability: {
        display: false,
        status: false
      }
    }
  },
  validations: {
    pseudo: {
      required,
      alphaNum,
      minLength: minLength(3),
      maxLength: maxLength(17)
    }
  },
  computed: {
    ...mapState({
      session: state => state.session
    })
  },
  mounted() {
    this.pseudoInputEl = this.$refs.pseudoInput
    // Input events triggers
  },
  beforeDestroy() {
    this.timeOuts = []
  },
  methods: {
    ...mapMutations({
      updateUserSession: 'session/updateUserSession'
    }),
    ...mapActions({
      getUsersData: 'users/getUsersData'
    }),
    setFocusState() {
      console.log('setfocustate')
      this.$emit('inputDialog')
      if (window.StatusBar) {
        window.StatusBar.hide()
      }
    },
    checkNetwork(event) {
      switch (window.$nuxt.isOffline) {
        case false:
          this.setDelayBeforeValidations(event)
          break
        case true:
          // Connexion fallback
          this.setNoNetworkDialog('menu', 'initUser')
          break
      }
    },
    setDelayBeforeValidations(event) {
      console.log(event.target.value)
      console.log('input => setDelayBeforeValidations')

      // Reset availability
      this.pseudoAvailability.status = false
      this.pseudo = event.target.value.toUpperCase()

      // Set check delay
      killTimeOuts(this.timeOuts)

      this.timeOuts.push(
        setTimeout(() => {
          console.log('check for ', event.target.value)
          console.log(
            'pseudoInputEl before checking pseudo: ',
            this.pseudoInputEl
          )
          this.checkForExistingPseudo(event)
          this.pseudoKeyDown = false
          console.log('pseudoKeyDown: ', this.pseudoKeyDown)
        }, 600)
      )
    },
    preventTyping(event) {
      if (!this.pseudoKeyDown) {
        event.preventDefault()
      }
    },
    checkForExistingPseudo(event) {
      console.log('checkForExistingPseudo')
      this.$v.pseudo.$touch()

      // Check pseudos if valid
      if (!this.$v.pseudo.$invalid) {
        console.warn('valid, checking pseudo availability ...')
        // Pseudo is valid
        this.pseudoAvailability.display = true
        this.loading = true
        const usersStoreUpdate = false

        this.getUsersData({ usersStoreUpdate })
          .then(users => {
            console.log('getUsersData -> users datas retrieved')
            setTimeout(() => {
              this.pseudoKeyDown = true
              console.log('pseudoKeyDown: ', this.pseudoKeyDown)
            }, 100)

            this.loading = false
            const usersPseudo = users.docs.map(doc => {
              return doc.data().pseudo
            })
            if (usersPseudo.includes(this.pseudo)) {
              this.pseudoAvailability.status = false
            } else {
              this.timeOuts.push(
                setTimeout(() => {
                  this.$refs.soundTypeInput.stopSound()
                  this.$refs.soundTypeInput.playSound()
                  this.pseudoAvailability.status = true
                }, 0)
              )
            }
          })
          .catch(err => {
            console.log(err)
            // Connexion fallback
            this.setNoNetworkDialog('menu', 'initUser')
          })
      } else {
        // Pseudo is invalid
        this.pseudoAvailability.display = false
        this.timeOuts.push(
          setTimeout(() => {
            this.pseudoKeyDown = true
            console.log('pseudoKeyDown: ', this.pseudoKeyDown)
          }, 100)
        )
      }
    },
    createUserData() {
      console.log('create user data')
      this.$refs.BaseSounds.playSound()

      this.$v.pseudo.$touch()

      if (!this.$v.pseudo.$invalid && this.pseudoAvailability.status) {
        // Pseudo is valid & available
        this.loading = true

        // Create user data in firestore
        db.collection('users')
          .add({
            email: this.session.email,
            pseudo: this.pseudo,
            premium: false,
            times: []
          })
          .then(docRef => {
            console.log('createUserData then')
            this.loading = false

            // Update user data in vuex
            const update = {
              firstLaunch: false,
              pseudo: this.pseudo
            }
            this.updateUserSession(update)

            // Set local storage
            this.timeOuts.push(
              setTimeout(() => {
                window.localStorage.setItem('email', this.session.email)
                window.localStorage.setItem('userPseudo', this.pseudo)
                window.localStorage.setItem('premium', false)

                // close dialog
                this.$emit('closeDialog')
              }, 500)
            )
          })
          .catch(error => {
            console.log('createUserData fail')
            console.log(error)
            // Connexion fallback
            this.setNoNetworkDialog('menu', 'initUser')
          })
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
.createPseudo {
  &__title {
    text-transform: uppercase;
    font-size: 18px;
  }

  &__fieldset {
    position: relative;
    margin-top: 20px;
    display: flex;
  }

  &__error,
  &__pseudoCheck {
    position: absolute;
    bottom: -50px;
    left: 0;
    text-align: left;
    bottom: -36px;
    height: 30px;
  }

  &__spinner {
    position: absolute;
    right: -30px;
    top: 7px;
  }

  &__pseudoCheck {
    .text {
      &--available {
        color: $color-cyan;
      }
      &--notavailable {
        color: $color-theme;
      }
    }
  }

  &__field {
    font-family: $font-share-tech;
    border: 1px solid $color-theme;
    color: $color-granny-smith;
    background-color: transparent;
    padding: 7px 7px 5px;
    font-size: 16px;
    width: 170px;
    letter-spacing: 1px;
    height: 35px;
    text-transform: uppercase;
    flex: 1 1 auto;
  }

  &__submit {
    font-family: $font-share-tech;
    font-size: 18px;
    border: 0;
    background-color: $color-theme;
    transition: color 0.2s ease;
    width: 50px;
    height: 35px;
    flex: 0 0 auto;
    pointer-events: none;
    color: rgba(white, 0.5);

    &.enabled {
      pointer-events: auto;
      color: white;
    }
  }
}

.pseudoLoading {
  position: absolute;
  right: -32px;
  top: 6px;
}

// Transitions
.validations-enter-active,
.validations-leave-active {
  transition: opacity 0.15s ease-out;
}
.validations-enter,
.validations-leave-to {
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
