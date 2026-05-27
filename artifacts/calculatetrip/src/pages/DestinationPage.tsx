import { useParams, Redirect } from 'wouter'
import ResortCard from '../components/ResortCard'
import Breadcrumb from '../components/Breadcrumb'
import { getResortsByCountry } from '../data/resorts'
import { countryFromSlug } from '../lib/utils'

export default function DestinationPage() {
  const { country: countrySlug } = useParams<{ country: string }>()
  const countryName = countryFromSlug(countrySlug)
  const resorts = getResortsByCountry(countrySlug).sort((a, b) => b.ratings.overall - a.ratings.overall)

  if (!resorts.length) return <Redirect to="/resorts" />

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Breadcrumb
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Destinations', href: '/resorts' },
          { label: countryName },
        ]}
      />

      <h1 className="font-serif text-3xl font-extrabold text-ocean-950 mb-2">
        Best All-Inclusive Resorts in {countryName} 2025
      </h1>
      <p className="font-sans text-ocean-500 mb-10 max-w-2xl">
        {resorts.length} all-inclusive {resorts.length === 1 ? 'resort' : 'resorts'} in {countryName}, independently rated across food, beach, pool, service, and value.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resorts.map((r, i) => (
          <ResortCard key={r.slug} resort={r} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}
