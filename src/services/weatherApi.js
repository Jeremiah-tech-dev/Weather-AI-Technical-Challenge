import { checkBudget, consumeApiCall } from '../store/farmStore'

const BASE    = 'https://api.weather-ai.co'
const API_KEY = import.meta.env.VITE_WEATHERAI_KEY

export class BudgetError extends Error {
  constructor(msg) { super(msg); this.isBudget = true }
}

export class NetworkError extends Error {
  constructor(msg) { super(msg); this.isNetwork = true }
}

export class PlanError extends Error {
  constructor(msg) { super(msg); this.isPlan = true }
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
        ...(options.headers || {}),
      },
    })
  } catch {
    throw new NetworkError('Network error — check your connection and try again.')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    if (res.status === 403 && body?.error) throw new PlanError(body.error)
    const text = body ? JSON.stringify(body) : res.statusText
    throw new NetworkError(`Network error — ${res.status}: ${text.slice(0, 100)}`)
  }

  consumeApiCall()
  return res.json()
}

// ── Normalise helpers ──────────────────────────────────────────────────
export function normaliseCurrentWeather(raw) {
  const c = raw?.current ?? raw
  return {
    temperature: c.temperature  ?? c.temp      ?? c.temp_c    ?? null,
    condition:   c.condition    ?? c.condition_code ?? c.description ?? c.weather ?? '',
    humidity:    c.humidity     ?? raw?.hourly?.[0]?.humidity  ?? null,
    wind_speed:  c.wind_speed   ?? c.wind_kph  ?? null,
    uv_index:    c.uv_index     ?? raw?.hourly?.[0]?.uv_index  ?? null,
    feels_like:  c.feels_like   ?? raw?.hourly?.[0]?.feels_like ?? null,
  }
}

export function normaliseDailyForecast(raw) {
  const arr = raw?.daily ?? raw?.forecast ?? raw?.data ?? (Array.isArray(raw) ? raw : [])
  return arr.map((d, i) => ({
    day:              d.day   ?? new Date(d.date ?? Date.now() + i * 86400000).toLocaleDateString('en-KE', { weekday: 'short' }),
    date:             d.date  ?? new Date(Date.now() + i * 86400000).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }),
    high:             d.high  ?? d.temp_max  ?? d.maxtemp_c ?? null,
    low:              d.low   ?? d.temp_min  ?? d.mintemp_c ?? null,
    rain_probability: d.rain_probability ?? d.precipitation_probability ?? d.daily_chance_of_rain ?? d.pop ?? null,
    condition:        d.condition ?? d.condition_code ?? d.description ?? '',
  }))
}

export function normaliseHourlyForecast(raw) {
  const arr = raw?.hourly ?? raw?.forecast ?? raw?.data ?? (Array.isArray(raw) ? raw : [])
  return arr.slice(0, 24).map((h, i) => ({
    hour:             h.hour ?? h.time ?? `${String(i).padStart(2, '0')}:00`,
    temperature:      h.temperature ?? h.temp_c ?? h.temp ?? null,
    rain_probability: h.rain_probability ?? h.precipitation_probability ?? h.chance_of_rain ?? h.pop ?? null,
    condition:        h.condition ?? h.condition_code ?? h.description ?? '',
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
    used:  raw?.period?.requestCount ?? raw?.used  ?? raw?.apiCallsUsed  ?? raw?.calls_used  ?? 0,
    limit: raw?.limits?.requests     ?? raw?.limit ?? raw?.apiCallsLimit ?? raw?.calls_limit ?? 1000,
    remaining: raw?.remaining?.requests ?? null,
  }
}

// ── Public API ─────────────────────────────────────────────────────────
export async function getCurrentWeather(lat, lng) {
  const raw = await call(`/v1/current?lat=${lat}&lon=${lng}`)
  return normaliseCurrentWeather(raw)
}

export async function getWeatherGeo(lat, lng) {
  const raw = await call(`/v1/weather-geo?lat=${lat}&lon=${lng}`)
  return normaliseCurrentWeather(raw)
}

export async function getDailyForecast(lat, lng) {
  const raw = await call(`/v1/daily?lat=${lat}&lon=${lng}`)
  return normaliseDailyForecast(raw)
}

export async function getHourlyForecast(lat, lng) {
  const raw = await call(`/v1/hourly?lat=${lat}&lon=${lng}`)
  return normaliseHourlyForecast(raw)
}

export async function analyzeTree(formData) {
  const { allowed, reason } = checkBudget()
  if (!allowed) throw new BudgetError(reason)
  let res
  try {
    res = await fetch(`${BASE}/v1/trees/analyze`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      body: formData,
    })
  } catch {
    throw new NetworkError('Network error — check your connection and try again.')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    if (res.status === 403 && body?.error) throw new PlanError(body.error)
    throw new NetworkError(`Network error — ${res.status}: ${res.statusText}`)
  }
  consumeApiCall()
  const r = await res.json()
  return {
    analysis_id:      r.analysis_id      ?? null,
    tree_count:       r.total_tree_count ?? r.tree_count ?? 0,
    density_per_acre: r.tree_density_per_acre ?? null,
    confidence:       r.confidence_score ?? null,
    canopy_coverage:  r.canopy_coverage_pct ?? null,
    species_guess:    r.tree_species_guess ?? null,
    overlay_url:      r.overlay_image_url  ?? r.overlay_url ?? r.annotated_url ?? null,
    original_url:     r.original_image_url ?? null,
    canopy: {
      healthy:           r.tree_health?.healthy           ?? r.canopy?.healthy           ?? null,
      needs_care:        r.tree_health?.needs_care        ?? r.canopy?.needs_care        ?? null,
      needs_replacement: r.tree_health?.needs_replacement ?? r.canopy?.needs_replacement ?? null,
    },
    observations:    r.observations    ?? [],
    recommendations: r.recommendations ?? [],
    analyzed_at:     r.timestamp ?? r.analyzed_at ?? new Date().toISOString(),
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
  const raw = await call(`/v1/insights?lat=${lat}&lon=${lng}&crop=${encodeURIComponent(crop)}`)
  return normaliseInsights(raw)
}

export async function getUsage() {
  const raw = await call('/v1/usage')
  return normaliseUsage(raw)
}
