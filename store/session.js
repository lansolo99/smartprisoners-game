import { format } from 'date-fns'
import sourceData from '@/store/datas/session'
import { db } from '~/plugins/firebase.js'

export const state = () => ({
  ...sourceData
})

export const actions = {
  updateUserPremium({ commit }, { pseudo, payload }) {
    return new Promise((resolve, reject) => {
      db.collection('users')
        .where('pseudo', '==', pseudo)
        .get()
        .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            console.log(doc.id)
            console.log(doc.data())

            // user object update
            db.collection('users')
              .doc(doc.id)
              .update({ premium: payload })
              .then(() => {
                console.log(
                  `premium key in user object has been updated to ${payload}`
                )
                resolve()
                commit('updateUserPremium', payload)
              })
          })
        })
        .catch(error => {
          reject(error)
        })
    })
  }
}

export const mutations = {
  updateUserSession(state, update) {
    Object.entries(update).forEach(pair => {
      state[pair[0]] = pair[1]
    })
  },
  updateUserIQ(state) {
    state.iq += 5
  },
  updateUserPremium(state, payload) {
    state.premium = payload
  },
  updateUserFirstShopLaunch(state) {
    console.log('updateUserFirstShopLaunch mutation')
    state.firstShopLaunch = false
  },
  setDirectAccessToPuzzle(state, status) {
    console.log('setDirectAccessToPuzzle :', status)
    state.directAccess = status
  },
  updateCurrentHighSecurityStep(state, step) {
    console.log('updateCurrentHighSecurityStep', step)
    state.currentHighSecurityStep = step
  },
  updatePuzzlePlayed(state, puzzleId) {
    if (!state.puzzlesPlayed.includes(puzzleId)) {
      state.puzzlesPlayed.push(puzzleId)
    }
  },
  resetPuzzlePlayed(state) {
    state.puzzlesPlayed = []
  },
  resetPuzzleSolved(state) {
    state.puzzlesSolved = []
  },
  updatePuzzleSolved(state, puzzleId) {
    console.warn('pdatePuzzleSolved -> ' + puzzleId)
    state.puzzlesSolved.push(puzzleId)
  },
  updateCurrentPuzzle(state, puzzleId) {
    state.currentpuzzle = puzzleId
  },
  recordCurrentSchemaId(state, { puzzleId, schemaId }) {
    state.staticSchemasCycling[`puzzle${puzzleId}`] = schemaId
  },
  updateLives(state, payload = 1) {
    state.lives -= payload
  },
  // updateAttempts(state, payload = 1) {
  updateAttempts(state, payload) {
    const { puzzleAttempts, context } = payload
    // Remove one attempts or reset to initial puzzle value
    switch (context) {
      case 'resetAttempts':
        state.attempts = puzzleAttempts
        break
      case 'updateAttempts':
        state.attempts -= 1
        break
    }
  },
  recordCurrentPuzzleTime(state, time) {
    console.log('recordCurrentPuzzleTime', time)
    state.puzzleTimes.push(time)
    state.currentPuzzleTime = time
  },
  reset(state) {
    const resetExceptions = {
      firstLaunch: state.firstLaunch,
      firstShopLaunch: state.firstShopLaunch,
      premium: state.premium,
      pseudo: state.pseudo,
      audios: {
        volume: state.audios.volume
      }
    }

    Object.assign(state, sourceData)
    state.puzzleTimes = []

    Object.entries(resetExceptions).forEach(prop => {
      state[prop[0]] = prop[1]
    })
  },
  togglePuzzleChanged(state, status) {
    state.puzzleChanged = status
  },
  setAudiosVolume(state) {
    const currentVolume = state.audios.volume
    return currentVolume === 1
      ? (state.audios.volume = 0)
      : (state.audios.volume = 1)
  }
}

export const getters = {
  totalTime(state) {
    // Constructor
    class TimeFormats {
      constructor(milliseconds, formatted, human) {
        this.milliseconds = milliseconds
        this.formatted = formatted
        this.human = human
      }
    }

    if (state.puzzleTimes.length > 0) {
      // Store millisecs timestamps
      const timestamps = []
      state.puzzleTimes.forEach(chrono => {
        const ms =
          Number(chrono.split(':')[0]) * 60 * 60 * 1000 +
          Number(chrono.split(':')[1]) * 60 * 1000 +
          Number(chrono.split(':')[2].split('.')[0]) * 1000 +
          Number(chrono.split('.')[1])
        timestamps.push(ms)
      })
      const computedTimestamps = timestamps.reduce((t, c) => {
        return t + c
      })

      const correctedComputedTimestamps =
        computedTimestamps - 1 * 60 * 60 * 1000

      const formattedComputedTimestamps = format(
        correctedComputedTimestamps,
        'HH:mm:ss:SSS'
      )

      const humanReadableTime = formattedComputedTimestamps
        .split(':')
        .map((v, i) => {
          switch (i) {
            case 0:
              if (v === '00') {
                return
              } else if (v[0] === '0') {
                return v[1] + 'h,'
              } else {
                return v + 'h,'
              }
            case 1:
              return v[0] === '0' ? v[1] + ' mins,' : v + ' mins,'
            case 2:
              return v[0] === '0' ? v[1] + ' secs,' : v + ' secs,'
            case 3:
              return v + ' ms'
          }
        })
        .join(' ')
        .trim()

      // const puzzleTimes = ['00:08:30.219', '00:02:30.219']
      // const puzzleTimes = ['00:00:03.111', '00:00:08.896', '00:00:04.849']

      return new TimeFormats(
        computedTimestamps,
        formattedComputedTimestamps,
        humanReadableTime
      )
      // return formattedComputedTimestamps
    } else {
      return new TimeFormats(0, '00:00:00.000', 'no time')
      // return '00:00:00.000'
    }
  }
}
