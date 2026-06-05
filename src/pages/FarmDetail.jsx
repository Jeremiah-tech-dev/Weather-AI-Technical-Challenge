import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { getDailyForecast, getHourlyForecast, BudgetError, NetworkError } from '../services/weatherApi'

const CONDITION_ICON = { 'Sunny': '☀️', 'Partly Cloudy': '⛅', 'Rain': '🌧️', 'Clear': '🌙', 'Cloudy': '☁️', 'Light Rain': '🌦️', 'Thunderstorm': '⛈️', 'Foggy': '🌫️' }

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0d2318] border border-white/20 rounded-xl px-3 py-2 text-xs shadow-2xl">
      <p className="text-white/60 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-bold">{p.name}: {p.value}{p.name.includes('Temp') ? '°' : '%'}</p>
      ))}
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
      <span className="text-5xl">📡</span>
      <p className="text-white font-bold text-lg">Could not load forecast</p>
      <p className="text-white/40 text-sm max-w-xs">{message}</p>
      <button onClick={onRetry}
        className="mt-2 bg-[#a8d66b] hover:bg-[#96c45a] text-[#1a3c2e] font-bold px-6 py-2.5 rounded-xl text-sm transition-all active:scale-95">
        Retry
      </button>
    </div>
  )
}

export default function FarmDetail({ farm, onBack, onBudgetError }) {
  const [daily,          setDaily]         = useState(null)
  const [hourly,         setHourly]        = useState(null)
  const [loading,        setLoading]       = useState(true)
  const [error,          setError]         = useState(null)
  const [activeHourTab,  setActiveHourTab] = useState('temp')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [d, h] = await Promise.all([
        getDailyForecast(farm.lat, farm.lng)
          .catch(() => getDailyForecast(farm.lat, farm.lng)),
        getHourlyForecast(farm.lat, farm.lng)
          .catch(() => getHourlyForecast(farm.lat, farm.lng)),
      ])
      setDaily(d)
      setHourly(h)
    } catch (e) {
      if (e instanceof BudgetError) { onBudgetError(e.message); return }
      setError(e instanceof NetworkError ? e.message : 'Network error — check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [farm.id]) // eslint-disable-line

  const hourlyDisplay = hourly?.filter((_, i) => i % 2 === 0)

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(160deg, #071510 0%, #0d2318 40%, #071510 100%)' }}>
      <div className="sticky top-0 z-40 border-b border-white/8" style={{ background: 'rgba(7,21,16,0.9)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">← Back</button>
          <div className="h-4 w-px bg-white/20" />
          <div>
            <p className="font-extrabold text-white">{farm.name}</p>
            <p className="text-white/40 text-xs">{farm.region} · {farm.crop}</p>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <svg className="w-8 h-8 animate-spin text-[#a8d66b]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <p className="text-white/40 text-sm">Fetching forecast data…</p>
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <>
            {/* 7-Day Forecast */}
            <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[#a8d66b] text-xs font-bold tracking-widest uppercase mb-0.5">7-Day Forecast</p>
                  <p className="text-white font-extrabold text-lg">Rain probability & temperature</p>
                </div>
                <span className="text-2xl">📅</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={daily} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="rain" orientation="right" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                  <YAxis yAxisId="temp" orientation="left"  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} unit="°" />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar yAxisId="rain" dataKey="rain_probability" name="Rain %"    fill="#5b5ea6" radius={[4,4,0,0]} opacity={0.85} />
                  <Bar yAxisId="temp" dataKey="high"             name="High Temp" fill="#a8d66b" radius={[4,4,0,0]} opacity={0.9} />
                  <Bar yAxisId="temp" dataKey="low"              name="Low Temp"  fill="#1a3c2e" radius={[4,4,0,0]} opacity={0.9} />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-7 gap-2 mt-4">
                {daily?.map(d => (
                  <div key={d.day} className="flex flex-col items-center gap-1 bg-white/5 rounded-xl p-2">
                    <p className="text-white/50 text-[10px] font-semibold">{d.day}</p>
                    <span className="text-lg">{CONDITION_ICON[d.condition] || '🌡️'}</span>
                    <p className="text-white text-xs font-bold">{d.high}°</p>
                    <p className="text-white/30 text-[10px]">{d.low}°</p>
                    <p className="text-blue-300 text-[10px]">{d.rain_probability}%</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Hourly Breakdown */}
            <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[#a8d66b] text-xs font-bold tracking-widest uppercase mb-0.5">Hourly Breakdown</p>
                  <p className="text-white font-extrabold text-lg">Today's hour-by-hour</p>
                </div>
                <div className="flex gap-2">
                  {['temp', 'rain'].map(t => (
                    <button key={t} onClick={() => setActiveHourTab(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeHourTab === t ? 'bg-[#a8d66b] text-[#1a3c2e]' : 'bg-white/10 text-white/50 hover:text-white'}`}>
                      {t === 'temp' ? '🌡️ Temp' : '💧 Rain'}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={hourlyDisplay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="hour" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false}
                    unit={activeHourTab === 'temp' ? '°' : '%'} />
                  <Tooltip content={<CustomTooltip />} />
                  {activeHourTab === 'temp'
                    ? <Line type="monotone" dataKey="temperature"      name="Temp"   stroke="#a8d66b" strokeWidth={2} dot={false} />
                    : <Line type="monotone" dataKey="rain_probability" name="Rain %" stroke="#5b8dd9" strokeWidth={2} dot={false} />
                  }
                </LineChart>
              </ResponsiveContainer>
              {hourly && (() => {
                const rainHour = hourly.find(h => (h.rain_probability ?? 0) > 50)
                return rainHour ? (
                  <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="text-2xl">🌧️</span>
                    <div>
                      <p className="text-blue-200 text-sm font-bold">Rain likely at {rainHour.hour}</p>
                      <p className="text-blue-300/60 text-xs">{rainHour.rain_probability}% probability — plan field work accordingly</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <p className="text-emerald-200 text-sm font-bold">No significant rain expected today</p>
                  </div>
                )
              })()}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
