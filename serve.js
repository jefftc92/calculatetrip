// Static file server with dynamic fallback for compare pages.
// Pre-built pages in dist/ are served directly (fast).
// Compare pages not in dist/ are rendered on-demand from resort data.

const http = require('http')
const fs = require('fs')
const path = require('path')
const ejs = require('ejs')

const ROOT = __dirname
const DIST = path.join(ROOT, 'dist')
const TEMPLATES = path.join(ROOT, 'templates')
const PORT = Number(process.env.PORT) || 3000
const SITE_URL = 'https://www.calculatetrip.com'
const SITE_NAME = 'CalculateTrip'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
}

// ---------------------------------------------------------------------------
// Load resort data for dynamic rendering
// ---------------------------------------------------------------------------
const { resorts: legacyResorts, pairOverviews: legacyPairOverviews } = require('./data/resorts')
const { newResorts, newPairOverviews } = require('./data/resorts-new')
const { buildOverview } = require('./scripts/formulaic-overview')
const { fillResortContent } = require('./scripts/formulaic-resort')
const resorts = [...legacyResorts, ...newResorts]
// Fill missing editorial fields so dynamically-rendered compare pages show the
// same When to Visit / Activities / What You Need to Know content as elsewhere.
for (const r of resorts) Object.assign(r, fillResortContent(r))
const bySlugMap = Object.fromEntries(resorts.map(r => [r.slug, r]))

// Compare-picker dataset, cached once. build.js writes this to dist/, but
// serve it here too so the picker works even when running without a build.
const pairDataJson = JSON.stringify({
  resorts: resorts.map(r => ({
    slug: r.slug, name: r.name, country: r.country, area: r.area, type: r.type,
    priceLevel: r.priceLevel || null, ageNote: r.ageNote || null, notes: r.notes || null,
    ratings: r.ratings, amenities: r.amenities, agodaLink: r.agodaLink,
    whatYouNeedToKnow: r.whatYouNeedToKnow,
    bestTimeToVisit: r.bestTimeToVisit,
    activities: r.activities,
  })),
})

// Merge overviews — shards loaded eagerly at startup so the first compare
// request doesn't block. Falls back to legacy-only until loading completes.
let _pairOverviews = { ...newPairOverviews, ...legacyPairOverviews }
setImmediate(() => {
  const dir = path.join(ROOT, 'data', 'pair-overviews')
  const merged = {}
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir).sort()) {
      if (!/\.js$/.test(f)) continue
      Object.assign(merged, require(path.join(dir, f)))
    }
  }
  _pairOverviews = { ...merged, ...newPairOverviews, ...legacyPairOverviews }
  console.log(`Loaded ${Object.keys(_pairOverviews).length} pair overviews`)
})
function getPairOverviews() { return _pairOverviews }

// Helpers shared with build.js
function scoreColor(s) {
  if (s === null || s === undefined) return 'text-gray-400'
  if (s >= 9.5) return 'text-emerald-600'
  if (s >= 9.0) return 'text-emerald-500'
  if (s >= 8.0) return 'text-amber-500'
  if (s >= 7.0) return 'text-orange-500'
  return 'text-red-500'
}
function scoreLabel(s) {
  if (s === null || s === undefined) return 'N/A'
  if (s >= 9.5) return 'Exceptional'
  if (s >= 9.0) return 'Superb'
  if (s >= 8.0) return 'Excellent'
  if (s >= 7.0) return 'Good'
  return 'Fair'
}
function pairUrl(slug1, slug2) {
  const [a, b] = [slug1, slug2].sort()
  return `/compare/${a}-vs-${b}/`
}
function bySlug(slug) { return bySlugMap[slug] }
function byCountry(countrySlug) { return resorts.filter(r => r.countrySlug === countrySlug) }
function topBy(key, n) {
  return [...resorts]
    .filter(r => r.ratings[key] !== null && r.ratings[key] !== undefined)
    .sort((a, b) => b.ratings[key] - a.ratings[key])
    .slice(0, n === undefined ? resorts.length : n)
}
function countries() {
  const seen = new Set()
  return resorts
    .filter(r => { if (seen.has(r.countrySlug)) return false; seen.add(r.countrySlug); return true })
    .map(r => ({ name: r.country, slug: r.countrySlug, count: byCountry(r.countrySlug).length }))
}
const RATING_LABELS = {
  overall: 'Overall', food: 'Food & Dining', beach: 'Beach', pool: 'Pool',
  atmosphere: 'Atmosphere', location: 'Location', room: 'Rooms',
  value: 'Value for Money', cleanliness: 'Cleanliness', service: 'Service',
  sleepQuality: 'Sleep Quality',
}
const RATING_TOOLTIPS = {
  overall:      'A weighted composite of all category scores, calculated from thousands of verified guest reviews using AI-assisted analysis across major booking platforms.',
  food:         'Reflects restaurant quality, variety, and the all-inclusive meal program. AI-analyzed from verified guest reviews.',
  beach:        'Rates sand condition, water clarity, and beach environment. Resorts without a traditional beach show no score.',
  pool:         'Reflects pool quality, design, and guest satisfaction. AI-analyzed from verified guest reviews.',
  atmosphere:   'Captures overall ambiance, vibe, and setting — including landscaping, communal areas, and resort energy.',
  location:     'Rates the resort\'s setting, scenery, and surrounding environment.',
  room:         'Reflects room size, comfort, furnishings, and overall quality as reported by guests.',
  value:        'Scores the all-inclusive package value relative to price paid, as reported by guests.',
  cleanliness:  'Reflects housekeeping standards across rooms and public areas. AI-analyzed from verified guest reviews.',
  service:      'Rates staff warmth, attentiveness, and responsiveness. AI-analyzed from verified guest reviews.',
  sleepQuality: 'Reflects noise levels, bed comfort, and overall quality of rest as reported by guests.',
}

