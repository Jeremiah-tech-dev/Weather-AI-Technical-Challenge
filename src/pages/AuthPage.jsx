import { useState } from 'react'
import { register, login } from '../store/farmStore'

export default function AuthPage({ onAuth, onBack }) {
  const [tab,      setTab]      = useState('register')
  const [form,     setForm]     = useState({ name: '', phone: '', password: '' })
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'register') {
        if (!form.name.trim() || !form.phone.trim() || !form.password)
          throw new Error('Please fill in all fields.')
        await register({ name: form.name.trim(), phone: form.phone.trim(), password: form.password })
      } else {
        if (!form.phone.trim() || !form.password)
          throw new Error('Please enter your phone and password.')
        await login({ phone: form.phone.trim(), password: form.password })
      }
      onAuth()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">

      {/* Background image */}
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/533982/pexels-photo-533982.jpeg')] bg-cover bg-center" />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Floating animated orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,214,107,0.18), transparent 70%)', animation: 'float1 8s ease-in-out infinite' }} />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.14), transparent 70%)', animation: 'float2 10s ease-in-out infinite' }} />
        <div className="absolute top-3/4 left-1/3 w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,214,107,0.10), transparent 70%)', animation: 'float1 12s ease-in-out infinite 3s' }} />
      </div>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(30px) scale(0.95); }
        }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .auth-card { animation: slideUp 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
        .auth-back { animation: fadeIn 0.4s ease 0.2s both; }
        .auth-logo { animation: slideUp 0.5s ease 0.1s both; }
      `}</style>

      <div className="relative z-10 w-full max-w-md mx-4 py-8">

        {/* Back button */}
        <button onClick={onBack}
          className="auth-back flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-all hover:-translate-x-1 group">
          <span className="bg-white/10 group-hover:bg-white/20 border border-white/20 rounded-lg px-3 py-1.5 backdrop-blur-sm transition-all">
            ← Back to Home
          </span>
        </button>

        {/* Logo */}
        <div className="auth-logo flex items-center gap-3 mb-8">
          <span className="bg-[#a8d66b] text-[#1a3c2e] rounded-xl p-2.5 text-xl shadow-lg shadow-[#a8d66b]/30">🌿</span>
          <div>
            <p className="font-black text-2xl text-white tracking-tight">FarmPulse</p>
            <p className="text-white/50 text-xs">Smart farming for future generations</p>
          </div>
        </div>

        {/* Card */}
        <div className="auth-card rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {[['register', 'Create Account'], ['login', 'Sign In']].map(([t, label]) => (
              <button key={t} onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-4 text-sm font-bold transition-all ${
                  tab === t
                    ? 'text-[#1a3c2e] bg-[#a8d66b] shadow-inner'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Subtitle */}
            <p className="text-white/60 text-xs mb-6 leading-relaxed">
              {tab === 'register'
                ? '🌱 Join agronomists across Kenya monitoring farms in real-time. No email needed.'
                : '👋 Welcome back. Enter your credentials to access your dashboard.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">

              {tab === 'register' && (
                <div style={{ animation: 'slideUp 0.3s ease both' }}>
                  <label className="block text-xs font-bold text-white/80 mb-2 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Muthoni"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#a8d66b] transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.10)',
                      border: '1px solid rgba(255,255,255,0.20)',
                      backdropFilter: 'blur(8px)',
                    }}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-white/80 mb-2 uppercase tracking-widest">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 0712 345 678"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#a8d66b] transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.10)',
                    border: '1px solid rgba(255,255,255,0.20)',
                    backdropFilter: 'blur(8px)',
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-2 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Choose a strong password"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    className="w-full rounded-xl px-4 py-3.5 pr-12 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#a8d66b] transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.10)',
                      border: '1px solid rgba(255,255,255,0.20)',
                      backdropFilter: 'blur(8px)',
                    }}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors text-base">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
                {tab === 'register' && (
                  <p className="text-white/40 text-[10px] mt-1.5 flex items-center gap-1">
                    🔒 Hashed with bcrypt — never stored as plain text
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-xl px-4 py-3 flex items-center gap-3"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.30)' }}>
                  <span className="text-red-400 shrink-0">⚠️</span>
                  <p className="text-red-200 text-xs">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-[#a8d66b] hover:bg-[#96c45a] disabled:opacity-60 disabled:cursor-not-allowed text-[#1a3c2e] font-black py-4 rounded-xl text-sm transition-all mt-2 flex items-center justify-center gap-2 shadow-lg shadow-[#a8d66b]/25 hover:shadow-[#a8d66b]/40 hover:-translate-y-0.5 active:scale-95">
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    {tab === 'register' ? 'Creating account…' : 'Signing in…'}
                  </>
                ) : (
                  tab === 'register' ? '🌿 Create My Account →' : '🚀 Sign In →'
                )}
              </button>
            </form>

            {/* Stats strip */}
            {tab === 'register' && (
              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
                {[['500+', 'Farms'], ['1k', 'API Calls/mo'], ['98%', 'Uptime']].map(([val, lbl]) => (
                  <div key={lbl} className="text-center">
                    <p className="text-[#a8d66b] font-black text-base">{val}</p>
                    <p className="text-white/40 text-[10px]">{lbl}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-white/25 text-[10px] text-center mt-4">
          Password hashed in browser · Session in memory only · Budget enforced before every API call
        </p>
      </div>
    </div>
  )
}
