import { useState } from 'react'
import { getWeatherGeo } from '../services/weatherApi'

const CROP_TYPES = ['Tea', 'Maize', 'Coffee', 'Horticulture', 'Wheat', 'Rice', 'Dairy Pasture', 'Other']
const STEPS = { DETAILS: 'details', LOCATION: 'location', CONFIRMING: 'confirming' }

export default function AddFarmModal({ onClose, onFarmAdded }) {
  const [step,       setStep]       = useState(STEPS.DETAILS)
  const [details,    setDetails]    = useState({ name: '', crop: '', region: '' })
  const [coords,     setCoords]     = useState(null)
  const [geoMeta,    setGeoMeta]    = useState(null) // { city, region, country }
  const [locError,   setLocError]   = useState('')
  const [locLoading, setLocLoading] = useState(false)

  function submitDetails(e) {
    e.preventDefault()
    if (!details.name.trim() || !details.crop || !details.region.trim()) return
    setStep(STEPS.LOCATION)
  }

  async function detectLocation() {
    setLocError('')
    setLocLoading(true)

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords
        setCoords({ lat, lng, accuracy: Math.round(accuracy) })

        // Resolve location name via the proxy (keeps API key server-side)
        try {
          const data = await getWeatherGeo(lat, lng)
          const geo = data?.ip_geo ?? data?.location ?? data ?? {}
          setGeoMeta({
            city:    geo.city    ?? null,
            region:  geo.region  ?? null,
            country: geo.country ?? null,
          })
        } catch {
          // Non-fatal — we still have the GPS coords
        }

        setLocLoading(false)
        setStep(STEPS.CONFIRMING)
      },
      err => {
        setLocLoading(false)
        if (err.code === 1) {
          setLocError('Location access denied. Click the 🔒 icon in your browser address bar → Site settings → Location → Allow, then try again.')
        } else if (err.code === 2) {
          setLocError('📍 Your device location (GPS) is turned off. Please turn on Location/GPS in your device settings, then try again.')
        } else {
          setLocError('Location request timed out. Move to an open area and try again.')
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  function confirmFarm() {
    onFarmAdded({
      id:      Date.now(),
      name:    details.name.trim(),
      crop:    details.crop,
      region:  details.region.trim(),
      lat:     coords.lat,
      lng:     coords.lng,
      weather: null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="modal-scale-up relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl">✕</button>

        {/* ── STEP 1: Details ── */}
        {step === STEPS.DETAILS && (
          <>
            <span className="text-[#1a3c2e] text-xs font-bold tracking-widest uppercase">New Farm</span>
            <h2 className="text-2xl font-extrabold text-gray-900 mt-1 mb-6">Fill in farm details</h2>
            <form onSubmit={submitDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Farm name</label>
                <input
                  type="text"
                  placeholder="e.g. Nandi Hills Farm"
                  value={details.name}
                  onChange={e => setDetails(d => ({ ...d, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a8d66b]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Crop type</label>
                <select
                  value={details.crop}
                  onChange={e => setDetails(d => ({ ...d, crop: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a8d66b] bg-white"
                >
                  <option value="">Select crop type</option>
                  {CROP_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Region</label>
                <input
                  type="text"
                  placeholder="e.g. Kericho, Rift Valley"
                  value={details.region}
                  onChange={e => setDetails(d => ({ ...d, region: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a8d66b]"
                />
              </div>
              <button
                type="submit"
                disabled={!details.name.trim() || !details.crop || !details.region.trim()}
                className="w-full bg-[#a8d66b] hover:bg-[#96c45a] disabled:opacity-40 disabled:cursor-not-allowed text-[#1a3c2e] font-bold py-3 rounded-xl text-sm transition-colors"
              >
                Next: Set Location →
              </button>
            </form>
          </>
        )}

        {/* ── STEP 2: Location ── */}
        {step === STEPS.LOCATION && (
          <>
            <button onClick={() => setStep(STEPS.DETAILS)} className="text-xs text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1">
              ← Back
            </button>
            <span className="text-[#1a3c2e] text-xs font-bold tracking-widest uppercase">Set Location</span>
            <h2 className="text-2xl font-extrabold text-gray-900 mt-1 mb-2">Pin your farm</h2>
            <p className="text-gray-400 text-xs mb-3">
              Your browser will ask for permission — click <strong className="text-gray-700">Allow</strong>. Make sure your device Location/GPS is turned on.
            </p>

            {/* Free tier notice */}
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-4">
              <span className="text-amber-500 text-sm shrink-0 mt-0.5">⚠️</span>
              <p className="text-amber-700 text-[11px] leading-relaxed">
                <strong>Free tier API notice:</strong> This system uses the WeatherAI free plan. Location detection relies on your browser's GPS — IP-based geo-lookup is a paid feature. For best accuracy, ensure your device GPS is enabled.
              </p>
            </div>

            <div className="border border-gray-200 rounded-2xl p-5">
              <p className="font-semibold text-sm text-gray-800 mb-1">📍 Detect my GPS location</p>
              <p className="text-gray-400 text-xs mb-4">Captures your exact coordinates and resolves your location name via WeatherAI.</p>
              <button
                onClick={detectLocation}
                disabled={locLoading}
                className="w-full bg-[#1a3c2e] hover:bg-[#0f2419] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                {locLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Detecting location…
                  </span>
                ) : '📡 Get My Location'}
              </button>
            </div>

            {locError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-xs leading-relaxed">{locError}</p>
              </div>
            )}
          </>
        )}

        {/* ── STEP 3: Confirmed ── */}
        {step === STEPS.CONFIRMING && coords && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">📍</div>
              <span className="text-[#1a3c2e] text-xs font-bold tracking-widest uppercase">Location Confirmed</span>
              <h2 className="text-2xl font-extrabold text-gray-900 mt-1">Coordinates captured</h2>
              {geoMeta?.city && (
                <p className="text-[#1a3c2e] font-semibold text-sm mt-1">
                  {[geoMeta.city, geoMeta.region, geoMeta.country].filter(Boolean).join(', ')}
                </p>
              )}
              <p className="text-gray-400 text-xs mt-1">
                {coords.lat.toFixed(6)}°, {coords.lng.toFixed(6)}°
              </p>
              <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 mt-2">
                ⚠️ Free tier — location resolved via browser GPS
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-sm space-y-1.5 mb-4">
              <p><span className="text-gray-400">Farm:</span> <span className="font-semibold text-gray-800">{details.name}</span></p>
              <p><span className="text-gray-400">Crop:</span> <span className="font-semibold text-gray-800">{details.crop}</span></p>
              <p><span className="text-gray-400">Region:</span> <span className="font-semibold text-gray-800">{details.region}</span></p>
              {geoMeta?.city && (
                <p><span className="text-gray-400">Detected location:</span> <span className="font-semibold text-gray-800">{[geoMeta.city, geoMeta.region].filter(Boolean).join(', ')}</span></p>
              )}
            </div>

            {/* Accuracy + upgrade notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 space-y-1">
              <p className="text-amber-700 text-[11px] font-semibold">⚠️ Location accuracy: ~{coords.accuracy ?? '?'}m radius (free tier)</p>
              <p className="text-amber-600 text-[11px] leading-relaxed">For precise farm-level GPS accuracy, upgrade to a paid WeatherAI plan.</p>
            </div>

            {/* Thank you */}
            <p className="text-center text-[#1a3c2e] text-xs font-semibold mb-4">
              🌿 Thank you for using FarmPulse! Your farm will be live in seconds.
            </p>
            <button
              onClick={confirmFarm}
              className="w-full bg-[#a8d66b] hover:bg-[#96c45a] text-[#1a3c2e] font-bold py-3 rounded-xl text-sm transition-colors"
            >
              ✅ Save Farm & Fetch Weather
            </button>
          </>
        )}
      </div>
    </div>
  )
}
