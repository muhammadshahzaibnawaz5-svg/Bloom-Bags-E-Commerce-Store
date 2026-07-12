import { auth, db, isFirebaseAvailable } from './firebase.js'
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, updateProfile } from 'firebase/auth'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast')
  if (!toast) return
  toast.textContent = message
  toast.className = `toast toast-${type} toast-visible`
  clearTimeout(toast._hide)
  toast._hide = setTimeout(() => toast.classList.remove('toast-visible'), 2800)
}

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem('blome_cart')) || []
  } catch { return [] }
}

function saveCart(cart) {
  localStorage.setItem('blome_cart', JSON.stringify(cart))
}

export function updateCartBadge() {
  const el = document.getElementById('cart-count')
  if (!el) return
  const cart = getCart()
  const total = cart.reduce((sum, item) => sum + item.qty, 0)
  el.textContent = total
  el.classList.toggle('cart-badge--hidden', total === 0)
}

export function addToCart(name, price, img, id, color) {
  const cart = getCart()
  const itemId = Number(id) || id
  const existing = cart.find(item => item.id === itemId)
  if (existing) {
    existing.qty += 1
  } else {
    cart.push({ id: itemId, name, price, img, qty: 1, color: color || '' })
  }
  saveCart(cart)
  updateCartBadge()
  showToast(`${name} added to cart ✦`)
}

const menuBtn = document.getElementById('menu-btn')
const mobileMenu = document.getElementById('mobile-menu')
const menuIcon = document.getElementById('menu-icon')

menuBtn?.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('hidden')
  mobileMenu.classList.toggle('flex', !open)
  if (menuIcon) {
    menuIcon.innerHTML = open
      ? '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>'
      : '<line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/>'
  }
})

const signupBtn = document.getElementById('signup-btn')
const emailInput = document.getElementById('email-input')
const signupMsg = document.getElementById('signup-msg')
const signupSection = document.getElementById('signup-section')
const navUser = document.getElementById('nav-user')
const navUsername = document.getElementById('nav-username')
const mobileNavUser = document.getElementById('mobile-nav-user')
const mobileNavUsername = document.getElementById('mobile-nav-username')

function displayNameFromEmail(email) {
  const name = (email || '').split('@')[0].replace(/[._-]+/g, ' ').trim()
  return name ? name.replace(/\b\w/g, c => c.toUpperCase()) : 'Customer'
}

function updateNavbarUser(user) {
  const signedIn = !!user
  const name = user?.displayName || displayNameFromEmail(user?.email) || 'Customer'
  ;[navUser, mobileNavUser].forEach(el => el?.classList.toggle('is-visible', signedIn))
  if (navUsername) navUsername.textContent = name
  if (mobileNavUsername) mobileNavUsername.textContent = name
  if (signupSection) signupSection.classList.toggle('hidden', signedIn)
}

if (isFirebaseAvailable) {
  onAuthStateChanged(auth, (user) => {
    updateNavbarUser(user)
    if (user) {
      signupSection?.classList.add('hidden')
    } else {
      signupSection?.classList.remove('hidden')
    }
  })
} else {
  signupSection?.classList.add('hidden')
}

function signOutUser() {
  if (isFirebaseAvailable) {
    firebaseSignOut(auth)
  }
}

document.getElementById('nav-signout-btn')?.addEventListener('click', signOutUser)
document.getElementById('mobile-nav-signout-btn')?.addEventListener('click', signOutUser)

if (isFirebaseAvailable) {
  signupBtn?.addEventListener('click', async () => {
    const email = emailInput?.value.trim()
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email', 'error')
      return
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, email.split('@')[0] + '123')
      const name = displayNameFromEmail(email)
      await updateProfile(cred.user, { displayName: name })

      const subsCol = collection(db, 'subscribers')
      const q = query(subsCol, where('email', '==', email))
      const existing = await getDocs(q)
      if (existing.empty) {
        await addDoc(subsCol, { email, name, subscribedAt: new Date().toISOString() })
      }

      emailInput.value = ''
      signupMsg?.classList.remove('hidden')
      setTimeout(() => signupSection?.classList.add('hidden'), 900)
      showToast('Account created! Check your email.')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        try {
          await signInWithEmailAndPassword(auth, email, email.split('@')[0] + '123')
          emailInput.value = ''
          signupMsg?.classList.remove('hidden')
          setTimeout(() => signupSection?.classList.add('hidden'), 900)
          showToast('Signed in successfully!')
        } catch {
          showToast('Email already registered. Please sign in.', 'error')
        }
      } else if (err.code === 'auth/weak-password') {
        showToast('Use a stronger password', 'error')
      } else {
        showToast('Something went wrong. Try again.', 'error')
      }
    }
  })
}

const track = document.getElementById('carousel-track')
const dots = document.querySelectorAll('#carousel-dots button')
const prevBtn = document.getElementById('prev-testimonial')
const nextBtn = document.getElementById('next-testimonial')

if (track && dots.length) {
  function updateDots() {
    const cardWidth = track.querySelector('.snap-center')?.offsetWidth || 0
    const scrollLeft = track.scrollLeft
    const idx = Math.round(scrollLeft / cardWidth)
    dots.forEach((dot, i) => {
      dot.classList.toggle('bg-charcoal', i === idx)
      dot.classList.toggle('bg-warm-gray', i !== idx)
    })
  }

  track.addEventListener('scroll', updateDots)

  prevBtn?.addEventListener('click', () => {
    const cardWidth = track.querySelector('.snap-center')?.offsetWidth || 0
    track.scrollBy({ left: -cardWidth, behavior: 'smooth' })
  })

  nextBtn?.addEventListener('click', () => {
    const cardWidth = track.querySelector('.snap-center')?.offsetWidth || 0
    track.scrollBy({ left: cardWidth, behavior: 'smooth' })
  })

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const cardWidth = track.querySelector('.snap-center')?.offsetWidth || 0
      const idx = parseInt(dot.dataset.index)
      track.scrollTo({ left: idx * cardWidth, behavior: 'smooth' })
    })
  })

  updateDots()
}

updateCartBadge()
