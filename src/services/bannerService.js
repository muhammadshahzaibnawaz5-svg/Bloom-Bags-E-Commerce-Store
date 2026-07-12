import { db } from '../firebase'
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'

const col = collection(db, 'banners')
const LOCAL_KEY = 'blome_banners'

function getLocalBanners() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [] } catch { return [] }
}

function saveLocalBanners(banners) {
  try {
    const normalized = banners.map(b => ({
      ...b,
      createdAt: b.createdAt?.toDate ? b.createdAt.toDate().toISOString() : b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt
    }))
    localStorage.setItem(LOCAL_KEY, JSON.stringify(normalized))
  } catch { }
}

export async function getBanners() {
  const local = getLocalBanners()
  try {
    const snap = await getDocs(col)
    const firestore = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    const merged = mergeBanners(firestore, local)
    saveLocalBanners(merged)
    return merged
  } catch {
    return local.length ? local : []
  }
}

function mergeBanners(firestore, local) {
  const map = new Map()
  for (const b of firestore) map.set(b.id, b)
  for (const b of local) map.set(b.id, b)
  return Array.from(map.values())
}

export async function addBanner(data) {
  let banner = { ...data }
  let id
  try {
    const docRef = await addDoc(col, banner)
    id = docRef.id
  } catch {
    id = 'local_' + Date.now()
  }
  banner = { id, ...banner }
  const local = getLocalBanners()
  local.unshift(banner)
  saveLocalBanners(local)
  return banner
}

export async function updateBanner(id, data) {
  try {
    await updateDoc(doc(db, 'banners', id), data)
  } catch { }
  const local = getLocalBanners()
  const idx = local.findIndex(b => String(b.id) === String(id))
  if (idx !== -1) {
    local[idx] = { ...local[idx], ...data }
  }
  saveLocalBanners(local)
}

export async function deleteBanner(id) {
  try {
    await deleteDoc(doc(db, 'banners', id))
  } catch { }
  const local = getLocalBanners()
  saveLocalBanners(local.filter(b => String(b.id) !== String(id)))
}
