import { storage } from '../firebase'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'

const IMGBB_KEY = import.meta.env.VITE_IMGBB_KEY || '3572acc9df5fc72534b49173d93eaed4'

export function uploadImage(file, path = 'products') {
  const timestamp = Date.now()
  const filename = `${timestamp}_${file.name}`
  const storageRef = ref(storage, `${path}/${filename}`)
  const task = uploadBytesResumable(storageRef, file)
  return task
}

export async function getImageUrl(task) {
  return await getDownloadURL(task.snapshot.ref)
}

export async function deleteImage(url) {
  try {
    const storageRef = ref(storage, url)
    await deleteObject(storageRef)
  } catch { }
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export async function uploadToImgBB(dataUrl) {
  const base64 = dataUrl.split(',')[1]
  const formData = new FormData()
  formData.append('key', IMGBB_KEY)
  formData.append('image', base64)
  const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: formData })
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message || 'ImgBB upload failed')
  return json.data.url
}
