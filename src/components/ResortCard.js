import Link from 'next/link'
import { ratingColor, ratingLabel } from '@/lib/utils'

export default function ResortCard({ resort, rank }) {
  const { slug, name, ratings, country, type, amenities, heroTagline, affiliateLink } = resort

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {rank && (
            <span className="bg-green-700 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shrink-0 mt-0.5">
              {rank}
            </span>
          )}
          <div>
            <Link href={`/resorts/${slug}/`} className="text-lg font-bold text-gray-900 hover:text-green-700 transition-colors leading-tight">
              {name}
            </Link>
            <p className="text-sm text-gray-500 mt-0.5">{country} &middot; {type === 'adults-only' ? 'Adults Only' : 'Family'}</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span className={`text-2xl font-extrabold ${ratingColor(ratings.overall)}`}>
            {ratings.overall}
          </span>
          <p className="text-xs text-gray-400">{ratingLabel(ratings.overall)}</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">{heroTagline}</p>

      <div className="flex flex-wrap gap-1.5">
        {amenities.slice(0, 5).map((a) => (
          <span key={a} className="text-xs bg-green-50 text-green-700 border border-green-100 rounded-full px-2.5 py-0.5">
            {a}
          </span>
        ))}
        {amenities.length > 5 && (
          <span className="text-xs text-gray-400 self-center">+{amenities.length - 5} more</span>
        )}
      </div>

      <div className="flex gap-3 mt-auto pt-2">
        <Link
          href={`/resorts/${slug}/`}
          className="flex-1 text-center text-sm font-medium border border-green-700 text-green-700 rounded-lg py-2 hover:bg-green-50 transition-colors"
        >
          Read Review
        </Link>
        <a
          href={affiliateLink}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex-1 text-center text-sm font-medium bg-green-700 text-white rounded-lg py-2 hover:bg-green-800 transition-colors"
        >
          Check Prices
        </a>
      </div>
    </div>
  )
}
