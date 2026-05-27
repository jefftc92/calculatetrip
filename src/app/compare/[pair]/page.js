import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllComparisonPairs, getResortBySlug, resorts } from '@/data/resorts'
import { RATING_LABELS, SITE_URL } from '@/lib/utils'
import { scoreColor, scoreLabel } from '@/components/RatingBar'

const RATING_ROWS = [
  { key: 'overall',      label: 'Overall Score' },
  { key: 'food',         label: 'Food & Dining' },
  { key: 'beach',        label: 'Beach' },
  { key: 'pool',         label: 'Pool' },
  { key: 'atmosphere',   label: 'Atmosphere' },
  { key: 'location',     label: 'Location' },
  { key: 'room',         label: 'Rooms' },
  { key: 'value',        label: 'Value for Money' },
  { key: 'cleanliness',  label: 'Cleanliness' },
  { key: 'service',      label: 'Service' },
  { key: 'sleepQuality', label: 'Sleep Quality' },
]

// All amenities that appear across all resorts
const ALL_AMENITIES = [
  'Beach', 'Pool', 'Heated Pool', 'Adult Pool', 'Spa', 'Gym',
  'Diving', 'Snorkelling', 'Fishing', 'Hiking', 'Yoga Classes',
  'Horseback Riding', 'Watersports Equipment Rentals', 'Bicycles Available',
  'Tennis', 'Room Service', 'Buffet', 'Evening Entertainment', 'Wi-Fi Free',
]

export async function generateStaticParams() {
  return getAllComparisonPairs().map(({ a, b }) => ({ pair: `${a.slug}-vs-${b.slug}` }))
}

function parsePair(pair) {
  const vsIdx = pair.indexOf('-vs-')
  if (vsIdx === -1) return null
  return { slugA: pair.slice(0, vsIdx), slugB: pair.slice(vsIdx + 4) }
}

