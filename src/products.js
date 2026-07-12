import { db, isFirebaseAvailable } from './firebase.js'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { fallbackProducts } from './data/fallbackData.js'

const LOCAL_KEY = 'blome_products'

function getLocalProducts() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [] } catch { return [] }
}

let cachedProducts = []
let loaded = false

function normalizeProduct(data, id) {
  return {
    id: data.id ?? id,
    ...data,
    image: data.image || (Array.isArray(data.images) && data.images[0]) || ''
  }
}

export async function initProducts() {
  if (loaded) return cachedProducts

  const local = getLocalProducts()
  if (local.length > 0) {
    cachedProducts = local.map(p => normalizeProduct(p, p.id))
    loaded = true
    return cachedProducts
  }

  if (!isFirebaseAvailable) {
    cachedProducts = fallbackProducts
    loaded = true
    return cachedProducts
  }

  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    if (!snap.empty) {
      cachedProducts = snap.docs.map(d => normalizeProduct(d.data(), d.id))
    } else {
      cachedProducts = fallbackProducts
    }
    loaded = true
  } catch {
    cachedProducts = local.length ? local.map(p => normalizeProduct(p, p.id)) : fallbackProducts
    loaded = true
  }
  return cachedProducts
}

export function getProductsSync() {
  if (!loaded) return fallbackProducts
  return cachedProducts
}

export function getProduct(id) {
  const source = loaded ? cachedProducts : fallbackProducts
  return source.find(p => String(p.id) === String(id))
    || source.find(p => String(p.id) === `prod_${id}`)
    || null
}

export function getRelatedProducts(product, count = 4) {
  const source = loaded ? cachedProducts : fallbackProducts
  if (!source.length) return []
  const sameCategory = source.filter(p => p.category === product.category && String(p.id) !== String(product.id))
  const others = source.filter(p => p.category !== product.category && String(p.id) !== String(product.id))
  const shuffled = [...sameCategory, ...others].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function getStarRating(rating) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) stars.push('full')
    else if (i - rating < 1) stars.push('half')
    else stars.push('empty')
  }
  return stars
}

const RECENTLY_VIEWED_KEY = 'blome_recently_viewed'
const MAX_RECENTLY_VIEWED = 8

export function getRecentlyViewedIds() {
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY)) || []
  } catch { return [] }
}

export function addRecentlyViewed(productId) {
  let viewed = getRecentlyViewedIds()
  viewed = viewed.filter(id => String(id) !== String(productId))
  viewed.unshift(String(productId))
  if (viewed.length > MAX_RECENTLY_VIEWED) {
    viewed = viewed.slice(0, MAX_RECENTLY_VIEWED)
  }
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(viewed))
}

export function getRecentlyViewedProducts(count = 4, excludeId) {
  let ids = getRecentlyViewedIds()
  if (excludeId != null) ids = ids.filter(id => String(id) !== String(excludeId))
  ids = ids.slice(0, count)
  const source = loaded ? cachedProducts : fallbackProducts
  return ids.map(id => source.find(p => String(p.id) === String(id))).filter(Boolean)
}
