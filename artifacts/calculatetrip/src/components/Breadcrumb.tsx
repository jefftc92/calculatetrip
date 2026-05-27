import { Link } from 'wouter'

interface Crumb {
  label: string
  href?: string
}

interface Props {
  crumbs: Crumb[]
  dark?: boolean
}

export default function Breadcrumb({ crumbs, dark }: Props) {
  return (
    <nav className="flex items-center gap-1.5 mb-5 flex-wrap">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <span key={i} className="flex items-center gap-1.5">
            {crumb.href && !isLast ? (
              <Link
                href={crumb.href}
                className={`font-sans text-xs hover:underline transition-colors ${dark ? 'text-ocean-400 hover:text-ocean-200' : 'text-ocean-500 hover:text-ocean-800'}`}
              >
                {crumb.label}
              </Link>
            ) : (
              <span className={`font-sans text-xs ${dark ? 'text-ocean-600' : 'text-ocean-400'}`}>
                {crumb.label}
              </span>
            )}
            {!isLast && (
              <span className={`text-xs ${dark ? 'text-ocean-700' : 'text-ocean-300'}`}>›</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
