import { checkBudget, consumeApiCall } from '../store/farmStore'

const BASE    = 'https://api.weatherai.co'
const API_KEY = import.meta.env.VITE_WEATHERAI_KEY

export const isMockMode = () => !API_KEY || API_KEY === 'demo'

export class BudgetError extends Error {
  constructor(msg) { super(msg); this.isBudget = true }
}

// ── Core fetch wrapper ─────────────────────────────────────────────────
async function call(path, options = {}) {
  const { allowed, reason } = checkBudget()
  if (!allowed) throw new BudgetError(reason)

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'x-api-key': API_KEY,
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`WeatherAI ${path}: ${res.status} — ${text.slice(0, 120)}`)
  }
  consumeApiCall()
  return res.json()
}

// ── Normalise helpers (handle varied field names from real API) ─────────
export function normaliseCurrentWeather(raw) {
  if (!raw) return null
  return {
    temperature: raw.temperature   ?? raw.temp       ?? raw.temp_c   ?? raw.current?.temp_c ?? 20,
    condition:   raw.condition     ?? raw.description ?? raw.weather  ?? raw.current?.condition?.text ?? 'Clear',
    humidity:    raw.humidity      ?? raw.humidity_pct ?? raw.current?.humidity ?? 60,
    wind_speed:  raw.wind_speed    ?? raw.wind_kph   ?? raw.current?.wind_kph  ?? 10,
    uv_index:    raw.uv_index      ?? raw.uv         ?? raw.current?.uv        ?? 3,
    feels_like:  raw.feels_like    ?? raw.feelslike_c ?? raw.current?.feelslike_c ?? raw.temperature ?? 20,
  }
}

export function normaliseDailyForecast(raw) {
  const arr = raw?.forecast ?? raw?.daily ?? raw?.data ?? (Array.isArray(raw) ? raw : [])
  return arr.map((d, i) => ({
    day:              d.day   ?? d.date_epoch ? new Date(d.date_epoch * 1000).toLocaleDateString('en-KE',{weekday:'short'}) : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i % 7],
    date:             d.date  ?? new Date(Date.now() + i * 86400000).toLocaleDateString('en-KE',{month:'short',day:'numeric'}),
    high:             d.high  ?? d.maxtemp_c ?? d.max_temp ?? d.temp_max ?? 25,
    low:              d.low   ?? d.mintemp_c ?? d.min_temp ?? d.temp_min ?? 14,
    rain_probability: d.rain_probability ?? d.daily_chance_of_rain ?? d.pop ?? d.precipitation_probability ?? Math.round(Math.random() * 60),
    condition:        d.condition ?? d.description ?? d.day?.condition?.text ?? 'Clear',
  }))
}

export function normaliseHourlyForecast(raw) {
  const arr = raw?.hourly ?? raw?.forecast ?? raw?.data ?? (Array.isArray(raw) ? raw : [])
  return arr.slice(0, 24).map((h, i) => ({
    hour:             h.hour  ?? h.time ?? `${String(i).padStart(2,'0')}:00`,
    temperature:      +(h.temperature ?? h.temp_c ?? h.temp ?? 18).toFixed(1),
    rain_probability: h.rain_probability ?? h.chance_of_rain ?? h.pop ?? 0,
    condition:        h.condition ?? h.description ?? 'Clear',
  }))
}

export function normaliseInsights(raw) {
  const arr = raw?.insights ?? raw?.alerts ?? raw?.data ?? (Array.isArray(raw) ? raw : [])
  return arr.map((a, i) => ({
    id:        a.id        ?? i + 1,
    severity:  a.severity  ?? a.level ?? 'medium',
    icon:      a.icon      ?? { high:'🚨', medium:'⚠️', low:'ℹ️' }[a.severity ?? 'medium'],
    title:     a.title     ?? a.name ?? a.summary ?? 'Advisory',
    body:      a.body      ?? a.description ?? a.message ?? a.detail ?? '',
    timestamp: a.timestamp ?? a.created_at ?? new Date().toISOString(),
  }))
}

export function normaliseUsage(raw) {
  return {
    used:  raw?.used  ?? raw?.apiCallsUsed  ?? raw?.calls_used  ?? 0,
    limit: raw?.limit ?? raw?.apiCallsLimit ?? raw?.calls_limit ?? 100,
  }
}

// ── Public API functions ───────────────────────────────────────────────
export async function getCurrentWeather(lat, lng) {
  const raw = await call(`/v1/current?lat=${lat}&lng=${lng}`)
  return normaliseCurrentWeather(raw)
}

export async function getWeatherGeo(lat, lng) {
  const raw = await call(`/v1/weather-geo?lat=${lat}&lng=${lng}`)
  return normaliseCurrentWeather(raw)
}

export async function getDailyForecast(lat, lng) {
  const raw = await call(`/v1/daily?lat=${lat}&lng=${lng}`)
  return normaliseDailyForecast(raw)
}

export async function getHourlyForecast(lat, lng) {
  const raw = await call(`/v1/hourly?lat=${lat}&lng=${lng}`)
  return normaliseHourlyForecast(raw)
}

