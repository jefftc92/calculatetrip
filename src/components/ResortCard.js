import Link from 'next/link'
import { scoreColor, scoreLabel, scoreBg } from './RatingBar'

const SPOTLIGHT = [
  { key: 'food',    label: 'Food' },
  { key: 'service', label: 'Service' },
  { key: 'value',   label: 'Value' },
]

export default function ResortCard({ resort, rank }) {
  const { slug, name, ratings, country, type, amenities, heroTagline, affiliateLink } = resort
  const score = ratings.overall

  return (
    <article className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden flex flex-col">

      {/* Coloured top band */}
      <div className={`h-1.5 w-full ${score >= 9.5 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : score >= 9.0 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`} />

      <div className="p-6 flex flex-col flex-1 gap-4">

        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {rank && (
              <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-ocean-950 text-white text-xs font-bold font-sans flex items-center justify-center">
                {rank}
              </span>
            )}
            <div className="min-w-0">
              <Link
                href={`/resorts/${slug}/`}
                className="font-serif text-lg font-bold text-ocean-950 hover:text-ocean-700 transition-colors leading-snug block"
              >
                {name}
              </Link>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs font-sans text-ocean-500">{country}</span>
                <span className="text-ocean-200 text-xs">·</span>
                <span className={`text-xs font-sans font-medium px-2 py-0.5 rounded-full ${type === 'adults-only' ? 'bg-ocean-50 text-ocean-700' : 'bg-amber-50 text-amber-700'}`}>
                  {type === 'adults-only' ? 'Adults Only' : 'Family'}
                </span>
              </div>
            </div>
          </div>

          {/* Score badge */}
          <div className="shrink-0 text-right">
            <div className={`text-3xl font-bold font-sans tabular-nums leading-none ${scoreColor(score)}`}>
              {score}
            </div>
            <div className="text-xs font-sans text-ocean-400 mt-0.5">{scoreLabel(score)}</div>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-sm font-sans text-ocean-600 leading-relaxed">{heroTagline}</p>

        {/* Spotlight ratings */}
        <div className="grid grid-cols-3 gap-2">
          {SPOTLIGHT.map(({ key, label }) => (
            <div key={key} className="bg-ocean-50 rounded-xl p-2.5 text-center">
              <div className={`text-base font-bold font-sans tabular-nums ${scoreColor(ratings[key])}`}>
                {ratings[key] ?? '—'}
              </div>
              <div className="text-xs font-sans text-ocean-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5">
          {amenities.slice(0, 4).map((a) => (
            <span key={a} className="text-xs font-sans bg-white border border-ocean-100 text-ocean-600 rounded-full px-2.5 py-0.5">
              {a}
            </span>
          ))}
          {amenities.length > 4 && (
            <span className="text-xs font-sans text-ocean-400 self-center">+{amenities.length - 4}</span>
          )}
        </div>

        {/* CTAs */}
        <div className="flex gap-2 mt-auto pt-1">
          <Link
            href={`/resorts/${slug}/`}
            className="flex-1 text-center text-sm font-sans font-medium border border-ocean-200 text-ocean-700 rounded-xl py-2.5 hover:bg-ocean-50 hover:border-ocean-300 transition-all"
          >
            Full Review
          </Link>
          <a
            href={affiliateLink}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex-1 text-center text-sm font-sans font-medium bg-ocean-900 text-white rounded-xl py-2.5 hover:bg-ocean-950 transition-all"
          >
            Check Prices →
          </a>
        </div>
      </div>
    </article>
  )
}
