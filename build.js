// Static site generator. No framework. No client renderer. Pure Node.
//
// Reads templates/ + data/, writes pre-rendered HTML to dist/.
// Tailwind compiles a single CSS file. A 1.5KB vanilla JS module
// runs only the compare picker. Everything Google sees is HTML.

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const ejs = require('ejs')

const SITE_URL = 'https://www.calculatetrip.com'
const SITE_NAME = 'CalculateTrip'

const { resorts: legacyResorts, pairOverviews: legacyPairOverviews } = require('./data/resorts')
const { newResorts, newPairOverviews, shouldGeneratePair } = require('./data/resorts-new')
const { fillResortContent } = require('./scripts/formulaic-resort')

const resorts = [...legacyResorts, ...newResorts]

// Fill any missing editorial fields (description, whatYouNeedToKnow,
// bestTimeToVisit, activities) so every resort page and comparison carries
// the same sections. Hand-authored fields are never overwritten.
for (const r of resorts) Object.assign(r, fillResortContent(r))

// Merge overviews: shards first (lowest priority), then module-level new,
// then legacy hand-authored (highest priority, never overwritten).
function loadShardOverviews() {
  const dir = path.join(__dirname, 'data', 'pair-overviews')
  const merged = {}
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir).sort()) {
      if (!/\.js$/.test(f)) continue
      Object.assign(merged, require(path.join(dir, f)))
    }
  }
  return merged
}
const pairOverviews = { ...loadShardOverviews(), ...newPairOverviews, ...legacyPairOverviews }

// ---------------------------------------------------------------------------
// Data helpers over the combined resort set
// ---------------------------------------------------------------------------
const bySlugMap = Object.fromEntries(resorts.map(r => [r.slug, r]))
function bySlug(slug) { return bySlugMap[slug] }
function byCountry(countrySlug) { return resorts.filter(r => r.countrySlug === countrySlug) }
function byType(type) { return resorts.filter(r => r.type === type) }
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

// Every resort pair is a valid comparison — serve.js renders each on demand
// and the overview is generated at request time when no hand-authored or LLM
// overview exists. Used for the sitemap.
let _allPairs = null
function allComparisonPairs() {
  if (_allPairs) return _allPairs
  _allPairs = []
  for (let i = 0; i < resorts.length; i++) {
    for (let j = i + 1; j < resorts.length; j++) {
      const x = resorts[i], y = resorts[j]
      const [a, b] = x.slug < y.slug ? [x, y] : [y, x]
      _allPairs.push({ a, b })
    }
  }
  return _allPairs
}

// Pairs to feature on the compare hub page (filtered to same-brand/country pairs
// to keep the pre-rendered list manageable).
function popularPairs() {
  const pairs = []
  for (let i = 0; i < resorts.length; i++) {
    for (let j = i + 1; j < resorts.length; j++) {
      const x = resorts[i], y = resorts[j]
      if (!shouldGeneratePair(x, y)) continue
      const [a, b] = x.slug < y.slug ? [x, y] : [y, x]
      pairs.push({ a, b })
    }
  }
  return pairs
}

const ROOT = __dirname
const DIST = path.join(ROOT, 'dist')
const TEMPLATES = path.join(ROOT, 'templates')
const PUBLIC = path.join(ROOT, 'public')

function rmrf(dir) { if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true }) }
function mkdirp(dir) { fs.mkdirSync(dir, { recursive: true }) }

function copyDir(src, dest) {
  mkdirp(dest)
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d)
  }
}

const RATING_LABELS = {
  overall: 'Overall', food: 'Food & Dining', beach: 'Beach', pool: 'Pool',
  atmosphere: 'Atmosphere', location: 'Location', room: 'Rooms',
  value: 'Value for Money', cleanliness: 'Cleanliness', service: 'Service',
  sleepQuality: 'Sleep Quality',
}

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

const baseLocals = {
  SITE_URL, SITE_NAME,
  resorts, bySlug, byCountry, byType, topBy,
  countries: countries(),
  allComparisonPairs: allComparisonPairs(),
  RATING_LABELS, RATING_TOOLTIPS, scoreColor, scoreLabel, pairUrl, pairOverviews,
}

function render(templateName, locals = {}) {
  const file = path.join(TEMPLATES, `${templateName}.ejs`)
  return ejs.renderFile(file, { ...baseLocals, ...locals }, { async: false })
}

async function writeHtml(routePath, html) {
  const dir = path.join(DIST, routePath.replace(/^\/|\/$/g, ''))
  mkdirp(dir)
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8')
}

async function buildPage(routePath, templateName, locals = {}, meta = {}) {
  const inner = await render(templateName, { ...locals, canonical: SITE_URL + routePath })
  const html = await render('_layout', {
    ...locals,
    canonical: SITE_URL + routePath,
    title: meta.title || `${SITE_NAME} | Best All-Inclusive Resorts`,
    description: meta.description || 'Independent ratings and reviews for the best all-inclusive resorts.',
    body: inner,
    activeNav: meta.activeNav || '',
  })
  await writeHtml(routePath, html)
}

