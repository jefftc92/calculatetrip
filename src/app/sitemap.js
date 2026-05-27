import { resorts, getAllCountries, getAllComparisonPairs } from '@/data/resorts'
import { SITE_URL } from '@/lib/utils'

export default function sitemap() {
  const now = new Date()

  const staticPages = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/resorts/`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/best-adults-only-all-inclusive-resorts/`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/best-family-all-inclusive-resorts/`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/best-value-all-inclusive-resorts/`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/best-beach-all-inclusive-resorts/`, changeFrequency: 'weekly', priority: 0.8 },
  ].map((p) => ({ ...p, lastModified: now }))

  const resortPages = resorts.map((r) => ({
    url: `${SITE_URL}/resorts/${r.slug}/`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const countryPages = getAllCountries().map((c) => ({
    url: `${SITE_URL}/destination/${c.slug}/`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const comparisonPages = getAllComparisonPairs().map(({ a, b }) => ({
    url: `${SITE_URL}/compare/${a.slug}-vs-${b.slug}/`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticPages, ...resortPages, ...countryPages, ...comparisonPages]
}
