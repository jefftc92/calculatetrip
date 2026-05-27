import { notFound } from 'next/navigation'
import Link from 'next/link'
import { resorts, getResortBySlug } from '@/data/resorts'
import RatingBar from '@/components/RatingBar'
import ResortCard from '@/components/ResortCard'
import Breadcrumb from '@/components/Breadcrumb'
import { RATING_LABELS, SITE_URL, ratingColor, ratingLabel } from '@/lib/utils'

export async function generateStaticParams() {
  return resorts.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }) {
  const resort = getResortBySlug(params.slug)
  if (!resort) return {}
  const title = `${resort.name} Review 2025 | All-Inclusive Rating & Guide`
  const description = `Independent review of ${resort.name} in ${resort.country}. Rated ${resort.ratings.overall}/10 overall. See scores for food, beach, pool, rooms, value, service, and more.`
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/resorts/${resort.slug}/` },
    openGraph: { title, description, url: `${SITE_URL}/resorts/${resort.slug}/` },
  }
}

const RATING_ORDER = ['overall', 'food', 'beach', 'pool', 'atmosphere', 'location', 'room', 'value', 'cleanliness', 'service', 'sleepQuality']

export default function ResortPage({ params }) {
  const resort = getResortBySlug(params.slug)
  if (!resort) notFound()

  const { name, country, type, area, airport, ageNote, amenities, description, ratings, affiliateLink, slug } = resort

  const related = resorts.filter((r) => r.slug !== slug && (r.country === resort.country || r.type === resort.type)).slice(0, 2)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name,
    description,
    address: {
      '@type': 'PostalAddress',
      addressCountry: country,
      addressLocality: area,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratings.overall,
      bestRating: 10,
      worstRating: 0,
      ratingCount: 100,
    },
    amenityFeature: amenities.map((a) => ({ '@type': 'LocationFeatureSpecification', name: a, value: true })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Breadcrumb crumbs={[
          { label: 'Home', href: '/' },
          { label: 'All Resorts', href: '/resorts/' },
          { label: name },
        ]} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{name}</h1>
            <p className="text-gray-500 mt-1">{area}, {country} &middot; {type === 'adults-only' ? 'Adults Only' : 'Family'}{ageNote ? ` (${ageNote})` : ''}</p>
            <p className="text-sm text-gray-400 mt-0.5">Nearest airport: {airport}</p>
          </div>
          <div className="shrink-0 text-right">
            <span className={`text-5xl font-extrabold ${ratingColor(ratings.overall)}`}>{ratings.overall}</span>
            <p className="text-sm text-gray-500 mt-0.5">{ratingLabel(ratings.overall)} · out of 10</p>
          </div>
        </div>

        {/* Book CTA */}
        <a
          href={affiliateLink}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block w-full text-center bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-xl text-base transition-colors mb-10 shadow-md"
        >
          Check Availability &amp; Prices &rarr;
        </a>

        {/* Description */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">{name} — Overview</h2>
          <p className="text-gray-700 leading-relaxed">{description}</p>
        </section>

        {/* Ratings */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Rating Breakdown</h2>
          <div className="space-y-4">
            {RATING_ORDER.map((key) => (
              ratings[key] !== null && (
                <RatingBar key={key} label={RATING_LABELS[key]} score={ratings[key]} />
              )
            ))}
          </div>
        </section>

        {/* Amenities */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities at {name}</h2>
          <div className="flex flex-wrap gap-2">
            {amenities.map((a) => (
              <span key={a} className="bg-green-50 border border-green-100 text-green-800 text-sm rounded-full px-4 py-1.5 font-medium">
                {a}
              </span>
            ))}
          </div>
        </section>

        {/* Comparison links */}
        <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Compare {name}</h2>
          <div className="flex flex-col gap-2">
            {resorts.filter((r) => r.slug !== slug).map((other) => (
              <Link
                key={other.slug}
                href={`/compare/${[slug, other.slug].sort().join('-vs-')}/`}
                className="text-sm text-green-700 hover:underline"
              >
                {name} vs {other.name} &rarr;
              </Link>
            ))}
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-5">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {related.map((r) => <ResortCard key={r.slug} resort={r} />)}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
