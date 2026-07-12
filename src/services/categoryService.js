import { db } from '../firebase'
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'

const col = collection(db, 'categories')

export async function getCategories() {
  const snap = await getDocs(col)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addCategory(name) {
  return await addDoc(col, { name })
}

export async function updateCategory(id, name) {
  return await updateDoc(doc(db, 'categories', id), { name })
}

export async function deleteCategory(id) {
  return await deleteDoc(doc(db, 'categories', id))
}
