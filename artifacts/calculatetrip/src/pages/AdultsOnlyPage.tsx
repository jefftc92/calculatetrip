import ResortCard from '../components/ResortCard'
import Breadcrumb from '../components/Breadcrumb'
import { getResortsByType } from '../data/resorts'

const resorts = getResortsByType('adults-only').sort((a, b) => b.ratings.overall - a.ratings.overall)

export default function AdultsOnlyPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Adults-Only Resorts' }]} />

      <h1 className="font-serif text-3xl font-extrabold text-ocean-950 mb-2">
        Best Adults-Only All-Inclusive Resorts 2025
      </h1>
      <p className="font-sans text-ocean-500 mb-4 max-w-2xl">
        Rated and reviewed for couples and solo travelers seeking a peaceful, adult atmosphere. All scored across food, beach, pool, service, value, and more.
      </p>
      <div className="bg-ocean-50 border border-ocean-100 rounded-xl px-5 py-4 mb-10 text-sm font-sans text-ocean-700">
        <strong>What is an adults-only all-inclusive?</strong> These resorts restrict guests to ages 16+ or 18+, creating a quieter, more romantic atmosphere typically preferred by couples. All food, drinks, and most activities are included in one upfront price.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resorts.map((r, i) => (
          <ResortCard key={r.slug} resort={r} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}
