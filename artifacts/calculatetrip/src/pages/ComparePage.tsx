import { Link, useParams, Redirect } from 'wouter'
import { resorts, getResortBySlug, getAllComparisonPairs, type Resort } from '../data/resorts'
import { scoreColor, scoreLabel } from '../components/RatingBar'

const RATING_ROWS = [
  { key: 'overall',      label: 'Overall Score' },
  { key: 'food',         label: 'Food & Dining' },
  { key: 'beach',        label: 'Beach' },
  { key: 'pool',         label: 'Pool' },
  { key: 'atmosphere',   label: 'Atmosphere' },
  { key: 'location',     label: 'Location' },
  { key: 'room',         label: 'Rooms' },
  { key: 'value',        label: 'Value for Money' },
  { key: 'cleanliness',  label: 'Cleanliness' },
  { key: 'service',      label: 'Service' },
  { key: 'sleepQuality', label: 'Sleep Quality' },
] as const

const ALL_AMENITIES = [
  'Beach', 'Pool', 'Heated Pool', 'Adult Pool', 'Spa', 'Gym',
  'Diving', 'Snorkelling', 'Fishing', 'Hiking', 'Yoga Classes',
  'Horseback Riding', 'Watersports Equipment Rentals', 'Bicycles Available',
  'Tennis', 'Room Service', 'Buffet', 'Evening Entertainment', 'Wi-Fi Free',
]

function parsePair(pair: string): { slugA: string; slugB: string } | null {
  const vsIdx = pair.indexOf('-vs-')
  if (vsIdx === -1) return null
  return { slugA: pair.slice(0, vsIdx), slugB: pair.slice(vsIdx + 4) }
}

function buildKeyDifferences(a: Resort, b: Resort) {
  const winner = a.ratings.overall >= b.ratings.overall ? a : b
  const loser  = winner.slug === a.slug ? b : a
  const aStronger: string[] = []
  const bStronger: string[] = []
  RATING_ROWS.filter(r => r.key !== 'overall').forEach(({ key, label }) => {
    const sA = a.ratings[key]
    const sB = b.ratings[key]
    if (sA !== null && sB !== null) {
      if ((sA as number) - (sB as number) >= 0.3) aStronger.push(label.toLowerCase())
      else if ((sB as number) - (sA as number) >= 0.3) bStronger.push(label.toLowerCase())
    }
  })
  const lines: string[] = []
  lines.push(`${winner.name} (${winner.ratings.overall}/10) edges ahead of ${loser.name} (${loser.ratings.overall}/10) overall, but both rank among the top all-inclusive resorts in the Caribbean region.`)
  if (aStronger.length > 0) lines.push(`${a.name} leads on ${aStronger.slice(0, 3).join(', ')}.`)
  if (bStronger.length > 0) lines.push(`${b.name} pulls ahead on ${bStronger.slice(0, 3).join(', ')}.`)
  if (a.type !== b.type) {
    const ao = a.type === 'adults-only' ? a : b
    const fam = a.type === 'family' ? a : b
    lines.push(`${ao.name} is adults-only, while ${fam.name} welcomes families — this is often the decisive factor.`)
  } else if (a.type === 'adults-only') {
    lines.push(`Both resorts are adults-only, so the choice comes down to location and specific ratings.`)
  } else {
    lines.push(`Both resorts welcome families, giving travelers flexibility on this dimension.`)
  }
  return lines.join(' ')
}

function buildResortSummary(resort: Resort, opponent: Resort) {
  const bullets: string[] = []
  const wins = RATING_ROWS.filter(r => r.key !== 'overall').filter(({ key }) => {
    const s = resort.ratings[key]
    const o = opponent.ratings[key]
    return s !== null && o !== null && (s as number) > (o as number)
  }).map(r => r.label)
  if (wins.length > 0) bullets.push(`Leads on: ${wins.slice(0, 3).join(', ')}`)
  if (resort.type === 'adults-only') bullets.push('Adults-only (16+ or 18+)')
  else bullets.push('Family-friendly')
  bullets.push(`${resort.country} · ${resort.area}`)
  const uniqueAmenities = resort.amenities.filter(am => !opponent.amenities.includes(am))
  if (uniqueAmenities.length > 0) bullets.push(`Exclusive: ${uniqueAmenities.slice(0, 2).join(', ')}`)
  return bullets
}

