import { useState } from 'react'
import { register, login } from '../store/farmStore'

export default function AuthPage({ onAuth }) {
  const [tab, setTab] = useState('register') // 'register' | 'login'
  const [form, setForm] = useState({ name: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'register') {
        if (!form.name.trim() || !form.phone.trim() || !form.password) {
          throw new Error('Please fill in all fields.')
        }
        await register({ name: form.name.trim(), phone: form.phone.trim(), password: form.password })
      } else {
        if (!form.phone.trim() || !form.password) {
          throw new Error('Please enter your phone and password.')
        }
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
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a1f14 0%, #1a3c2e 50%, #0f2a1e 100%)' }}>

      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #a8d66b, transparent)', animation: 'pulse 4s ease-in-out infinite' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #4ade80, transparent)', animation: 'pulse 4s ease-in-out infinite 2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-2xl text-white mb-8 justify-center">
          <span className="bg-[#a8d66b] text-[#1a3c2e] rounded-xl p-2 text-lg">🌿</span>
          FarmPulse
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex">
            {['register', 'login'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-4 text-sm font-bold transition-all capitalize ${
                  tab === t
                    ? 'bg-[#a8d66b] text-[#1a3c2e]'
                    : 'text-white/60 hover:text-white'
                }`}>
                {t === 'register' ? 'Create Account' : 'Sign In'}
              </button>
            ))}
          </div>

          <div className="p-8">
            <p className="text-white/50 text-xs mb-6">
              {tab === 'register'
                ? 'Join thousands of Kenyan agronomists. No email needed.'
                : 'Welcome back. Enter your phone and password.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Full name</label>
                  <input type="text" placeholder="e.g. Jane Muthoni" value={form.name}
                    onChange={e => set('name', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#a8d66b] focus:border-transparent" />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5">Phone number</label>
                <input type="tel" placeholder="e.g. 0712 345 678" value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#a8d66b] focus:border-transparent" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} placeholder="Choose a password"
                    value={form.password} onChange={e => set('password', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#a8d66b] focus:border-transparent" />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 text-xs">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
                {tab === 'register' && (
                  <p className="text-white/30 text-[10px] mt-1.5 flex items-center gap-1">
                    🔒 Hashed with bcrypt — never stored as plain text
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-2.5">
                  <p className="text-red-300 text-xs">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-[#a8d66b] hover:bg-[#96c45a] disabled:opacity-60 disabled:cursor-not-allowed text-[#1a3c2e] font-bold py-3.5 rounded-xl text-sm transition-all mt-2 flex items-center justify-center gap-2">
                {loading
                  ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> {tab === 'register' ? 'Creating account…' : 'Signing in…'}</>
                  : tab === 'register' ? 'Create Account →' : 'Sign In →'
                }
              </button>
            </form>
          </div>
        </div>

        <p className="text-white/30 text-[10px] text-center mt-4">
          Password hashed in browser · Session in memory only · Budget enforced before every API call
        </p>
      </div>
    </div>
  )
}
