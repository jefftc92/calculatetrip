import Link from 'next/link'
import ResortCard from '@/components/ResortCard'
import { resorts, getResortsByType, getTopByRating } from '@/data/resorts'
import { SITE_NAME, SITE_URL } from '@/lib/utils'

export const metadata = {
  title: 'Best All-Inclusive Resorts 2025 | Independent Ratings & Reviews',
  description: 'We rate the best all-inclusive resorts across the Caribbean and Latin America by food, beach, pool, value, service, and more. Find your perfect resort.',
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    title: 'Best All-Inclusive Resorts 2025 | Independent Ratings & Reviews',
    description: 'Independently rated all-inclusive resorts ranked by food, beach, pool, value, and service.',
    url: `${SITE_URL}/`,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: 'Independent ratings and reviews for the best all-inclusive resorts.',
}

const categories = [
  {
    label: 'Adults-Only Resorts',
    description: 'Romantic getaways and solo retreats with a 16+ or 18+ policy.',
    href: '/best-adults-only-all-inclusive-resorts/',
    emoji: '🌙',
  },
  {
    label: 'Family Resorts',
    description: 'All-inclusives with activities, pools, and amenities for every age.',
    href: '/best-family-all-inclusive-resorts/',
    emoji: '👨‍👩‍👧',
  },
  {
    label: 'Best Value',
    description: 'Top-rated resorts where your money goes furthest.',
    href: '/best-value-all-inclusive-resorts/',
    emoji: '💰',
  },
  {
    label: 'Beach Resorts',
    description: 'All-inclusives with exceptional private or direct beach access.',
    href: '/best-beach-all-inclusive-resorts/',
    emoji: '🏖️',
  },
]

const destinations = [
  { name: 'Panama', slug: 'panama', count: 2 },
  { name: 'Belize', slug: 'belize', count: 1 },
  { name: 'Saint Lucia', slug: 'saint-lucia', count: 1 },
  { name: 'British Virgin Islands', slug: 'british-virgin-islands', count: 1 },
]

const topResorts = [...resorts].sort((a, b) => b.ratings.overall - a.ratings.overall).slice(0, 3)

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-800 to-green-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Find Your Perfect All-Inclusive Resort
          </h1>
          <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto mb-8">
            Independent ratings across food, beach, pool, value, and service — so you can book with confidence.
          </p>
          <Link
            href="/resorts/"
            className="inline-block bg-white text-green-800 font-bold px-8 py-3.5 rounded-full text-base hover:bg-green-50 transition-colors shadow-lg"
          >
            Browse All Resorts
          </Link>
        </div>
      </section>

      {/* Top Rated */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Top-Rated All-Inclusive Resorts</h2>
            <p className="text-gray-500 mt-1">The highest-scoring resorts across all categories</p>
          </div>
          <Link href="/resorts/" className="text-sm font-medium text-green-700 hover:underline hidden sm:block">
            View all &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topResorts.map((r, i) => (
            <ResortCard key={r.slug} resort={r} rank={i + 1} />
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link href="/resorts/" className="text-sm font-medium text-green-700 hover:underline">
            View all resorts &rarr;
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse by Category</h2>
          <p className="text-gray-500 mb-8">Find the right resort for your travel style</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="group bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-200 rounded-xl p-5 transition-all"
              >
                <p className="text-3xl mb-3">{c.emoji}</p>
                <p className="font-semibold text-gray-900 group-hover:text-green-800 mb-1">{c.label}</p>
                <p className="text-sm text-gray-500">{c.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse by Destination</h2>
        <p className="text-gray-500 mb-8">All-inclusive resorts across the Caribbean and Latin America</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {destinations.map((d) => (
            <Link
              key={d.slug}
              href={`/destination/${d.slug}/`}
              className="group bg-white border border-gray-200 hover:border-green-300 rounded-xl p-5 text-center transition-all hover:shadow-md"
            >
              <p className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">{d.name}</p>
              <p className="text-sm text-gray-400 mt-1">{d.count} {d.count === 1 ? 'resort' : 'resorts'}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust signals */}
      <section className="bg-green-900 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">How We Rate Resorts</h2>
          <p className="text-green-200 max-w-2xl mx-auto text-base leading-relaxed">
            Every resort on CalculateTrip is scored across eleven dimensions — food, beach, pool, atmosphere, location, rooms, value, cleanliness, service, and sleep quality. Ratings are independently researched and updated regularly so you can trust what you read.
          </p>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: '11 rating categories', sub: 'per resort' },
              { label: 'Independent', sub: 'no paid placements' },
              { label: 'Affiliate links', sub: 'at no cost to you' },
              { label: 'Updated 2025', sub: 'current data' },
            ].map((s) => (
              <div key={s.label} className="bg-green-800 rounded-xl px-4 py-5">
                <p className="font-bold text-lg">{s.label}</p>
                <p className="text-green-300 text-sm mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
