import Link from 'next/link'
import { SITE_URL } from '@/lib/utils'

export default function Breadcrumb({ crumbs }) {
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
        <ol className="flex flex-wrap items-center gap-1.5">
          {crumbs.map((c, i) => (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-gray-300">/</span>}
              {c.href ? (
                <Link href={c.href} className="hover:text-green-700 transition-colors">
                  {c.label}
                </Link>
              ) : (
                <span className="text-gray-800 font-medium">{c.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
