import { ratingBg, ratingLabel } from '@/lib/utils'

export default function RatingBar({ label, score, max = 10 }) {
  if (score === null) return null
  const pct = (score / max) * 100

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-36 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full ${ratingBg(score)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold w-8 text-right">{score}</span>
      <span className="text-xs text-gray-400 w-20 hidden sm:block">{ratingLabel(score)}</span>
    </div>
  )
}
