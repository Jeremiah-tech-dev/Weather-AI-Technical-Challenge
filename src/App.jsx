import { useEffect, useRef, useState } from 'react'
import './App.css'

const avatars = [
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
]

function Marquee({ children }) {
  const outerRef = useRef(null)
  const textRef = useRef(null)
  const xRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const outer = outerRef.current
    const text = textRef.current
    if (!outer || !text) return

    xRef.current = outer.offsetWidth   // start just past the right gate

    const step = () => {
      xRef.current -= 0.6
      if (xRef.current < -text.offsetWidth) {
        xRef.current = outer.offsetWidth  // reset to right gate
      }
      text.style.transform = `translateX(${xRef.current}px)`
      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div ref={outerRef} className="marquee-track-outer flex-1 overflow-hidden relative">
      <div ref={textRef} className="marquee-track">
        {children}
      </div>
    </div>
  )
}

function App() {
  const [activeModal, setActiveModal] = useState(null)
  const close = () => setActiveModal(null)

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── ABOUT US — slides from left ── */}
      {activeModal === 'About Us' && (
        <div className="fixed inset-0 z-50 flex items-center justify-start" onClick={close}>
          <div
            className="modal-slide-left relative h-full w-full max-w-md bg-[#1a3c2e] text-white p-10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={close} className="absolute top-5 right-5 text-white/50 hover:text-white text-xl">✕</button>
            <div className="mt-8">
              <span className="text-[#a8d66b] text-xs font-bold tracking-widest uppercase">About FarmPulse</span>
              <h2 className="text-3xl font-extrabold mt-2 mb-4 leading-tight">Built for the Modern Agronomist</h2>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                FarmPulse is an AI-powered farm intelligence platform designed for agronomists managing multiple sites across diverse climates worldwide. We unify real-time weather, crop health, and risk data into one seamless dashboard.
              </p>
              <p className="text-white/70 text-sm leading-relaxed mb-8">
                Founded by a team of agronomists and engineers, our mission is simple: give farmers the power to act before problems strike. From hyperlocal forecasts to drone-based canopy analysis, FarmPulse is your farm's smartest tool.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[['500+', 'Farms Monitored'], ['20k+', 'Happy Clients'], ['98%', 'Uptime'], ['7-Day', 'Forecasts']].map(([val, lbl]) => (
                  <div key={lbl} className="bg-white/10 rounded-2xl p-4">
                    <p className="text-[#a8d66b] text-2xl font-extrabold">{val}</p>
                    <p className="text-white/60 text-xs mt-1">{lbl}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SOLUTIONS — drops from top ── */}
      {activeModal === 'Solutions' && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24" onClick={close}>
          <div
            className="modal-drop-down relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 p-8"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={close} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl">✕</button>
            <span className="text-[#1a3c2e] text-xs font-bold tracking-widest uppercase">Our Solutions</span>
            <h2 className="text-2xl font-extrabold text-gray-900 mt-1 mb-6">What FarmPulse Solves</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🌦️', title: 'Hyperlocal Weather', desc: 'Real-time and 7-day forecasts pinned to each farm location.' },
                { icon: '🤖', title: 'AI Crop Insights', desc: 'Machine learning models that predict crop stress before it shows.' },
                { icon: '🛸', title: 'Drone Analysis', desc: 'Canopy health scoring and tree count from aerial imagery.' },
                { icon: '⚠️', title: 'Risk Alerts', desc: 'Agronomic risk flags delivered instantly so you act first.' },
              ].map(s => (
                <div key={s.title} className="flex gap-3 bg-green-50 rounded-2xl p-4">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{s.title}</p>
                    <p className="text-gray-500 text-xs mt-1 leading-snug">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SERVICES — scale up from center ── */}
      {activeModal === 'Services' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={close}>
          <div
            className="modal-scale-up relative bg-[#0f2419] text-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 p-8"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={close} className="absolute top-5 right-5 text-white/40 hover:text-white text-xl">✕</button>
            <span className="text-[#a8d66b] text-xs font-bold tracking-widest uppercase">Services</span>
            <h2 className="text-2xl font-extrabold mt-1 mb-6">Everything Your Farm Needs</h2>
            <div className="space-y-3">
              {[
                { icon: '📡', title: 'Live Weather Monitoring', desc: 'Temp, humidity, wind & UV per farm in real time.' },
                { icon: '📊', title: 'Farm Dashboard', desc: 'Unified view of all your farms with visual charts and KPIs.' },
                { icon: '🌳', title: 'Tree & Crop Health', desc: 'AI-driven analysis of canopy cover and crop vitality.' },
                { icon: '🔔', title: 'Smart Risk Alerts', desc: 'Push alerts for frost, drought, pests and disease risk.' },
              ].map(s => (
                <div key={s.title} className="flex items-center gap-4 bg-white/8 border border-white/10 rounded-2xl px-4 py-3">
                  <span className="text-2xl w-10 shrink-0 text-center">{s.icon}</span>
                  <div>
                    <p className="font-semibold text-sm">{s.title}</p>
                    <p className="text-white/50 text-xs mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SUCCESS STORY — rises from bottom ── */}
      {activeModal === 'Success Story' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={close}>
          <div
            className="modal-rise-up relative bg-white rounded-t-3xl shadow-2xl w-full max-w-2xl p-8 pb-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
            <button onClick={close} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl">✕</button>
            <span className="text-[#1a3c2e] text-xs font-bold tracking-widest uppercase">Success Stories</span>
            <h2 className="text-2xl font-extrabold text-gray-900 mt-1 mb-6">What Our Farmers Say</h2>
            <div className="grid grid-cols-1 gap-4">
              {[
                { name: 'Jane Muthoni', role: 'Maize Farmer, Nakuru', quote: 'FarmPulse warned me 3 days early about a frost risk. I covered my crops and saved my entire harvest. I cannot imagine farming without it now.', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
                { name: 'David Otieno', role: 'Agronomist, Kisumu', quote: 'Managing 12 farms used to be a nightmare. Now I get a single view of everything — weather, crop health, alerts. My clients trust me more.', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
                { name: 'Amina Waweru', role: 'Horticulture Farmer, Meru', quote: 'The AI risk alerts helped me identify early blight before it spread. I cut pesticide use by 40% and my yields went up. Incredible tool.', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
              ].map(s => (
                <div key={s.name} className="flex gap-4 bg-green-50 border border-green-100 rounded-2xl p-4">
                  <img src={s.avatar} alt={s.name} className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-[#a8d66b]" />
                  <div>
                    <p className="text-gray-700 text-sm italic leading-snug mb-2">"{s.quote}"</p>
                    <p className="text-[#1a3c2e] font-bold text-xs">{s.name}</p>
                    <p className="text-gray-400 text-xs">{s.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Top bar ── */}
      <div className="bg-[#1a3c2e] text-gray-300 px-6 py-2 flex items-center justify-between text-xs overflow-hidden">
        <div className="flex items-center gap-1 shrink-0">
          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
          <span>hello@farmpulse.co.ke</span>
        </div>
        <div className="marquee-wrapper flex-1 mx-2 flex items-center">
          <div className="shrink-0 self-stretch w-6 border-r border-green-700/60 bg-gradient-to-r from-[#1a3c2e] to-transparent" />
          <Marquee>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-green-400 text-[10px] animate-pulse">⚡</span>
              <span className="text-green-300 font-semibold tracking-widest uppercase text-[11px]">Powered by Weather-AI</span>
            </span>
          </Marquee>
          <div className="shrink-0 self-stretch w-6 border-l border-green-700/60 bg-gradient-to-l from-[#1a3c2e] to-transparent" />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-gray-400">Stay Connected</span>
          <a href="#" className="hover:text-white transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
          </a>
          <a href="#" className="hover:text-white transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </a>
          <a href="#" className="hover:text-white transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="#" className="hover:text-white transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58a2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#1a3c2e"/></svg>
          </a>
        </div>
      </div>

      {/* ── Hero (navbar embedded inside) ── */}
      <section className="relative h-[95vh] flex flex-col bg-[url('https://images.pexels.com/photos/35428535/pexels-photo-35428535.jpeg')] bg-cover bg-center">
        {/* very subtle dark tint at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

        {/* Navbar — floating pill container */}
        <div className="relative z-20 px-8 pt-5">
          <nav className="bg-[#1a3c2e]/60 backdrop-blur-md rounded-full px-5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-base text-white">
              <span className="bg-[#a8d66b] text-[#1a3c2e] rounded-lg p-1 text-sm">🌿</span>
              <span>FarmPulse</span>
            </div>
            <ul className="hidden md:flex items-center gap-1 text-sm font-medium">
              {['Home', 'About Us', 'Solutions', 'Services', 'Success Story'].map((l, i) => (
                <li key={l}>
                  <span
                    onClick={() => l === 'Home' ? close() : setActiveModal(l)}
                    className={`px-4 py-1.5 rounded-full cursor-pointer transition-colors block ${
                      i === 0
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}>{l}</span>
                </li>
              ))}
            </ul>
            <button className="bg-[#a8d66b] hover:bg-[#96c45a] text-[#1a3c2e] font-bold px-5 py-2 rounded-full text-sm transition-colors">
              Register Account
            </button>
          </nav>
        </div>

        {/* Hero content — bottom-left */}
        <div className="relative z-10 flex-1 flex items-end pb-16 px-12">
          <div className="max-w-lg">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              Smart Farming for<br />Future <em className="font-light italic">Generations</em>
            </h1>

            <p className="text-white/75 text-sm leading-relaxed mb-8 max-w-sm">
              Monitor all your farms in one unified dashboard. Get real-time weather updates, hyperlocal forecasts, AI-powered crop health insights, and agronomic risk alerts — act before problems strike.
            </p>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-[#a8d66b] hover:bg-[#96c45a] text-[#1a3c2e] px-6 py-2.5 rounded-full text-sm font-bold transition-colors">
                Register Account <span>↗</span>
              </button>
              <button onClick={() => setActiveModal('Success Story')} className="flex items-center gap-2 border border-white/50 hover:bg-white/10 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors">
                🌟 Farmer Stories
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative z-10 px-12 pb-5 flex items-center justify-between">
          <span className="text-white/60 text-xs font-medium tracking-widest uppercase flex items-center gap-2">
            SCROLL <span>↓</span>
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
              ⭐ <span className="text-white">4.9</span>
            </div>
            <div className="flex -space-x-2">
              {avatars.map((src, i) => (
                <img key={i} src={src} alt="farmer" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
              ))}
            </div>
            <span className="text-white/80 text-xs font-medium">20k+ Happy Clients</span>
          </div>
        </div>
      </section>

      {/* ── What We Offer ── */}
      <section className="relative py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/18005301/pexels-photo-18005301.jpeg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-white/80" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <p className="text-green-600 text-xs font-semibold tracking-widest uppercase text-center mb-2">What We Offer</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-10">
            Everything your farm needs, in one place
          </h2>
          <div className="flex flex-nowrap justify-between gap-8">
            {[
              {
                label: 'Live Weather',
                desc: 'Real-time temp, humidity & conditions per farm location.',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999A5.002 5.002 0 003 15z" />
                  </svg>
                ),
              },
              {
                label: 'Farm Dashboard',
                desc: '7-day forecast & hourly breakdown with visual charts.',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                label: 'Tree Analysis',
                desc: 'AI drone image analysis — tree count & canopy health.',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C9 7 7 9 7 13a5 5 0 0010 0c0-4-2-6-5-11zm0 11v7m-3 0h6" />
                  </svg>
                ),
              },
              {
                label: 'Risk Alerts',
                desc: 'AI agronomic risk flags & live API quota tracking.',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl shadow-md px-4 py-3 flex-1 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <span className="bg-green-50 text-green-600 p-2.5 rounded-xl shrink-0">{item.icon}</span>
                <div>
                  <p className="text-gray-800 font-semibold text-sm">{item.label}</p>
                  <p className="text-gray-400 text-xs mt-0.5 leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#1a3c2e] text-gray-400 text-xs text-center py-4">
        © {new Date().getFullYear()} FarmPulse. All rights reserved.
      </footer>
    </div>
  )
}

export default App
