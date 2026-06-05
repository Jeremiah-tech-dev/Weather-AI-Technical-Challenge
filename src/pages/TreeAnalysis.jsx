import { useEffect, useRef, useState } from 'react'
import { analyzeTree, getTreeHistory, BudgetError, NetworkError } from '../services/weatherApi'

function CanopyBar({ label, pct, color }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white/60">{label}</span>
        <span className="font-bold" style={{ color }}>{pct != null ? `${pct}%` : '—'}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct ?? 0}%`, background: color }} />
      </div>
    </div>
  )
}

export default function TreeAnalysis({ farm, onBack, onBudgetError }) {
  const [dragging,   setDragging]   = useState(false)
  const [preview,    setPreview]    = useState(null)
  const [file,       setFile]       = useState(null)
  const [result,     setResult]     = useState(null)
  const [analyzeErr, setAnalyzeErr] = useState(null)
  const [history,    setHistory]    = useState([])
  const [analyzing,  setAnalyzing]  = useState(false)
  const [loadingH,   setLoadingH]   = useState(true)
  const [historyErr, setHistoryErr] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await getTreeHistory()
        setHistory(data)
      } catch (e) {
        if (e instanceof BudgetError) { onBudgetError(e.message); return }
        setHistoryErr(e instanceof NetworkError ? e.message : 'Network error — could not load history.')
      } finally {
        setLoadingH(false)
      }
    }
    loadHistory()
  }, []) // eslint-disable-line

  function handleDrop(e) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) pickFile(f)
  }

  function pickFile(f) {
    setFile(f); setResult(null); setAnalyzeErr(null)
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target.result)
    reader.readAsDataURL(f)
  }

  async function runAnalysis() {
    if (!file) return
    setAnalyzing(true); setAnalyzeErr(null)
    try {
      const fd = new FormData()
      fd.append('image', file)
      if (farm) { fd.append('lat', farm.lat); fd.append('lng', farm.lng) }
      const data = await analyzeTree(fd)
      // use uploaded image as overlay if API doesn't return one
      if (!data.overlay_url) data.overlay_url = preview
      setResult(data)
      setHistory(h => [{ ...data, id: Date.now(), thumbnail: preview }, ...h])
    } catch (e) {
      if (e instanceof BudgetError) { onBudgetError(e.message); return }
      setAnalyzeErr(e instanceof NetworkError ? e.message : 'Network error — analysis failed. Try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(160deg, #071510 0%, #0d2318 40%, #071510 100%)' }}>
      <div className="sticky top-0 z-40 border-b border-white/8" style={{ background: 'rgba(7,21,16,0.9)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">← Back</button>
          <div className="h-4 w-px bg-white/20" />
          <div>
            <p className="font-extrabold text-white">Tree Analysis</p>
            <p className="text-white/40 text-xs">AI-powered canopy health from drone imagery</p>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>

        {/* Upload zone */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <p className="text-[#a8d66b] text-xs font-bold tracking-widest uppercase mb-1">New Analysis</p>
          <p className="text-white font-extrabold text-lg mb-6">Upload a drone image</p>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
              dragging ? 'border-[#a8d66b] bg-[#a8d66b]/10 scale-[1.01]' : 'border-white/20 hover:border-white/40 hover:bg-white/5'
            }`}>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files[0] && pickFile(e.target.files[0])} />
            {preview ? (
              <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-xl object-contain" />
            ) : (
              <>
                <div className="text-5xl mb-3">🛸</div>
                <p className="text-white font-semibold text-sm">Drag & drop your drone image here</p>
                <p className="text-white/40 text-xs mt-1">or click to browse · JPG, PNG, WebP</p>
              </>
            )}
          </div>

          {file && !analyzing && (
            <button onClick={runAnalysis}
              className="mt-4 w-full bg-[#a8d66b] hover:bg-[#96c45a] text-[#1a3c2e] font-bold py-3 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-[#a8d66b]/20 active:scale-95">
              🔬 Analyse with AI
            </button>
          )}
          {analyzing && (
            <div className="mt-4 flex items-center justify-center gap-3 text-white/60 text-sm">
              <svg className="w-5 h-5 animate-spin text-[#a8d66b]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Analysing canopy… this takes a moment
            </div>
          )}
          {analyzeErr && (
            <div className="mt-4 flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <span className="text-lg">📡</span>
              <p className="text-red-300 text-sm">{analyzeErr}</p>
            </div>
          )}
        </section>

        {/* Result */}
        {result && (
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>
            <p className="text-[#a8d66b] text-xs font-bold tracking-widest uppercase mb-4">Analysis Complete</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-white/40 text-xs mb-1.5">Original</p>
                  <img src={preview} alt="original" className="w-full rounded-2xl object-cover max-h-44" />
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1.5">AI Annotated Overlay</p>
                  <div className="relative">
                    <img src={result.overlay_url} alt="overlay" className="w-full rounded-2xl object-cover max-h-44" />
                    <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg,rgba(168,214,107,0.15),rgba(91,94,166,0.15))' }} />
                    <div className="absolute top-2 right-2 bg-[#a8d66b] text-[#1a3c2e] text-[10px] font-black px-2 py-0.5 rounded-full">AI</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white/5 rounded-2xl p-4 mb-4 text-center">
                  <p className="text-white/50 text-xs mb-1">Trees Detected</p>
                  <p className="text-5xl font-black text-[#a8d66b]">{result.tree_count}</p>
                </div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">Canopy Health</p>
                <CanopyBar label="Healthy"             pct={result.canopy.healthy}           color="#10b981" />
                <CanopyBar label="Needs Care"          pct={result.canopy.needs_care}        color="#f59e0b" />
                <CanopyBar label="Needs Replacement"   pct={result.canopy.needs_replacement} color="#ef4444" />
              </div>
            </div>
          </section>
        )}

        {/* History */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <p className="text-[#a8d66b] text-xs font-bold tracking-widest uppercase mb-1">Past Analyses</p>
          <p className="text-white font-extrabold text-lg mb-5">History</p>
          {loadingH ? (
            <div className="flex justify-center py-8">
              <svg className="w-6 h-6 animate-spin text-white/30" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>
          ) : historyErr ? (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <span className="text-lg">📡</span>
              <p className="text-red-300 text-sm">{historyErr}</p>
            </div>
          ) : history.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">No past analyses yet. Upload your first drone image above.</p>
          ) : (
            <div className="space-y-3">
              {history.map(h => (
                <div key={h.id} className="flex items-center gap-4 bg-white/5 border border-white/8 rounded-2xl p-4">
                  {h.thumbnail && <img src={h.thumbnail} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{h.tree_count} trees detected</p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {new Date(h.analyzed_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {h.canopy.healthy   != null && <p className="text-emerald-400 text-xs font-bold">{h.canopy.healthy}% healthy</p>}
                    {h.canopy.needs_care != null && <p className="text-amber-400 text-xs">{h.canopy.needs_care}% needs care</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
