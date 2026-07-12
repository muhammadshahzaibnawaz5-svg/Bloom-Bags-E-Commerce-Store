import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
const hasConfig = !!(apiKey && projectId)

let app = null
let db = null
let auth = null
let storage = null
let isFirebaseAvailable = false

if (hasConfig) {
  try {
    const firebaseConfig = {
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    }
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    auth = getAuth(app)
    storage = getStorage(app)
    isFirebaseAvailable = true
  } catch (e) {
    console.warn('Firebase initialization failed:', e.message)
  }
} else {
  console.info('Firebase config not found — running in offline/fallback mode')
}

export { db, auth, storage, isFirebaseAvailable }
