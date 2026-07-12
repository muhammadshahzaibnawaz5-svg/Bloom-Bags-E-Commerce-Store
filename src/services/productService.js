import { db } from '../firebase'
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore'

const col = collection(db, 'products')
const LOCAL_KEY = 'blome_products'

function getLocalProducts() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [] } catch { return [] }
}

function saveLocalProducts(products) {
  try {
    const normalized = products.map(p => ({
      ...p,
      createdAt: p.createdAt?.toDate ? p.createdAt.toDate().toISOString() : p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
      updatedAt: p.updatedAt?.toDate ? p.updatedAt.toDate().toISOString() : p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt
    }))
    localStorage.setItem(LOCAL_KEY, JSON.stringify(normalized))
  } catch { }
}

export async function getProducts() {
  const local = getLocalProducts()
  try {
    const q = query(col, orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    const firestore = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    const merged = mergeProducts(firestore, local)
    saveLocalProducts(merged)
    return merged
  } catch {
    return local.length ? local : []
  }
}

function mergeProducts(firestore, local) {
  const map = new Map()
  for (const p of firestore) map.set(p.id, p)
  for (const p of local) map.set(p.id, p)
  return Array.from(map.values()).sort((a, b) => {
    const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
    const db = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
    return db - da
  })
}

export async function getProduct(id) {
  try {
    const snap = await getDoc(doc(db, 'products', id))
    if (snap.exists()) return { id: snap.id, ...snap.data() }
  } catch { }
  const local = getLocalProducts()
  return local.find(p => String(p.id) === String(id)) || null
}

export async function addProduct(data) {
  let product = { ...data, createdAt: new Date(), updatedAt: new Date() }
  let id
  try {
    const docRef = await addDoc(col, product)
    id = docRef.id
  } catch {
    id = 'local_' + Date.now()
  }
  product = { id, ...product }
  const local = getLocalProducts()
  local.unshift(product)
  saveLocalProducts(local)
  return product
}

export async function updateProduct(id, data) {
  try {
    await updateDoc(doc(db, 'products', id), { ...data, updatedAt: new Date() })
  } catch { }
  const local = getLocalProducts()
  const idx = local.findIndex(p => String(p.id) === String(id))
  if (idx !== -1) {
    local[idx] = { ...local[idx], ...data, updatedAt: new Date() }
  }
  saveLocalProducts(local)
}

export async function deleteProduct(id) {
  try {
    await deleteDoc(doc(db, 'products', id))
  } catch { }
  const local = getLocalProducts()
  saveLocalProducts(local.filter(p => String(p.id) !== String(id)))
}
