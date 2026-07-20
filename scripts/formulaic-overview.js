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

// ---- section writers -----------------------------------------------------------
function writeKeyDifferences(a, b, rng) {
  const parts = []
  const sameCountry = a.country && a.country === b.country
  const aRealArea = a.area && a.area !== a.country ? a.area : null
  const bRealArea = b.area && b.area !== b.country ? b.area : null

  // 1. Geography frame
  if (sameCountry && aRealArea && bRealArea && aRealArea !== bRealArea) {
    parts.push(pick(rng, [
      `${a.name} and ${b.name} are both in ${countryName(a.country)}, but in different corners of it — ${aRealArea} versus ${bRealArea} — so the setting is part of the choice, not just the resort.`,
      `The first fork in the road is geography: ${a.name} sits in ${aRealArea}, while ${b.name} is over in ${bRealArea}, and the two areas of ${countryName(a.country)} feel genuinely different.`,
      `Both resorts call ${countryName(a.country)} home, but ${a.name} (${aRealArea}) and ${b.name} (${bRealArea}) sit in different parts of the country, with their own transfer times and coastal character.`,
    ]))
  } else if (sameCountry) {
    const place = aRealArea && aRealArea === bRealArea ? `${aRealArea}, ${countryName(a.country)}` : countryName(a.country)
    parts.push(pick(rng, [
      `${a.name} and ${b.name} compete on the same turf in ${place}, so the destination is a wash and the decision comes down to the properties themselves.`,
      `With both resorts in ${place}, you aren't choosing a destination here; you're choosing between two takes on the same coastline.`,
      `${a.name} and ${b.name} share ${place} as a home base, which makes this a like-for-like matchup where the scores can do most of the talking.`,
    ]))
  } else {
    parts.push(pick(rng, [
      `${a.name} (${locationOf(a)}) and ${b.name} (${locationOf(b)}) put two different countries on the table, so flights, transfer logistics, and destination character weigh as heavily as the resorts.`,
      `This comparison crosses borders — ${locationOf(a)} versus ${locationOf(b)} — making it a destination decision as much as a resort decision.`,
      `${a.name} sits in ${locationOf(a)}; ${b.name} is a different trip entirely, in ${locationOf(b)}. Weigh the destinations first, then let the scores refine the call.`,
    ]))
  }

  // 2. Overall verdict — qualitative only; the ratings table above the text
  // already shows every number, so the prose interprets rather than recites.
  const ao = a.ratings.overall, bo = b.ratings.overall
  if (ao != null && bo != null) {
    const d = Math.abs(ao - bo)
    const w = ao >= bo ? a : b, l = ao >= bo ? b : a
    if (d < 0.2) {
      parts.push(pick(rng, [
        `On overall guest score they're effectively tied, so the real separation lives in the individual categories.`,
        `The headline scores won't settle it — overall, this is a statistical tie.`,
      ]))
    } else if (d < 0.6) {
      parts.push(pick(rng, [
        `${w.name} holds a slim overall edge, though not one big enough to decide anything on its own.`,
        `Overall, guests give ${w.name} a modest lead over ${l.name}.`,
      ]))
    } else {
      parts.push(pick(rng, [
        `${w.name} is clearly ahead on overall guest score — a gap wide enough that guests genuinely feel it.`,
        `The overall verdict isn't close: guests rate ${w.name} well above ${l.name}.`,
      ]))
    }
  }

  // 3. Category gaps
  const gaps = ratingGaps(a, b, 0.5)
  if (gaps.length === 0) {
    parts.push(pick(rng, [
      `Category by category the two track each other closely — nothing separates them by even half a point — so let price, setting, and style break the tie.`,
      `Neither resort opens a meaningful lead in any single category; the rating cards are near mirror images, which pushes the decision toward location and price.`,
    ]))
  } else {
    const g = gaps[0]
    const w = g.diff > 0 ? a : b, l = g.diff > 0 ? b : a
    const cat = CATEGORY[g.k]
    const gapWord = Math.abs(g.diff) >= 1.5 ? 'decisively' : Math.abs(g.diff) >= 0.8 ? 'clearly' : 'noticeably'
    parts.push(pick(rng, [
      `The widest split is ${cat.noun}, where ${w.name} ${gapWord} outscores ${l.name} — ${pick(rng, cat.consequences)}.`,
      `${cap(cat.noun)} is where they diverge most, with ${w.name} ${gapWord} ahead — ${pick(rng, cat.consequences)}.`,
      `Start with ${cat.noun}, the biggest gap on the card: ${w.name} comes out ${gapWord} on top — ${pick(rng, cat.consequences)}.`,
    ]))
    if (gaps.length > 1) {
      const g2 = gaps[1]
      const w2 = g2.diff > 0 ? a : b
      const noun2 = CATEGORY[g2.k].noun
      if (w2 === w) {
        parts.push(pick(rng, [
          `Its advantage repeats on ${noun2}.`,
          `${w2.name} also leads on ${noun2}, so the gaps point in one direction.`,
        ]))
      } else {
        parts.push(pick(rng, [
          `${w2.name} pushes back on ${noun2}, though, so the scorecard cuts both ways.`,
          `It isn't one-sided: ${w2.name} answers on ${noun2}.`,
        ]))
      }
    }
  }

  // 4. Profiles. If the headline gap category is also a resort's weakest,
  // surface the next-weakest instead so one category doesn't dominate the text.
  const mainGapKey = gaps.length ? gaps[0].k : null
  const aTop = topRatings(a, 2), bTop = topRatings(b, 2)
  const aWeak = weakestRating(a, mainGapKey), bWeak = weakestRating(b, mainGapKey)
  if (aTop.length >= 2 && aWeak) {
    parts.push(pick(rng, [
      `${a.name} is at its best when it comes to ${CATEGORY[aTop[0].k].noun} and ${CATEGORY[aTop[1].k].noun}, though ${CATEGORY[aWeak.k].noun} is its softest area.`,
      `${a.name} shines brightest on ${CATEGORY[aTop[0].k].noun} and ${CATEGORY[aTop[1].k].noun}; ${CATEGORY[aWeak.k].noun} trails the rest of its card.`,
      `Guests give ${a.name} its best marks for ${CATEGORY[aTop[0].k].noun} and ${CATEGORY[aTop[1].k].noun}, and its lowest for ${CATEGORY[aWeak.k].noun}.`,
    ]))
  }
  if (bTop.length >= 2 && bWeak) {
    parts.push(pick(rng, [
      `${b.name}, for its part, earns its highest marks for ${CATEGORY[bTop[0].k].noun} and ${CATEGORY[bTop[1].k].noun}, while ${CATEGORY[bWeak.k].noun} is the weak spot.`,
      `Over at ${b.name}, ${CATEGORY[bTop[0].k].noun} and ${CATEGORY[bTop[1].k].noun} lead the card, and ${CATEGORY[bWeak.k].noun} brings up the rear.`,
      `${b.name} answers with strong ${CATEGORY[bTop[0].k].noun} and ${CATEGORY[bTop[1].k].noun}, though guests mark it down on ${CATEGORY[bWeak.k].noun}.`,
    ]))
  }

  // 5. Practicalities: price and audience
  const ap = PRICE_WORDS[a.priceLevel], bp = PRICE_WORDS[b.priceLevel]
  if (ap && bp) {
    if (ap === bp) {
      parts.push(pick(rng, [
        `Both book at a ${ap} price point.`,
        `Pricing won't separate them — both are ${ap} properties.`,
      ]))
    } else {
      parts.push(pick(rng, [
        `Budgets differ: ${a.name} books as a ${ap} stay while ${b.name} runs ${bp}.`,
        `Expect different bills, too — ${a.name} is ${ap}, ${b.name} is ${bp}.`,
      ]))
    }
  }
  if (a.type !== b.type) {
    const adults = a.type === 'adults-only' ? a : b
    const fam = a.type === 'adults-only' ? b : a
    parts.push(pick(rng, [
      `And note the crowd: ${adults.name} is adults-only while ${fam.name} welcomes kids — for many travelers that alone settles it.`,
      `One structural difference outranks every score: ${adults.name} is adults-only, ${fam.name} is family-friendly.`,
    ]))
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
      `It's ${/^[aeiou]/i.test(price) ? 'an' : 'a'} ${price} property in ${loc}.`,
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