export async function analyzeTree(formData) {
  const { allowed, reason } = checkBudget()
  if (!allowed) throw new BudgetError(reason)
  const res = await fetch(`${BASE}/v1/trees/analyze`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}`, 'x-api-key': API_KEY },
    body: formData,
  })
  if (!res.ok) throw new Error(`/v1/trees/analyze: ${res.status}`)
  consumeApiCall()
  return res.json()
}

export async function getTreeHistory() {
  const raw = await call('/v1/trees/history')
  const arr = raw?.analyses ?? raw?.history ?? raw?.data ?? (Array.isArray(raw) ? raw : [])
  return arr.map((h, i) => ({
    id:          h.id          ?? i + 1,
    analyzed_at: h.analyzed_at ?? h.created_at ?? new Date().toISOString(),
    tree_count:  h.tree_count  ?? h.trees      ?? 0,
    canopy: {
      healthy:           h.canopy?.healthy            ?? h.healthy_pct           ?? 70,
      needs_care:        h.canopy?.needs_care         ?? h.needs_care_pct        ?? 20,
      needs_replacement: h.canopy?.needs_replacement  ?? h.needs_replacement_pct ?? 10,
    },
    thumbnail: h.thumbnail ?? h.image_url ?? h.url ?? '',
    overlay_url: h.overlay_url ?? h.annotated_url ?? h.thumbnail ?? '',
  }))
}

export async function getInsights(lat, lng, crop) {
  const raw = await call(`/v1/insights?lat=${lat}&lng=${lng}&crop=${encodeURIComponent(crop)}`)
  return normaliseInsights(raw)
}

export async function getUsage() {
  const raw = await call('/v1/usage')
  return normaliseUsage(raw)
}

// ── Mock data (used when VITE_WEATHERAI_KEY not set OR as fallback) ────
export function mockCurrentWeather() {
  const conditions = ['Sunny','Partly Cloudy','Light Rain','Overcast','Foggy']
  return {
    temperature: +(14 + Math.random() * 18).toFixed(1),
    condition:   conditions[Math.floor(Math.random() * conditions.length)],
    humidity:    Math.round(50 + Math.random() * 35),
    wind_speed:  +(5  + Math.random() * 20).toFixed(1),
    uv_index:    Math.round(1 + Math.random() * 10),
    feels_like:  +(12 + Math.random() * 18).toFixed(1),
  }
}

export function mockDailyForecast() {
  const days  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const conds = ['Sunny','Cloudy','Rain','Partly Cloudy','Thunderstorm','Clear','Foggy']
  return days.map((day, i) => ({
    day,
    date: new Date(Date.now() + i * 86400000).toLocaleDateString('en-KE',{month:'short',day:'numeric'}),
    high: Math.round(18 + Math.random() * 12),
    low:  Math.round(8  + Math.random() * 8),
    rain_probability: Math.round(Math.random() * 100),
    condition: conds[Math.floor(Math.random() * conds.length)],
  }))
}

export function mockHourlyForecast() {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2,'0')}:00`,
    temperature:      +(13 + Math.random() * 15).toFixed(1),
    rain_probability: Math.round(Math.random() * 80),
    condition: ['Clear','Cloudy','Light Rain','Sunny'][Math.floor(Math.random() * 4)],
  }))
}

export function mockInsights(farmName, crop) {
  return [
    { id:1, severity:'high',   icon:'❄️', title:'Frost risk in 36hrs',   body:`Overnight temps dropping to 4°C on ${farmName}. ${crop} crops vulnerable — cover or activate frost protection.`, timestamp: new Date(Date.now()-3600000).toISOString() },
    { id:2, severity:'medium', icon:'💧', title:'Rain expected Thursday', body:`60% chance of 15mm rainfall Thursday 3pm on ${farmName}. Delay fertiliser application by 48hrs.`,               timestamp: new Date(Date.now()-7200000).toISOString() },
    { id:3, severity:'high',   icon:'🌡️', title:'Heat stress risk',      body:`Temperatures may exceed 35°C this weekend. ${crop} crops face moisture stress — consider irrigation.`,           timestamp: new Date(Date.now()-10800000).toISOString() },
    { id:4, severity:'low',    icon:'🌬️', title:'Wind advisory Friday',  body:`Winds 25–35 km/h forecast Friday. ${crop} may need staking — check young plants on ${farmName}.`,               timestamp: new Date(Date.now()-14400000).toISOString() },
    { id:5, severity:'medium', icon:'☁️', title:'Low UV this week',      body:`Extended cloud cover reduces photosynthesis. Monitor ${crop} growth rates closely.`,                             timestamp: new Date(Date.now()-18000000).toISOString() },
  ]
}

export function mockTreeAnalysis() {
  return {
    tree_count:  Math.round(80 + Math.random() * 120),
    canopy: { healthy: Math.round(55 + Math.random() * 20), needs_care: Math.round(15 + Math.random() * 15), needs_replacement: Math.round(5 + Math.random() * 10) },
    overlay_url: 'https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg',
    analyzed_at: new Date().toISOString(),
  }
}

export function mockTreeHistory() {
  return [
    { id:1, analyzed_at:'2025-05-28T09:00:00Z', tree_count:143, canopy:{ healthy:72, needs_care:20, needs_replacement:8 },  thumbnail:'https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg', overlay_url:'https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg' },
    { id:2, analyzed_at:'2025-04-15T11:30:00Z', tree_count:138, canopy:{ healthy:68, needs_care:24, needs_replacement:8 },  thumbnail:'https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg', overlay_url:'https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg' },
  ]
}
