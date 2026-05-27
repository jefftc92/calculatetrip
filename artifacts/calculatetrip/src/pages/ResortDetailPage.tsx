import { Link, useParams, Redirect } from 'wouter'
import { resorts, getResortBySlug } from '../data/resorts'
import RatingBar, { scoreColor, scoreLabel } from '../components/RatingBar'
import ResortCard from '../components/ResortCard'
import Breadcrumb from '../components/Breadcrumb'
import { RATING_LABELS } from '../lib/utils'

const RATING_ORDER = ['overall', 'food', 'beach', 'pool', 'atmosphere', 'location', 'room', 'value', 'cleanliness', 'service', 'sleepQuality'] as const

const HIGHLIGHTS = [
  { key: 'service' as const, icon: '⭐' },
  { key: 'value' as const, icon: '💰' },
  { key: 'cleanliness' as const, icon: '✨' },
]

export default function ResortDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const resort = getResortBySlug(slug)

  if (!resort) return <Redirect to="/resorts" />

  const { name, country, type, area, airport, ageNote, amenities, description, ratings, affiliateLink } = resort

  const related = resorts
    .filter((r) => r.slug !== slug && (r.country === resort.country || r.type === resort.type))
    .slice(0, 2)

  return (
    <>
      <div className="bg-ocean-950 pt-8 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Breadcrumb
            crumbs={[
              { label: 'Home', href: '/' },
              { label: 'All Resorts', href: '/resorts' },
              { label: name },
            ]}
            dark
          />

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mt-4">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-xs font-sans font-semibold px-3 py-1 rounded-full ${type === 'adults-only' ? 'bg-ocean-800 text-ocean-300' : 'bg-yellow-700/30 text-yellow-400'}`}>
                  {type === 'adults-only' ? 'Adults Only' : 'Family'}
                </span>
                {ageNote && (
                  <span className="text-xs font-sans px-3 py-1 rounded-full bg-ocean-800 text-ocean-400">{ageNote}</span>
                )}
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-white leading-tight">{name}</h1>
              <p className="font-sans text-ocean-400 mt-2 text-sm">{area}, {country} · Nearest airport: {airport}</p>
            </div>

            <div className="shrink-0 bg-ocean-900 border border-ocean-700 rounded-2xl px-6 py-4 text-center min-w-[120px]">
              <div className={`font-serif text-5xl font-bold tabular-nums leading-none ${scoreColor(ratings.overall)}`}>
                {ratings.overall}
              </div>
              <div className="font-sans text-xs text-ocean-400 mt-1">{scoreLabel(ratings.overall)}</div>
              <div className="font-sans text-xs text-ocean-600 mt-0.5">out of 10</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <a
          href={affiliateLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-ocean-900 hover:bg-ocean-950 text-white font-sans font-bold py-4 rounded-2xl text-base transition-colors mb-10 shadow-card"
        >
          Check Availability &amp; Prices →
        </a>

        <div className="grid grid-cols-3 gap-3 mb-10">
          {HIGHLIGHTS.map(({ key, icon }) =>
            ratings[key] !== null ? (
              <div key={key} className="bg-white border border-ocean-100 rounded-2xl p-4 text-center shadow-card">
                <div className="text-xl mb-1">{icon}</div>
                <div className={`font-serif text-2xl font-bold ${scoreColor(ratings[key])}`}>{ratings[key]}</div>
                <div className="font-sans text-xs text-ocean-500 mt-0.5">{RATING_LABELS[key]}</div>
              </div>
            ) : null
          )}
        </div>

        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-ocean-950 mb-4">{name} — Overview</h2>
          <p className="font-sans text-ocean-700 leading-relaxed">{description}</p>
        </section>

        <section className="bg-white border border-ocean-100 rounded-2xl p-6 md:p-8 mb-10 shadow-card">
          <h2 className="font-serif text-2xl font-bold text-ocean-950 mb-6">Rating Breakdown</h2>
          <div className="space-y-4">
            {RATING_ORDER.map((key) =>
              ratings[key] !== null ? (
                <RatingBar key={key} label={RATING_LABELS[key]} score={ratings[key] as number} />
              ) : null
            )}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-ocean-950 mb-5">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {amenities.map((a) => (
              <span key={a} className="font-sans text-sm bg-white border border-ocean-200 text-ocean-700 rounded-full px-4 py-1.5 shadow-sm">
                {a}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-ocean-50 border border-ocean-100 rounded-2xl p-6 mb-10">
          <h2 className="font-serif text-lg font-bold text-ocean-950 mb-3">Compare {name}</h2>
          <div className="flex flex-col gap-2">
            {resorts
              .filter((r) => r.slug !== slug)
              .map((other) => (
                <Link
                  key={other.slug}
                  href={`/compare/${[slug, other.slug].sort().join('-vs-')}`}
                  className="font-sans text-sm text-ocean-700 hover:text-ocean-950 hover:underline transition-colors"
                >
                  {name} vs {other.name} →
                </Link>
              ))}
          </div>
        </section>

        {related.length > 0 && (
          <section>
            <h2 className="font-serif text-2xl font-bold text-ocean-950 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {related.map((r) => (
                <ResortCard key={r.slug} resort={r} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