function Check() {
  return (
    <svg className="w-5 h-5 text-emerald-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function Dash() {
  return <span className="block text-center text-gray-300 text-lg leading-none">—</span>
}

function SectionToggle({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen || undefined} className="group border border-ocean-100 rounded-2xl overflow-hidden shadow-card mb-4">
      <summary className="flex items-center justify-between px-5 sm:px-6 py-4 cursor-pointer bg-white hover:bg-ocean-50 transition-colors select-none [&::-webkit-details-marker]:hidden list-none">
        <h2 className="font-serif text-lg font-bold text-ocean-950">{title}</h2>
        <span className="text-ocean-400 text-sm transition-transform duration-200 group-open:rotate-180 inline-block">▾</span>
      </summary>
      <div className="bg-white">{children}</div>
    </details>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border-b border-ocean-50 last:border-0">
      <summary className="flex items-center justify-between px-0 py-4 cursor-pointer hover:text-ocean-700 transition-colors select-none [&::-webkit-details-marker]:hidden list-none">
        <span className="font-sans text-sm font-semibold text-ocean-900 pr-4">{question}</span>
        <span className="text-ocean-400 text-sm shrink-0 transition-transform duration-200 group-open:rotate-180 inline-block">▾</span>
      </summary>
      <p className="font-sans text-sm text-ocean-600 leading-relaxed pb-4">{answer}</p>
    </details>
  )
}

