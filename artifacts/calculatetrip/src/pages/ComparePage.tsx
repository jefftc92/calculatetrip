import { Link, useParams, Redirect } from 'wouter'
import { resorts, getResortBySlug } from '../data/resorts'
import { RATING_LABELS } from '../lib/utils'
import { scoreColor, scoreLabel } from '../components/RatingBar'
import Breadcrumb from '../components/Breadcrumb'

const ORDERED_KEYS = ['overall', 'food', 'beach', 'pool', 'atmosphere', 'location', 'room', 'value', 'cleanliness', 'service', 'sleepQuality'] as const

function parsePair(pair: string): { slugA: string; slugB: string } | null {
  const vsIdx = pair.indexOf('-vs-')
  if (vsIdx === -1) return null
  return { slugA: pair.slice(0, vsIdx), slugB: pair.slice(vsIdx + 4) }
}

export default function ComparePage() {
  const { pair } = useParams<{ pair: string }>()
  const parsed = parsePair(pair)
  if (!parsed) return <Redirect to="/resorts" />

  const a = getResortBySlug(parsed.slugA)
  const b = getResortBySlug(parsed.slugB)
  if (!a || !b) return <Redirect to="/resorts" />

  const winner = a.ratings.overall >= b.ratings.overall ? a : b
  const loser = a.ratings.overall >= b.ratings.overall ? b : a

  return (
    <>
      <div className="bg-ocean-950 pt-8 pb-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Breadcrumb
            dark
            crumbs={[
              { label: 'Home', href: '/' },
              { label: 'All Resorts', href: '/resorts' },
              { label: 'Compare' },
            ]}
          />
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ocean-500 mb-2">Side-by-Side</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white leading-tight">
            {a.name}<br />
            <span className="text-ocean-500 text-2xl">vs</span><br />
            {b.name}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 pb-16">
        <div className="grid grid-cols-2 gap-4 mb-10">
          {[a, b].map((r) => (
            <div
              key={r.slug}
              className={`bg-white rounded-2xl shadow-card p-5 text-center border-2 transition-all ${r.slug === winner.slug ? 'border-gold-500' : 'border-transparent'}`}
            >
              {r.slug === winner.slug && (
                <span className="inline-block font-sans text-xs font-bold bg-gold-500 text-white px-3 py-0.5 rounded-full mb-3">
                  Higher Score
                </span>
              )}
              <Link
                href={`/resorts/${r.slug}`}
                className="font-serif text-base font-bold text-ocean-950 hover:text-ocean-700 transition-colors block leading-snug mb-1"
              >
                {r.name}
              </Link>
              <p className="font-sans text-xs text-ocean-400 mb-3">
                {r.country} · {r.type === 'adults-only' ? 'Adults Only' : 'Family'}
              </p>
              <div className={`font-serif text-4xl font-bold tabular-nums ${scoreColor(r.ratings.overall)}`}>{r.ratings.overall}</div>
              <div className="font-sans text-xs text-ocean-400 mt-0.5">{scoreLabel(r.ratings.overall)}</div>
              <a
                href={r.affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block font-sans text-sm font-medium bg-ocean-900 text-white rounded-xl py-2.5 hover:bg-ocean-950 transition-colors"
              >
                Check Prices →
              </a>
            </div>
          ))}
        </div>

        <div className="bg-white border border-ocean-100 rounded-2xl overflow-hidden shadow-card mb-10">
          <div className="grid grid-cols-[1fr_auto_1fr] bg-ocean-50 border-b border-ocean-100 px-5 py-3 text-xs font-sans font-semibold text-ocean-500 uppercase tracking-wider">
            <span className="truncate">{a.name.split(' ')[0]}</span>
            <span className="text-center px-4">Category</span>
            <span className="text-right truncate">{b.name.split(' ')[0]}</span>
          </div>

          {ORDERED_KEYS.map((key) => {
            const sA = a.ratings[key]
            const sB = b.ratings[key]
            if (sA === null && sB === null) return null
            const aWins = sA !== null && sB !== null && sA > sB
            const bWins = sA !== null && sB !== null && sB > sA

            return (
              <div key={key} className="grid grid-cols-[1fr_auto_1fr] items-center px-5 py-3.5 border-b border-ocean-50 last:border-0">
                <span className={`font-sans text-lg font-bold tabular-nums ${sA !== null ? scoreColor(sA) : 'text-gray-300'} ${aWins ? 'font-extrabold' : ''}`}>
                  {sA ?? '—'}
                  {aWins && <span className="ml-1 text-xs text-gold-500">▲</span>}
                </span>
                <span className="font-sans text-xs text-ocean-400 text-center px-3 whitespace-nowrap">
                  {RATING_LABELS[key]}
                </span>
                <span className={`font-sans text-lg font-bold tabular-nums text-right block ${sB !== null ? scoreColor(sB) : 'text-gray-300'} ${bWins ? 'font-extrabold' : ''}`}>
                  {bWins && <span className="mr-1 text-xs text-gold-500">▲</span>}
                  {sB ?? '—'}
                </span>
              </div>
            )
          })}
        </div>

        <div className="bg-ocean-950 rounded-2xl p-6 md:p-8 mb-10">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ocean-500 mb-2">Our Verdict</p>
          <h2 className="font-serif text-2xl font-bold text-white mb-3">{winner.name} wins overall</h2>
          <p className="font-sans text-ocean-300 leading-relaxed">
            {winner.name} scores {winner.ratings.overall}/10 overall vs {loser.ratings.overall}/10 for {loser.name}.{' '}
            {winner.ratings.value >= loser.ratings.value
              ? `It also leads on value (${winner.ratings.value} vs ${loser.ratings.value}), making it the stronger pick for most travelers.`
              : `However, ${loser.name} scores higher on value (${loser.ratings.value} vs ${winner.ratings.value}) — worth considering for budget-conscious travelers.`}
          </p>
        </div>

        <div className="bg-ocean-50 border border-ocean-100 rounded-2xl p-6">
          <h2 className="font-serif text-lg font-bold text-ocean-950 mb-4">More Comparisons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {resorts
              .filter((r) => r.slug !== a.slug && r.slug !== b.slug)
              .flatMap((r) => [
                { label: `${a.name} vs ${r.name}`, href: `/compare/${[a.slug, r.slug].sort().join('-vs-')}` },
                { label: `${b.name} vs ${r.name}`, href: `/compare/${[b.slug, r.slug].sort().join('-vs-')}` },
              ])
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-sans text-sm text-ocean-700 hover:text-ocean-950 hover:underline transition-colors"
                >
                  {link.label} →
                </Link>
              ))}
          </div>
        </div>
      </div>
    </>
  )
}
