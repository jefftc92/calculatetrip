import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllComparisonPairs, getResortBySlug, resorts } from '@/data/resorts'
import RatingBar from '@/components/RatingBar'
import Breadcrumb from '@/components/Breadcrumb'
import { RATING_LABELS, RATING_ORDER, SITE_URL, ratingColor, ratingLabel } from '@/lib/utils'

const ORDERED_KEYS = ['overall', 'food', 'beach', 'pool', 'atmosphere', 'location', 'room', 'value', 'cleanliness', 'service', 'sleepQuality']

export async function generateStaticParams() {
  return getAllComparisonPairs().map(({ a, b }) => ({
    pair: `${a.slug}-vs-${b.slug}`,
  }))
}

function parsePair(pair) {
  const vsIdx = pair.indexOf('-vs-')
  if (vsIdx === -1) return null
  const slugA = pair.slice(0, vsIdx)
  const slugB = pair.slice(vsIdx + 4)
  return { slugA, slugB }
}

export async function generateMetadata({ params }) {
  const parsed = parsePair(params.pair)
  if (!parsed) return {}
  const a = getResortBySlug(parsed.slugA)
  const b = getResortBySlug(parsed.slugB)
  if (!a || !b) return {}
  const title = `${a.name} vs ${b.name} 2025 | All-Inclusive Comparison`
  const description = `Head-to-head comparison of ${a.name} (${a.ratings.overall}/10) vs ${b.name} (${b.ratings.overall}/10). See which all-inclusive wins on food, beach, pool, value, service, and more.`
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/compare/${params.pair}/` },
    openGraph: { title, description, url: `${SITE_URL}/compare/${params.pair}/` },
  }
}

function Winner({ a, b, ratingKey }) {
  const scoreA = a.ratings[ratingKey]
  const scoreB = b.ratings[ratingKey]
  if (scoreA === null && scoreB === null) return null
  if (scoreA === null || scoreB === null) return null
  if (scoreA === scoreB) return <span className="text-xs text-gray-400">Tie</span>
  const winner = scoreA > scoreB ? a : b
  return (
    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
      {winner.name.split(' ')[0]} wins
    </span>
  )
}

export default function ComparePage({ params }) {
  const parsed = parsePair(params.pair)
  if (!parsed) notFound()
  const a = getResortBySlug(parsed.slugA)
  const b = getResortBySlug(parsed.slugB)
  if (!a || !b) notFound()

  const winner = a.ratings.overall >= b.ratings.overall ? a : b
  const loser  = a.ratings.overall >= b.ratings.overall ? b : a

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

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Breadcrumb crumbs={[
          { label: 'Home', href: '/' },
          { label: 'All Resorts', href: '/resorts/' },
          { label: `${a.name} vs ${b.name}` },
        ]} />

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          {a.name} vs {b.name}
        </h1>
        <p className="text-gray-500 mb-10">
          Side-by-side all-inclusive resort comparison — food, beach, pool, value, service, and more.
        </p>

        {/* Score header */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {[a, b].map((r) => (
            <div key={r.slug} className={`rounded-2xl border p-5 text-center ${r.slug === winner.slug ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}`}>
              {r.slug === winner.slug && (
                <span className="inline-block bg-green-600 text-white text-xs font-bold px-3 py-0.5 rounded-full mb-2">
                  Higher Overall Score
                </span>
              )}
              <Link href={`/resorts/${r.slug}/`} className="font-bold text-lg text-gray-900 hover:text-green-700 transition-colors block leading-tight">
                {r.name}
              </Link>
              <p className="text-sm text-gray-500 mb-3">{r.country} · {r.type === 'adults-only' ? 'Adults Only' : 'Family'}</p>
              <span className={`text-4xl font-extrabold ${ratingColor(r.ratings.overall)}`}>{r.ratings.overall}</span>
              <p className="text-xs text-gray-400 mt-0.5">{ratingLabel(r.ratings.overall)} · out of 10</p>
              <a
                href={r.affiliateLink}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="mt-4 block text-sm font-medium bg-green-700 text-white rounded-lg py-2 hover:bg-green-800 transition-colors"
              >
                Check Prices
              </a>
            </div>
          ))}
        </div>

        {/* Category comparison */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-10">
          <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600 px-4 py-3">
            <span>{a.name.split(' ')[0]}</span>
            <span className="text-center text-gray-400">Category</span>
            <span className="text-right">{b.name.split(' ')[0]}</span>
          </div>
          {ORDERED_KEYS.map((key) => {
            const scoreA = a.ratings[key]
            const scoreB = b.ratings[key]
            if (scoreA === null && scoreB === null) return null
            return (
              <div key={key} className="grid grid-cols-3 items-center px-4 py-3 border-b border-gray-100 last:border-0">
                <span className={`text-lg font-bold ${scoreA !== null ? ratingColor(scoreA) : 'text-gray-300'}`}>
                  {scoreA ?? 'N/A'}
                </span>
                <span className="text-center text-sm text-gray-500">{RATING_LABELS[key]}</span>
                <span className={`text-lg font-bold text-right block ${scoreB !== null ? ratingColor(scoreB) : 'text-gray-300'}`}>
                  {scoreB ?? 'N/A'}
                </span>
              </div>
            )
          })}
        </div>

        {/* Verdict */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Our Verdict</h2>
          <p className="text-gray-700 leading-relaxed">
            {winner.name} edges ahead with an overall score of {winner.ratings.overall}/10 vs {loser.ratings.overall}/10 for {loser.name}.{' '}
            {winner.ratings.value >= loser.ratings.value
              ? `${winner.name} also scores higher on value (${winner.ratings.value} vs ${loser.ratings.value}), making it the stronger choice for most travelers.`
              : `However, ${loser.name} scores higher on value (${loser.ratings.value} vs ${winner.ratings.value}), so budget-conscious travelers may prefer it.`
            }
          </p>
        </div>

        {/* Other comparisons */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
          <h2 className="text-base font-bold text-gray-900 mb-3">More Comparisons</h2>
          <div className="flex flex-col gap-1.5">
            {resorts
              .filter((r) => r.slug !== a.slug && r.slug !== b.slug)
              .flatMap((r) => [
                { label: `${a.name} vs ${r.name}`, href: `/compare/${[a.slug, r.slug].sort().join('-vs-')}/` },
                { label: `${b.name} vs ${r.name}`, href: `/compare/${[b.slug, r.slug].sort().join('-vs-')}/` },
              ])
              .map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-green-700 hover:underline">
                  {link.label} &rarr;
                </Link>
              ))}
          </div>
        </div>
      </div>
    </>
  )
}
