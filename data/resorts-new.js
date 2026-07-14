// New-resort ingestion + comparison-grouping logic.
//
// Parses data/resorts-extra-{1..4}.csv (the full ~885-row dataset) at load time,
// skips the 125 resorts already hand-authored in data/resorts.js, and emits
// the remaining resorts plus the helpers build.js uses to decide which
// resort pairs deserve a comparison page.
//
// CSV columns (20 total, no Address column):
//   0=Name 1=AffiliateLink 2=PriceLevel 3=AvgRating 4-13=Ratings
//   14=Country 15=Area 16=Airport 17=FamilyAdults 18=Notes 19=Amenities
//
// A pair gets a comparison page when:
//   - both resorts are legacy (already true in the original data), OR
//   - both belong to the same company (any location), OR
//   - both are in the same country (for Mexico: the same nearby-city corridor).

const fs = require('fs')
const path = require('path')

// ---------------------------------------------------------------------------
// Mexico nearby-city corridors.
// ---------------------------------------------------------------------------
const MEXICO_ZONES = {
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
  'Cabo San Lucas': 'los-cabos',
  'San Jose del Cabo': 'los-cabos',
  'Los Cabos': 'los-cabos',
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
  return area
}

// ---------------------------------------------------------------------------
// Company inference from resort name.
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
// Helpers
// ---------------------------------------------------------------------------
function slugify(name) {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
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

function countrySlugFn(country) { return slugify(country || 'unknown') }

function typeOf(raw) {
  return (raw || '').toLowerCase().includes('adult') ? 'adults-only' : 'family'
}

// ---------------------------------------------------------------------------
// Minimal RFC-4180-ish CSV parser
// ---------------------------------------------------------------------------
function parseCSV(text) {
  const rows = []
  let row = [], field = '', inQuotes = false
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
      else if (c === '\r') { /* skip */ }
      else field += c
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows
}

// ---------------------------------------------------------------------------
// Load legacy resorts and build new-resort list from CSV parts
// ---------------------------------------------------------------------------
const { resorts: legacyResorts } = require('./resorts')
const LEGACY_SLUGS = new Set(legacyResorts.map(r => r.slug))
const LEGACY_NAMES = new Set(legacyResorts.map(r => r.name.toLowerCase().trim()))

// CSV columns (20 total): 0=Name 1=AffiliateLink 2=PriceLevel 3=AvgRating
// 4=Food 5=Beach 6=Pool 7=Atmosphere 8=Location 9=Room 10=Value
// 11=Cleanliness 12=Service 13=SleepQuality 14=Country
// 15=Area 16=Airport 17=FamilyAdults 18=Notes 19=Amenities
const CSV_PARTS = [1, 2, 3, 4].map(n =>
  path.join(__dirname, `resorts-extra-${n}.csv`)
)

function buildNewResorts() {
  const out = [], seen = new Set()
  for (const csvPath of CSV_PARTS) {
    if (!fs.existsSync(csvPath)) continue
    const rows = parseCSV(fs.readFileSync(csvPath, 'utf8'))
    for (const cols of rows) {
      if (cols.length < 18) continue
      const name = (cols[0] || '').trim()
      if (!name || /resort name/i.test(name) || /^adults only$/i.test(name)) continue
      const slug = slugify(name)
      if (!slug) continue
      if (LEGACY_SLUGS.has(slug) || LEGACY_NAMES.has(name.toLowerCase().trim())) continue
      if (seen.has(slug)) continue
      seen.add(slug)
      const country = (cols[14] || '').trim()
      const area = (cols[15] || '').trim()
      out.push({
        slug, name, country,
        countrySlug: countrySlugFn(country),
        area,
        airport: (cols[16] || '').trim(),
        type: typeOf(cols[17]),
        ageNote: (cols[18] || '').trim() || null,
        priceLevel: (cols[2] || '').trim() || null,
        notes: null,
        description: '', heroTagline: '', whatYouNeedToKnow: '', bestTimeToVisit: '', activities: '',
        amenities: (cols[19] || '').split(',').map(s => s.trim()).filter(Boolean),
        agodaLink: (cols[1] || '').trim(),
        ratings: {
          overall: num(cols[3]), food: num(cols[4]), beach: num(cols[5]), pool: num(cols[6]),
          atmosphere: num(cols[7]), location: num(cols[8]), room: num(cols[9]), value: num(cols[10]),
          cleanliness: num(cols[11]), service: num(cols[12]), sleepQuality: num(cols[13]),
        },
      })
    }
  }
  return out
}

const newResorts = buildNewResorts()

// Build company map across all resorts (legacy + new)
const COMPANY_MAP = {}
for (const r of [...legacyResorts, ...newResorts]) {
  const c = inferCompany(r.name)
  if (c) COMPANY_MAP[r.slug] = c
}

function zoneOf(r) {
  return r.country === 'Mexico' ? getMexicoZone(r.area, r.name) : null
}

function shouldGeneratePair(a, b) {
  if (LEGACY_SLUGS.has(a.slug) && LEGACY_SLUGS.has(b.slug)) return true
  const ac = COMPANY_MAP[a.slug], bc = COMPANY_MAP[b.slug]
  if (ac && bc && ac === bc) return true
  if (a.country !== b.country) return false
  if (a.country === 'Mexico') return zoneOf(a) === zoneOf(b)
  return true
}

module.exports = {
  newResorts,
  newPairOverviews: {},
  COMPANY_MAP,
  getMexicoZone,
  inferCompany,
  shouldGeneratePair,
  slugify,
}
