// Editorial writer for resort-pair overviews — pure function of the two
// resort records, no API calls. build.js uses it as the lowest-priority
// fallback for any comparison page that has no stored (hand-authored or
// LLM-generated) overview.
//
// Every sentence slot has several phrasings and the choice is made with a
// PRNG seeded from the pair key, so pages read differently from each other
// but any given pair renders identically on every build.

const {
  rngFor, pick, cap, listJoin, locationOf, countryName,
  CATEGORY, topRatings, weakestRating, ratingGaps, PRICE_WORDS,
  seasonStr, destinationActivities, activityAmenities,
} = require('./destinations')

function art(word) { return /^[aeiou]/i.test(word) ? 'an' : 'a' }

// ---- resort identity ----------------------------------------------------------
// Key Differences opens with what each property actually IS — setting,
// character, signature features — pulled from the researched
// whatYouNeedToKnow paragraph, instead of narrating the rating table (which
// sits directly above the text). The first sentence of every resort's
// whatYouNeedToKnow is a concrete identity statement, so we lift its
// predicate ("is a couples-only resort on Cable Beach with its own offshore
// private island…") and re-use it here.

const ABBREV_BEFORE_PERIOD = /(?:\b[A-Z]|\bSt|\bMr|\bMrs|\bDr|\bMt|\bFt|\bvs|\bU\.S)$/

function firstSentence(text) {
  const re = /\.\s+(?=[A-Z0-9])/g
  let m
  while ((m = re.exec(text))) {
    if (ABBREV_BEFORE_PERIOD.test(text.slice(0, m.index))) continue
    return text.slice(0, m.index)
  }
  return text
}

