import { Link } from 'wouter'
import { type Resort } from '../data/resorts'
import { scoreColor, scoreLabel } from './RatingBar'

interface Props {
  resort: Resort
  rank?: number
}

export default function ResortCard({ resort, rank }: Props) {
  const { slug, name, country, area, type, ratings, ageNote } = resort

  return (
    <Link href={`/resorts/${slug}`} className="block group">
      <div className="bg-white border border-ocean-100 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 group-hover:-translate-y-0.5 h-full flex flex-col">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            {rank && (
              <span className="font-sans text-xs font-bold text-ocean-400 mb-1 block">#{rank}</span>
            )}
            <h3 className="font-serif text-base font-bold text-ocean-950 leading-snug group-hover:text-ocean-700 transition-colors line-clamp-2">
              {name}
            </h3>
            <p className="font-sans text-xs text-ocean-400 mt-0.5">
              {area}, {country}
            </p>
          </div>

          {/* Score badge */}
          <div className="shrink-0 text-center">
            <div className={`font-serif text-2xl font-bold tabular-nums leading-none ${scoreColor(ratings.overall)}`}>
              {ratings.overall}
            </div>
            <div className="font-sans text-[10px] text-ocean-400 mt-0.5">{scoreLabel(ratings.overall)}</div>
          </div>
        </div>

        {/* Type badge */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className={`font-sans text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${type === 'adults-only' ? 'bg-ocean-100 text-ocean-700' : 'bg-amber-100 text-amber-700'}`}>
            {type === 'adults-only' ? 'Adults Only' : 'Family'}
          </span>
          {ageNote && (
            <span className="font-sans text-[11px] px-2.5 py-0.5 rounded-full bg-ocean-50 text-ocean-500">
              {ageNote}
            </span>
          )}
        </div>

        {/* Sub-ratings */}
        <div className="grid grid-cols-3 gap-2 mt-auto">
          {[
            { key: 'food' as const, label: 'Food' },
            { key: 'service' as const, label: 'Service' },
            { key: 'value' as const, label: 'Value' },
          ].map(({ key, label }) => (
            <div key={key} className="text-center bg-ocean-50 rounded-xl py-2">
              <div className={`font-sans text-sm font-bold tabular-nums ${scoreColor(ratings[key])}`}>
                {ratings[key]}
              </div>
              <div className="font-sans text-[10px] text-ocean-400">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </Link>
  )
}
