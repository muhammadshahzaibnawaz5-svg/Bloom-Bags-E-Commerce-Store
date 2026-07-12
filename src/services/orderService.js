import { db } from '../firebase'
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore'

const col = collection(db, 'orders')

export async function getOrders() {
  const q = query(col, orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getOrder(id) {
  const snap = await getDoc(doc(db, 'orders', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getUserOrders(uid) {
  const q = query(col, where('userId', '==', uid), orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addOrder(data) {
  return await addDoc(col, { ...data, date: new Date().toISOString() })
}

export async function updateOrderStatus(id, status) {
  return await updateDoc(doc(db, 'orders', id), { status })
}

export function subscribeToUserOrders(uid, callback) {
  const q = query(col, where('userId', '==', uid), orderBy('date', 'desc'))
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(orders)
  })
}

export function subscribeToOrder(id, callback) {
  return onSnapshot(doc(db, 'orders', id), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  })
}