export default function ComparePage() {
  const { pair } = useParams<{ pair: string }>()
  const parsed = parsePair(pair)
  if (!parsed) return <Redirect to="/compare" />

  const a = getResortBySlug(parsed.slugA)
  const b = getResortBySlug(parsed.slugB)
  if (!a || !b) return <Redirect to="/compare" />

  const aWins = a.ratings.overall >= b.ratings.overall
  const winner = aWins ? a : b
  const loser  = aWins ? b : a

  const relevantAmenities = ALL_AMENITIES.filter(
    (am) => a.amenities.includes(am) || b.amenities.includes(am)
  )

  const keyDifferences = buildKeyDifferences(a, b)
  const aSummary = buildResortSummary(a, b)
  const bSummary = buildResortSummary(b, a)

  const popularComparisons = resorts
    .filter((r) => r.slug !== a.slug && r.slug !== b.slug)
    .flatMap((r) => [
      { label: `${a.name} vs ${r.name}`, href: `/compare/${[a.slug, r.slug].sort().join('-vs-')}` },
      { label: `${b.name} vs ${r.name}`, href: `/compare/${[b.slug, r.slug].sort().join('-vs-')}` },
    ])

  const faqs = [
    {
      question: `Which is better overall — ${a.name} or ${b.name}?`,
      answer: `Based on verified guest ratings, ${winner.name} scores ${winner.ratings.overall}/10 overall vs ${loser.ratings.overall}/10 for ${loser.name}. That makes ${winner.name} the stronger pick by our overall metric, though individual preferences for things like family-friendliness, location, and budget may shift the recommendation.`,
    },
    {
      question: 'How are these scores calculated?',
      answer: 'Scores are aggregated from verified guest reviews across major booking platforms, weighted to reflect recency. Each category — food, beach, pool, value, service, and more — is scored independently. The overall score is a weighted composite that emphasizes the experience dimensions guests care most about: rooms, service, and value.',
    },
    {
      question: `Is ${a.name} or ${b.name} better value for money?`,
      answer: `${a.name} earns a value score of ${a.ratings.value ?? 'N/A'}/10 while ${b.name} scores ${b.ratings.value ?? 'N/A'}/10. ${a.ratings.value !== null && b.ratings.value !== null ? (a.ratings.value >= b.ratings.value ? `${a.name} leads on value, making it the more budget-conscious pick.` : `${b.name} leads on value, making it the more budget-conscious pick.`) : ''}`,
    },
    {
      question: 'Are these resorts truly all-inclusive?',
      answer: 'Yes — every resort listed on CalculateTrip is verified all-inclusive, meaning accommodation, meals, drinks, and core activities are included in the room rate. Some premium extras (spa treatments, excursions, premium spirits) may carry additional charges. Always confirm current inclusions directly with the resort before booking.',
    },
    {
      question: 'When was this comparison last updated?',
      answer: 'Our resort data and ratings are reviewed continuously and reflect the most current available guest review aggregates. The comparison you are viewing reflects data current as of 2025.',
    },
  ]

  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-br from-ocean-950 via-ocean-900 to-ocean-800 px-4 sm:px-6 pt-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <Link href="/compare" className="inline-flex items-center gap-1.5 font-sans text-xs text-ocean-400 hover:text-ocean-200 transition-colors mb-8">
            ← All Comparisons
          </Link>
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-ocean-500 mb-2 text-center">
            Resort Comparison · 2025
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white text-center mb-10 leading-tight">
            {a.name}
            <span className="block font-sans font-normal text-ocean-500 text-xl my-2">vs</span>
            {b.name}
          </h1>

          <div className="grid grid-cols-2 gap-3">
            {[a, b].map((r) => {
              const isWinner = r.slug === winner.slug
              return (
                <div
                  key={r.slug}
                  className={`rounded-2xl p-4 sm:p-5 text-center border ${isWinner ? 'bg-white/10 border-gold-500/60' : 'bg-white/5 border-white/10'}`}
                >
                  {isWinner && (
                    <span className="inline-block font-sans text-[10px] font-extrabold uppercase tracking-widest bg-gold-500 text-white px-2.5 py-0.5 rounded-full mb-3">
                      Recommended
                    </span>
                  )}
                  <Link href={`/resorts/${r.slug}`} className="font-serif text-base sm:text-lg font-bold text-white hover:text-gold-300 transition-colors block leading-snug mb-1">
                    {r.name}
                  </Link>
                  <p className="font-sans text-xs text-ocean-400 mb-3">
                    {r.country} · {r.type === 'adults-only' ? 'Adults Only' : 'Family'}
                  </p>
                  <div className={`font-serif text-4xl font-bold tabular-nums ${scoreColor(r.ratings.overall)}`}>
                    {r.ratings.overall}
                  </div>
                  <div className="font-sans text-xs text-ocean-400 mt-0.5">{scoreLabel(r.ratings.overall)}</div>
                  <a
                    href={r.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className={`mt-4 block font-sans text-sm font-semibold rounded-xl py-2.5 transition-colors ${isWinner ? 'bg-gold-500 hover:bg-gold-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                  >
                    Check Prices →
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 pb-16">

        {/* Key Differences */}
        <div className="bg-white border border-ocean-100 rounded-2xl shadow-card p-5 sm:p-7 mb-6">
          <p className="font-sans text-xs font-bold uppercase tracking-widest text-ocean-500 mb-1">Editorial Summary</p>
          <h2 className="font-serif text-xl font-bold text-ocean-950 mb-3">Key Differences</h2>
          <p className="font-sans text-sm text-ocean-700 leading-relaxed mb-6">{keyDifferences}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[{ resort: a, bullets: aSummary }, { resort: b, bullets: bSummary }].map(({ resort, bullets }) => (
              <div key={resort.slug} className="bg-ocean-50/60 rounded-xl p-4">
                <p className="font-sans text-xs font-bold uppercase tracking-widest text-ocean-500 mb-2">
                  {resort.name.split(' ').slice(0, 2).join(' ')}
                </p>
                <ul className="space-y-1.5">
                  {bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2 font-sans text-sm text-ocean-700">
                      <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Ratings comparison */}
        <SectionToggle title="Ratings Comparison" defaultOpen>
          <div className="grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_100px_100px] bg-ocean-950 text-white text-xs font-sans font-bold uppercase tracking-wider">
            <div className="px-4 sm:px-5 py-3.5">Category</div>
            <div className="py-3.5 text-center truncate px-1 text-ocean-300">{a.name.split(' ')[0]}</div>
            <div className="py-3.5 text-center truncate px-1 text-ocean-300">{b.name.split(' ')[0]}</div>
          </div>
          {RATING_ROWS.map(({ key, label }, i) => {
            const sA = a.ratings[key]
            const sB = b.ratings[key]
            if (sA === null && sB === null) return null
            const aRowWins = sA !== null && sB !== null && (sA as number) > (sB as number)
            const bRowWins = sA !== null && sB !== null && (sB as number) > (sA as number)
            return (
              <div
                key={key}
                className={`grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_100px_100px] border-b border-ocean-50 last:border-0 ${i % 2 === 0 ? 'bg-ocean-50/40' : 'bg-white'}`}
              >
                <div className="px-4 sm:px-5 py-3.5 font-sans text-sm text-ocean-700 font-medium flex items-center gap-2">
                  {label}
                  {key === 'overall' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ocean-400 bg-ocean-100 px-1.5 py-0.5 rounded">Overall</span>
                  )}
                </div>
                <div className={`py-3.5 flex items-center justify-center ${aRowWins ? 'bg-emerald-50' : ''}`}>
                  {sA !== null ? (
                    <div className="text-center">
                      <span className={`font-sans text-base font-bold tabular-nums ${scoreColor(sA as number)} ${aRowWins ? 'text-lg' : ''}`}>{sA}</span>
                      {aRowWins && <div className="text-[10px] text-emerald-500 font-bold mt-0.5">▲ wins</div>}
                    </div>
                  ) : <Dash />}
                </div>
                <div className={`py-3.5 flex items-center justify-center ${bRowWins ? 'bg-emerald-50' : ''}`}>
                  {sB !== null ? (
                    <div className="text-center">
                      <span className={`font-sans text-base font-bold tabular-nums ${scoreColor(sB as number)} ${bRowWins ? 'text-lg' : ''}`}>{sB}</span>
                      {bRowWins && <div className="text-[10px] text-emerald-500 font-bold mt-0.5">▲ wins</div>}
                    </div>
                  ) : <Dash />}
                </div>
              </div>
            )
          })}
        </SectionToggle>

        {/* Amenities */}
        <SectionToggle title="Amenities & Features" defaultOpen>
          <div className="grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_100px_100px] bg-ocean-950 text-white text-xs font-sans font-bold uppercase tracking-wider">
            <div className="px-4 sm:px-5 py-3.5">Amenity</div>
            <div className="py-3.5 text-center truncate px-1 text-ocean-300">{a.name.split(' ')[0]}</div>
            <div className="py-3.5 text-center truncate px-1 text-ocean-300">{b.name.split(' ')[0]}</div>
          </div>
          {relevantAmenities.map((am, i) => (
            <div
              key={am}
              className={`grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_100px_100px] border-b border-ocean-50 last:border-0 ${i % 2 === 0 ? 'bg-ocean-50/40' : 'bg-white'}`}
            >
              <div className="px-4 sm:px-5 py-3 font-sans text-sm text-ocean-700">{am}</div>
              <div className="py-3 flex items-center justify-center">
                {a.amenities.includes(am) ? <Check /> : <Dash />}
              </div>
              <div className="py-3 flex items-center justify-center">
                {b.amenities.includes(am) ? <Check /> : <Dash />}
              </div>
            </div>
          ))}
        </SectionToggle>

        {/* Verdict */}
        <div className="bg-ocean-950 rounded-2xl p-6 sm:p-8 mb-6">
          <p className="font-sans text-xs font-bold uppercase tracking-widest text-ocean-500 mb-1">Our Verdict</p>
          <h2 className="font-serif text-2xl font-bold text-white mb-3">{winner.name} comes out ahead</h2>
          <p className="font-sans text-ocean-300 leading-relaxed text-sm">
            {winner.name} scores {winner.ratings.overall}/10 overall vs {loser.ratings.overall}/10 for {loser.name}.{' '}
            {winner.ratings.value !== null && loser.ratings.value !== null
              ? winner.ratings.value >= loser.ratings.value
                ? `It also leads on value (${winner.ratings.value} vs ${loser.ratings.value}), making it the stronger pick for most travelers.`
                : `However, ${loser.name} scores higher on value (${loser.ratings.value} vs ${winner.ratings.value}), so budget-focused travelers may prefer it.`
              : ''}
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <a
              href={winner.affiliateLink}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex-1 text-center font-sans text-sm font-bold bg-gold-500 hover:bg-gold-600 text-white rounded-xl py-3 transition-colors"
            >
              View {winner.name.split(' ').slice(0, 2).join(' ')} Prices →
            </a>
            <a
              href={loser.affiliateLink}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex-1 text-center font-sans text-sm font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 transition-colors"
            >
              View {loser.name.split(' ').slice(0, 2).join(' ')} Prices →
            </a>
          </div>
        </div>

        {/* About + Popular sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-6 mb-6">
          <div className="bg-white border border-ocean-100 rounded-2xl shadow-card p-5 sm:p-6">
            <p className="font-sans text-xs font-bold uppercase tracking-widest text-ocean-500 mb-1">Methodology</p>
            <h2 className="font-serif text-lg font-bold text-ocean-950 mb-3">About This Comparison</h2>
            <p className="font-sans text-sm text-ocean-600 leading-relaxed mb-3">
              CalculateTrip scores are built from verified guest reviews aggregated across major booking platforms. Each dimension — food, beach, pool, service, value, rooms, cleanliness, atmosphere, location, and sleep quality — is scored from 0–10 and updated continuously.
            </p>
            <p className="font-sans text-sm text-ocean-600 leading-relaxed">
              The overall score is a weighted composite designed to reflect the full experience, not just the highlights. Amenities are verified directly from resort information and booking platform listings. Affiliate links are marked <code className="text-xs bg-ocean-50 px-1 rounded">sponsored</code> per Google guidelines — they never influence ratings.
            </p>
          </div>
          <div className="bg-white border border-ocean-100 rounded-2xl shadow-card p-5">
            <h2 className="font-serif text-base font-bold text-ocean-950 mb-3">Popular Comparisons</h2>
            <ul className="space-y-1">
              {popularComparisons.slice(0, 8).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block font-sans text-sm text-ocean-700 hover:text-ocean-950 hover:underline transition-colors py-1"
                  >
                    {link.label} →
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/compare"
              className="mt-4 block text-center font-sans text-xs font-semibold text-ocean-500 hover:text-ocean-800 transition-colors border border-ocean-200 rounded-lg py-2"
            >
              All Comparisons
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white border border-ocean-100 rounded-2xl shadow-card p-5 sm:p-6">
          <p className="font-sans text-xs font-bold uppercase tracking-widest text-ocean-500 mb-1">Common Questions</p>
          <h2 className="font-serif text-lg font-bold text-ocean-950 mb-4">FAQ</h2>
          {faqs.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>

      </div>
    </>
  )
}
