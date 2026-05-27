import ResortCard from '../components/ResortCard'
import Breadcrumb from '../components/Breadcrumb'
import { resorts } from '../data/resorts'

const sorted = [...resorts].sort((a, b) => b.ratings.value - a.ratings.value)

export default function BestValuePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Best Value Resorts' }]} />

      <h1 className="font-serif text-3xl font-extrabold text-ocean-950 mb-2">
        Best Value All-Inclusive Resorts 2025
      </h1>
      <p className="font-sans text-ocean-500 mb-4 max-w-2xl">
        Ranked by independent value-for-money score. These resorts deliver exceptional quality without the luxury markup.
      </p>
      <div className="bg-gold-300/20 border border-gold-300/40 rounded-xl px-5 py-4 mb-10 text-sm font-sans text-gold-700">
        <strong>How we score value:</strong> Value ratings reflect the balance between overall quality and price. A high value score means guests consistently feel they got more than they paid for.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sorted.map((r, i) => (
          <ResortCard key={r.slug} resort={r} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}
