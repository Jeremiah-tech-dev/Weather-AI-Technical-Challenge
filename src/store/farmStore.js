const USER_KEY = 'fp_user'
const FARMS_KEY = 'fp_farms'

export function getUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
}

export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getFarms() {
  try { return JSON.parse(localStorage.getItem(FARMS_KEY)) || [] } catch { return [] }
}

export function saveFarm(farm) {
  const farms = getFarms()
  farms.push(farm)
  localStorage.setItem(FARMS_KEY, JSON.stringify(farms))
  return farms
}

export function clearAll() {
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(FARMS_KEY)
}
