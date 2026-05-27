'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ComparePicker({ resorts }) {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const router = useRouter()

  function handleCompare() {
    if (!a || !b || a === b) return
    const pair = [a, b].sort().join('-vs-')
    router.push(`/compare/${pair}/`)
  }

  const selectClass =
    'w-full font-sans text-sm bg-white border border-ocean-200 text-ocean-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent appearance-none cursor-pointer'

  return (
    <div className="bg-white border border-ocean-100 rounded-2xl p-6 shadow-card">
      <p className="font-serif text-xl font-bold text-ocean-950 mb-1">Pick any two resorts</p>
      <p className="font-sans text-sm text-ocean-500 mb-5">Select a resort from each column to see a side-by-side comparison.</p>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
        {/* Resort A */}
        <div className="relative">
          <select value={a} onChange={(e) => setA(e.target.value)} className={selectClass}>
            <option value="">Select Resort A</option>
            {resorts.map((r) => (
              <option key={r.slug} value={r.slug} disabled={r.slug === b}>
                {r.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ocean-400">▾</div>
        </div>

        <span className="font-sans text-sm font-bold text-ocean-400 text-center">vs</span>

        {/* Resort B */}
        <div className="relative">
          <select value={b} onChange={(e) => setB(e.target.value)} className={selectClass}>
            <option value="">Select Resort B</option>
            {resorts.map((r) => (
              <option key={r.slug} value={r.slug} disabled={r.slug === a}>
                {r.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ocean-400">▾</div>
        </div>
      </div>

      <button
        onClick={handleCompare}
        disabled={!a || !b || a === b}
        className="mt-4 w-full font-sans text-sm font-bold bg-ocean-900 text-white rounded-xl py-3 hover:bg-ocean-950 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Compare Resorts →
      </button>
    </div>
  )
}
