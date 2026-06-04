import bcrypt from 'bcryptjs'

const STORE_KEY = 'farmpulse_users'

// ── In-memory session (disappears on tab close) ────────────────────────
let _session = null // { userId, name }

export function getSession() { return _session }
export function setSession(s) { _session = s }
export function clearSession() { _session = null }

// ── User store helpers ─────────────────────────────────────────────────
function loadUsers() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || [] } catch { return [] }
}
function saveUsers(users) {
  localStorage.setItem(STORE_KEY, JSON.stringify(users))
}
function findUser(phone) {
  return loadUsers().find(u => u.phone === phone) || null
}

// ── Register ───────────────────────────────────────────────────────────
export async function register({ name, phone, password }) {
  const users = loadUsers()
  if (users.find(u => u.phone === phone)) {
    throw new Error('An account with this phone number already exists.')
  }
  const passwordHash = await bcrypt.hash(password, 10)
  const user = {
    id: crypto.randomUUID(),
    name,
    phone,
    passwordHash,          // never stored plain
    apiCallsUsed: 0,
    apiCallsLimit: 100,
    farms: [],
    createdAt: new Date().toISOString().slice(0, 10),
  }
  users.push(user)
  saveUsers(users)
  setSession({ userId: user.id, name: user.name })
  return user
}

// ── Login ──────────────────────────────────────────────────────────────
export async function login({ phone, password }) {
  const user = findUser(phone)
  if (!user) throw new Error('No account found with this phone number.')
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) throw new Error('Incorrect password.')
  setSession({ userId: user.id, name: user.name })
  return user
}

// ── Get current user (from session) ───────────────────────────────────
export function getCurrentUser() {
  if (!_session) return null
  return loadUsers().find(u => u.id === _session.userId) || null
}

// ── Update user in store ───────────────────────────────────────────────
function updateUser(updatedUser) {
  const users = loadUsers().map(u => u.id === updatedUser.id ? updatedUser : u)
  saveUsers(users)
}

// ── Budget enforcement — call BEFORE every API request ─────────────────
export function checkBudget() {
  const user = getCurrentUser()
  if (!user) return { allowed: false, reason: 'Not logged in.' }
  if (user.apiCallsUsed >= user.apiCallsLimit) {
    return { allowed: false, reason: `API budget reached (${user.apiCallsLimit} calls used). Resets monthly.` }
  }
  return { allowed: true, remaining: user.apiCallsLimit - user.apiCallsUsed }
}

// ── Consume one API call (call AFTER a successful request) ─────────────
export function consumeApiCall() {
  const user = getCurrentUser()
  if (!user) return
  user.apiCallsUsed = Math.min(user.apiCallsUsed + 1, user.apiCallsLimit)
  updateUser(user)
}

// ── Farm helpers ───────────────────────────────────────────────────────
export function getFarms() {
  return getCurrentUser()?.farms || []
}

export function saveFarm(farm) {
  const user = getCurrentUser()
  if (!user) return []
  user.farms.push(farm)
  updateUser(user)
  return user.farms
}

// ── Sign out ───────────────────────────────────────────────────────────
export function signOut() {
  clearSession()
}