async function build() {
  console.log('Cleaning dist/')
  rmrf(DIST)
  mkdirp(DIST)

  console.log('Copying public/ assets')
  if (fs.existsSync(PUBLIC)) copyDir(PUBLIC, DIST)

  console.log('Compiling Tailwind CSS')
  execSync(
    `npx tailwindcss -c tailwind.config.js -i ./styles.css -o ./dist/styles.css --minify`,
    { stdio: 'inherit', cwd: ROOT }
  )

  console.log('Rendering pages')

  await buildPage('/', 'home', {
    topResorts: topBy('overall', 3),
    featuredPairs: popularPairs().slice(0, 4),
  }, {
    title: `Best All-Inclusive Resorts 2025 | Independent Ratings | ${SITE_NAME}`,
    description: 'Independent ratings for the best all-inclusive resorts across the Caribbean and Latin America. Compare by food, beach, pool, value, and service.',
    activeNav: '/',
  })

  await buildPage('/resorts/', 'all-resorts', {
    sortedResorts: topBy('overall', resorts.length),
  }, {
    title: `All-Inclusive Resort Reviews & Ratings 2025 | ${SITE_NAME}`,
    description: 'Every all-inclusive resort in our database, independently rated across eleven categories.',
    activeNav: '/resorts/',
  })

  for (const r of resorts) {
    const related = resorts.filter(o => o.slug !== r.slug && (o.country === r.country || o.type === r.type)).slice(0, 2)
    await buildPage(`/resorts/${r.slug}/`, 'resort', { resort: r, related }, {
      title: `${r.name} Review 2025 | All-Inclusive Rating | ${SITE_NAME}`,
      description: `Independent review of ${r.name} in ${r.country}. Rated ${r.ratings.overall}/10 overall. Scores for food, beach, pool, rooms, value, and service.`,
    })
  }

  const categoryDefs = [
    { slug: 'best-adults-only-all-inclusive-resorts', label: 'Adults-Only', filter: r => r.type === 'adults-only', title: 'Best Adults-Only All-Inclusive Resorts 2025', sub: 'Romantic escapes for couples and adult travelers.' },
    { slug: 'best-family-all-inclusive-resorts', label: 'Family', filter: r => r.type === 'family', title: 'Best Family All-Inclusive Resorts 2025', sub: 'Family-friendly resorts with activities for every age.' },
    { slug: 'best-value-all-inclusive-resorts', label: 'Best Value', filter: () => true, sortKey: 'value', title: 'Best Value All-Inclusive Resorts 2025', sub: 'Top all-inclusives ranked by value-for-money score.' },
    { slug: 'best-beach-all-inclusive-resorts', label: 'Best Beach', filter: r => r.ratings.beach !== null, sortKey: 'beach', title: 'Best Beach All-Inclusive Resorts 2025', sub: 'All-inclusive resorts with the highest-rated beaches.' },
  ]
  for (const cat of categoryDefs) {
    const list = resorts
      .filter(cat.filter)
      .sort((a, b) => (b.ratings[cat.sortKey || 'overall'] || 0) - (a.ratings[cat.sortKey || 'overall'] || 0))
    await buildPage(`/${cat.slug}/`, 'category', { category: cat, resortList: list }, {
      title: `${cat.title} | ${SITE_NAME}`,
      description: `${cat.sub} Ranked by independent guest ratings.`,
      activeNav: `/${cat.slug}/`,
    })
  }

  for (const c of countries()) {
    const list = byCountry(c.slug).sort((a, b) => b.ratings.overall - a.ratings.overall)
    await buildPage(`/destination/${c.slug}/`, 'destination', { country: c, resortList: list }, {
      title: `Best All-Inclusive Resorts in ${c.name} 2025 | ${SITE_NAME}`,
      description: `All-inclusive resorts in ${c.name}, independently rated and reviewed.`,
    })
  }

  // Compare hub shows a curated popular list, not all 383K pairs
  await buildPage('/compare/', 'compare-hub', {
    pairs: popularPairs().slice(0, 100),
  }, {
    title: `Compare All-Inclusive Resorts 2025 | Side-by-Side | ${SITE_NAME}`,
    description: 'Compare any two all-inclusive resorts side by side. Ratings for food, beach, pool, value, service, and amenities.',
    activeNav: '/compare/',
  })

  // Compare pages are all served dynamically by serve.js on-demand.
  // Pre-building them would generate thousands of large files (5+ GB)
  // and blow the deployment disk quota. serve.js handles them via EJS.

  // Shared dataset for the compare picker, written once and fetched by
  // compare-pair.js. Keeping it out of each compare page's HTML keeps those
  // (dynamically-rendered) pages small — ~40KB instead of ~1.5MB each.
  const pairData = {
    resorts: resorts.map(r => ({
      slug: r.slug, name: r.name, country: r.country, area: r.area, type: r.type,
      priceLevel: r.priceLevel || null, ageNote: r.ageNote || null, notes: r.notes || null,
      ratings: r.ratings, amenities: r.amenities, agodaLink: r.agodaLink,
      whatYouNeedToKnow: r.whatYouNeedToKnow,
      bestTimeToVisit: r.bestTimeToVisit,
      activities: r.activities,
    })),
  }
  fs.writeFileSync(path.join(DIST, 'pair-data.json'), JSON.stringify(pairData), 'utf8')

  const urls = [
    '/', '/resorts/', '/compare/',
    ...categoryDefs.map(c => `/${c.slug}/`),
    ...countries().map(c => `/destination/${c.slug}/`),
    ...resorts.map(r => `/resorts/${r.slug}/`),
    ...allComparisonPairs().map(({ a, b }) => `/compare/${a.slug}-vs-${b.slug}/`),
  ]
  const today = new Date().toISOString().split('T')[0]
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>`
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap, 'utf8')
  fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`, 'utf8')

  console.log(`Built ${urls.length} pages to dist/`)
}

build().catch(err => { console.error(err); process.exit(1) })
