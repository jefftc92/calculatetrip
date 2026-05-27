import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { scoreColor } from './RatingBar'
import type { Resort } from '../data/resorts'

function SlotCard({
  resort,
  onClick,
  onClear,
  disabled,
}: {
  resort: Resort | null
  onClick: () => void
  onClear: (e: React.MouseEvent) => void
  disabled?: boolean
}) {
  return (
    <div className="relative flex-1">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          w-full h-28 rounded-xl border-2 transition-all text-left px-5
          ${resort
            ? 'border-ocean-500 bg-ocean-50 cursor-pointer'
            : disabled
              ? 'border-dashed border-ocean-200 bg-white opacity-40 cursor-not-allowed'
              : 'border-dashed border-ocean-300 bg-white hover:border-ocean-500 hover:bg-ocean-50/60 cursor-pointer'
          }
        `}
      >
        {resort ? (
          <div>
            <p className="font-serif text-sm font-bold text-ocean-950 leading-snug truncate pr-5">{resort.name}</p>
            <p className="font-sans text-xs text-ocean-400 mt-0.5">{resort.country}</p>
            <p className={`font-sans text-xl font-bold mt-1.5 tabular-nums ${scoreColor(resort.ratings.overall)}`}>
              {resort.ratings.overall}
              <span className="text-xs font-normal text-ocean-400"> /10</span>
            </p>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-1.5">
            <span className="font-sans text-2xl font-light text-ocean-300">+</span>
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-ocean-400">Add Resort</span>
          </div>
        )}
      </button>
      {resort && (
        <button
          onClick={onClear}
          className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-ocean-200 hover:bg-ocean-300 text-ocean-600 flex items-center justify-center text-sm font-bold transition-colors leading-none"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default function ComparePicker({ resorts }: { resorts: Resort[] }) {
  const [slotA, setSlotA] = useState<string | null>(null)
  const [slotB, setSlotB] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState<'a' | 'b' | null>(null)
  const [, setLocation] = useLocation()

  const resortA = resorts.find((r) => r.slug === slotA) ?? null
  const resortB = resorts.find((r) => r.slug === slotB) ?? null

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modalOpen])

  function openModal(slot: 'a' | 'b') {
    if (slot === 'b' && !slotA) return
    setModalOpen(slot)
  }

  function pick(slug: string) {
    if (modalOpen === 'a') {
      setSlotA(slug)
      if (!slotB) setModalOpen('b')
      else setModalOpen(null)
    } else if (modalOpen === 'b') {
      setSlotB(slug)
      setModalOpen(null)
    }
  }

  function clearA(e: React.MouseEvent) {
    e.stopPropagation()
    setSlotA(null)
    setSlotB(null)
  }

  function clearB(e: React.MouseEvent) {
    e.stopPropagation()
    setSlotB(null)
  }

  function handleCompare() {
    if (!slotA || !slotB) return
    const pair = [slotA, slotB].sort().join('-vs-')
    setLocation(`/compare/${pair}`)
  }

  const available =
    modalOpen === 'a'
      ? resorts.filter((r) => r.slug !== slotB)
      : resorts.filter((r) => r.slug !== slotA)

  return (
    <>
      <div className="flex items-center gap-3">
        <SlotCard resort={resortA} onClick={() => openModal('a')} onClear={clearA} />
        <span className="shrink-0 font-sans text-sm font-bold text-ocean-300">vs</span>
        <SlotCard resort={resortB} onClick={() => openModal('b')} onClear={clearB} disabled={!slotA} />
      </div>

      {slotA && slotB && (
        <button
          onClick={handleCompare}
          className="mt-4 w-full font-sans text-sm font-bold bg-ocean-900 hover:bg-ocean-950 text-white rounded-xl py-3 transition-colors"
        >
          Compare Resorts →
        </button>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setModalOpen(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-ocean-100">
              <div>
                <h3 className="font-serif text-xl font-bold text-ocean-950">Add a resort</h3>
                <p className="font-sans text-xs text-ocean-400 mt-0.5">
                  {modalOpen === 'a'
                    ? 'Select your first resort'
                    : `Comparing with ${resortA?.name.split(' ').slice(0, 2).join(' ')}`}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(null)}
                className="w-8 h-8 rounded-full text-ocean-400 hover:text-ocean-700 hover:bg-ocean-100 flex items-center justify-center text-xl font-light transition-colors"
              >
                ×
              </button>
            </div>

            <div className="divide-y divide-ocean-50 max-h-[60vh] overflow-y-auto">
              {available.map((r) => (
                <button
                  key={r.slug}
                  onClick={() => pick(r.slug)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-ocean-50 transition-colors text-left group"
                >
                  <div>
                    <p className="font-serif text-sm font-bold text-ocean-950 group-hover:text-ocean-700 transition-colors">
                      {r.name}
                    </p>
                    <p className="font-sans text-xs text-ocean-400 mt-0.5">
                      {r.country} · {r.type === 'adults-only' ? 'Adults Only' : 'Family'}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className={`font-sans text-xl font-bold tabular-nums ${scoreColor(r.ratings.overall)}`}>
                      {r.ratings.overall}
                    </span>
                    <p className="font-sans text-[10px] text-ocean-400">/10</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
