import heroImg from './assets/hero.png'
import './App.css'

const avatars = [
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
]

function App() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Navbar ── */}
      {/* ── Top bar ── */}
      <div className="bg-[#1a3c2e] text-gray-300 px-6 py-2 flex items-center justify-between text-xs overflow-hidden">
        {/* Left: email */}
        <div className="flex items-center gap-1 shrink-0">
          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
          <span>hello@farmpulse.co.ke</span>
        </div>

        <div className="marquee-wrapper flex-1 mx-6">
          <div className="marquee-track">
            <span className="inline-flex items-center gap-1.5 pr-32">
              <span className="text-green-400 text-[10px] animate-pulse">⚡</span>
              <span className="text-green-300 font-semibold tracking-widest uppercase text-[11px]">Powered by Weather-AI</span>
            </span>
            <span className="inline-flex items-center gap-1.5 pr-32">
              <span className="text-green-400 text-[10px] animate-pulse">⚡</span>
              <span className="text-green-300 font-semibold tracking-widest uppercase text-[11px]">Powered by Weather-AI</span>
            </span>
          </div>
        </div>

        {/* Right: follow us + icons */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-gray-400">Stay Connected</span>
          {/* Facebook */}
          <a href="#" className="hover:text-white transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
          </a>
          {/* Instagram */}
          <a href="#" className="hover:text-white transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </a>
          {/* Twitter/X */}
          <a href="#" className="hover:text-white transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          {/* YouTube */}
          <a href="#" className="hover:text-white transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58a2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#1a3c2e"/></svg>
          </a>
        </div>
      </div>

      <nav className="bg-white text-gray-800 px-6 py-3 flex items-center justify-between text-sm shadow-sm relative">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-base text-green-700">
          <span className="text-green-500 text-xl">🌿</span>
          <span>FarmPulse</span>
        </div>
        {/* Links — centred */}
        <ul className="hidden md:flex items-center gap-6 text-gray-600 absolute left-1/2 -translate-x-1/2">
          {['Home', 'About', 'Services', 'Pages', 'Blog', 'Contact'].map(l => (
            <li key={l} className="hover:text-green-600 cursor-pointer font-medium">{l}</li>
          ))}
        </ul>
        <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-xs font-semibold">
          Contact Now →
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-[#1e4a35] relative overflow-hidden min-h-[520px] flex items-center">
        {/* subtle leaf texture overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')]" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-8 py-12 flex items-center justify-between gap-8">

          {/* ── Left content ── */}
          <div className="flex-1 text-white max-w-lg">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs text-green-300 mb-4">
              <span className="text-green-400">🌱</span>
              WELCOME TO FARMPULSE
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white mb-4">
              Smart Farm &amp;<br />Agronomic Intelligence
            </h1>

            {/* Sub-text */}
            <p className="text-gray-300 text-sm leading-relaxed mb-8">
              Monitor all your farms in one place. Get live weather, crop health
              insights, and AI-powered risk alerts — so you can act before problems strike.
            </p>

            {/* CTA row */}
            <div className="flex items-center gap-6 flex-wrap">
              <button className="bg-green-500 hover:bg-green-400 text-white px-6 py-3 rounded text-sm font-semibold">
                Book Appointment →
              </button>

              {/* Avatars + count */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {avatars.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="client"
                      className="w-8 h-8 rounded-full border-2 border-[#1e4a35] object-cover"
                    />
                  ))}
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-sm leading-none">200k+</p>
                  <p className="text-gray-400 text-xs">Happy clients</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: image + floating cards ── */}
          <div className="relative hidden md:flex items-end justify-center flex-shrink-0 w-[400px] h-[380px]">
            {/* Hero image */}
            <img
              src={heroImg}
              alt="Farm agronomist"
              className="h-full object-contain object-bottom drop-shadow-2xl"
            />

            {/* Floating card — Tree Planting (top right) */}
            <div className="absolute top-4 right-0 bg-white rounded-xl shadow-lg p-3 w-44 flex items-start gap-2">
              <span className="text-2xl">🌳</span>
              <div>
                <p className="text-gray-800 font-semibold text-xs leading-tight">Tree Planting</p>
                <p className="text-gray-400 text-[10px] mt-1 leading-snug">
                  AI canopy analysis &amp; drone-based tree health scoring.
                </p>
              </div>
            </div>

            {/* Floating card — Seed Farm (bottom right) */}
            <div className="absolute bottom-8 right-0 bg-white rounded-xl shadow-lg p-3 w-44 flex items-start gap-2">
              <span className="text-2xl">🌾</span>
              <div>
                <p className="text-gray-800 font-semibold text-xs leading-tight">Seed Farm</p>
                <p className="text-gray-400 text-[10px] mt-1 leading-snug">
                  Live weather &amp; 7-day forecast per farm location.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}

export default App
