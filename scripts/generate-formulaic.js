#!/usr/bin/env node
// Formulaic pair overview generator — no API calls, instant output.
// Generates keyDifferences, whoShouldChooseA/B, whenToVisit, activities
// from resort data fields (ratings, country, area, amenities, price, type).

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const SHARD_DIR = path.join(ROOT, 'data', 'pair-overviews')
const PENDING_JSONL = path.join(SHARD_DIR, '_pending.jsonl')
const SHARD_SIZE = parseInt(process.env.SHARD_SIZE || '5000', 10)
const OUT_PREFIX = process.env.OUT_PREFIX || 'formulaic'

const { resorts: legacyResorts, pairOverviews: legacyPairOverviews } = require(path.join(ROOT, 'data', 'resorts'))
const { newResorts, shouldGeneratePair, LEGACY_SLUGS } = require(path.join(ROOT, 'data', 'resorts-new'))
const resorts = [...legacyResorts, ...newResorts]

// ---- load already-done keys ------------------------------------------------
fs.mkdirSync(SHARD_DIR, { recursive: true })
const done = new Set(Object.keys(legacyPairOverviews))
let nextShard = 0
for (const f of fs.readdirSync(SHARD_DIR).sort()) {
  const m = f.match(/^shard-(\d+)\.js$/)
  if (m) { nextShard = Math.max(nextShard, parseInt(m[1], 10) + 1); for (const k of Object.keys(require(path.join(SHARD_DIR, f)))) done.add(k); continue }
  if (f.endsWith('.js') && f !== 'shard-0000.js') { try { for (const k of Object.keys(require(path.join(SHARD_DIR, f)))) done.add(k) } catch(e){} }
}
if (fs.existsSync(PENDING_JSONL)) {
  for (const line of fs.readFileSync(PENDING_JSONL, 'utf8').split('\n')) {
    if (!line.trim()) continue
    try { const { key } = JSON.parse(line); done.add(key) } catch(e){}
  }
}

const RATING_LABELS = { overall:'Overall',food:'Food',beach:'Beach',pool:'Pool',atmosphere:'Atmosphere',location:'Location',room:'Room',value:'Value',cleanliness:'Cleanliness',service:'Service',sleepQuality:'Sleep Quality' }

function fmt(v) { return v != null ? v.toFixed(1) : 'n/a' }

function topRatings(r, n=3) {
  return Object.entries(r.ratings)
    .filter(([k,v]) => v != null && k !== 'overall')
    .sort(([,a],[,b]) => b - a)
    .slice(0, n)
    .map(([k,v]) => `${RATING_LABELS[k]||k} (${fmt(v)})`)
}

function weakRatings(r, n=2) {
  return Object.entries(r.ratings)
    .filter(([k,v]) => v != null && k !== 'overall')
    .sort(([,a],[,b]) => a - b)
    .slice(0, n)
    .map(([k,v]) => `${RATING_LABELS[k]||k} (${fmt(v)})`)
}

function bigGaps(a, b, n=3) {
  const gaps = []
  for (const k of Object.keys(RATING_LABELS)) {
    if (k === 'overall') continue
    const av = a.ratings[k], bv = b.ratings[k]
    if (av == null || bv == null) continue
    const diff = av - bv
    if (Math.abs(diff) >= 0.5) gaps.push({ k, diff, av, bv })
  }
  gaps.sort((x,y) => Math.abs(y.diff) - Math.abs(x.diff))
  return gaps.slice(0, n)
}

function priceStr(p) {
  if (!p) return null
  return { '$':'budget', '$$':'mid-range', '$$$':'upscale', '$$$$':'luxury' }[p] || p
}

function locationStr(r) {
  if (r.area) return `${r.area}, ${r.country}`
  return r.country
}

function amenityHighlights(r, n=4) {
  if (!r.amenities || !r.amenities.length) return []
  const priority = ['Spa','Casino','Golf','Scuba Diving','Snorkeling','Water Park','Kids Club','Butler Service','Swim-up Bar','Overwater Bungalow','Adults Only','Nightclub','Tennis','Yoga Classes']
  const hits = priority.filter(a => r.amenities.includes(a))
  if (hits.length >= n) return hits.slice(0, n)
  return [...hits, ...r.amenities.filter(a => !hits.includes(a))].slice(0, n)
}

