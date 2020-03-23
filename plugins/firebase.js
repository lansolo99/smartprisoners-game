/* eslint-disable no-unused-vars */

import firebase from 'firebase/app'
import 'firebase/firestore'
import { firebaseDevKeys, firebaseProdKeys } from '@/api'

const firebaseConfigDev = {
  projectId: firebaseDevKeys.projectId,
  apiKey: firebaseDevKeys.apiKey,
  databaseURL: firebaseDevKeys.databaseURL
}

const firebaseConfigProd = {
  projectId: firebaseProdKeys.projectId,
  apiKey: firebaseProdKeys.apiKey,
  databaseURL: firebaseProdKeys.databaseURL
}

// Initialize Firebase
if (process.env.NODE_ENV === 'development') {
  firebase.initializeApp(firebaseConfigDev)
}
if (process.env.NODE_ENV === 'production') {
  // Dev db
  firebase.initializeApp(firebaseConfigDev)
  // Production release db
  // firebase.initializeApp(firebaseConfigProd)
}

const db = firebase.firestore()
const firebaseStandAlone = firebase

export { db }
export { firebaseStandAlone }