async function renderComparePage(a, b) {
  const pairOverviews = getPairOverviews()
  const routePath = `/compare/${a.slug}-vs-${b.slug}/`
  const canonical = SITE_URL + routePath
  const locals = {
    SITE_URL, SITE_NAME, canonical,
    a, b, resorts, pairOverviews, buildOverview,
    bySlug, byCountry, topBy,
    countries: countries(),
    allComparisonPairs: [],
    RATING_LABELS, RATING_TOOLTIPS, scoreColor, scoreLabel, pairUrl,
  }
  const inner = await ejs.renderFile(path.join(TEMPLATES, 'compare-pair.ejs'), locals, { async: false })
  return ejs.renderFile(path.join(TEMPLATES, '_layout.ejs'), {
    ...locals,
    title: `${a.name} vs ${b.name} 2025 | Resort Comparison | ${SITE_NAME}`,
    description: `Detailed comparison of ${a.name} (${a.ratings.overall}/10) and ${b.name} (${b.ratings.overall}/10). Side-by-side ratings, amenities, and editorial verdict.`,
    body: inner,
    activeNav: '/compare/',
  }, { async: false })
}

// ---------------------------------------------------------------------------
// Request handler
// ---------------------------------------------------------------------------
http.createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])

  // 1. Try static file first
  const candidates = [
    path.join(DIST, url),
    path.join(DIST, url, 'index.html'),
  ]
  for (const p of candidates) {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'text/plain' })
      fs.createReadStream(p).pipe(res)
      return
    }
  }

  // 1b. Compare-picker dataset (fallback if not pre-built into dist/)
  if (url === '/pair-data.json') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(pairDataJson)
    return
  }

  // 2. Dynamic compare page fallback
  const m = url.match(/^\/compare\/(.+)-vs-(.+?)\/?$/)
  if (m) {
    // Slugs in URL are already sorted (a < b); verify and redirect if not
    const slugA = m[1], slugB = m[2]
    const ra = bySlugMap[slugA], rb = bySlugMap[slugB]
    if (ra && rb) {
      const [a, b] = ra.slug < rb.slug ? [ra, rb] : [rb, ra]
      if (slugA !== a.slug) {
        res.writeHead(301, { Location: `/compare/${a.slug}-vs-${b.slug}/` })
        res.end()
        return
      }
      try {
        const html = await renderComparePage(a, b)
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(html)
        return
      } catch (err) {
        console.error('Dynamic render error for', url, err.message)
      }
    }
  }

  // 3. 404
  const notFound = path.join(DIST, '404.html')
  if (fs.existsSync(notFound)) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
    fs.createReadStream(notFound).pipe(res)
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end('<h1>404</h1>')
  }
}).listen(PORT, '0.0.0.0', () => console.log(`http://localhost:${PORT}`))
