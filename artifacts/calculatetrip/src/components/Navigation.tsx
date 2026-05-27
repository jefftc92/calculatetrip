import { useState } from 'react'
import { Link } from 'wouter'

export default function Navigation() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-ocean-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-serif font-bold text-lg text-white tracking-tight">CalculateTrip</span>
          <span className="hidden sm:inline font-sans text-xs font-semibold uppercase tracking-widest text-ocean-500">
            All-Inclusive Guide
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: 'All Resorts', href: '/resorts' },
            { label: 'Adults Only', href: '/best-adults-only-all-inclusive-resorts' },
            { label: 'Family', href: '/best-family-all-inclusive-resorts' },
            { label: 'Best Value', href: '/best-value-all-inclusive-resorts' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-sans text-sm text-ocean-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-ocean-800 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/compare"
            className="font-sans text-sm font-bold px-4 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-600 text-white transition-all ml-1"
          >
            Compare Resorts
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-ocean-300 hover:text-white p-2"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-ocean-800 px-4 py-3 flex flex-col gap-1">
          {[
            { label: 'All Resorts', href: '/resorts' },
            { label: 'Adults Only', href: '/best-adults-only-all-inclusive-resorts' },
            { label: 'Family', href: '/best-family-all-inclusive-resorts' },
            { label: 'Best Value', href: '/best-value-all-inclusive-resorts' },
            { label: 'Best Beach', href: '/best-beach-all-inclusive-resorts' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-sans text-sm text-ocean-300 hover:text-white py-2 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