function seasonStr(country) {
  const seasons = {
    'Mexico': 'December through April (dry season). Hurricane season runs June–November; Riviera Maya and Cancun see the most risk August–October.',
    'Jamaica': 'December through April for the driest weather. Hurricane season peaks August–October.',
    'Dominican Republic': 'December through April. The north coast (Puerto Plata) gets more rain year-round than Punta Cana.',
    'Cuba': 'November through April (dry season). Summer is hot and humid with occasional tropical storms.',
    'Bahamas': 'December through May. Hurricane season June–November; peak risk August–October.',
    'Barbados': 'December through May. Barbados sits south of the main hurricane belt and sees less storm risk than most Caribbean islands.',
    'Saint Lucia': 'January through April for the driest weather. The island is lush year-round due to reliable rainfall.',
    'Turks and Caicos': 'December through April. Water visibility is excellent year-round for diving.',
    'Antigua': 'January through April. The island averages only 45 inches of rain per year — one of the driest in the Caribbean.',
    'Aruba': 'Year-round. Aruba sits outside the hurricane belt and receives less than 20 inches of rain annually.',
    'Curacao': 'Year-round. Like Aruba, Curacao sits outside the hurricane belt with consistent trade winds.',
    'Panama': 'The Pacific coast (Farallon) is driest December through April. Bocas del Toro on the Caribbean side is drier September–October.',
    'Costa Rica': 'December through April on the Pacific coast (Guanacaste). The Caribbean coast has no true dry season.',
    'Honduras': 'March through May for Bay Islands diving. December through February is also dry and popular.',
    'Belize': 'February through May. Dive visibility peaks in April.',
  }
  return seasons[country] || 'Check local climate guides for the best time to visit, as weather patterns vary by region and season.'
}

function buildOverview(a, b) {
  const gaps = bigGaps(a, b)
  const aTop = topRatings(a)
  const bTop = topRatings(b)
  const aWeak = weakRatings(a)
  const bWeak = weakRatings(b)
  const aPrice = priceStr(a.priceLevel)
  const bPrice = priceStr(b.priceLevel)
  const aLoc = locationStr(a)
  const bLoc = locationStr(b)
  const aAmen = amenityHighlights(a)
  const bAmen = amenityHighlights(b)
  const sameCountry = a.country === b.country

  let kd = ''
  const aOverall = fmt(a.ratings.overall), bOverall = fmt(b.ratings.overall)
  kd += `${a.name} (${aLoc}, overall ${aOverall}) and ${b.name} (${bLoc}, overall ${bOverall}) `
  if (!sameCountry) {
    kd += `sit in different countries, appealing to guests with distinct destination preferences. `
  } else if (a.area && b.area && a.area !== b.area) {
    kd += `both sit in ${a.country} but in different areas — ${a.area} versus ${b.area}. `
  } else {
    kd += `are both ${a.country} all-inclusives that compete for a similar traveller. `
  }
  if (gaps.length > 0) {
    const g = gaps[0]
    const winner = g.diff > 0 ? a.name : b.name
    const loser = g.diff > 0 ? b.name : a.name
    const winVal = g.diff > 0 ? g.av : g.bv
    const loseVal = g.diff > 0 ? g.bv : g.av
    kd += `The clearest rating gap is ${RATING_LABELS[g.k]||g.k}: ${winner} scores ${fmt(winVal)} versus ${fmt(loseVal)} for ${loser}. `
  }
  if (gaps.length > 1) {
    const g = gaps[1]
    const winner = g.diff > 0 ? a.name : b.name
    const loser = g.diff > 0 ? b.name : a.name
    const winVal = g.diff > 0 ? g.av : g.bv
    const loseVal = g.diff > 0 ? g.bv : g.av
    kd += `${winner} also leads on ${RATING_LABELS[g.k]||g.k} (${fmt(winVal)} vs ${fmt(loseVal)}). `
  }
  kd += `${a.name} scores highest in ${aTop.join(', ')}; its weakest ratings are ${aWeak.join(' and ')}. `
  kd += `${b.name}'s strongest scores are ${bTop.join(', ')}, with ${bWeak.join(' and ')} as relative weak spots. `
  if (aPrice || bPrice) {
    if (aPrice === bPrice) { kd += `Both are ${aPrice||'similarly priced'} properties. ` }
    else if (aPrice && bPrice) { kd += `Price-wise, ${a.name} is ${aPrice} while ${b.name} is ${bPrice}. ` }
    else { kd += `${aPrice ? a.name + ' is ' + aPrice : b.name + ' is ' + bPrice}. ` }
  }
  if (a.type !== b.type) { kd += `${a.name} is ${a.type.replace('-',' ')}, while ${b.name} is ${b.type.replace('-',' ')}. ` }

  let wA = `${a.name} suits `
  if (a.type === 'adults-only') wA += 'couples and adult travellers '
  else if (a.type === 'family') wA += 'families with children '
  else wA += 'travellers '
  wA += `who prioritise ${aTop.slice(0,2).join(' and ')} in ${aLoc}. `
  if (aPrice) wA += `At a ${aPrice} price point, `
  if (aAmen.length) wA += `it offers ${aAmen.slice(0,3).join(', ')}. `
  wA += `Best for guests where ${aTop[0]||'overall experience'} is the primary deciding factor.`

  let wB = `${b.name} suits `
  if (b.type === 'adults-only') wB += 'couples and adult travellers '
  else if (b.type === 'family') wB += 'families with children '
  else wB += 'travellers '
  wB += `who prioritise ${bTop.slice(0,2).join(' and ')} in ${bLoc}. `
  if (bPrice) wB += `At a ${bPrice} price point, `
  if (bAmen.length) wB += `it offers ${bAmen.slice(0,3).join(', ')}. `
  wB += `Best for guests where ${bTop[0]||'overall experience'} is the primary deciding factor.`

  let when = ''
  if (sameCountry) { when = `Both resorts are in ${a.country}. ${seasonStr(a.country)}` }
  else { when = `${a.name} is in ${a.country}: ${seasonStr(a.country)} ${b.name} is in ${b.country}: ${seasonStr(b.country)}` }

  const allAmen = [...new Set([...aAmen, ...bAmen])].slice(0, 6)
  let acts = ''
  if (aAmen.length || bAmen.length) { acts += `Between the two resorts, on-site activities include ${allAmen.join(', ')}. ` }
  acts += `${a.name} in ${aLoc} `
  acts += a.country !== 'Maldives' && a.country !== 'Fiji' ? `offers access to local excursions and watersports typical of ${a.country}. ` : `is a remote overwater destination focused on snorkelling, diving, and reef exploration. `
  acts += `${b.name} in ${bLoc} `
  acts += b.country !== 'Maldives' && b.country !== 'Fiji' ? `similarly provides watersports, beach access, and regional cultural excursions.` : `similarly centres on marine activity and seclusion.`

  return { keyDifferences: kd.trim(), whoShouldChooseA: wA.trim(), whoShouldChooseB: wB.trim(), whenToVisit: when.trim(), activities: acts.trim() }
}

