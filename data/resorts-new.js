// New-resort ingestion + comparison-grouping logic.
//
// Parses data/resorts-extra.csv (the full ~885-row dataset) at load time,
// skips the 125 resorts already hand-authored in data/resorts.js, and emits
// the remaining resorts plus the helpers build.js uses to decide which
// resort pairs deserve a comparison page.
//
// A pair gets a comparison page when:
//   - both resorts are legacy (already true in the original data), OR
//   - both belong to the same company (any location), OR
//   - both are in the same country (for Mexico: the same nearby-city corridor).

const fs = require('fs')
const path = require('path')

// ---------------------------------------------------------------------------
// Mexico nearby-city corridors. Resorts in the same corridor are treated as
// cross-shoppable; resorts in different corridors are not paired.
// ---------------------------------------------------------------------------
const MEXICO_ZONES = {
  // Cancun + Riviera Maya (one corridor — they are a ~45-60 min drive apart
  // and travelers routinely cross-shop them).
  'Cancun': 'cancun-riviera-maya',
  'Costa Mujeres': 'cancun-riviera-maya',
  'Playa Mujeres': 'cancun-riviera-maya',
  'Isla Mujeres': 'cancun-riviera-maya',
  'Puerto Morelos': 'cancun-riviera-maya',
  'Punta Sam': 'cancun-riviera-maya',
  'Holbox Island': 'cancun-riviera-maya',
  'Playa del Carmen': 'cancun-riviera-maya',
  'Playa del Secreto': 'cancun-riviera-maya',
  'Playa Paraiso': 'cancun-riviera-maya',
  'Playa Maroma': 'cancun-riviera-maya',
  'Playacar': 'cancun-riviera-maya',
  'Barcelo Maya': 'cancun-riviera-maya',
  'Solidaridad': 'cancun-riviera-maya',
  'Akumal': 'cancun-riviera-maya',
  'Tulum': 'cancun-riviera-maya',
  'Chemuyil': 'cancun-riviera-maya',
  'Chacalal': 'cancun-riviera-maya',
  'Caracol': 'cancun-riviera-maya',
  'El Dorado': 'cancun-riviera-maya',
  'Puerto Aventuras': 'cancun-riviera-maya',
  'Xpu-Ha': 'cancun-riviera-maya',
  'Cozumel': 'cancun-riviera-maya',
  'Riviera Maya': 'cancun-riviera-maya',

  // Los Cabos
  'Cabo San Lucas': 'los-cabos',
  'San Jose del Cabo': 'los-cabos',
  'Los Cabos': 'los-cabos',

  // Puerto Vallarta / Riviera Nayarit
  'Puerto Vallarta': 'puerto-vallarta',
  'Nuevo Vallarta': 'puerto-vallarta',
  'Nuevo Nayarit': 'puerto-vallarta',
  'Punta de Mita': 'puerto-vallarta',
  'Flamingos': 'puerto-vallarta',
  'Bucerias': 'puerto-vallarta',
  'Sayulita': 'puerto-vallarta',
  'La Cruz de Huanacaxtle': 'puerto-vallarta',
  'Mismaloya': 'puerto-vallarta',
  'Rincon de Guayabitos': 'puerto-vallarta',
}

// Any Mexico area not listed above falls back to its own area name (so it only
// pairs with resorts in the exact same area). Blank areas are inferred from the
// resort name where possible (handles the ~19 rows with an empty area column).
function inferZoneFromName(name) {
  const n = name.toLowerCase()
  if (/cancun|costa mujeres|isla mujeres|puerto morelos/.test(n)) return 'cancun-riviera-maya'
  if (/riviera maya|playa del carmen|tulum|akumal|playacar|xpu/.test(n)) return 'cancun-riviera-maya'
  if (/los cabos|cabo san lucas|san jose del cabo|baja/.test(n)) return 'los-cabos'
  if (/vallarta|nayarit|jalisco|bucerias|sayulita/.test(n)) return 'puerto-vallarta'
  if (/acapulco/.test(n)) return 'acapulco'
  if (/mazatlan/.test(n)) return 'mazatlan'
  if (/ixtapa|zihuatanejo/.test(n)) return 'ixtapa'
  if (/huatulco/.test(n)) return 'huatulco'
  return null
}

function getMexicoZone(area, name) {
  if (area && MEXICO_ZONES[area]) return MEXICO_ZONES[area]
  if (!area || !area.trim()) {
    const inferred = inferZoneFromName(name || '')
    if (inferred) return inferred
    return 'mexico-other'
  }
  return area // its own single-area zone
}

