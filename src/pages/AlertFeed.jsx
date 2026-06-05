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
  { min: 100, color: '#ef4444', label: '🔴 Exhausted', text: 'text-red-300',     msg: 'AI quota exhausted — upgrade to restore alerts.' },
  { min: 75,  color: '#ef4444', label: '🔴 Critical',  text: 'text-red-300',     msg: 'Only a few AI calls left this month.' },
  { min: 50,  color: '#f59e0b', label: '🟡 Half used', text: 'text-amber-300',   msg: 'Halfway through your monthly AI quota.' },
  { min: 25,  color: '#f59e0b', label: '🟡 Moderate',  text: 'text-amber-300',   msg: 'AI quota in use — monitor your usage.' },
  { min: 0,   color: '#a8d66b', label: '🟢 Healthy',   text: 'text-emerald-300', msg: null },
]
function getStage(pct) { return QUOTA_STAGES.find(s => pct >= s.min) }

function DonutChart({ pct, color, used, limit }) {
  const r = 54, cx = 64, cy = 64
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="14"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 6px ${color})` }} />
      <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="20" fontWeight="900">{pct}%</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">{used} / {limit}</text>
      <text x={cx} y={cy + 22} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8">AI calls</text>
    </svg>
  )
}

function QuotaModal({ used, limit, onClose }) {
  const pct   = Math.min(Math.round((used / limit) * 100), 100)
  const stage = getStage(pct)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative rounded-3xl p-8 w-full max-w-sm mx-4 text-center"
        style={{ background: 'linear-gradient(145deg,#0d2318,#071510)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', animation: 'fadeSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white text-xl">✕</button>
        <p className="text-[#a8d66b] text-xs font-black tracking-widest uppercase mb-1">Weather-AI</p>
        <p className="text-white font-extrabold text-lg mb-6">Monthly AI Quota</p>
        <div className="flex justify-center mb-6">
          <DonutChart pct={pct} color={stage.color} used={used} limit={limit} />
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[['Used', used, stage.color], ['Remaining', limit - used, '#a8d66b'], ['Limit', limit, 'rgba(255,255,255,0.4)']].map(([lbl, val, clr]) => (
            <div key={lbl} className="bg-white/5 rounded-2xl py-3 px-2">
              <p className="text-white font-black text-lg" style={{ color: clr }}>{val}</p>
              <p className="text-white/40 text-[10px] mt-0.5">{lbl}</p>
            </div>
          ))}
        </div>
        <div className="bg-white/5 rounded-2xl px-4 py-2.5 mb-5 flex items-center justify-center gap-2">
          <span className="text-sm">{stage.label.split(' ')[0]}</span>
          <span className={`text-xs font-bold ${stage.text}`}>{stage.label.split(' ').slice(1).join(' ')}</span>
        </div>
        {stage.msg ? (
          <div className="space-y-3">
            <p className="text-white/50 text-xs">{stage.msg}</p>
            <a href="https://weather-ai.co" target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-1.5 font-bold text-sm py-2.5 rounded-xl transition-all hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg,#a8d66b,#96c45a)', color: '#1a3c2e' }}>
              ⚡ Upgrade Plan ↗
            </a>
          </div>
        ) : (
          <p className="text-white/30 text-xs">Resets monthly · Powered by Weather-AI</p>
        )}
      </div>
    </div>
  )
}

function ApiUsageSidebar({ onOpen }) {
  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">🤖 AI Quota</p>
        <p className="text-white/40 text-xs mb-4 leading-relaxed">Check your monthly Weather-AI call usage and remaining quota.</p>
        <button onClick={onOpen}
          className="w-full flex items-center justify-center gap-2 font-black text-sm py-3 rounded-xl transition-all hover:shadow-xl hover:shadow-[#a8d66b]/20 hover:-translate-y-0.5 active:scale-95"
          style={{ background: 'linear-gradient(135deg,#a8d66b,#96c45a)', color: '#1a3c2e', boxShadow: '0 4px 16px rgba(168,214,107,0.25)' }}>
          📊 View Quota Usage
        </button>
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
  const [showQuota, setShowQuota] = useState(false)
  const [filter,    setFilter]    = useState('all')
  const [planError, setPlanError] = useState(false)

  async function loadQuota() {
    try {
      const u = await getUsage()
      setApiUsed(u.aiUsed)
      setApiLimit(u.aiLimit)
    } catch { /* silent */ }
  }

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
        await loadQuota()
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
            <ApiUsageSidebar onOpen={() => { loadQuota(); setShowQuota(true) }} />
          </div>
        </div>
      </main>
      {showQuota && <QuotaModal used={apiUsed} limit={apiLimit} onClose={() => setShowQuota(false)} />}
    </div>
  )
}
