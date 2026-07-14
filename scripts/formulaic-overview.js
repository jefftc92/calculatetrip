// Editorial writer for resort-pair overviews — pure function of the two
// resort records, no API calls. build.js uses it as the lowest-priority
// fallback for any comparison page that has no stored (hand-authored or
// LLM-generated) overview.
//
// Every sentence slot has several phrasings and the choice is made with a
// PRNG seeded from the pair key, so pages read differently from each other
// but any given pair renders identically on every build.

const {
  rngFor, pick, fmt, cap, listJoin, locationOf,
  CATEGORY, topRatings, weakestRating, ratingGaps, PRICE_WORDS, scoreWord,
  seasonStr, destinationActivities, activityAmenities,
  areaCharacter, realArea,
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
      `${a.name} and ${b.name} are both in ${a.country}, but in different corners of it — ${aRealArea} versus ${bRealArea} — so the setting is part of the choice, not just the resort.`,
      `The first fork in the road is geography: ${a.name} sits in ${aRealArea} while ${b.name} is over in ${bRealArea}, two distinctly different corners of ${a.country}.`,
      `Both fly the ${a.country} flag, but ${a.name} (${aRealArea}) and ${b.name} (${bRealArea}) occupy different parts of the country, with different transfer times and coastal character.`,
    ]))
  } else if (sameCountry) {
    const place = aRealArea && aRealArea === bRealArea ? `${aRealArea}, ${a.country}` : a.country
    parts.push(pick(rng, [
      `${a.name} and ${b.name} compete on the same turf — both are ${place} all-inclusives — so the destination is a wash and the decision comes down to the properties themselves.`,
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

  // 2. Overall verdict
  const ao = a.ratings.overall, bo = b.ratings.overall
  if (ao != null && bo != null) {
    const d = Math.abs(ao - bo)
    const w = ao >= bo ? a : b, l = ao >= bo ? b : a
    if (d < 0.2) {
      parts.push(pick(rng, [
        `On overall guest score they're effectively tied, ${fmt(ao)} to ${fmt(bo)}, so the separation lives in the category ratings.`,
        `The headline numbers won't settle it — ${fmt(ao)} versus ${fmt(bo)} overall is a statistical tie.`,
      ]))
    } else if (d < 0.6) {
      parts.push(pick(rng, [
        `${w.name} holds a slim overall edge, ${fmt(w.ratings.overall)} to ${fmt(l.ratings.overall)}.`,
        `Overall, guests give ${w.name} a modest lead: ${fmt(w.ratings.overall)} against ${fmt(l.ratings.overall)}.`,
      ]))
    } else {
      parts.push(pick(rng, [
        `${w.name} is clearly ahead overall, ${fmt(w.ratings.overall)} to ${fmt(l.ratings.overall)} — a gap guests genuinely feel.`,
        `The overall scores aren't close: ${fmt(w.ratings.overall)} for ${w.name} versus ${fmt(l.ratings.overall)} for ${l.name}.`,
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
    const wv = g.diff > 0 ? g.av : g.bv, lv = g.diff > 0 ? g.bv : g.av
    const cat = CATEGORY[g.k]
    parts.push(pick(rng, [
      `The widest split is ${cat.noun}: ${w.name} scores ${fmt(wv)} to ${l.name}'s ${fmt(lv)} — ${pick(rng, cat.consequences)}.`,
      `${cap(cat.noun)} is where they diverge most, ${fmt(wv)} for ${w.name} against ${fmt(lv)} for ${l.name} — ${pick(rng, cat.consequences)}.`,
      `Start with ${cat.noun}, the biggest gap on the card: ${w.name} at ${fmt(wv)}, ${l.name} at ${fmt(lv)} — ${pick(rng, cat.consequences)}.`,
    ]))
    if (gaps.length > 1) {
      const g2 = gaps[1]
      const w2 = g2.diff > 0 ? a : b
      const wv2 = g2.diff > 0 ? g2.av : g2.bv, lv2 = g2.diff > 0 ? g2.bv : g2.av
      const noun2 = CATEGORY[g2.k].noun
      if (w2 === w) {
        parts.push(pick(rng, [
          `Its advantage repeats on ${noun2}, ${fmt(wv2)} to ${fmt(lv2)}.`,
          `The same resort also leads on ${noun2} (${fmt(wv2)} vs ${fmt(lv2)}), so the gaps point one direction.`,
        ]))
      } else {
        parts.push(pick(rng, [
          `${w2.name} pushes back on ${noun2}, though, ${fmt(wv2)} to ${fmt(lv2)}, so the scorecard cuts both ways.`,
          `It isn't one-sided: ${w2.name} answers on ${noun2}, ${fmt(wv2)} against ${fmt(lv2)}.`,
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
      `${a.name} is at its best on ${CATEGORY[aTop[0].k].noun} (${fmt(aTop[0].v)}) and ${CATEGORY[aTop[1].k].noun}, with ${CATEGORY[aWeak.k].noun} its softest score at ${fmt(aWeak.v)}.`,
      `${a.name}'s card peaks at ${CATEGORY[aTop[0].k].noun} (${fmt(aTop[0].v)}) and ${CATEGORY[aTop[1].k].noun}; ${CATEGORY[aWeak.k].noun}, at ${fmt(aWeak.v)}, trails the rest.`,
    ]))
  }
  if (bTop.length >= 2 && bWeak) {
    parts.push(pick(rng, [
      `${b.name} earns its highest marks for ${CATEGORY[bTop[0].k].noun} (${fmt(bTop[0].v)}) and ${CATEGORY[bTop[1].k].noun}, while ${CATEGORY[bWeak.k].noun} (${fmt(bWeak.v)}) is the weak spot.`,
      `For ${b.name}, ${CATEGORY[bTop[0].k].noun} (${fmt(bTop[0].v)}) and ${CATEGORY[bTop[1].k].noun} lead the card, and ${CATEGORY[bWeak.k].noun} (${fmt(bWeak.v)}) brings up the rear.`,
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

function article(word) { return /^[aeiou]/i.test(word) ? 'an' : 'a' }

// Countries that take a definite article mid-sentence ("in the Bahamas").
const THE_COUNTRIES = new Set(['Bahamas', 'Turks and Caicos', 'British Virgin Islands', 'United States', 'Maldives', 'Philippines', 'United Arab Emirates'])
function inCountry(c) { return THE_COUNTRIES.has(c) ? `the ${c}` : c }

// Detailed writer for same-country pairs (Mexico excluded — its volume makes
// destination color repeat too often). Produces multi-paragraph editorial
// prose (~230-290 words): area character, a full ratings narrative including
// where the two resorts converge, practical contrasts, and a verdict.
function writeDetailedKeyDifferences(a, b, rng) {
  const paras = []
  const country = a.country
  const aChar = areaCharacter(a), bChar = areaCharacter(b)
  const aArea = realArea(a), bArea = realArea(b)
  const sameSpot = (aChar && aChar === bChar) || (!aChar && !bChar && aArea === bArea)

  // --- P1: setting -----------------------------------------------------------
  if (sameSpot) {
    const place = aChar || (aArea ? `${aArea}, ${country}` : null)
    if (place) {
      paras.push(pick(rng, [
        `${a.name} and ${b.name} occupy the same corner of ${inCountry(country)} — both sit in ${place} — so location is a genuine wash here. The choice comes down entirely to how each property runs: what it does well, what it charges, and who it's built for.`,
        `Geography won't help you choose between these two: ${a.name} and ${b.name} both call ${place} home. That makes this one of the cleaner head-to-heads in ${inCountry(country)} — same setting, same weather, same excursions, different resorts.`,
      ]))
    } else {
      paras.push(pick(rng, [
        `${a.name} and ${b.name} are both ${country} all-inclusives, and nothing in their listed locations separates them — so this comparison is purely about the properties: what each does well, what each charges, and who each is built for.`,
        `Set the map aside for this one: both resorts call ${inCountry(country)} home, and the real differences live in the rating card, the price, and the crowd each is designed to serve.`,
      ]))
    }
  } else if (aChar && bChar) {
    paras.push(pick(rng, [
      `${a.name} and ${b.name} are both ${country} all-inclusives, but they anchor different corners of the destination. ${a.name} sits in ${aChar}. ${b.name} is in ${bChar}. That split shapes everything downstream — transfer times, the water you swim in, and what's outside the gates.`,
      `Start with where each one puts you. ${a.name} is in ${aChar}, while ${b.name} sits in ${bChar}. Same country, two noticeably different trips — worth deciding which coast you actually want before weighing the resorts themselves.`,
      `The first real difference is the map. ${a.name}'s address is ${aChar}; ${b.name}'s is ${bChar}. Neither is objectively better — they're different vacations — but most travelers will feel a pull toward one setting over the other before a single rating enters the picture.`,
    ]))
  } else {
    const aLoc = aChar || (aArea ? `${aArea}, ${country}` : null)
    const bLoc = bChar || (bArea ? `${bArea}, ${country}` : null)
    if (aLoc && bLoc) {
      paras.push(pick(rng, [
        `${a.name} and ${b.name} both fly the ${country} flag but from different bases: ${a.name} in ${aLoc}, ${b.name} in ${bLoc}. Factor the setting in alongside the scores — within one country, the coast you pick still changes the trip.`,
        `Both resorts are in ${inCountry(country)}, with ${a.name} based in ${aLoc} and ${b.name} in ${bLoc}. The scores below separate the properties; the map separates the vacations.`,
      ]))
    } else {
      // Only one side has a usable sub-location — describe just that one.
      const known = aLoc ? a : b, kLoc = aLoc || bLoc
      paras.push(pick(rng, [
        `${a.name} and ${b.name} are both ${country} all-inclusives. The clearest geographic marker between them is ${known.name}'s home in ${kLoc} — worth weighing alongside the scorecard below.`,
        `Both resorts call ${inCountry(country)} home; ${known.name} sits in ${kLoc}, and from there the comparison is about the properties themselves.`,
      ]))
    }
  }

  // --- P2: ratings narrative ---------------------------------------------------
  const s2 = []
  const ao = a.ratings.overall, bo = b.ratings.overall
  if (ao != null && bo != null) {
    const d = Math.abs(ao - bo)
    const w = ao >= bo ? a : b, l = ao >= bo ? b : a
    if (d < 0.2) {
      s2.push(pick(rng, [
        `On the numbers, this is a dead heat: guests score them ${fmt(ao)} and ${fmt(bo)} overall, so the headline rating settles nothing.`,
        `Overall guest scores won't break the tie — ${fmt(ao)} versus ${fmt(bo)} is statistical noise.`,
      ]))
    } else if (d < 0.6) {
      s2.push(pick(rng, [
        `${w.name} takes the overall rating by a nose, ${fmt(w.ratings.overall)} to ${fmt(l.ratings.overall)} — real, but not decisive on its own.`,
        `Guests hand ${w.name} a modest overall lead: ${fmt(w.ratings.overall)} against ${fmt(l.ratings.overall)}.`,
      ]))
    } else {
      s2.push(pick(rng, [
        `The overall ratings aren't close: ${fmt(w.ratings.overall)} for ${w.name} versus ${fmt(l.ratings.overall)} for ${l.name}, a gap guests plainly feel during a stay.`,
        `${w.name} is the clear favorite of the two on paper, ${fmt(w.ratings.overall)} to ${fmt(l.ratings.overall)} overall.`,
      ]))
    }
  }
  const gaps = ratingGaps(a, b, 0.4)
  if (gaps.length) {
    const g = gaps[0]
    const w = g.diff > 0 ? a : b, l = g.diff > 0 ? b : a
    const wv = g.diff > 0 ? g.av : g.bv, lv = g.diff > 0 ? g.bv : g.av
    const cat = CATEGORY[g.k]
    s2.push(pick(rng, [
      `Dig into the categories and the sharpest divide is ${cat.noun}: ${w.name} posts ${article(scoreWord(wv))} ${scoreWord(wv)} ${fmt(wv)} while ${l.name} sits at ${fmt(lv)} — ${pick(rng, cat.consequences)}.`,
      `The category that should drive the decision is ${cat.noun}. ${w.name} earns a ${scoreWord(wv)} ${fmt(wv)} there against ${l.name}'s ${fmt(lv)} — ${pick(rng, cat.consequences)}.`,
    ]))
    if (gaps.length > 1) {
      const g2 = gaps[1]
      const w2 = g2.diff > 0 ? a : b
      const wv2 = g2.diff > 0 ? g2.av : g2.bv, lv2 = g2.diff > 0 ? g2.bv : g2.av
      const noun2 = CATEGORY[g2.k].noun
      s2.push(w2 === w
        ? pick(rng, [
            `The same resort stretches its lead on ${noun2}, ${fmt(wv2)} to ${fmt(lv2)}, so the gaps mostly point one way.`,
            `${w.name} doubles down on ${noun2} too (${fmt(wv2)} vs ${fmt(lv2)}).`,
          ])
        : pick(rng, [
            `But it cuts both ways: ${w2.name} strikes back on ${noun2}, ${fmt(wv2)} to ${fmt(lv2)}.`,
            `${w2.name} answers on ${noun2}, though — ${fmt(wv2)} against ${fmt(lv2)} — so each resort owns part of the scorecard.`,
          ]))
    }
    if (gaps.length > 2) {
      const g3 = gaps[2]
      const w3 = g3.diff > 0 ? a : b
      const wv3 = g3.diff > 0 ? g3.av : g3.bv, lv3 = g3.diff > 0 ? g3.bv : g3.av
      s2.push(`${w3 === a ? a.name : b.name} also edges ${CATEGORY[g3.k].noun}, ${fmt(wv3)} to ${fmt(lv3)}.`)
    }
  } else {
    s2.push(pick(rng, [
      `Category by category, the rating cards are near mirror images — no gap reaches even half a point — which is exactly when setting, price, and style should carry the decision.`,
      `Neither property opens a meaningful ratings lead in any category, so treat the scorecard as a tie and decide on location and feel.`,
    ]))
  }
  // Convergences: categories where they're close AND both genuinely good.
  const gapKeys = new Set(gaps.slice(0, 3).map(g => g.k))
  const close = Object.keys(CATEGORY).filter(k => {
    const av = a.ratings[k], bv = b.ratings[k]
    return av != null && bv != null && !gapKeys.has(k) && Math.abs(av - bv) <= 0.2 && Math.min(av, bv) >= 8.4
  }).sort((x, y) => Math.min(b.ratings[y], a.ratings[y]) - Math.min(b.ratings[x], a.ratings[x]))
  if (close.length >= 2) {
    s2.push(pick(rng, [
      `Where they agree is just as telling: both post virtually identical — and ${scoreWord(Math.min(a.ratings[close[0]], b.ratings[close[0]]))} — marks for ${CATEGORY[close[0]].noun} and ${CATEGORY[close[1]].noun}, so neither is a compromise there.`,
      `Call ${CATEGORY[close[0]].noun} and ${CATEGORY[close[1]].noun} a push — the scores land within a whisker of each other, and at a high level for both.`,
    ]))
  }
  paras.push(s2.join(' '))

  // --- P3: practical contrasts + verdict --------------------------------------
  const s3 = []
  if (a.type !== b.type) {
    const adults = a.type === 'adults-only' ? a : b
    const fam = a.type === 'adults-only' ? b : a
    s3.push(pick(rng, [
      `Before any of that, though, one structural fact may decide it: ${adults.name} is adults-only while ${fam.name} welcomes children.`,
      `Audience is the hard filter here — ${adults.name} runs adults-only; ${fam.name} takes families.`,
    ]))
  }
  const ap = PRICE_WORDS[a.priceLevel], bp = PRICE_WORDS[b.priceLevel]
  if (ap && bp && ap !== bp) {
    s3.push(pick(rng, [
      `Budgets diverge too: ${a.name} books as a ${ap} stay, ${b.name} as ${bp}.`,
      `Expect different bills — ${a.name} is priced ${ap}, ${b.name} ${bp}.`,
    ]))
  } else if (ap && bp) {
    s3.push(`Both sit at a ${ap} price point, so cost is unlikely to be the tiebreaker.`)
  }
  const aActs = activityAmenities(a, 8), bActs = activityAmenities(b, 8)
  const aOnly = aActs.filter(x => !bActs.includes(x)).slice(0, 3)
  const bOnly = bActs.filter(x => !aActs.includes(x)).slice(0, 3)
  if (aOnly.length && bOnly.length) {
    s3.push(pick(rng, [
      `On facilities, ${a.name} brings ${listJoin(aOnly)} that ${b.name} doesn't list; ${b.name} counters with ${listJoin(bOnly)}.`,
      `Each holds amenities the other lacks — ${listJoin(aOnly)} at ${a.name}; ${listJoin(bOnly)} at ${b.name}.`,
    ]))
  } else if (aOnly.length || bOnly.length) {
    const has = aOnly.length ? a : b, other = aOnly.length ? b : a
    s3.push(`On facilities, ${has.name} adds ${listJoin(aOnly.length ? aOnly : bOnly)} that ${other.name} doesn't list.`)
  }
  const aTop2 = topRatings(a, 2), bTop2 = topRatings(b, 2)
  const aTop = aTop2[0], bTop = bTop2[0]
  if (aTop && bTop && aTop.k === bTop.k && aTop2[1] && bTop2[1] && aTop2[1].k === bTop2[1].k) {
    // Even the top-two categories match — the cards run parallel.
    s3.push(pick(rng, [
      `Their rating cards run almost parallel — ${CATEGORY[aTop.k].noun} tops both, with ${CATEGORY[aTop2[1].k].noun} next — so lean on the facility differences and the category gaps above to break the tie.`,
      `Both properties are built the same way on paper: ${CATEGORY[aTop.k].noun} first, ${CATEGORY[aTop2[1].k].noun} second. When the shapes match this closely, the deciding factors are the gaps above and which amenity list reads like your vacation.`,
    ]))
  } else if (aTop && bTop && aTop.k === bTop.k && aTop2[1] && bTop2[1]) {
    // Both peak on the same category — compare one rung down instead.
    s3.push(pick(rng, [
      `Both resorts peak on ${CATEGORY[aTop.k].noun} (${fmt(aTop.v)} and ${fmt(bTop.v)}), so look one rung down for the real signature: ${a.name}'s next-best card is ${CATEGORY[aTop2[1].k].noun} (${fmt(aTop2[1].v)}), while ${b.name}'s is ${CATEGORY[bTop2[1].k].noun} (${fmt(bTop2[1].v)}).`,
      `Tellingly, ${CATEGORY[aTop.k].noun} is the top score at both properties — the split shows up second from the top, where ${a.name} backs it with ${CATEGORY[aTop2[1].k].noun} (${fmt(aTop2[1].v)}) and ${b.name} with ${CATEGORY[bTop2[1].k].noun} (${fmt(bTop2[1].v)}).`,
    ]))
  } else if (aTop && bTop) {
    s3.push(pick(rng, [
      `The short version: book ${a.name} when ${CATEGORY[aTop.k].noun} (${fmt(aTop.v)}) and its side of ${inCountry(country)} fit the trip you're planning; book ${b.name} when ${CATEGORY[bTop.k].noun} (${fmt(bTop.v)}) matters more.`,
      `Bottom line — ${a.name}'s case rests on ${CATEGORY[aTop.k].noun} (${fmt(aTop.v)}); ${b.name}'s on ${CATEGORY[bTop.k].noun} (${fmt(bTop.v)}). Decide which of those you'd actually miss.`,
      `If forced to summarize: ${a.name} for ${CATEGORY[aTop.k].noun}, ${b.name} for ${CATEGORY[bTop.k].noun} — and let the setting break any remaining tie.`,
    ]))
  }
  paras.push(s3.join(' '))

  return paras.filter(p => p.trim()).join('\n\n')
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
      `${r.name} is the pick for ${audience} who put ${n1} and ${n2} at the top of the list — guests score it ${fmt(top[0].v)} and ${fmt(top[1].v)} there.`,
      `Choose ${r.name} if ${n1} is what you're really buying: at ${fmt(top[0].v)} it's the resort's calling card, with ${n2} (${fmt(top[1].v)}) close behind. It suits ${audience}.`,
      `Book ${r.name} when ${n1} (${fmt(top[0].v)}) and ${n2} (${fmt(top[1].v)}) matter more than anything else on the card — a natural fit for ${audience}.`,
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
      `It's a ${price} property in ${loc}.`,
      `Expect ${price} pricing for its ${loc} address.`,
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
      `Just go in with measured expectations for ${CATEGORY[weak.k].noun} — at ${fmt(weak.v)}, it's the soft spot.`,
      `The trade-off is ${CATEGORY[weak.k].noun} (${fmt(weak.v)}), the one category where guests consistently mark it down.`,
      `Its rating card does dip on ${CATEGORY[weak.k].noun} (${fmt(weak.v)}), so weight that accordingly.`,
    ]
    let ci = Math.floor(rng() * caveats.length)
    if (ci === avoid.caveatIdx) ci = (ci + 1) % caveats.length
    used.caveatIdx = ci
    parts.push(caveats[ci])
  } else if (r.ratings.overall != null && other.ratings.overall != null && r.ratings.overall >= other.ratings.overall) {
    parts.push(pick(rng, [
      `It also carries the stronger overall score of the pair (${fmt(r.ratings.overall)}).`,
      `At ${fmt(r.ratings.overall)} overall, it's the higher-rated of the two.`,
    ]))
  }

  return { text: parts.join(' '), used }
}

function writeWhenToVisit(a, b, rng) {
  if (a.country && a.country === b.country) {
    return pick(rng, [
      `Both resorts run on ${a.country}'s weather calendar, so timing is one decision, not two. ${seasonStr(a.country)}`,
      `Seasonality is identical here — one ${a.country} climate covers both properties. ${seasonStr(a.country)}`,
      `Whichever resort wins, the calendar advice is the same. ${seasonStr(a.country)}`,
    ])
  }
  return pick(rng, [
    `The two destinations run on different calendars. For ${a.name} in ${a.country || 'its region'}: ${seasonStr(a.country)} For ${b.name} in ${b.country || 'its region'}: ${seasonStr(b.country)}`,
    `Timing depends on which destination you pick. ${a.country || a.name}: ${seasonStr(a.country)} ${b.country || b.name}: ${seasonStr(b.country)}`,
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
      `Off property, ${a.country} adds ${destinationActivities(a)}.`,
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
  // Same-country pairs get the detailed multi-paragraph treatment. Mexico is
  // the exception: with ~380 resorts there, area color would repeat across
  // tens of thousands of pages, so those pairs keep the compact writer.
  const detailed = a.country && a.country === b.country && a.country !== 'Mexico'
  const keyDifferences = detailed
    ? writeDetailedKeyDifferences(a, b, rng)
    : writeKeyDifferences(a, b, rng)
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