// ---------------------------------------------------------------------------
// Company inference from resort name. Keyword → canonical company.
// Order matters: earlier, more-specific patterns win.
// ---------------------------------------------------------------------------
const COMPANY_RULES = [
  [/\bbeaches\b/i, 'Sandals'],
  [/\bsandals\b/i, 'Sandals'],
  [/\bzo[eë]try\b/i, 'AMR Collection'],
  [/\bsecrets\b/i, 'AMR Collection'],
  [/\bdreams\b/i, 'AMR Collection'],
  [/\bbreathless\b/i, 'AMR Collection'],
  [/\bimpression\b/i, 'AMR Collection'],
  [/\bnow\s+(amber|emerald|jade|larimar|natura|onyx|sapphire)\b/i, 'AMR Collection'],
  [/\breflect\b/i, 'AMR Collection'],
  [/\bsunscape\b/i, 'AMR Collection'],
  [/\bhyatt\s+(ziva|zilara)\b/i, 'Hyatt'],
  [/\bparadisus\b/i, 'Melia'],
  [/\bmeli[aá]\b/i, 'Melia'],
  [/\bbarcel[oó]\b/i, 'Barcelo'],
  [/\biberostar\b/i, 'Iberostar'],
  [/\briu\b/i, 'RIU'],
  [/\bhard rock\b/i, 'Hard Rock'],
  [/\bbah[ií]a pr[ií]ncipe\b/i, 'Bahia Principe'],
  [/\bgrand palladium\b/i, 'Palladium'],
  [/\bpalladium\b/i, 'Palladium'],
  [/\broyalton\b/i, 'Royalton'],
  [/\bexcellence\b/i, 'Excellence Group'],
  [/\bfinest\b/i, 'Excellence Group'],
  [/\bel dorado\b/i, 'Karisma'],
  [/\bkarisma\b/i, 'Karisma'],
  [/\bgenerations\b/i, 'Karisma'],
  [/\bnickelodeon\b/i, 'Karisma'],
  [/\bmoon palace\b/i, 'Palace Resorts'],
  [/\bsun palace\b/i, 'Palace Resorts'],
  [/\bcozumel palace\b/i, 'Palace Resorts'],
  [/\bbeach palace\b/i, 'Palace Resorts'],
  [/\bplaya?car palace\b/i, 'Palace Resorts'],
  [/\bisla mujeres palace\b/i, 'Palace Resorts'],
  [/\ble blanc\b/i, 'Palace Resorts'],
  [/\bhaven\b/i, 'Palace Resorts'],
  [/\bsandos\b/i, 'Sandos'],
  [/\bclub med\b/i, 'Club Med'],
  [/\bviva\b/i, 'Wyndham'],
  [/\bwyndham\b/i, 'Wyndham'],
  [/\bvilla del palmar\b/i, 'Villa Group'],
  [/\bvilla la estancia\b/i, 'Villa Group'],
  [/\bvilla group\b/i, 'Villa Group'],
  [/\bunico\b/i, 'Unico Hotels'],
  [/\bgrand velas\b/i, 'Velas Resorts'],
  [/\bvelas\b/i, 'Velas Resorts'],
  [/\bmajestic\b/i, 'Majestic Resorts'],
  [/\bgran muthu\b|\bmuthu\b/i, 'Muthu Hotels'],
  [/\bvila gal[eé]\b/i, 'Vila Gale'],
  [/\bocean\s+(blue|coral|el faro|maya|riviera|varadero|vista|casa|by h10)\b/i, 'H10 Hotels'],
  [/\bh10\b/i, 'H10 Hotels'],
  [/\bcatalonia\b/i, 'Catalonia'],
  [/\bgrand fiesta americana\b|\bfiesta americana\b/i, 'Fiesta Americana'],
  [/\bhilton\b/i, 'Hilton'],
  [/\bmarriott\b/i, 'Marriott'],
  [/\bhyatt\b/i, 'Hyatt'],
]

function inferCompany(name) {
  for (const [re, company] of COMPANY_RULES) {
    if (re.test(name)) return company
  }
  return null
}

