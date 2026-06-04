import { useEffect, useState } from 'react'
import { getFarms, saveFarm, getUser, clearAll } from '../store/farmStore'
import AddFarmModal from '../components/AddFarmModal'

const RISK_BADGE = {
  safe:  { label: 'Safe',     bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500'  },
  watch: { label: 'Watch',    bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500'  },
  act:   { label: 'Act Now',  bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500'    },
}

function riskLevel(weather) {
  if (!weather) return 'safe'
  const temp = weather.temperature ?? 20
  if (temp < 8 || temp > 38) return 'act'
  if (temp < 12 || temp > 32) return 'watch'
  return 'safe'
}

function FarmCard({ farm }) {
  const risk = riskLevel(farm.weather)
  const badge = RISK_BADGE[risk]
  const w = farm.weather

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer">
      {/* header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-extrabold text-gray-900 text-base">{farm.name}</p>
          <p className="text-gray-400 text-xs mt-0.5">{farm.region} · {farm.crop}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
          {badge.label}
        </span>
      </div>

      {/* weather */}
      {w ? (
        <div className="flex items-end gap-3 mt-4">
          <p className="text-4xl font-extrabold text-gray-900">{Math.round(w.temperature)}°</p>
          <div className="pb-1">
            <p className="text-sm font-medium text-gray-600">{w.condition}</p>
            <p className="text-xs text-gray-400">{w.humidity}% humidity</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-4 text-gray-400 text-xs">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Fetching weather…
        </div>
      )}

      {/* coords */}
      <p className="text-[10px] text-gray-300 mt-3">{farm.lat.toFixed(4)}°, {farm.lng.toFixed(4)}°</p>
    </div>
  )
}

export default function Dashboard({ onLogout }) {
  const user = getUser()
  const [farms, setFarms] = useState(getFarms)
  const [showModal, setShowModal] = useState(false)

  // Mock weather fetch — replace with real /v1/current call
  async function fetchWeather(farm) {
    await new Promise(r => setTimeout(r, 1200))
    return {
      temperature: 18 + Math.random() * 14,
      condition: ['Partly Cloudy', 'Sunny', 'Light Rain', 'Overcast'][Math.floor(Math.random() * 4)],
      humidity: Math.round(55 + Math.random() * 30),
    }
  }

  function handleFarmAdded(farm) {
    const updated = saveFarm(farm)
    setFarms([...updated])
    setShowModal(false)

    // Fire weather fetch for the new farm
    fetchWeather(farm).then(weather => {
      setFarms(prev => prev.map(f => f.id === farm.id ? { ...f, weather } : f))
    })
  }

  // Fetch weather for farms that don't have it yet on mount
  useEffect(() => {
    farms.forEach(farm => {
      if (!farm.weather) {
        fetchWeather(farm).then(weather => {
          setFarms(prev => prev.map(f => f.id === farm.id ? { ...f, weather } : f))
        })
      }
    })
  }, []) // eslint-disable-line

  function handleLogout() {
    clearAll()
    onLogout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-[#1a3c2e] px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-base text-white">
          <span className="bg-[#a8d66b] text-[#1a3c2e] rounded-lg p-1 text-sm">🌿</span>
          FarmPulse
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/70 text-sm">
            Hey, <span className="text-white font-semibold">{user?.name}</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-white/60 hover:text-white text-xs transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Your Farms</h1>
            <p className="text-gray-400 text-sm mt-0.5">{farms.length} farm{farms.length !== 1 ? 's' : ''} monitored</p>
          </div>
          {farms.length > 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-[#a8d66b] hover:bg-[#96c45a] text-[#1a3c2e] font-bold px-5 py-2.5 rounded-full text-sm transition-colors"
            >
              + Add Farm
            </button>
          )}
        </div>

        {/* Empty state */}
        {farms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mb-6">🌱</div>
            <h2 className="text-xl font-extrabold text-gray-800 mb-2">No farms yet</h2>
            <p className="text-gray-400 text-sm mb-8 max-w-xs">Add your first farm to start monitoring weather, crop health, and risk alerts.</p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-[#a8d66b] hover:bg-[#96c45a] text-[#1a3c2e] font-bold px-8 py-3 rounded-full text-base transition-colors shadow-lg"
            >
              + Add your first farm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {farms.map(farm => <FarmCard key={farm.id} farm={farm} />)}
          </div>
        )}
      </main>

      {showModal && (
        <AddFarmModal
          onClose={() => setShowModal(false)}
          onFarmAdded={handleFarmAdded}
        />
      )}
    </div>
  )
}