export async function generateMetadata({ params }) {
  const parsed = parsePair(params.pair)
  if (!parsed) return {}
  const a = getResortBySlug(parsed.slugA)
  const b = getResortBySlug(parsed.slugB)
  if (!a || !b) return {}
  const title = `${a.name} vs ${b.name} 2025 | All-Inclusive Resort Comparison`
  const description = `Detailed comparison of ${a.name} (${a.ratings.overall}/10) vs ${b.name} (${b.ratings.overall}/10). Head-to-head ratings for food, beach, pool, value, service, and amenities.`
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/compare/${params.pair}/` },
    openGraph: { title, description, url: `${SITE_URL}/compare/${params.pair}/` },
  }
}

function Check() {
  return (
    <svg className="w-5 h-5 text-emerald-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function Dash() {
  return <span className="block text-center text-gray-300 text-lg leading-none">—</span>
}

export default function ComparePage({ params }) {
  const parsed = parsePair(params.pair)
  if (!parsed) notFound()
  const a = getResortBySlug(parsed.slugA)
  const b = getResortBySlug(parsed.slugB)
  if (!a || !b) notFound()

  const aWins = a.ratings.overall >= b.ratings.overall
  const winner = aWins ? a : b
  const loser  = aWins ? b : a

  // Only show amenities that at least one resort has
  const relevantAmenities = ALL_AMENITIES.filter(
    (am) => a.amenities.includes(am) || b.amenities.includes(am)
  )

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${a.name} vs ${b.name} — All-Inclusive Comparison 2025`,
    url: `${SITE_URL}/compare/${params.pair}/`,
    description: `Side-by-side comparison of ${a.name} and ${b.name} all-inclusive resorts.`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Gradient header ── */}
      <div className="bg-gradient-to-br from-ocean-950 via-ocean-900 to-ocean-800 px-4 sm:px-6 pt-8 pb-16">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link href="/resorts/" className="inline-flex items-center gap-1.5 font-sans text-xs text-ocean-400 hover:text-ocean-200 transition-colors mb-8">
            ← All Resorts
          </Link>

          {/* Page label */}
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-ocean-500 mb-2 text-center">
            Resort Comparison · 2025
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white text-center mb-10 leading-tight">
            {a.name}<br />
            <span className="text-ocean-500 font-sans font-normal text-xl">vs</span><br />
            {b.name}
          </h1>

          {/* Resort header cards */}
          <div className="grid grid-cols-2 gap-3">
            {[a, b].map((r) => {
              const isWinner = r.slug === winner.slug
              return (
                <div
                  key={r.slug}
                  className={`rounded-2xl p-4 sm:p-5 text-center border ${isWinner ? 'bg-white/10 border-gold-500/60' : 'bg-white/5 border-white/10'}`}
                >
                  {isWinner && (
                    <span className="inline-block font-sans text-[10px] font-extrabold uppercase tracking-widest bg-gold-500 text-white px-2.5 py-0.5 rounded-full mb-3">
                      Recommended
                    </span>
                  )}
                  <Link href={`/resorts/${r.slug}/`} className="font-serif text-base sm:text-lg font-bold text-white hover:text-gold-300 transition-colors block leading-snug mb-1">
                    {r.name}
                  </Link>
                  <p className="font-sans text-xs text-ocean-400 mb-3">
                    {r.country} · {r.type === 'adults-only' ? 'Adults Only' : 'Family'}
                  </p>
                  <div className={`font-serif text-4xl font-bold tabular-nums ${scoreColor(r.ratings.overall)}`}>
                    {r.ratings.overall}
                  </div>
                  <div className="font-sans text-xs text-ocean-400 mt-0.5">{scoreLabel(r.ratings.overall)}</div>
                  <a
                    href={r.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className={`mt-4 block font-sans text-sm font-semibold rounded-xl py-2.5 transition-colors ${isWinner ? 'bg-gold-500 hover:bg-gold-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                  >
                    Check Prices →
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Ratings table ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-6 pb-16">

        <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-6 border border-ocean-100">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_100px_100px] bg-ocean-950 text-white text-xs font-sans font-bold uppercase tracking-wider">
            <div className="px-4 sm:px-5 py-3.5">Category</div>
            <div className="py-3.5 text-center truncate px-1 text-ocean-300">{a.name.split(' ')[0]}</div>
            <div className="py-3.5 text-center truncate px-1 text-ocean-300">{b.name.split(' ')[0]}</div>
          </div>

          {/* Rating rows */}
          {RATING_ROWS.map(({ key, label }, i) => {
            const sA = a.ratings[key]
            const sB = b.ratings[key]
            if (sA === null && sB === null) return null
            const aRowWins = sA !== null && sB !== null && sA > sB
            const bRowWins = sA !== null && sB !== null && sB > sA

            return (
              <div
                key={key}
                className={`grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_100px_100px] border-b border-ocean-50 last:border-0 ${i % 2 === 0 ? 'bg-ocean-50/40' : 'bg-white'}`}
              >
                {/* Label */}
                <div className="px-4 sm:px-5 py-3.5 font-sans text-sm text-ocean-700 font-medium flex items-center">
                  {label}
                  {key === 'overall' && (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-ocean-400 bg-ocean-100 px-1.5 py-0.5 rounded">Overall</span>
                  )}
                </div>

                {/* Score A */}
                <div className={`py-3.5 flex items-center justify-center ${aRowWins ? 'bg-emerald-50' : ''}`}>
                  {sA !== null ? (
                    <div className="text-center">
                      <span className={`font-sans text-base font-bold tabular-nums ${scoreColor(sA)} ${aRowWins ? 'text-lg' : ''}`}>
                        {sA}
                      </span>
                      {aRowWins && <div className="text-[10px] text-emerald-500 font-bold mt-0.5">▲ wins</div>}
                    </div>
                  ) : <Dash />}
                </div>

                {/* Score B */}
                <div className={`py-3.5 flex items-center justify-center ${bRowWins ? 'bg-emerald-50' : ''}`}>
                  {sB !== null ? (
                    <div className="text-center">
                      <span className={`font-sans text-base font-bold tabular-nums ${scoreColor(sB)} ${bRowWins ? 'text-lg' : ''}`}>
                        {sB}
                      </span>
                      {bRowWins && <div className="text-[10px] text-emerald-500 font-bold mt-0.5">▲ wins</div>}
                    </div>
                  ) : <Dash />}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Amenities table ── */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-6 border border-ocean-100">
          <div className="grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_100px_100px] bg-ocean-950 text-white text-xs font-sans font-bold uppercase tracking-wider">
            <div className="px-4 sm:px-5 py-3.5">Amenity</div>
            <div className="py-3.5 text-center truncate px-1 text-ocean-300">{a.name.split(' ')[0]}</div>
            <div className="py-3.5 text-center truncate px-1 text-ocean-300">{b.name.split(' ')[0]}</div>
          </div>

          {relevantAmenities.map((am, i) => (
            <div
              key={am}
              className={`grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_100px_100px] border-b border-ocean-50 last:border-0 ${i % 2 === 0 ? 'bg-ocean-50/40' : 'bg-white'}`}
            >
              <div className="px-4 sm:px-5 py-3 font-sans text-sm text-ocean-700">{am}</div>
              <div className="py-3 flex items-center justify-center">
                {a.amenities.includes(am) ? <Check /> : <Dash />}
              </div>
              <div className="py-3 flex items-center justify-center">
                {b.amenities.includes(am) ? <Check /> : <Dash />}
              </div>
            </div>
          ))}
        </div>

        {/* ── Verdict ── */}
        <div className="bg-ocean-950 rounded-2xl p-6 sm:p-8 mb-8">
          <p className="font-sans text-xs font-bold uppercase tracking-widest text-ocean-500 mb-1">Our Verdict</p>
          <h2 className="font-serif text-2xl font-bold text-white mb-3">
            {winner.name} comes out ahead
          </h2>
          <p className="font-sans text-ocean-300 leading-relaxed text-sm">
            {winner.name} scores {winner.ratings.overall}/10 overall vs {loser.ratings.overall}/10 for {loser.name}.{' '}
            {winner.ratings.value >= loser.ratings.value
              ? `It also leads on value (${winner.ratings.value} vs ${loser.ratings.value}), making it the stronger pick for most travelers.`
              : `However, ${loser.name} scores higher on value (${loser.ratings.value} vs ${winner.ratings.value}), so budget-focused travelers may prefer it.`
            }
          </p>
        </div>

        {/* ── More comparisons ── */}
        <div className="bg-white border border-ocean-100 rounded-2xl p-5 sm:p-6 shadow-card">
          <h2 className="font-serif text-lg font-bold text-ocean-950 mb-4">More Comparisons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {resorts
              .filter((r) => r.slug !== a.slug && r.slug !== b.slug)
              .flatMap((r) => [
                { label: `${a.name} vs ${r.name}`, href: `/compare/${[a.slug, r.slug].sort().join('-vs-')}/` },
                { label: `${b.name} vs ${r.name}`, href: `/compare/${[b.slug, r.slug].sort().join('-vs-')}/` },
              ])
              .map((link) => (
                <Link key={link.href} href={link.href} className="font-sans text-sm text-ocean-700 hover:text-ocean-950 hover:underline transition-colors py-0.5">
                  {link.label} →
                </Link>
              ))}
          </div>
        </div>
      </div>
    </>
  )
}
