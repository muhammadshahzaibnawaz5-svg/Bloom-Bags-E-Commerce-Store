import { auth, db, isFirebaseAvailable } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'

export function onAuth(callback) {
  if (!isFirebaseAvailable) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

export async function isAdmin(uid) {
  if (!isFirebaseAvailable || !uid) return false
  try {
    const snap = await getDoc(doc(db, 'roles', uid))
    return snap.exists() && snap.data().role === 'admin'
  } catch {
    return false
  }
}

export async function signOutUser() {
  if (isFirebaseAvailable) {
    await firebaseSignOut(auth)
  }
  window.location.href = '/'
}
