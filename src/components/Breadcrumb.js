import Link from 'next/link'
import { SITE_URL } from '@/lib/utils'

export default function Breadcrumb({ crumbs, dark = false }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: c.href ? `${SITE_URL}${c.href}` : undefined,
    })),
  }

  const base  = dark ? 'text-ocean-500' : 'text-ocean-400'
  const link  = dark ? 'hover:text-ocean-200' : 'hover:text-ocean-700'
  const cur   = dark ? 'text-ocean-300' : 'text-ocean-700'
  const sep   = dark ? 'text-ocean-700' : 'text-ocean-200'

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className={`font-sans text-xs ${base} mb-4`}>
        <ol className="flex flex-wrap items-center gap-1.5">
          {crumbs.map((c, i) => (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className={sep}>/</span>}
              {c.href ? (
                <Link href={c.href} className={`transition-colors ${link}`}>{c.label}</Link>
              ) : (
                <span className={`font-medium ${cur}`}>{c.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
