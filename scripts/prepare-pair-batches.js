#!/usr/bin/env node
// Prepare batched pair lists + compact resort summary for AI overview generation.
const fs = require('fs')
const path = require('path')
const { resorts, pairOverviews, allComparisonPairs } = require('../data/resorts.js')

const summary = resorts.map(r => ({
  slug: r.slug,
  name: r.name,
  country: r.country,
  area: r.area,
  airport: r.airport,
  type: r.type,
  ageNote: r.ageNote,
  priceLevel: r.priceLevel,
  notes: r.notes,
  ratings: r.ratings,
  amenities: r.amenities,
  heroTagline: r.heroTagline,
  whatYouNeedToKnow: r.whatYouNeedToKnow,
}))

fs.writeFileSync('/tmp/resort-summary.json', JSON.stringify(summary, null, 2))

const allPairs = allComparisonPairs()
const missing = allPairs
  .map(({ a, b }) => `${a.slug}-vs-${b.slug}`)
  .filter(key => !pairOverviews[key])

const BATCH_COUNT = 18
const batches = Array.from({ length: BATCH_COUNT }, () => [])
missing.forEach((key, i) => batches[i % BATCH_COUNT].push(key))

batches.forEach((batch, i) => {
  fs.writeFileSync(`/tmp/pair-batch-${i + 1}.json`, JSON.stringify(batch, null, 2))
})

console.log(`Total pairs: ${allPairs.length}`)
console.log(`Already curated: ${Object.keys(pairOverviews).length}`)
console.log(`Missing (to generate): ${missing.length}`)
console.log(`Batches: ${BATCH_COUNT} × ~${Math.ceil(missing.length / BATCH_COUNT)} pairs`)
