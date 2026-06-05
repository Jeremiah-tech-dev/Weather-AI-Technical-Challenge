import { useEffect, useState } from 'react'
import { getInsights, getUsage, BudgetError, NetworkError, PlanError } from '../services/weatherApi'

const SEVERITY_STYLE = {
  high:   { bg: 'bg-red-500/10',   border: 'border-red-500/25',   badge: 'bg-red-500/20 text-red-300' },
  medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/25', badge: 'bg-amber-500/20 text-amber-300' },
  low:    { bg: 'bg-blue-500/10',  border: 'border-blue-500/25',  badge: 'bg-blue-500/20 text-blue-300' },
}


function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const QUOTA_STAGES = [
  { min: 100, color: '#ef4444', glow: '#ef444480', label: '🔴 Exhausted',   bg: 'bg-red-500/10',     border: 'border-red-500/20',     text: 'text-red-300',     msg: 'AI quota exhausted — upgrade to restore alerts.' },
  { min: 75,  color: '#ef4444', glow: '#ef444480', label: '🔴 Critical',    bg: 'bg-red-500/10',     border: 'border-red-500/20',     text: 'text-red-300',     msg: 'Only a few AI calls left this month.' },
  { min: 50,  color: '#f59e0b', glow: '#f59e0b80', label: '🟡 Half used',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-300',   msg: 'Halfway through your monthly AI quota.' },
  { min: 25,  color: '#f59e0b', glow: '#f59e0b80', label: '🟡 Moderate',    bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-300',   msg: 'AI quota in use — monitor your usage.' },
  { min: 0,   color: '#a8d66b', glow: '#a8d66b80', label: '🟢 Healthy',     bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-300', msg: null },
]
function getStage(pct) { return QUOTA_STAGES.find(s => pct >= s.min) }

function ApiUsageSidebar({ used, limit }) {
  const pct   = Math.min(Math.round((used / limit) * 100), 100)
  const stage = getStage(pct)
  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">🤖 AI Quota</p>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${stage.bg} ${stage.border} ${stage.text}`}>
            {stage.label}
          </span>
        </div>
        <div className="flex items-end gap-1 mb-1">
          <p className="text-white text-2xl font-black leading-none">{used}</p>
          <p className="text-white/30 text-sm mb-0.5">/ {limit} AI calls</p>
        </div>
        <p className="text-white/40 text-xs mb-3">used this month</p>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: stage.color, boxShadow: `0 0 10px ${stage.glow}` }} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-white/40 text-[10px]">{limit - used} remaining</span>
          <span className={`text-[10px] font-bold ${stage.text}`}>{pct}%</span>
        </div>
        {stage.msg && (
          <div className={`mt-3 ${stage.bg} border ${stage.border} rounded-xl px-3 py-2 space-y-2`}>
            <p className={`${stage.text} text-[11px] font-semibold`}>⚠️ {stage.msg}</p>
            <a href="https://weather-ai.co" target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-1 bg-[#a8d66b] hover:bg-[#96c45a] text-[#1a3c2e] font-bold text-[11px] py-1.5 rounded-lg transition-colors">
              ⚡ Upgrade Plan ↗
            </a>
          </div>
        )}
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Alert Legend</p>
        {[['high','🚨','Immediate action needed'],['medium','⚠️','Monitor closely'],['low','ℹ️','For your awareness']].map(([sev, icon, desc]) => {
          const s = SEVERITY_STYLE[sev]
          return (
            <div key={sev} className="flex items-center gap-2 mb-2.5 last:mb-0">
              <span className="text-sm">{icon}</span>
              <div>
                <p className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${s.badge}`}>{sev.toUpperCase()}</p>
                <p className="text-white/30 text-[10px] mt-0.5">{desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AlertFeed({ farms, onBack, onBudgetError }) {
  const [alerts,    setAlerts]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [apiUsed,   setApiUsed]   = useState(0)
  const [apiLimit,  setApiLimit]  = useState(200)
  const [filter,    setFilter]    = useState('all')
  const [planError, setPlanError] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    setPlanError(false)
    try {
      let all = []
      for (const farm of farms) {
        const data = await getInsights(farm.lat, farm.lng, farm.crop)
          .catch(() => getInsights(farm.lat, farm.lng, farm.crop))
        data.forEach(a => all.push({ ...a, farmName: farm.name }))
      }
      try {
        const usage = await getUsage()
        setApiUsed(usage.aiUsed)
        setApiLimit(usage.aiLimit)
      } catch {
        // usage fetch failed silently
      }
      const order = { high: 0, medium: 1, low: 2 }
      all.sort((a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3))
      setAlerts(all)
    } catch (e) {
      if (e instanceof BudgetError) { onBudgetError(e.message); return }
      if (e instanceof PlanError)   { setPlanError(true); return }
      setError(e instanceof NetworkError ? e.message : 'Network error — check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter)

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(160deg, #071510 0%, #0d2318 40%, #071510 100%)' }}>
      <div className="sticky top-0 z-40 border-b border-white/8" style={{ background: 'rgba(7,21,16,0.9)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">← Back</button>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex-1">
            <p className="font-extrabold text-white">Alert Feed</p>
            <p className="text-white/40 text-xs">AI-generated agronomic risk flags across all your farms</p>
          </div>
          {!loading && !error && (
            <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold px-3 py-1 rounded-full">
              {alerts.filter(a => a.severity === 'high').length} critical
            </span>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>
          <div className="flex-1 min-w-0">
            <div className="flex gap-2 mb-5">
              {['all','high','medium','low'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    filter === f ? 'bg-[#a8d66b] text-[#1a3c2e]' : 'bg-white/8 text-white/50 hover:text-white hover:bg-white/12'
                  }`}>
                  {f === 'all' ? `All (${alerts.length})` : f}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <svg className="w-7 h-7 animate-spin text-[#a8d66b]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <p className="text-white/40 text-sm">Fetching AI risk assessments…</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
                <span className="text-5xl">📡</span>
                <p className="text-white font-bold text-lg">Could not load alerts</p>
                <p className="text-white/40 text-sm max-w-xs">{error}</p>
                <button onClick={load}
                  className="mt-2 bg-[#a8d66b] hover:bg-[#96c45a] text-[#1a3c2e] font-bold px-6 py-2.5 rounded-xl text-sm transition-all active:scale-95">
                  Retry
                </button>
              </div>
            ) : planError ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-2"
                  style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)' }}>
                  ⚡
                </div>
                <span className="text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full"
                  style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
                  Free Tier Active
                </span>
                <p className="text-white font-extrabold text-xl mt-1">AI Alerts Unavailable</p>
                <p className="text-white/40 text-sm max-w-xs leading-relaxed">
                  The <span className="text-[#a8d66b] font-semibold">Weather-AI Insights API</span> is not available on the free plan. Upgrade to a paid tier to unlock full agronomic risk alerts across all your farms.
                </p>
                <a href="https://weather-ai.co" target="_blank" rel="noreferrer"
                  className="mt-2 font-bold px-8 py-3 rounded-xl text-sm transition-all hover:shadow-lg active:scale-95"
                  style={{ background: 'linear-gradient(135deg,#a8d66b,#96c45a)', color: '#1a3c2e', boxShadow: '0 4px 20px rgba(168,214,107,0.25)' }}>
                  Upgrade to Paid Plan ↗
                </a>
              </div>
            ) : (
              <>
                {filtered.length === 0 ? (
                  <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl">
                    <div className="text-5xl mb-4">✅</div>
                    <p className="text-white font-bold text-lg">No alerts</p>
                    <p className="text-white/40 text-sm mt-1">All your farms are clear for this category.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filtered.map((alert, i) => {
                      const s = SEVERITY_STYLE[alert.severity] ?? SEVERITY_STYLE.low
                      return (
                        <div key={`${alert.id}-${i}`}
                          className={`border rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${s.bg} ${s.border}`}
                          style={{ animation: `fadeSlideUp 0.4s ease-out ${i * 60}ms both` }}>
                          <div className="flex items-start gap-4">
                            <span className="text-2xl mt-0.5 shrink-0">{alert.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="text-white font-extrabold text-sm">{alert.title}</p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.badge}`}>{alert.severity.toUpperCase()}</span>
                                <span className="text-white/30 text-[10px] bg-white/5 px-2 py-0.5 rounded-full">{alert.farmName}</span>
                              </div>
                              <p className="text-white/60 text-sm leading-relaxed">{alert.body}</p>
                              <p className="text-white/25 text-[10px] mt-2">{timeAgo(alert.timestamp)}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="lg:w-64 shrink-0">
            <ApiUsageSidebar used={apiUsed} limit={apiLimit} />
          </div>
        </div>
      </main>
    </div>
  )
}
