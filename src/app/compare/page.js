import Link from 'next/link'
import { resorts, getAllComparisonPairs } from '@/data/resorts'
import { SITE_URL } from '@/lib/utils'
import ComparePicker from '@/components/ComparePicker'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata = {
  title: 'Compare All-Inclusive Resorts 2025 | Side-by-Side',
  description: 'Compare any two all-inclusive resorts side by side. Ratings for food, beach, pool, value, service, amenities, and more — all in one place.',
  alternates: { canonical: `${SITE_URL}/compare/` },
  openGraph: {
    title: 'Compare All-Inclusive Resorts 2025 | Side-by-Side',
    description: 'Side-by-side all-inclusive resort comparisons across food, beach, pool, value, and service.',
    url: `${SITE_URL}/compare/`,
  },
}

const pairs = getAllComparisonPairs()

const FAQS = [
  {
    q: 'How do I use the compare tool?',
    a: 'Click "Add Resort" to open the selection panel and pick your first resort. The tool will automatically prompt you to add a second. Once both slots are filled, click "Compare Resorts" to see a full side-by-side breakdown of scores, amenities, and our editorial verdict.',
  },
  {
    q: 'How many resorts can I compare at once?',
    a: 'The tool currently supports head-to-head comparisons between two resorts, covering eleven rating categories plus a full amenities checklist.',
  },
  {
    q: 'Where do the scores come from?',
    a: 'Scores are aggregated from verified guest reviews on major booking platforms, weighted for recency and review volume. Each category — food, beach, pool, atmosphere, location, rooms, value, cleanliness, service, and sleep quality — is scored independently out of 10.',
  },
  {
    q: 'Are these resorts truly all-inclusive?',
    a: 'Yes — every resort in our database is verified all-inclusive. Core inclusions (accommodation, meals, drinks, core activities) are confirmed before listing. Some premium extras like spa treatments or specialty restaurants may carry additional charges. Always verify current inclusions with the resort before booking.',
  },
  {
    q: 'How current is the data?',
    a: 'Resort scores are reviewed continuously and reflect the most current available guest review aggregates. Amenity and property details are verified at listing and updated when changes are reported.',
  },
]

export default function CompareHubPage() {
  return (
    <>
      {/* Header */}
      <div className="bg-ocean-950 pt-8 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <Breadcrumb dark crumbs={[{ label: 'Home', href: '/' }, { label: 'Compare Resorts' }]} />
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mt-4">Compare Resorts</h1>
          <p className="font-sans text-ocean-400 mt-2 max-w-lg text-sm">
            Side-by-side ratings, amenities, and our editorial verdict for any two all-inclusive resorts.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 pb-16">

        {/* Picker card */}
        <div className="bg-white border border-ocean-100 rounded-2xl shadow-card p-6 mb-12">
          <p className="font-sans text-sm text-ocean-500 mb-5">
            Start your comparison by adding a resort →
          </p>
          <ComparePicker resorts={resorts} />
        </div>

        {/* Popular comparisons — two column link list */}
        <h2 className="font-serif text-2xl font-bold text-ocean-950 mb-5">Popular Comparisons</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 mb-14">
          {pairs.map(({ a, b }) => {
            const slug = `${a.slug}-vs-${b.slug}`
            return (
              <Link
                key={slug}
                href={`/compare/${slug}/`}
                className="flex items-center gap-2.5 py-3 border-b border-ocean-100 font-sans text-sm text-ocean-700 hover:text-ocean-950 group transition-colors"
              >
                <span className="text-ocean-400 group-hover:text-ocean-600 transition-colors shrink-0">→</span>
                <span>{a.name} vs {b.name}</span>
              </Link>
            )
          })}
        </div>

        {/* About */}
        <div className="mb-12 max-w-2xl">
          <h2 className="font-serif text-2xl font-bold text-ocean-950 mb-3">About Our Compare Tool</h2>
          <p className="font-sans text-sm text-ocean-600 leading-relaxed">
            Our team aggregates verified guest reviews from major booking platforms to score every resort across eleven categories: food, beach, pool, atmosphere, location, rooms, value, cleanliness, service, and sleep quality. The overall score is a weighted composite designed to reflect the full experience — not just the highlights. Use the comparison tool to see a full side-by-side breakdown of scores, amenities, and our editorial verdict for any two resorts in our database. Affiliate links are disclosed and never influence ratings.
          </p>
        </div>

        {/* FAQs */}
        <h2 className="font-serif text-2xl font-bold text-ocean-950 mb-2">FAQs</h2>
        <div className="divide-y divide-ocean-100">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group py-4">
              <summary className="flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none">
                <span className="font-sans text-sm font-semibold text-ocean-900 pr-4">{q}</span>
                <span className="text-ocean-400 text-sm shrink-0 group-open:rotate-180 transition-transform inline-block">▾</span>
              </summary>
              <p className="font-sans text-sm text-ocean-600 leading-relaxed mt-2 max-w-2xl">{a}</p>
            </details>
          ))}
        </div>

      </div>
    </>
  )
}
