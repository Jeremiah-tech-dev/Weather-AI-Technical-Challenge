import { useEffect, useState } from 'react'
import { getFarms, saveFarm, getCurrentUser, signOut, checkBudget, consumeApiCall } from '../store/farmStore'
import { getCurrentWeather, mockCurrentWeather, isMockMode, BudgetError } from '../services/weatherApi'
import AddFarmModal from '../components/AddFarmModal'

// ── Risk helpers ───────────────────────────────────────────────────────
const RISK = {
  safe:  { label:'Safe',    classes:'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', dot:'bg-emerald-400', glow:'#10b981' },
  watch: { label:'Watch',   classes:'bg-amber-500/20 text-amber-300 border-amber-500/30',      dot:'bg-amber-400',   glow:'#f59e0b' },
  act:   { label:'Act Now', classes:'bg-red-500/20 text-red-300 border-red-500/30',            dot:'bg-red-400',     glow:'#ef4444' },
}
function riskLevel(w) {
  if (!w) return 'safe'
  const t = w.temperature ?? 20
  if (t < 8 || t > 38) return 'act'
  if (t < 12 || t > 32) return 'watch'
  return 'safe'
}
const CONDITION_ICON = { 'Sunny':'☀️','Partly Cloudy':'⛅','Light Rain':'🌦️','Overcast':'☁️','Heavy Rain':'🌧️','Thunderstorm':'⛈️','Foggy':'🌫️','Clear':'🌙' }

function AnimatedNumber({ value, suffix='' }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let n = 0; const inc = value / 30
    const t = setInterval(() => {
      n += inc
      if (n >= value) { setDisplay(value); clearInterval(t) }
      else setDisplay(Math.round(n))
    }, 30)
    return () => clearInterval(t)
  }, [value])
  return <>{display}{suffix}</>
}

function ApiUsageBar({ used, limit }) {
  const pct   = Math.round((used / limit) * 100)
  const color = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#a8d66b'
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">API Usage</p>
        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
      </div>
      <p className="text-white text-sm font-bold mb-2">{used} <span className="text-white/40 font-normal">of {limit} calls used</span></p>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width:`${pct}%`, background:color, boxShadow:`0 0 8px ${color}80` }} />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-white/40 text-[10px]">{limit - used} remaining</span>
        <span className="text-white/40 text-[10px]">Resets monthly</span>
      </div>
    </div>
  )
}

