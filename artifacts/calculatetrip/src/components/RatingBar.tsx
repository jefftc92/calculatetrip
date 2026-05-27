export function scoreColor(score: number): string {
  if (score >= 9.5) return 'text-emerald-500'
  if (score >= 9.0) return 'text-green-500'
  if (score >= 8.0) return 'text-yellow-500'
  if (score >= 7.0) return 'text-orange-400'
  return 'text-red-400'
}

export function scoreBg(score: number): string {
  if (score >= 9.5) return 'bg-emerald-500'
  if (score >= 9.0) return 'bg-green-500'
  if (score >= 8.0) return 'bg-yellow-400'
  if (score >= 7.0) return 'bg-orange-400'
  return 'bg-red-400'
}

export function scoreLabel(score: number): string {
  if (score >= 9.5) return 'Exceptional'
  if (score >= 9.0) return 'Superb'
  if (score >= 8.0) return 'Excellent'
  if (score >= 7.0) return 'Good'
  return 'Fair'
}

interface RatingBarProps {
  label: string
  score: number
  maxScore?: number
}

export default function RatingBar({ label, score, maxScore = 10 }: RatingBarProps) {
  const pct = Math.round((score / maxScore) * 100)

  return (
    <div className="flex items-center gap-4">
      <span className="font-sans text-sm text-ocean-700 w-36 shrink-0">{label}</span>
      <div className="flex-1 bg-ocean-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all ${scoreBg(score)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`font-sans text-sm font-bold w-8 text-right tabular-nums shrink-0 ${scoreColor(score)}`}>
        {score}
      </span>
    </div>
  )
}