function allPairs() {
  const pairs = []
  for (let i = 0; i < resorts.length; i++)
    for (let j = i + 1; j < resorts.length; j++) {
      const x = resorts[i], y = resorts[j]
      if (!shouldGeneratePair(x, y)) continue
      if (LEGACY_SLUGS.has(x.slug) && LEGACY_SLUGS.has(y.slug)) continue
      const [a, b] = x.slug < y.slug ? [x, y] : [y, x]
      const key = `${a.slug}-vs-${b.slug}`
      if (done.has(key)) continue
      pairs.push({ a, b, key })
    }
  return pairs
}

const pending = allPairs()
console.log(`Remaining: ${pending.length} | nextShard: ${nextShard}`)

const results = {}
const unsharded = []

function record(key, value) { results[key] = value; unsharded.push(key) }

function maybeFlush(final) {
  while (unsharded.length >= SHARD_SIZE || (final && unsharded.length > 0)) {
    const take = unsharded.splice(0, SHARD_SIZE)
    const obj = {}; for (const k of take) obj[k] = results[k]
    const name = `${OUT_PREFIX}-shard-${String(nextShard++).padStart(4, '0')}.js`
    fs.writeFileSync(path.join(SHARD_DIR, name),
      `// Auto-generated formulaic overviews. Do not edit by hand.\nmodule.exports = ${JSON.stringify(obj, null, 2)}\n`)
    console.log(`FLUSHED ${name} (${take.length} entries)`)
  }
}

let i = 0
for (const { a, b, key } of pending) {
  record(key, buildOverview(a, b))
  i++
  if (i % 5000 === 0) { maybeFlush(false); console.log(`Progress: ${i}/${pending.length}`) }
}
maybeFlush(true)
console.log(`DONE: generated ${i} formulaic overviews across ${nextShard} shards`)
