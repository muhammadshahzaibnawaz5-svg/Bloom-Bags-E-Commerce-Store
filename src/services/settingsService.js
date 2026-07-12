import { db } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const SETTINGS_ID = 'main'

export async function getSettings() {
  const snap = await getDoc(doc(db, 'settings', SETTINGS_ID))
  return snap.exists() ? snap.data() : null
}

export async function saveSettings(data) {
  return await setDoc(doc(db, 'settings', SETTINGS_ID), data, { merge: true })
}
