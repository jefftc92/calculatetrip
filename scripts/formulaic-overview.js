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
  seasonStr, destinationActivities, destinationCharacter, destinationDrawShort,
  activityAmenities,
} = require('./destinations')

function art(word) { return /^[aeiou]/i.test(word) ? 'an' : 'a' }

// Site style: no em or en dashes in prose. Convert numeric/date ranges to
// "to", turn any remaining dash into sentence punctuation, and tidy the
// spacing that leaves behind. Applied to every generated string.
function deDash(s) {
  return s
    .replace(/(\w)\s*[–]\s*(\w)/g, '$1 to $2')
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/\s+([,;.])/g, '$1')
    .replace(/,\s*([,;.])/g, '$1')
    .replace(/([;:])\s*,/g, '$1')
}

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
  // Editorial meta-asides describe our record rather than the resort:
  // "making it one of the more convenient properties to reach", an em-dash
  // aside like "— about as convenient a location as exists in our database"
  // or "— the longer transfer is the tradeoff for …".
  p = p.replace(/,?\s*making it\b.*$/i, '')
  p = p.replace(/\s*[—–]\s*[^—–]*\b(convenient|in our database|as exists|transfer|trade[- ]?off)\b.*$/i, '')
  p = p.replace(/,\s*[^,;—]*\bconvenient\b[^,;—]*/gi, '')
  // Rating-card recitations ("reflected in its 8 beach score") belong to the
  // score table shown directly above, never to the prose identity.
  p = p.replace(/[,—–]\s*(reflected in|as reflected|which shows|scoring)\b[^,;—]*/gi, '')
  p = p.replace(/[,—–]\s*[^,;—]*\b\d+(\.\d+)?[- ]?(point\s+)?\w*\s*(score|rating)s?\b[^,;—]*/gi, '')
  // A coordinating fragment ("…, and sits …") can lose its object once the
  // airport tail behind it is cut; drop the now-dangling verb.
  p = p.replace(/,?\s*and\s+(sits?|lies?|stands?)\s*$/i, '')
  // Any surviving dash aside becomes a comma clause (site style: no em dashes).
  p = p.replace(/\s*[—–]\s*/g, ', ').replace(/,\s*,/g, ',')
  if (p.length > 180) {
    const cut = Math.max(p.lastIndexOf(',', 180), p.lastIndexOf(';', 180))
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
  // Some researched first sentences ARE score summaries ("…with solid, if
  // unspectacular, scores — beach and location both above 8.3"). Reciting the
  // rating card in the identity is exactly what we're avoiding, so when score
  // language or a decimal rating survives, fall back to the plain identity.
  if (/\bscores?\b|\bratings?\b|\brat(e|es|ed|ing)\s+(well|strongly|highly|modestly|poorly)\b|\b\d\.\d\b|\bin the (mid|upper|lower|low|high)\b/i.test(tidied)) return fallback
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
  // iconic, one-of-a-kind draws (kept plain-English so a non-expert reader
  // knows what each one actually is)
  [/blue holes?/i, 'diving in deep underwater caves'],
  [/swimming[ -]pigs/i, 'the famous swimming pigs'],
  [/cenote/i, 'swimming in freshwater cave pools'],
  [/chich[eé]n|coba|mayan ruins|tulum ruins|maya ruins/i, 'ancient Maya ruins'],
  [/\bpitons?\b/i, 'the Piton mountains'],
  [/dunn'?s river/i, "climbing Dunn's River Falls"],
  [/marietas/i, 'boat trips to the Marietas Islands'],
  [/bianca c\b/i, 'a famous shipwreck dive'],
  [/underwater sculpture/i, 'an underwater sculpture park'],
  [/crystal cave/i, 'the underground Crystal Caves'],
  // strong activity-type differentiators
  [/whale[ -]?watch/i, 'whale watching'],
  [/\bcasino\b/i, 'a casino'],
  [/golf/i, 'golf'],
  [/water[ -]?park|pirates island water|lazy river|flowrider|surf simulator/i, 'a water park'],
  [/kitesurf|kiteboard|kite school/i, 'kitesurfing'],
  [/\bsurf(ing|ers?| boards?| breaks?| lessons?| camp| town)/i, 'surfing'],
  [/ziplin|canopy tour/i, 'zip-lining'],
  [/over[- ]?water (bungalow|villa|suite)/i, 'overwater bungalows'],
  [/offshore (private )?island|private cay|its own .{0,12}island/i, 'its own private island'],
  [/flying trapeze|circus (program|workshop|clinic)/i, 'a flying trapeze'],
  [/hot springs?|volcanic (vent|spring)/i, 'natural hot springs'],
  [/rainforest|jungle (tour|excursion|hike)/i, 'rainforest trips'],
  [/bonefish/i, 'shallow-water fly fishing'],
  // named reefs / dive sites
  [/(barrier|mesoamerican) reef/i, 'the barrier reef'],
  [/buck island/i, 'snorkeling the Buck Island reef'],
  [/cane bay/i, 'wall diving at Cane Bay'],
  [/champagne reef/i, 'snorkeling over warm volcanic springs at Champagne Reef'],
  [/saona|catalina island/i, 'catamaran trips to nearby islands'],
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

// ---- character / vibe ---------------------------------------------------------
// A one-phrase read on the FEEL of a stay, detected from the researched prose.
// Only ever used when the two resorts' characters actually differ.
const CHARACTERS = [
  [/lodge experience|no televisions?|\brustic\b|unplugged|off-grid|barefoot|back-to-basics/i, 'rustic, unplugged'],
  [/clothing-optional|adults-only party|temptation|hedonis/i, 'high-energy'],
  [/\bboutique\b|intimate|a handful of|only \d+ (rooms|suites|villas)|small-scale|deeply personal/i, 'small, intimate'],
  [/wellness|daily yoga|holistic|plant-based|vegan-forward|mindful/i, 'wellness-focused'],
  [/waterpark|water park|sesame street|kids'? camps|lazy river|flowrider/i, 'action-packed'],
  [/sprawling|\bmega\b|expansive|one of the largest|hundreds of|\d\d restaurants|full spectrum|extensive amenit|mega-resort/i, 'big, full-service'],
  [/lively|buzzing|energetic|nightclub|disco\b|flying trapeze|circus|entertainment-heavy/i, 'lively'],
  [/tranquil|serene|secluded|peaceful|\bquiet\b|romantic|hushed|adults-only calm|slower pace/i, 'laid-back'],
]
function characterOf(r) {
  const t = `${r.whatYouNeedToKnow || ''} ${r.activities || ''}`
  for (const [re, adj] of CHARACTERS) if (re.test(t)) return adj
  return null
}

// Announced-but-unopened properties carry relabeled prose ("…not a currently
// operating hotel", activities that open "There is nothing to do here yet").
// Their category ratings and any detected "draws" are placeholders, so we must
// never contrast activities or scores against them — the only honest
// difference is that one resort is bookable and the other isn't yet.
function isUnbuilt(r) {
  const t = `${r.whatYouNeedToKnow || ''} ${r.activities || ''}`
  return /not a currently operating hotel|there is nothing to do here yet|not yet open|is not open\b/i.test(t)
}

// True when a resort's identity sentence already names what a draw refers to,
// so the cross-country on-site line can skip repeating it.
function identityHasDraw(idText, draw) {
  const skip = new Set(['deep', 'with', 'from', 'your', 'over', 'into', 'that', 'this', 'famous', 'ancient'])
  const words = (draw || '').toLowerCase().match(/[a-z]{4,}/g) || []
  const t = (idText || '').toLowerCase()
  return words.some(w => !skip.has(w) && t.includes(w))
}

function priceRank(r) { return r.priceLevel ? r.priceLevel.length : 0 }

function audienceAdj(r) {
  if (r.type === 'adults-only') return /couples? only/i.test(r.ageNote || '') ? 'couples-only' : 'adults-only'
  return 'family-friendly'
}

// The head noun for a "if you want a ___" clause. When a character or audience
// adjective is already carrying the vibe (hasAdj), keep the noun neutral so we
// never stack ("laid-back, adults-only getaway" — not "…laid-back retreat for
// adults-only"). With no adjective in play, let the noun itself signal who the
// resort is for — but an adults-only resort must never be called a "family"
// anything.
function tripNoun(r, rng, hasAdj) {
  if (hasAdj) return pick(rng, ['week', 'getaway', 'stay'])
  if (r.type === 'adults-only') return pick(rng, ['getaway', 'escape', 'retreat'])
  return pick(rng, ['family week', 'family stay', 'family getaway'])
}

function destShort(r) {
  if (r.area && r.area.trim() && r.area !== r.country) return `${r.area}, ${countryName(r.country)}`
  return r.country ? countryName(r.country) : (r.area || 'the region')
}

// Label for the landscape sentence. "Mexico" is too broad to pair with a
// coast-specific description (Los Cabos vs the Riviera Maya are nothing alike),
// so Mexican resorts are labelled by their area instead.
function settingLabel(r) {
  if (r.country === 'Mexico' && (r.area || '').trim()) return r.area.trim()
  return countryName(r.country)
}

const HYGIENE = new Set(['cleanliness', 'sleepQuality'])
function topStrength(r) {
  const t = topRatings(r, 4)
  return (t.find(x => !HYGIENE.has(x.k)) || t[0] || {}).k
}
// A category that genuinely separates r from `other`: one of r's high marks
// (>= 8.0) where it also beats the other resort by a clear margin. Returns
// null when the two are matched on r's strengths — so we never hand both
// resorts the same "for its strong location" reason when neither actually
// leads on it.
function distinguishingStrength(r, other) {
  const cand = topRatings(r, 6)
    .filter(x => !HYGIENE.has(x.k) && x.v >= 8.0)
    .filter(x => other.ratings[x.k] != null && x.v - other.ratings[x.k] >= 0.3)
  if (!cand.length) return null
  cand.sort((p, q) => (q.v - other.ratings[q.k]) - (p.v - other.ratings[p.k]))
  return cand[0].k
}
function bareNoun(k) { return CATEGORY[k].noun.replace(/^the\s+/, '') }

// The "choose X if …" clause. Assembles only the axes flagged active in ctx.
// Cross-destination pairs lead with the place and what you do there (the
// biggest real difference); same-country pairs lead with the trip's character
// and the resort's own distinctive draws. Never mentions a shared axis.
function reasonFor(r, other, ctx, rng) {
  // Same-country only: character + audience + the trip noun, then a distinctive
  // draw or a rating category where it actually leads. (Cross-destination pairs
  // build their verdict inline, keyed on the destination.)
  const adjs = []
  if (ctx.character) { const c = characterOf(r); if (c) adjs.push(c) }
  if (ctx.audience) adjs.push(audienceAdj(r))
  const head = (adjs.length ? adjs.join(', ') + ' ' : '') + tripNoun(r, rng, adjs.length > 0)
  let phrase = `if you want ${art(head)} ${head}`

  const draws = ctx.activity ? distinctiveDraws(r, other, 2) : []
  if (draws.length) {
    phrase += ` for ${listJoin(draws)}`
  } else if (ctx.qualityWinner === r && ctx.qualityKey) {
    phrase += `, where it has the better ${bareNoun(ctx.qualityKey)} of the two`
  } else if (adjs.length === 0) {
    // Nothing distinctive surfaced; anchor on a category where it actually
    // leads the other resort, never a strength they happen to share.
    const k = distinguishingStrength(r, other)
    if (k) phrase += ` for its strong ${bareNoun(k)}`
  }
  if (ctx.cheaper === r) phrase += ', at a lower price'
  return phrase
}

// ---- section writers -----------------------------------------------------------

// When one (or both) resorts in the pair is announced but not yet open, the
// only honest comparison is availability — contrasting activities or ratings
// against a resort that doesn't exist would be fabrication.
function writeUnbuiltDifference(a, b, idA, idB, aUnbuilt, bUnbuilt) {
  const opener = `${a.name} ${idA}. ${b.name} ${idB}.`
  if (aUnbuilt && bUnbuilt) {
    return `${opener} Both are announced but not yet open, so there's no real guest experience to compare at either. Treat this as a look ahead, not a decision between two bookable resorts.`
  }
  const open = aUnbuilt ? b : a
  const soon = aUnbuilt ? a : b
  return `${opener} The practical difference is simple: ${open.name} is open and bookable now, while ${soon.name} is still forthcoming and can't be visited yet. For a trip in the near term, ${open.name} is the only real option; keep ${soon.name} in mind only if you're planning far enough ahead for it to open.`
}

function writeKeyDifferences(a, b, rng) {
  const idA = identityOf(a), idB = identityOf(b)
  const aUnbuilt = isUnbuilt(a), bUnbuilt = isUnbuilt(b)
  if (aUnbuilt || bUnbuilt) return writeUnbuiltDifference(a, b, idA, idB, aUnbuilt, bUnbuilt)

  const parts = []

  // --- Which axes genuinely differ (the only things worth writing about) ---
  const sameCountry = a.country && a.country === b.country
  const audienceDiffers = audienceAdj(a) !== audienceAdj(b)
  const charA = characterOf(a), charB = characterOf(b)
  const characterDiffers = charA && charB && charA !== charB
  const aOnly = distinctiveDraws(a, b, 2), bOnly = distinctiveDraws(b, a, 2)
  const activityDiffers = aOnly.length > 0 && bOnly.length > 0
  const priceGap = (priceRank(a) && priceRank(b)) ? Math.abs(priceRank(a) - priceRank(b)) : 0
  const cheaper = priceGap >= 1 ? (priceRank(a) < priceRank(b) ? a : b) : null
  const gaps = ratingGaps(a, b, 1.0)
  const qGap = gaps.length ? gaps[0] : null
  const qWinner = qGap ? (qGap.diff > 0 ? a : b) : null

  // --- Opening: what each resort actually is. ---
  parts.push(`${a.name} ${idA}. ${b.name} ${idB}.`)

  // --- Cross-destination path: the biggest difference is where you'd be.
  // Built from short, single-idea sentences (no long run-ons), with the
  // landscape described in plain terms and the audience stated outright. ---
  if (!sameCountry) {
    parts.push(`${cap(settingLabel(a))} is ${destinationCharacter(a)}.`)
    parts.push(`${cap(settingLabel(b))} is ${destinationCharacter(b)}.`)
    // Audience, plainly: contrast when it differs, state it once when shared.
    parts.push(audienceDiffers
      ? `${a.name} is ${audienceAdj(a)}; ${b.name} is ${audienceAdj(b)}.`
      : `Both are ${audienceAdj(a)} resorts.`)
    // One short line on the sharpest on-site difference, if there is one.
    // Skip a draw the identity sentence already named (no "…full casino… has a
    // casino" echo), and never repeat the long resort names for nothing.
    const aDraw = activityDiffers && !identityHasDraw(idA, aOnly[0]) ? aOnly[0] : null
    const bDraw = activityDiffers && !identityHasDraw(idB, bOnly[0]) ? bOnly[0] : null
    if (aDraw && bDraw) parts.push(`On site, ${a.name} has ${aDraw}; ${b.name} has ${bDraw}.`)
    else if (aDraw) parts.push(`${a.name} is known for ${aDraw}.`)
    else if (bDraw) parts.push(`${b.name} is known for ${bDraw}.`)
    else if (characterDiffers) parts.push(`In feel, ${a.name} is ${charA} and ${b.name} is ${charB}.`)
    // Verdict: it comes down to the destination. One short tiebreaker if warranted.
    parts.push(`It comes down to the destination: choose ${a.name} for ${countryName(a.country)}, ${b.name} for ${countryName(b.country)}.`)
    const tie = []
    if (qGap && cheaper && qWinner === cheaper) {
      tie.push(`${qWinner.name} rates higher for ${CATEGORY[qGap.k].noun} and costs less`)
    } else {
      if (qGap) tie.push(`${qWinner.name} rates higher for ${CATEGORY[qGap.k].noun}`)
      if (cheaper) tie.push(`${cheaper.name} costs less`)
    }
    if (tie.length) parts.push(`${cap(listJoin(tie))}.`)
    return parts.join(' ')
  }

  // --- Same-country path: one shared destination. Describe the landscape once
  // (noting different areas or coasts where they diverge), then let the
  // resort-level differences decide. ---
  const areaA = (a.area || '').trim(), areaB = (b.area || '').trim()
  const diffArea = areaA && areaB && areaA.toLowerCase() !== areaB.toLowerCase()
  const destA = destinationCharacter(a), destB = destinationCharacter(b)
  // State the shared audience here (family vs adults) since a same-audience
  // pair never surfaces it in the verdict; a differing audience is carried by
  // the verdict instead.
  // "Both are family-friendly resorts in X" when audience is shared; a plain
  // "Both are in X" when it differs (the verdict carries the audience then).
  const bothIn = audienceDiffers
    ? `Both are in ${countryName(a.country)}`
    : `Both are ${audienceAdj(a)} resorts in ${countryName(a.country)}`
  if (destA !== destB) {
    parts.push(`${bothIn}, but in very different parts. ${cap(areaA || a.name)} is ${destA}. ${cap(areaB || b.name)} is ${destB}.`)
  } else {
    parts.push(`${bothIn}, ${destA}.`)
    if (diffArea) parts.push(`${a.name} is in ${areaA}, ${b.name} in ${areaB}.`)
  }

  // The body spotlights the sharpest resort-level difference; the verdict makes
  // it an explicit "choose A if …, choose B if …", padding no shared axis.
  const expAxis = activityDiffers ? 'activity' : characterDiffers ? 'character' : null
  const verdictTwoSided = audienceDiffers || cheaper ||
    (characterDiffers && expAxis !== 'character') ||
    (activityDiffers && expAxis !== 'activity')

  const activityBody = () => pick(rng, [
    `The days look nothing alike: ${listJoin(aOnly)} at ${a.name}, versus ${listJoin(bOnly)} at ${b.name}.`,
    `You'd spend your time differently, too: ${listJoin(aOnly)} at ${a.name}, ${listJoin(bOnly)} at ${b.name}.`,
  ])
  const characterBody = () => pick(rng, [
    `The feel is the real split: ${a.name} is ${charA}, ${b.name} ${charB}.`,
    `They diverge most on atmosphere: ${a.name} feels ${charA}, ${b.name} ${charB}.`,
  ])
  const qualityBody = () => `The clearest gap on the rating card is ${CATEGORY[qGap.k].noun}: ${qWinner.name} pulls ahead, ${pick(rng, CATEGORY[qGap.k].consequences)}.`

  if (verdictTwoSided) {
    if (expAxis === 'activity') parts.push(activityBody())
    else if (expAxis === 'character') parts.push(characterBody())
    else if (qGap) parts.push(qualityBody())

    const covered = expAxis || (qGap ? 'quality' : null)
    const qualityFree = qGap && covered !== 'quality'
    const ctx = {
      audience: audienceDiffers,
      character: characterDiffers && covered !== 'character',
      destination: false,
      activity: activityDiffers && covered !== 'activity',
      qualityKey: qualityFree ? qGap.k : null,
      qualityWinner: qualityFree ? qWinner : null,
      cheaper,
    }
    const rA = reasonFor(a, b, ctx, rng), rB = reasonFor(b, a, ctx, rng)
    parts.push(pick(rng, [
      `Choose ${a.name} ${rA}; choose ${b.name} ${rB}.`,
      `The bottom line: pick ${a.name} ${rA}, and ${b.name} ${rB}.`,
    ]))
  } else if (expAxis === 'activity') {
    const tail = qGap ? `, with ${qWinner.name} also holding the edge on ${CATEGORY[qGap.k].noun}` : ''
    parts.push(`It comes down to how you'd spend your days: ${a.name} for ${listJoin(aOnly)}, ${b.name} for ${listJoin(bOnly)}${tail}.`)
  } else if (expAxis === 'character') {
    const tail = qGap ? `, though ${qWinner.name} rates a little higher on ${CATEGORY[qGap.k].noun}` : ''
    parts.push(`It comes down to the atmosphere you want: ${a.name} for ${art(charA)} ${charA} feel, ${b.name} for ${art(charB)} ${charB} one${tail}.`)
  } else if (qGap) {
    parts.push(qualityBody())
    const loser = qWinner === a ? b : a
    parts.push(pick(rng, [
      `That makes ${qWinner.name} the stronger all-round pick; ${loser.name} is worth it mainly if you prefer its setting or find a better rate.`,
      `On paper ${qWinner.name} is the safer bet; go with ${loser.name} only if its price tilts things your way.`,
    ]))
  } else {
    const dA = distinguishingStrength(a, b), dB = distinguishingStrength(b, a)
    if (dA && !dB) parts.push(`They're closely matched overall; ${a.name} edges it on ${CATEGORY[dA].noun}.`)
    else if (dB && !dA) parts.push(`They're closely matched overall; ${b.name} edges it on ${CATEGORY[dB].noun}.`)
    else if (dA && dB) parts.push(`They're closely matched overall, with ${a.name} leaning stronger on ${CATEGORY[dA].noun} and ${b.name} on ${CATEGORY[dB].noun}.`)
    else parts.push(`On the big measures the two are closely matched, so the call really comes down to setting and personal preference.`)
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
  const chooseA = writeWhoShouldChoose(a, b, rng)
  const chooseB = writeWhoShouldChoose(b, a, rng, chooseA.used)
  // deDash every field so no em/en dash reaches the page, whatever the source
  // (our templates, lifted identity prose, or the season strings).
  return {
    keyDifferences: deDash(writeKeyDifferences(a, b, rng)),
    whoShouldChooseA: deDash(chooseA.text),
    whoShouldChooseB: deDash(chooseB.text),
    whenToVisit: deDash(writeWhenToVisit(a, b, rng)),
    activities: deDash(writeActivities(a, b, rng)),
  }
}

module.exports = { buildOverview, deDash }
