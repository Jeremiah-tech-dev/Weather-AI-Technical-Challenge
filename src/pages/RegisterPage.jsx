import { useState } from 'react'
import { saveUser } from '../store/farmStore'

export default function RegisterPage({ onRegistered }) {
  const [form, setForm] = useState({ name: '', phone: '' })
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Please enter your name and phone number.')
      return
    }
    saveUser({ name: form.name.trim(), phone: form.phone.trim() })
    onRegistered()
  }

  return (
    <div className="min-h-screen bg-[url('https://images.pexels.com/photos/35428535/pexels-photo-35428535.jpeg')] bg-cover bg-center flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-xl text-white mb-8 justify-center">
          <span className="bg-[#a8d66b] text-[#1a3c2e] rounded-lg p-1.5 text-base">🌿</span>
          FarmPulse
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Create account</h2>
          <p className="text-gray-400 text-sm mb-6">Name and phone number — that's all you need.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full name</label>
              <input
                type="text"
                placeholder="e.g. Jane Muthoni"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a8d66b] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone number</label>
              <input
                type="tel"
                placeholder="e.g. 0712 345 678"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a8d66b] focus:border-transparent"
              />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              type="submit"
              className="w-full bg-[#a8d66b] hover:bg-[#96c45a] text-[#1a3c2e] font-bold py-3 rounded-xl text-sm transition-colors mt-2"
            >
              Create Account →
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
