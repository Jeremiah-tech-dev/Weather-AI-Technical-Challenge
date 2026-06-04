import { checkBudget, consumeApiCall } from '../store/farmStore'

const BASE    = 'https://api.weatherai.co'
const API_KEY = import.meta.env.VITE_WEATHERAI_KEY

export class BudgetError extends Error {
  constructor(msg) { super(msg); this.isBudget = true }
}

export class NetworkError extends Error {
  constructor(msg) { super(msg); this.isNetwork = true }
}

async function call(path, options = {}) {
  const { allowed, reason } = checkBudget()
  if (!allowed) throw new BudgetError(reason)

  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'x-api-key': API_KEY,
        ...(options.headers || {}),
      },
    })
  } catch {
    throw new NetworkError('Network error — check your connection and try again.')
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new NetworkError(`Network error — ${res.status}: ${text.slice(0, 100) || res.statusText}`)
  }

  consumeApiCall()
  return res.json()
}

// ── Normalise helpers ──────────────────────────────────────────────────
export function normaliseCurrentWeather(raw) {
  return {
    temperature: raw.temperature  ?? raw.temp      ?? raw.temp_c          ?? raw.current?.temp_c       ?? null,
    condition:   raw.condition    ?? raw.description ?? raw.weather        ?? raw.current?.condition?.text ?? '',
    humidity:    raw.humidity     ?? raw.humidity_pct ?? raw.current?.humidity ?? null,
    wind_speed:  raw.wind_speed   ?? raw.wind_kph  ?? raw.current?.wind_kph   ?? null,
    uv_index:    raw.uv_index     ?? raw.uv        ?? raw.current?.uv          ?? null,
    feels_like:  raw.feels_like   ?? raw.feelslike_c ?? raw.current?.feelslike_c ?? null,
  }
}

export function normaliseDailyForecast(raw) {
  const arr = raw?.forecast ?? raw?.daily ?? raw?.data ?? (Array.isArray(raw) ? raw : [])
  return arr.map((d, i) => ({
    day:              d.day   ?? new Date(Date.now() + i * 86400000).toLocaleDateString('en-KE', { weekday: 'short' }),
    date:             d.date  ?? new Date(Date.now() + i * 86400000).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }),
    high:             d.high  ?? d.maxtemp_c ?? d.max_temp ?? d.temp_max ?? null,
    low:              d.low   ?? d.mintemp_c ?? d.min_temp ?? d.temp_min ?? null,
    rain_probability: d.rain_probability ?? d.daily_chance_of_rain ?? d.pop ?? d.precipitation_probability ?? null,
    condition:        d.condition ?? d.description ?? d.day?.condition?.text ?? '',
  }))
}

export function normaliseHourlyForecast(raw) {
  const arr = raw?.hourly ?? raw?.forecast ?? raw?.data ?? (Array.isArray(raw) ? raw : [])
  return arr.slice(0, 24).map((h, i) => ({
    hour:             h.hour ?? h.time ?? `${String(i).padStart(2, '0')}:00`,
    temperature:      h.temperature ?? h.temp_c ?? h.temp ?? null,
    rain_probability: h.rain_probability ?? h.chance_of_rain ?? h.pop ?? null,
    condition:        h.condition ?? h.description ?? '',
  }))
}

export function normaliseInsights(raw) {
  const arr = raw?.insights ?? raw?.alerts ?? raw?.data ?? (Array.isArray(raw) ? raw : [])
  return arr.map((a, i) => ({
    id:        a.id        ?? i + 1,
    severity:  a.severity  ?? a.level ?? 'medium',
    icon:      a.icon      ?? { high: '🚨', medium: '⚠️', low: 'ℹ️' }[a.severity ?? 'medium'],
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

// ── Public API ─────────────────────────────────────────────────────────
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
  let res
  try {
    res = await fetch(`${BASE}/v1/trees/analyze`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'x-api-key': API_KEY },
      body: formData,
    })
  } catch {
    throw new NetworkError('Network error — check your connection and try again.')
  }
  if (!res.ok) throw new NetworkError(`Network error — ${res.status}: ${res.statusText}`)
  consumeApiCall()
  const raw = await res.json()
  return {
    tree_count:  raw.tree_count  ?? raw.trees ?? 0,
    overlay_url: raw.overlay_url ?? raw.annotated_url ?? raw.image_url ?? null,
    canopy: {
      healthy:           raw.canopy?.healthy            ?? raw.healthy_pct            ?? null,
      needs_care:        raw.canopy?.needs_care         ?? raw.needs_care_pct         ?? null,
      needs_replacement: raw.canopy?.needs_replacement  ?? raw.needs_replacement_pct  ?? null,
    },
    analyzed_at: raw.analyzed_at ?? raw.created_at ?? new Date().toISOString(),
  }
}

export async function getTreeHistory() {
  const raw = await call('/v1/trees/history')
  const arr = raw?.analyses ?? raw?.history ?? raw?.data ?? (Array.isArray(raw) ? raw : [])
  return arr.map((h, i) => ({
    id:          h.id          ?? i + 1,
    analyzed_at: h.analyzed_at ?? h.created_at ?? new Date().toISOString(),
    tree_count:  h.tree_count  ?? h.trees ?? 0,
    canopy: {
      healthy:           h.canopy?.healthy           ?? h.healthy_pct            ?? null,
      needs_care:        h.canopy?.needs_care        ?? h.needs_care_pct         ?? null,
      needs_replacement: h.canopy?.needs_replacement ?? h.needs_replacement_pct  ?? null,
    },
    thumbnail:   h.thumbnail   ?? h.image_url ?? h.url ?? null,
    overlay_url: h.overlay_url ?? h.annotated_url ?? h.thumbnail ?? null,
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