// ---------------------------------------------------------------------------
// Slug + value helpers
// ---------------------------------------------------------------------------
function slugify(name) {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[°ºª]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function num(v) {
  if (v == null) return null
  const s = String(v).trim()
  if (!s || /^n\/?a$/i.test(s)) return null
  const f = parseFloat(s)
  return Number.isFinite(f) ? f : null
}

function countrySlug(country) {
  return slugify(country || 'unknown')
}

function typeOf(raw) {
  const s = (raw || '').toLowerCase()
  if (s.includes('adult')) return 'adults-only'
  return 'family'
}

// ---------------------------------------------------------------------------
// Minimal CSV parser (RFC-4180-ish: handles quoted fields, escaped quotes,
// commas and newlines inside quotes).
// ---------------------------------------------------------------------------
function parseCSV(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else field += c
    } else {
      if (c === '"') inQuotes = true
      else if (c === ',') { row.push(field); field = '' }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
      else if (c === '\r') { /* ignore */ }
      else field += c
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows
}

// ---------------------------------------------------------------------------
// Build the new-resort list from the CSV, skipping legacy slugs.
// ---------------------------------------------------------------------------
const { resorts: legacyResorts } = require('./resorts')
const LEGACY_SLUGS = new Set(legacyResorts.map(r => r.slug))
const LEGACY_NAMES = new Set(legacyResorts.map(r => r.name.toLowerCase().trim()))

const CSV_PATH = path.join(__dirname, 'resorts-extra.csv')

function buildNewResorts() {
  if (!fs.existsSync(CSV_PATH)) return []
  const rows = parseCSV(fs.readFileSync(CSV_PATH, 'utf8'))
  const out = []
  const seen = new Set()
  for (const cols of rows) {
    if (cols.length < 19) continue
    const name = (cols[0] || '').trim()
    if (!name || /resort name/i.test(name) || /adults only/i.test(name)) continue // header rows
    const slug = slugify(name)
    if (!slug) continue
    if (LEGACY_SLUGS.has(slug) || LEGACY_NAMES.has(name.toLowerCase().trim())) continue // already authored
    if (seen.has(slug)) continue
    seen.add(slug)

    const country = (cols[14] || '').trim()
    const area = (cols[16] || '').trim()
    const ratings = {
      overall: num(cols[3]), food: num(cols[4]), beach: num(cols[5]), pool: num(cols[6]),
      atmosphere: num(cols[7]), location: num(cols[8]), room: num(cols[9]), value: num(cols[10]),
      cleanliness: num(cols[11]), service: num(cols[12]), sleepQuality: num(cols[13]),
    }
    const amenities = (cols[20] || '').split(',').map(s => s.trim()).filter(Boolean)

    out.push({
      slug,
      name,
      country,
      countrySlug: countrySlug(country),
      area,
      airport: (cols[17] || '').trim(),
      type: typeOf(cols[18]),
      ageNote: (cols[19] || '').trim() || null,
      priceLevel: (cols[2] || '').trim() || null,
      notes: null,
      // Editorial prose is generated separately; provide safe fallbacks so
      // resort detail pages render until enriched.
      description: '',
      heroTagline: '',
      whatYouNeedToKnow: '',
      bestTimeToVisit: '',
      activities: '',
      amenities,
      agodaLink: (cols[1] || '').trim(),
      ratings,
    })
  }
  return out
}

const newResorts = buildNewResorts()

// COMPANY_MAP covers both new and (where relevant) legacy resorts so that
// same-company cross-location pairs can be detected across both sets.
const COMPANY_MAP = {}
for (const r of [...legacyResorts, ...newResorts]) {
  const c = inferCompany(r.name)
  if (c) COMPANY_MAP[r.slug] = c
}

function companyOf(slug) { return COMPANY_MAP[slug] || null }

function zoneOf(r) {
  return r.country === 'Mexico' ? getMexicoZone(r.area, r.name) : null
}

function shouldGeneratePair(a, b) {
  // Preserve every pre-existing legacy comparison.
  if (LEGACY_SLUGS.has(a.slug) && LEGACY_SLUGS.has(b.slug)) return true
  // Same company, any location.
  const ac = companyOf(a.slug), bc = companyOf(b.slug)
  if (ac && bc && ac === bc) return true
  // Different countries (and not same company) → no page.
  if (a.country !== b.country) return false
  // Same country: Mexico requires the same nearby-city corridor.
  if (a.country === 'Mexico') return zoneOf(a) === zoneOf(b)
  return true
}

// pairOverviews for new pairs are generated into data/pair-overviews/ shards
// and merged in build.js. This module ships an empty object so build.js can
// spread it unconditionally.
const newPairOverviews = {}

module.exports = {
  newResorts,
  newPairOverviews,
  COMPANY_MAP,
  getMexicoZone,
  inferCompany,
  shouldGeneratePair,
  slugify,
}
