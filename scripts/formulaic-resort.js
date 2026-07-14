// Editorial writer for individual resort pages — a pure function of one
// resort record, no API calls. build.js uses it to fill any of the four
// editorial fields (description, whatYouNeedToKnow, bestTimeToVisit,
// activities) that a resort is missing, so every resort page carries the
// same sections regardless of whether it was hand-authored.
//
// Hand-authored fields always win; this only fills blanks. Output is
// deterministic per resort (PRNG seeded from the slug) so it's stable
// across builds, while varied phrasing keeps pages from reading identically.

const {
  rngFor, pick, fmt, listJoin, locationOf,
  CATEGORY, topRatings, weakestRating, PRICE_WORDS,
  seasonStr, destinationActivities, activityAmenities,
} = require('./destinations')

const PRICE_PHRASE = {
  budget: 'value-focused', 'mid-range': 'mid-range', upscale: 'upscale', luxury: 'luxury',
}

function audienceNoun(r, rng) {
  return r.type === 'adults-only'
    ? pick(rng, ['couples and adult travelers', 'couples and groups of adults', 'adults seeking a child-free stay'])
    : pick(rng, ['families', 'families and multi-generational groups', 'families with children'])
}

function typePhrase(r) {
  return r.type === 'adults-only' ? 'adults-only' : 'family-friendly'
}

function article(word) {
  return /^[aeiou]/i.test(word) ? 'an' : 'a'
}

// ---- description (~45-60 words) ----------------------------------------------
function writeDescription(r, rng) {
  const loc = locationOf(r)
  const price = PRICE_WORDS[r.priceLevel]
  const pricePhrase = price ? PRICE_PHRASE[price] + ' ' : ''
  const top = topRatings(r, 3)
  const parts = []

  parts.push(pick(rng, [
    `${r.name} is ${article(pricePhrase || typePhrase(r))} ${pricePhrase}${typePhrase(r)} all-inclusive resort in ${loc}.`,
    `${r.name} is ${article(typePhrase(r))} ${typePhrase(r)} all-inclusive in ${loc}${price ? `, positioned at the ${price} end of the market` : ''}.`,
    `Set in ${loc}, ${r.name} is ${article(pricePhrase || typePhrase(r))} ${pricePhrase}${typePhrase(r)} all-inclusive resort.`,
  ]))

  if (top.length >= 2) {
    const s1 = CATEGORY[top[0].k].strength, s2 = CATEGORY[top[1].k].strength
    parts.push(pick(rng, [
      `Guests rate it most highly for ${s1} (${fmt(top[0].v)}) and ${s2} (${fmt(top[1].v)}).`,
      `Its strongest marks come for ${s1} and ${s2}, scoring ${fmt(top[0].v)} and ${fmt(top[1].v)} respectively.`,
      `Reviewers single out ${s1} (${fmt(top[0].v)}) and ${s2} (${fmt(top[1].v)}) as the standouts.`,
    ]))
  }

  const overall = r.ratings.overall
  if (overall != null) {
    parts.push(pick(rng, [
      `It holds an overall guest rating of ${fmt(overall)} out of 10.`,
      `Across all categories it averages ${fmt(overall)} out of 10 from verified guest reviews.`,
      `The property earns ${fmt(overall)} out of 10 overall.`,
    ]))
  }

  return parts.join(' ')
}

