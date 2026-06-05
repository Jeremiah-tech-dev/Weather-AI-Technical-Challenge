import { useState } from 'react'
import { getWeatherGeo, BudgetError, NetworkError } from '../services/weatherApi'

const CROP_TYPES = ['Tea', 'Maize', 'Coffee', 'Horticulture', 'Wheat', 'Rice', 'Dairy Pasture', 'Other']
const STEPS = { DETAILS: 'details', LOCATION: 'location', CONFIRMING: 'confirming' }

export default function AddFarmModal({ onClose, onFarmAdded }) {
  const [step,       setStep]       = useState(STEPS.DETAILS)
  const [details,    setDetails]    = useState({ name: '', crop: '', region: '' })
  const [coords,     setCoords]     = useState(null)
  const [geoData,    setGeoData]    = useState(null) // weather-geo response
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
        const { latitude: lat, longitude: lng } = pos.coords
        try {
          const data = await getWeatherGeo(lat, lng)
          setGeoData(data)
        } catch (e) {
          if (e instanceof BudgetError) {
            setLocError(e.message)
            setLocLoading(false)
            return
          }
          // NetworkError: coords still valid, proceed without geo data
        }
        setCoords({ lat, lng })
        setLocLoading(false)
        setStep(STEPS.CONFIRMING)
      },
      () => {
        setLocError('Could not get GPS location. Please allow location access and try again.')
        setLocLoading(false)
      }
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
      weather: geoData ?? null,
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
            <h2 className="text-2xl font-extrabold text-gray-900 mt-1 mb-2">Pin your farm location</h2>
            <p className="text-gray-400 text-xs mb-6">Uses your device GPS and validates coordinates via WeatherAI.</p>

            <div className="border border-gray-200 rounded-2xl p-5">
              <p className="font-semibold text-sm text-gray-800 mb-1">📍 Detect my location</p>
              <p className="text-gray-400 text-xs mb-4">One tap — browser GPS captures your exact lat/lng.</p>
              <button
                onClick={detectLocation}
                disabled={locLoading}
                className="w-full bg-[#1a3c2e] hover:bg-[#0f2419] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                {locLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Detecting…
                  </span>
                ) : 'Detect my location'}
              </button>
            </div>

            {locError && <p className="text-red-500 text-xs text-center mt-3">{locError}</p>}
          </>
        )}

        {/* ── STEP 3: Confirmed ── */}
        {step === STEPS.CONFIRMING && coords && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">📍</div>
              <span className="text-[#1a3c2e] text-xs font-bold tracking-widest uppercase">Location Confirmed</span>
              <h2 className="text-2xl font-extrabold text-gray-900 mt-1">Coordinates saved</h2>
              <p className="text-gray-400 text-sm mt-1">
                {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-sm space-y-1.5 mb-6">
              <p><span className="text-gray-400">Farm:</span> <span className="font-semibold text-gray-800">{details.name}</span></p>
              <p><span className="text-gray-400">Crop:</span> <span className="font-semibold text-gray-800">{details.crop}</span></p>
              <p><span className="text-gray-400">Region:</span> <span className="font-semibold text-gray-800">{details.region}</span></p>
            </div>
            <p className="text-xs text-gray-400 text-center mb-4">
              WeatherAI will fetch live weather for these coordinates.
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
