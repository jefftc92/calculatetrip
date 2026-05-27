import ResortCard from '../components/ResortCard'
import Breadcrumb from '../components/Breadcrumb'
import { resorts } from '../data/resorts'

const sorted = [...resorts]
  .filter((r) => r.ratings.beach !== null)
  .sort((a, b) => (b.ratings.beach as number) - (a.ratings.beach as number))

export default function BestBeachPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Best Beach Resorts' }]} />

      <h1 className="font-serif text-3xl font-extrabold text-ocean-950 mb-2">
        Best Beach All-Inclusive Resorts 2025
      </h1>
      <p className="font-sans text-ocean-500 mb-10 max-w-2xl">
        Ranked by independent beach quality score — covering sand, water clarity, privacy, and access.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sorted.map((r, i) => (
          <ResortCard key={r.slug} resort={r} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}
