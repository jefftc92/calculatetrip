import ResortCard from '../components/ResortCard'
import Breadcrumb from '../components/Breadcrumb'
import { getResortsByType } from '../data/resorts'

const resorts = getResortsByType('family').sort((a, b) => b.ratings.overall - a.ratings.overall)

export default function FamilyPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Family Resorts' }]} />

      <h1 className="font-serif text-3xl font-extrabold text-ocean-950 mb-2">
        Best Family All-Inclusive Resorts 2025
      </h1>
      <p className="font-sans text-ocean-500 mb-4 max-w-2xl">
        All-inclusive resorts that welcome every age group, rated across pools, food, beach, atmosphere, and value.
      </p>
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 mb-10 text-sm font-sans text-amber-800">
        <strong>Why choose a family all-inclusive?</strong> One price covers all meals, drinks, snacks, and most activities for the whole family — no surprise bills. The best family resorts also offer multiple pool areas and a range of activities for all ages.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resorts.map((r, i) => (
          <ResortCard key={r.slug} resort={r} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}
