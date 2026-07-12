import { seedAll } from './seedService.js'

const log = document.getElementById('seed-log')
const btn = document.getElementById('seed-btn')
const status = document.getElementById('seed-status')

function appendLog(msg, type = 'info') {
  const div = document.createElement('div')
  div.className = `seed-${type}`
  div.textContent = msg
  log.appendChild(div)
}

btn.addEventListener('click', async () => {
  btn.disabled = true
  btn.textContent = 'Seeding...'
  log.innerHTML = ''
  status.textContent = ''

  try {
    appendLog('Starting seed...', 'info')
    const result = await seedAll()
    appendLog(`Admin: ${result.admin === 'already-exists' ? 'already exists' : 'created'}`, result.admin ? 'success' : 'warn')
    appendLog(`Products: ${result.products} seeded`, 'success')
    appendLog(`Categories: ${result.categories} seeded`, 'success')
    appendLog(`Banners: ${result.banners} seeded`, 'success')
    appendLog(`Settings: ${result.settings ? 'seeded' : 'failed'}`, result.settings ? 'success' : 'error')
    status.textContent = 'Seed completed successfully!'
    status.className = 'seed-success'
  } catch (e) {
    appendLog(`Error: ${e.message}`, 'error')
    status.textContent = 'Seed failed — check console'
    status.className = 'seed-error'
  } finally {
    btn.disabled = false
    btn.textContent = 'Run Seed'
  }
})