function FarmCard({ farm, index, onClick }) {
  const risk  = riskLevel(farm.weather)
  const badge = RISK[risk]
  const w     = farm.weather
  const icon  = w ? (CONDITION_ICON[w.condition] || '🌡️') : null
  return (
    <div onClick={onClick}
      className="relative group rounded-3xl overflow-hidden cursor-pointer border border-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
      style={{
        background:'linear-gradient(145deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.03) 100%)',
        backdropFilter:'blur(12px)',
        animationDelay:`${index*120}ms`,
        animation:'fadeSlideUp 0.6s ease-out both',
        boxShadow:'0 4px 24px rgba(0,0,0,0.3),0 0 0 1px rgba(255,255,255,0.08)',
      }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
        style={{ background:`radial-gradient(ellipse at top left,${badge.glow}15,transparent 60%)` }} />
      <div className="absolute top-0 left-6 right-6 h-px"
        style={{ background:`linear-gradient(90deg,transparent,${badge.glow}80,transparent)` }} />
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 min-w-0 pr-3">
            <p className="font-extrabold text-white text-base truncate">{farm.name}</p>
            <p className="text-white/40 text-xs mt-0.5 truncate">{farm.region} · {farm.crop}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${badge.classes}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} animate-pulse`} />
            {badge.label}
          </span>
        </div>
        {w ? (
          <div className="flex items-end justify-between">
            <div>
              <p className="text-5xl font-black text-white leading-none">
                <AnimatedNumber value={Math.round(w.temperature)} suffix="°" />
              </p>
              <p className="text-white/50 text-xs mt-1.5">{w.humidity}% humidity</p>
            </div>
            <div className="text-right">
              <span className="text-4xl">{icon}</span>
              <p className="text-white/60 text-xs mt-1">{w.condition}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-white/40 text-xs mt-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Fetching live weather…
          </div>
        )}
        <div className="mt-5 pt-4 border-t border-white/8 flex items-center justify-between">
          <p className="text-white/20 text-[10px]">{farm.lat.toFixed(4)}°, {farm.lng.toFixed(4)}°</p>
          <span className="text-white/30 text-[10px] group-hover:text-[#a8d66b] transition-colors">View details →</span>
        </div>
      </div>
    </div>
  )
}

function BudgetBanner({ reason, onDismiss }) {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-950 border border-red-500/40 rounded-2xl px-5 py-3.5 shadow-2xl"
      style={{ animation:'dropDown 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
      <span className="text-red-400 text-lg">⛔</span>
      <p className="text-red-200 text-sm font-semibold">{reason}</p>
      <button onClick={onDismiss} className="text-red-400/60 hover:text-red-300 ml-2 text-lg">✕</button>
    </div>
  )
}

function StatChip({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-white font-bold text-sm">{value}</p>
        <p className="text-white/40 text-[10px]">{label}</p>
      </div>
    </div>
  )
}

export default function Dashboard({ onLogout, onNavigate }) {
  const user  = getCurrentUser()
  const [farms,         setFarms]         = useState(getFarms)
  const [showModal,     setShowModal]     = useState(false)
  const [budgetWarning, setBudgetWarning] = useState(null)
  const [apiUsed,       setApiUsed]       = useState(user?.apiCallsUsed ?? 0)
  const apiLimit = user?.apiCallsLimit ?? 100

  async function fetchWeather(farm) {
    const { allowed, reason } = checkBudget()
    if (!allowed) { setBudgetWarning(reason); return null }
    try {
      let data
      if (isMockMode()) {
        consumeApiCall()
        await new Promise(r => setTimeout(r, 800 + Math.random() * 600))
        data = mockCurrentWeather()
      } else {
        try {
          data = await getCurrentWeather(farm.lat, farm.lng)
        } catch {
          // real API failed — fall back to mock so UI stays functional
          consumeApiCall()
          data = mockCurrentWeather()
        }
      }
      setApiUsed(getCurrentUser()?.apiCallsUsed ?? 0)
      return data
    } catch (e) {
      if (e instanceof BudgetError) setBudgetWarning(e.message)
      return null
    }
  }

  function handleFarmAdded(farm) {
    const updated = saveFarm(farm)
    setFarms([...updated])
    setShowModal(false)
    fetchWeather(farm).then(weather => {
      if (weather) setFarms(prev => prev.map(f => f.id === farm.id ? { ...f, weather } : f))
    })
  }

  useEffect(() => {
    farms.forEach(farm => {
      if (!farm.weather) {
        fetchWeather(farm).then(weather => {
          if (weather) setFarms(prev => prev.map(f => f.id === farm.id ? { ...f, weather } : f))
        })
      }
    })
  }, []) // eslint-disable-line

  const safeCount  = farms.filter(f => riskLevel(f.weather) === 'safe').length
  const watchCount = farms.filter(f => riskLevel(f.weather) === 'watch').length
  const actCount   = farms.filter(f => riskLevel(f.weather) === 'act').length

  const NAV_PAGES = ['Dashboard','Farm Detail','Tree Analysis','Alert Feed']

  return (
    <div className="min-h-screen text-white" style={{ background:'linear-gradient(160deg,#071510 0%,#0d2318 40%,#071510 100%)' }}>
      {budgetWarning && <BudgetBanner reason={budgetWarning} onDismiss={() => setBudgetWarning(null)} />}

      <nav className="sticky top-0 z-40 border-b border-white/8"
        style={{ background:'rgba(7,21,16,0.85)', backdropFilter:'blur(16px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-lg">
            <span className="bg-[#a8d66b] text-[#1a3c2e] rounded-xl p-1.5 text-sm">🌿</span>
            <span>Farm<span className="text-[#a8d66b]">Pulse</span></span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {NAV_PAGES.map(p => (
              <button key={p} onClick={() => p !== 'Dashboard' && onNavigate(p, farms)}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                  p === 'Dashboard'
                    ? 'text-[#a8d66b] font-semibold bg-[#a8d66b]/10'
                    : 'text-white/40 hover:text-white hover:bg-white/8'
                }`}>{p}</button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#a8d66b] flex items-center justify-center text-[#1a3c2e] font-black text-xs">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-white/70 text-sm hidden sm:block">{user?.name}</span>
            </div>
            <button onClick={() => { signOut(); onLogout() }}
              className="text-white/40 hover:text-white/80 text-xs border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8" style={{ animation:'fadeSlideUp 0.5s ease-out' }}>
          <p className="text-[#a8d66b] text-xs font-bold tracking-widest uppercase mb-1">
            {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}
          </p>
          <h1 className="text-3xl font-black text-white">
            {user?.name?.split(' ')[0]}'s <span className="text-white/40">Farm Overview</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {new Date().toLocaleDateString('en-KE', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>

        {farms.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8" style={{ animation:'fadeSlideUp 0.5s ease-out 0.1s both' }}>
            <StatChip icon="🌾" label="Total farms" value={farms.length} />
            <StatChip icon="✅" label="Safe"         value={safeCount} />
            <StatChip icon="⚠️" label="Watch"        value={watchCount} />
            <StatChip icon="🚨" label="Act now"       value={actCount} />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Farms grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-white/60 text-sm font-semibold uppercase tracking-widest">Farms · {farms.length}</p>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-[#a8d66b] hover:bg-[#96c45a] text-[#1a3c2e] font-bold px-4 py-2 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-[#a8d66b]/20 active:scale-95">
                + Add Farm
              </button>
            </div>

            {farms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/10 rounded-3xl"
                style={{ animation:'fadeSlideUp 0.6s ease-out 0.2s both' }}>
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
                    style={{ background:'radial-gradient(circle,rgba(168,214,107,0.15),transparent)' }}>🌱</div>
                  <div className="absolute inset-0 rounded-full animate-ping opacity-10" style={{ background:'#a8d66b' }} />
                </div>
                <h2 className="text-xl font-extrabold text-white mb-2">No farms yet</h2>
                <p className="text-white/40 text-sm mb-8 max-w-xs leading-relaxed">Add your first farm to start monitoring live weather, crop health, and risk alerts.</p>
                <button onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-[#a8d66b] hover:bg-[#96c45a] text-[#1a3c2e] font-bold px-8 py-3.5 rounded-2xl text-sm transition-all hover:shadow-xl hover:shadow-[#a8d66b]/25 active:scale-95">
                  + Add your first farm
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {farms.map((farm, i) => (
                  <FarmCard key={farm.id} farm={farm} index={i}
                    onClick={() => onNavigate('Farm Detail', farm)} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-72 shrink-0 space-y-4" style={{ animation:'fadeSlideUp 0.5s ease-out 0.2s both' }}>
            <ApiUsageBar used={apiUsed} limit={apiLimit} />

            {/* Quick nav to other pages */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-3">Quick Access</p>
              {[
                { icon:'📊', label:'Farm Detail',    desc:'7-day forecast & hourly' },
                { icon:'🌳', label:'Tree Analysis',  desc:'Drone canopy health' },
                { icon:'⚠️', label:'Alert Feed',     desc:'AI agronomic risk flags' },
              ].map(({ icon, label, desc }) => (
                <button key={label} onClick={() => onNavigate(label, farms)}
                  className="w-full flex items-center gap-3 text-left mb-2 last:mb-0 hover:bg-white/8 rounded-xl px-2 py-2 transition-colors group">
                  <span className="text-lg">{icon}</span>
                  <div>
                    <p className="text-white text-xs font-semibold group-hover:text-[#a8d66b] transition-colors">{label}</p>
                    <p className="text-white/30 text-[10px]">{desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-3">Risk Guide</p>
              {[{color:'#10b981',label:'Safe',desc:'Conditions normal'},{color:'#f59e0b',label:'Watch',desc:'Monitor closely'},{color:'#ef4444',label:'Act Now',desc:'Immediate action needed'}].map(({ color, label, desc }) => (
                <div key={label} className="flex items-center gap-3 mb-2.5 last:mb-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background:color }} />
                  <div>
                    <p className="text-white text-xs font-semibold">{label}</p>
                    <p className="text-white/30 text-[10px]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-3">Security</p>
              {['🔒 Passwords hashed with bcrypt','🧠 Session in memory only','💰 Budget enforced before every call'].map(s => (
                <p key={s} className="text-white/40 text-[10px] mb-1.5 last:mb-0">{s}</p>
              ))}
            </div>
          </div>
        </div>
      </main>

      {showModal && <AddFarmModal onClose={() => setShowModal(false)} onFarmAdded={handleFarmAdded} />}
    </div>
  )
}
