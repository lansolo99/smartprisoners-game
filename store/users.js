/* eslint-disable no-unused-vars */
import Vue from 'vue'
import sourceData from '@/store/datas/users'
import { db, firebaseStandAlone } from '~/plugins/firebase.js'

export const state = () => ({
  users: {}
})

export const actions = {
  updateUserTimes({ commit }, { pseudo, payload }) {
    console.log('updateUserTimes action')
    return new Promise((resolve, reject) => {
      db.collection('users')
        .where('pseudo', '==', pseudo)
        .get()
        .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            console.log(doc.id)
            console.log(doc.data())
            console.log({ payload })
            // user times update
            db.collection('users')
              .doc(doc.id)
              .update({
                times: firebaseStandAlone.firestore.FieldValue.arrayUnion(
                  payload
                )
              })
              .then(() => {
                console.log(payload)
                console.log('user times have been updated in firestore')
                resolve()
                // no immediate commit -> record user times in firestore first
              })
              .catch(error => {
                console.log(error)
              })
          })
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  getUsersData({ commit }, { usersStoreUpdate }) {
    return new Promise((resolve, reject) => {
      db.collection('users')
        .get()
        .then(users => {
          resolve(users)
          if (usersStoreUpdate) {
            const usersSnapshot = users.docs.map(doc => {
              return doc.data()
            })
            commit('getUsersData', usersSnapshot)
          }
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  setDummyUsersDatas({ commit }) {
    const dummyUserData = sourceData

    const addDummyUserToCollection = (user, index) => {
      db.collection('users')
        .add({
          email: `email${index}@gmail.com`,
          pseudo: user.pseudo,
          premium: false,
          times: user.times
        })
        .then(docRef => {
          console.log('Dummy user added in Firestore')
        })
        .catch(error => {
          console.log(error)
        })
    }

    Object.entries(dummyUserData).forEach((user, index) => {
      addDummyUserToCollection(user[1], index)
    })
  }
}

export const mutations = {
  getUsersData(state, usersSnapshot) {
    for (const [key, value] of Object.entries(usersSnapshot)) {
      Vue.set(state.users, key, value)
    }
  }
}

export const getters = {
  usersScores(state) {
    // Score constructor
    class Score {
      constructor(pseudo, formatted, milliseconds) {
        this.pseudo = pseudo
        this.formatted = formatted
        this.milliseconds = milliseconds
      }
    }

    // Set scores
    const scores = []
    Object.values(state.users)
      .filter(user => user.times.length)
      .forEach(user => {
        user.times.forEach(time => {
          const { pseudo } = user
          const formatted = time.formatted
          const milliseconds = time.milliseconds
          const score = new Score(pseudo, formatted, milliseconds)
          scores.push(score)
        })
      })

    // Sort scores
    const sortedScores = scores.sort((a, b) =>
      a.milliseconds > b.milliseconds ? 1 : -1
    )
    return sortedScores
  },
  usersLength(state) {
    return Object.keys(state.users).length
  }
}