function tidyPredicate(pred) {
  let p = pred.replace(/\s+/g, ' ').trim()
  // Drop transfer/airport logistics — good detail for the resort page, noise
  // in a one-line identity. pred is a single sentence, so cutting "reached
  // via …" through to the end is safe (airport names contain initials like
  // "Henry E. Rohlsen", so a period-bounded match would truncate mid-name).
  p = p.replace(/,?\s*(and\s+)?(reached|served)\s+(via|by)\b.*$/i, '')
  p = p.replace(/,?\s*(about|roughly)\s+\d+[^,;—]*?(minutes?|hours?|km|miles)[^,;—]*/i, '')
  // Any comma-bounded clause that exists to state airport proximity
  // ("roughly an hour from Sangster International Airport") goes too.
  p = p.replace(/,\s*[^,;—]*\b(airport|international(\s+\([A-Z]{3}\))?)\b[^,;—]*/gi, '')
  if (p.length > 180) {
    const cut = Math.max(p.lastIndexOf(',', 180), p.lastIndexOf(' — ', 180), p.lastIndexOf(';', 180))
    if (cut > 60) p = p.slice(0, cut)
  }
  p = p.replace(/[,;\s—]+$/, '').trim()
  // A trimmed trailing clause can leave a comma stranded inside a closing
  // quote ('…the "Platinum Coast,"').
  p = p.replace(/[,;]\s*(["'”’])$/, '$1')
  if (p.endsWith('.')) p = p.slice(0, -1)
  return p
}

// Returns a predicate beginning with a lowercase verb ("is …", "sits on …")
// so callers can write `${r.name} ${identityOf(r)}`.
function identityOf(r) {
  const priceWord = PRICE_WORDS[r.priceLevel]
  const typeWord = r.type === 'adults-only' ? 'adults-only' : 'family-friendly'
  const descNoun = `${priceWord ? priceWord + ' ' : ''}${typeWord} all-inclusive in ${locationOf(r)}`
  const fallback = `is ${art(descNoun)} ${descNoun}`

  const text = (r.whatYouNeedToKnow || '').trim()
  if (!text) return fallback
  const sentence = firstSentence(text)

  let pred = null
  if (sentence.toLowerCase().startsWith(r.name.toLowerCase())) {
    pred = sentence.slice(r.name.length).trim()
  }
  if (!pred || !/^(is|sits|occupies|lies|anchors|fronts|spreads|stretches|runs)\b/i.test(pred)) {
    // Names in prose sometimes differ slightly from the record name
    // ("Sugar Cane Club" vs "Sugar Cane Club Hotel & Spa"); grab the
    // predicate from the first linking verb — but only when the words
    // before the verb are actually the resort's name, not some other
    // subject like "Juan Gualberto Gómez Airport is…".
    const m = sentence.match(/^(.{0,80}?)\b(is|sits|occupies|lies|anchors|fronts)\b/i)
    if (m) {
      const prefix = m[1].toLowerCase()
      const nameTokens = r.name.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3)
      if (nameTokens.some(w => prefix.includes(w))) {
        pred = sentence.slice(m.index + m[0].length - m[2].length).trim()
      }
    }
  }
  if (!pred || !/^(is|sits|occupies|lies|anchors|fronts|spreads|stretches|runs)\b/i.test(pred)) return fallback
  // Reject logistics predicates ("is typically 20 to 30 minutes from…") that
  // slip through when the sentence's subject phrase mentions the resort name.
  if (/^is\s+(typically|about|roughly|around|just|only|accessible|the\s+(most\s+convenient|closest|nearest))\b/i.test(pred) || /^is\s+\d/.test(pred)) return fallback
  const tidied = tidyPredicate(pred)
  // If transfer/airport language survived the trims (non-comma-bounded
  // phrasings vary too much to chase), use the generic identity instead.
  if (/\b(airport|minutes?\s+from|hours?\s+from)\b/i.test(tidied)) return fallback
  return tidied.length >= 25 ? tidied : fallback
}

// ---- signature draws ----------------------------------------------------------
// The distinctive, bookable experiences each resort is known for, detected
// from its researched activities + whatYouNeedToKnow prose. Specific named
// draws (the Cane Bay wall, the blue holes, cenotes) rank above generic
// categories (diving, a spa) that most resorts share. Used to contrast what
// you'd actually DO differently at each — the real location/activity split —
// rather than narrating the rating card.
const DRAWS = [
  // iconic, one-of-a-kind draws
  [/blue holes?/i, 'the blue holes'],
  [/swimming[ -]pigs/i, 'the swimming pigs'],
  [/cenote/i, 'cenote swims'],
  [/chich[eé]n|coba|mayan ruins|tulum ruins|maya ruins/i, 'Mayan ruins'],
  [/\bpitons?\b/i, 'the Pitons'],
  [/dunn'?s river/i, "Dunn's River Falls"],
  [/marietas/i, 'the Marietas Islands'],
  [/bianca c\b/i, 'the Bianca C wreck dive'],
  [/underwater sculpture/i, 'the Underwater Sculpture Park'],
  [/crystal cave/i, 'the Crystal Caves'],
  // strong activity-type differentiators
  [/whale[ -]?watch/i, 'whale watching'],
  [/\bcasino\b/i, 'a casino'],
  [/golf/i, 'golf'],
  [/water[ -]?park|pirates island water|lazy river|flowrider|surf simulator/i, 'a waterpark'],
  [/kitesurf|kiteboard|kite school/i, 'kitesurfing'],
  [/\bsurf(ing|ers?| boards?| breaks?| lessons?| camp| town)/i, 'surfing'],
  [/ziplin|canopy tour/i, 'ziplining'],
  [/over[- ]?water (bungalow|villa|suite)/i, 'overwater bungalows'],
  [/offshore (private )?island|private cay|its own .{0,12}island/i, 'an offshore private island'],
  [/flying trapeze|circus (program|workshop|clinic)/i, 'a flying trapeze'],
  [/hot springs?|volcanic (vent|spring)/i, 'hot springs'],
  [/rainforest|jungle (tour|excursion|hike)/i, 'rainforest excursions'],
  [/bonefish/i, 'bonefishing'],
  // named reefs / dive sites
  [/(barrier|mesoamerican) reef/i, 'the barrier reef'],
  [/buck island/i, 'Buck Island reef'],
  [/cane bay/i, 'the Cane Bay wall'],
  [/champagne reef/i, 'Champagne Reef'],
  [/saona|catalina island/i, 'catamaran trips to the islands'],
  // generic categories many resorts share — only surface if nothing rarer
  [/scuba|\bdiv(e|ing|ers?)\b/i, 'scuba diving', true],
  [/snorkel/i, 'snorkeling', true],
  [/\bspa\b/i, 'the spa', true],
  [/kids'? club|sesame street|teen club/i, "kids' clubs", true],
  [/nightclub|disco\b|nightlife/i, 'nightlife', true],
  [/\btennis\b/i, 'tennis', true],
]

function signatureDraws(r) {
  const text = `${r.activities || ''} ${r.whatYouNeedToKnow || ''}`
  const specific = [], generic = []
  for (const [re, phrase, isGeneric] of DRAWS) {
    if (re.test(text)) (isGeneric ? generic : specific).push(phrase)
  }
  return { specific, generic, all: [...specific, ...generic] }
}

// Draws unique to `r` versus `other` — the things you'd do at one and not the
// other. Specific draws only: a shared category (both dive, both have a spa)
// is not a difference worth writing, so generics are never contrasted.
function distinctiveDraws(r, other, n = 2) {
  const theirs = new Set(signatureDraws(other).all)
  return signatureDraws(r).specific.filter(p => !theirs.has(p)).slice(0, n)
}

// ---- section writers -----------------------------------------------------------
function writeKeyDifferences(a, b, rng) {
  const parts = []
  const sameCountry = a.country && a.country === b.country
  const idA = identityOf(a), idB = identityOf(b)

  // 1. What each place actually is
  if (sameCountry) {
    parts.push(pick(rng, [
      `${a.name} ${idA}. ${b.name}, meanwhile, ${idB}.`,
      `Both call ${countryName(a.country)} home, but they're different animals: ${a.name} ${idA}, while ${b.name} ${idB}.`,
      `Start with what each place actually is. ${a.name} ${idA}; ${b.name} ${idB}.`,
    ]))
  } else {
    parts.push(pick(rng, [
      `${a.name} ${idA}. ${b.name}, an entirely different trip, ${idB}.`,
      `${a.name} ${idA}, while ${b.name} ${idB} — as much a choice between destinations as between resorts.`,
      `These are two different ideas of a vacation. ${a.name} ${idA}; ${b.name} ${idB}.`,
    ]))
  }

  // 2. What you'd actually do differently — the location/activity split,
  // drawn from each resort's distinctive, bookable experiences.
  const aOnly = distinctiveDraws(a, b, 2), bOnly = distinctiveDraws(b, a, 2)
  const haveDraws = aOnly.length && bOnly.length
  if (haveDraws) {
    parts.push(pick(rng, [
      `Day to day, the two promise different things: ${listJoin(aOnly)} at ${a.name}, versus ${listJoin(bOnly)} at ${b.name}.`,
      `You'd spend your days differently, too — ${a.name} is the one for ${listJoin(aOnly)}, while ${b.name} leans on ${listJoin(bOnly)}.`,
      `The activity mix diverges as well: at ${a.name}, expect ${listJoin(aOnly)}; ${b.name} counters with ${listJoin(bOnly)}.`,
    ]))
  }

  // 3. At most ONE ratings insight — the single gap that genuinely matters —
  // instead of narrating the whole scorecard.
  const gaps = ratingGaps(a, b, 0.8)
  const ao = a.ratings.overall, bo = b.ratings.overall
  if (gaps.length) {
    const g = gaps[0]
    const w = g.diff > 0 ? a : b
    const cat = CATEGORY[g.k]
    const edge = Math.abs(g.diff) >= 1.5 ? 'a commanding edge' : 'a clear edge'
    parts.push(pick(rng, [
      `On the ratings themselves, the difference that matters most is ${cat.noun}: ${w.name} holds ${edge} there, ${pick(rng, cat.consequences)}.`,
      `Where guest ratings genuinely separate them is ${cat.noun} — ${w.name}'s advantage is hard to ignore, ${pick(rng, cat.consequences)}.`,
    ]))
  } else if (!haveDraws) {
    parts.push(pick(rng, [
      `On guest ratings the two are hard to separate — the choice here is really about place and personality, not quality.`,
      `The ratings won't make this decision for you; both hold their own, so let the destination and the style of stay decide.`,
    ]))
  }

  // 4. Close on the single most decisive factor: audience (the hardest
  // constraint) if it differs, else the overall guest-score edge, else — only
  // when no activity contrast was drawn above — each resort's strongest
  // motivating category.
  if (a.type !== b.type) {
    const adults = a.type === 'adults-only' ? a : b
    const fam = a.type === 'adults-only' ? b : a
    parts.push(pick(rng, [
      `For many travelers, though, the simplest decider comes first: ${adults.name} is adults-only, while ${fam.name} welcomes families.`,
      `One constraint may settle it before anything else — ${adults.name} is adults-only, ${fam.name} is built for families.`,
    ]))
  } else if (ao != null && bo != null && Math.abs(ao - bo) >= 0.6) {
    const ow = ao >= bo ? a : b
    parts.push(pick(rng, [
      `If the call is still close, ${ow.name} carries the stronger overall guest score.`,
      `And when it comes down to overall guest sentiment, ${ow.name} has the edge.`,
    ]))
  } else if (!haveDraws) {
    const HYGIENE = new Set(['cleanliness', 'sleepQuality'])
    const motivating = (r, exclude) => {
      const t = topRatings(r, 4)
      return t.find(x => x.k !== exclude && !HYGIENE.has(x.k)) || t.find(x => x.k !== exclude) || t[0]
    }
    const ma = motivating(a), mb0 = motivating(b)
    let ka = ma && ma.k, kb = mb0 && mb0.k
    if (ka && kb && ka === kb) { const alt = motivating(b, kb); if (alt) kb = alt.k }
    if (ka && kb && ka !== kb) {
      parts.push(pick(rng, [
        `Past that, ${a.name} leans on ${CATEGORY[ka].strength}, ${b.name} on ${CATEGORY[kb].strength}.`,
        `Beyond that, the pull is ${CATEGORY[ka].strength} at ${a.name}, ${CATEGORY[kb].strength} at ${b.name}.`,
      ]))
    }
  }

  return parts.join(' ')
}

// `avoid` carries the template indices used for the other resort's blurb so the
// two "who should choose" blocks on one page never share the same skeleton.
function writeWhoShouldChoose(r, other, rng, avoid = {}) {
  const top = topRatings(r, 2)
  const weak = weakestRating(r)
  const price = PRICE_WORDS[r.priceLevel]
  const loc = locationOf(r)
  const audience = r.type === 'adults-only'
    ? pick(rng, ['couples and adults traveling without kids', 'travelers after a child-free stay'])
    : pick(rng, ['families', 'multi-generational groups and families'])
  const parts = []
  const used = { openerIdx: null, settingIdx: null, caveatIdx: null }

  if (top.length >= 2) {
    const n1 = CATEGORY[top[0].k].noun, n2 = CATEGORY[top[1].k].noun
    const openers = [
      `${r.name} is the pick for ${audience} who put ${n1} and ${n2} at the top of the list — those are where guests rate it best.`,
      `Choose ${r.name} if ${n1} is what you're really buying: it's the resort's calling card, with ${n2} close behind. It suits ${audience}.`,
      `Book ${r.name} when ${n1} and ${n2} matter more than anything else on the card — a natural fit for ${audience}.`,
    ]
    let oi = Math.floor(rng() * openers.length)
    if (oi === avoid.openerIdx) oi = (oi + 1) % openers.length
    used.openerIdx = oi
    parts.push(openers[oi])
  } else {
    parts.push(`${r.name} suits ${audience} looking for a straightforward stay in ${loc}.`)
  }

  if (price) {
    const settings = [
      `It's ${art(price)} ${price} property in ${loc}.`,
      `Expect ${price} pricing in ${loc}.`,
    ]
    let si = Math.floor(rng() * settings.length)
    if (si === avoid.settingIdx) si = (si + 1) % settings.length
    used.settingIdx = si
    parts.push(settings[si])
  } else {
    parts.push(`It sits in ${loc}.`)
  }

  if (weak && weak.v < 7.5) {
    const caveats = [
      `Just go in with measured expectations for ${CATEGORY[weak.k].noun} — it's the soft spot.`,
      `The trade-off is ${CATEGORY[weak.k].noun}, the one category where guests consistently mark it down.`,
      `Its rating card does dip on ${CATEGORY[weak.k].noun}, so weight that accordingly.`,
    ]
    let ci = Math.floor(rng() * caveats.length)
    if (ci === avoid.caveatIdx) ci = (ci + 1) % caveats.length
    used.caveatIdx = ci
    parts.push(caveats[ci])
  } else if (r.ratings.overall != null && other.ratings.overall != null && r.ratings.overall >= other.ratings.overall) {
    parts.push(pick(rng, [
      `It also carries the stronger overall score of the pair.`,
      `Overall, it's the higher-rated of the two.`,
    ]))
  }

  return { text: parts.join(' '), used }
}

function writeWhenToVisit(a, b, rng) {
  if (a.country && a.country === b.country) {
    return pick(rng, [
      `Both resorts run on the same weather calendar, so timing is one decision, not two. ${seasonStr(a.country)}`,
      `Seasonality is identical here — one climate covers both properties. ${seasonStr(a.country)}`,
      `Whichever resort wins, the calendar advice is the same. ${seasonStr(a.country)}`,
    ])
  }
  return pick(rng, [
    `The two destinations run on different calendars. For ${a.name} in ${a.country ? countryName(a.country) : 'its region'}: ${seasonStr(a.country)} For ${b.name} in ${b.country ? countryName(b.country) : 'its region'}: ${seasonStr(b.country)}`,
    `Timing depends on which destination you pick. ${a.country ? cap(countryName(a.country)) : a.name}: ${seasonStr(a.country)} ${b.country ? cap(countryName(b.country)) : b.name}: ${seasonStr(b.country)}`,
  ])
}

function writeActivities(a, b, rng) {
  const aActs = activityAmenities(a, 3)
  const bActs = activityAmenities(b, 3)
  const parts = []

  if (aActs.length && bActs.length) {
    parts.push(pick(rng, [
      `On site, ${a.name} covers ${listJoin(aActs)}, while ${b.name} answers with ${listJoin(bActs)}.`,
      `${a.name} keeps guests busy with ${listJoin(aActs)}; ${b.name} counters with ${listJoin(bActs)}.`,
    ]))
  } else if (aActs.length || bActs.length) {
    const has = aActs.length ? a : b
    const acts = aActs.length ? aActs : bActs
    parts.push(`On site, ${has.name} offers ${listJoin(acts)}.`)
  }

  if (a.country && a.country === b.country) {
    parts.push(pick(rng, [
      `Off property, ${countryName(a.country)} adds ${destinationActivities(a)}.`,
      `Beyond the resort gates, count on ${destinationActivities(a)}.`,
    ]))
  } else {
    const aDest = destinationActivities(a), bDest = destinationActivities(b)
    parts.push(`Off property the destinations diverge: around ${a.name}, expect ${aDest}; near ${b.name}, ${bDest}.`)
  }

  return parts.join(' ')
}

// ---- public API ---------------------------------------------------------------
function buildOverview(a, b) {
  const rng = rngFor(`${a.slug}-vs-${b.slug}`)
  const keyDifferences = writeKeyDifferences(a, b, rng)
  const chooseA = writeWhoShouldChoose(a, b, rng)
  const chooseB = writeWhoShouldChoose(b, a, rng, chooseA.used)
  return {
    keyDifferences,
    whoShouldChooseA: chooseA.text,
    whoShouldChooseB: chooseB.text,
    whenToVisit: writeWhenToVisit(a, b, rng),
    activities: writeActivities(a, b, rng),
  }
}

module.exports = { buildOverview }