// ---- whatYouNeedToKnow (~90-120 words) ---------------------------------------
function writeWhatYouNeedToKnow(r, rng) {
  const loc = locationOf(r)
  const top = topRatings(r, 2)
  const weak = weakestRating(r)
  const parts = []

  // 1. Setting + getting there
  if (r.airport) {
    parts.push(pick(rng, [
      `${r.name} sits in ${loc}, with ${r.airport} the nearest airport for transfers.`,
      `Located in ${loc}, ${r.name} is reached via ${r.airport} airport.`,
      `The resort is in ${loc}; most guests fly into ${r.airport}.`,
    ]))
  } else {
    parts.push(pick(rng, [
      `${r.name} sits in ${loc}.`,
      `The resort is located in ${loc}.`,
    ]))
  }

  // 2. All-inclusive baseline
  parts.push(pick(rng, [
    `As an all-inclusive, the rate covers accommodation, meals, drinks, and the core roster of on-site activities and entertainment.`,
    `The all-inclusive package bundles your room, all meals, beverages, and most on-site activities into one price.`,
    `Rates are all-inclusive, so accommodation, dining, drinks, and standard activities are covered up front.`,
  ]))

  // 3. Strengths from ratings
  if (top.length >= 2) {
    parts.push(pick(rng, [
      `Guests reserve their highest praise for ${CATEGORY[top[0].k].strength} (${fmt(top[0].v)}) and ${CATEGORY[top[1].k].strength} (${fmt(top[1].v)}) — the clearest reasons to book.`,
      `Its strongest suit is ${CATEGORY[top[0].k].strength}, rated ${fmt(top[0].v)}, backed by ${CATEGORY[top[1].k].strength} at ${fmt(top[1].v)}.`,
      `Expect ${CATEGORY[top[0].k].strength} and ${CATEGORY[top[1].k].strength} to be the highlights, at ${fmt(top[0].v)} and ${fmt(top[1].v)}.`,
    ]))
  }

  // 4. A weak spot to set expectations (only if genuinely soft)
  if (weak && weak.v < 7.5) {
    parts.push(pick(rng, [
      `Set expectations on ${CATEGORY[weak.k].noun}, its lowest score at ${fmt(weak.v)} — the one area where reviews soften.`,
      `The category to watch is ${CATEGORY[weak.k].noun} (${fmt(weak.v)}), consistently the resort's weakest.`,
      `Reviews are most mixed on ${CATEGORY[weak.k].noun} (${fmt(weak.v)}), so weigh that against the strengths.`,
    ]))
  }

  // 5. Who it's for
  parts.push(pick(rng, [
    `It's ${article(typePhrase(r))} ${typePhrase(r)} property, best suited to ${audienceNoun(r, rng)}.`,
    `The resort is ${typePhrase(r)}, making it a natural fit for ${audienceNoun(r, rng)}.`,
  ]) + (r.ageNote ? ` Note the age policy: ${r.ageNote}.` : ''))

  // 6. Timing pointer
  parts.push(pick(rng, [
    `On timing: ${seasonStr(r.country)}`,
    `When to go: ${seasonStr(r.country)}`,
  ]))

  return parts.join(' ')
}

// ---- bestTimeToVisit (~50-70 words) ------------------------------------------
function writeBestTime(r, rng) {
  const season = seasonStr(r.country)
  const region = r.country || (r.area && r.area.trim()) || ''
  const opener = region
    ? pick(rng, [
        `The best time to visit ${r.name} tracks the wider ${region} season.`,
        `Timing a trip to ${r.name} comes down to ${region}'s climate.`,
        `When to book ${r.name} depends on the ${region} weather calendar.`,
      ])
    : pick(rng, [
        `The best time to visit ${r.name} follows the local climate.`,
        `Timing a trip to ${r.name} comes down to local weather patterns.`,
        `When to book ${r.name} depends on the local weather calendar.`,
      ])
  const closer = pick(rng, [
    `Prices and crowds peak in those prime months, so shoulder-season dates on either side often deliver the best balance of weather and value.`,
    `Booking at the edges of that window usually means fewer crowds and lower rates for similar weather.`,
    `Rates climb during the ideal stretch, so travelers chasing value should look at the shoulder weeks just before and after.`,
  ])
  return `${opener} ${season} ${closer}`
}

// ---- activities (~55-80 words) -----------------------------------------------
function writeActivities(r, rng) {
  const onSite = activityAmenities(r, 4)
  const dest = destinationActivities(r)
  const parts = []

  if (onSite.length) {
    parts.push(pick(rng, [
      `On property, ${r.name} offers ${listJoin(onSite)}, alongside the pools, beach access, and dining that come standard with the all-inclusive plan.`,
      `On-site, guests can fill days with ${listJoin(onSite)}, plus the usual pool, beach, and restaurant options included in the rate.`,
      `At the resort itself you'll find ${listJoin(onSite)}, layered on top of the standard pool and beach facilities.`,
    ]))
  } else {
    parts.push(pick(rng, [
      `On property, days revolve around the pools, beach, dining venues, and evening entertainment that come with the all-inclusive plan.`,
      `On-site, the rhythm is classic all-inclusive: pool and beach time, multiple restaurants, and nightly entertainment.`,
    ]))
  }

  parts.push(pick(rng, [
    `Beyond the gates, ${r.country || 'the surrounding area'} is known for ${dest}.`,
    `Off property, expect ${dest} within reach.`,
    `For excursions, the area offers ${dest}.`,
  ]))

  return parts.join(' ')
}

// ---- public API --------------------------------------------------------------
// Returns only the fields the resort is missing, so hand-authored content
// is never overwritten.
function fillResortContent(r) {
  const rng = rngFor(r.slug)
  const out = {}
  const blank = v => v == null || String(v).trim() === ''
  if (blank(r.description)) out.description = writeDescription(r, rng)
  if (blank(r.whatYouNeedToKnow)) out.whatYouNeedToKnow = writeWhatYouNeedToKnow(r, rng)
  if (blank(r.bestTimeToVisit)) out.bestTimeToVisit = writeBestTime(r, rng)
  if (blank(r.activities)) out.activities = writeActivities(r, rng)
  return out
}

module.exports = { fillResortContent }
