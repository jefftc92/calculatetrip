#!/usr/bin/env node
// Preview CLI for the formulaic overview writer (scripts/formulaic-overview.js).
//
// Formulaic overviews are no longer persisted to data/pair-overviews/ —
// build.js writes them at build time for any pair without a stored
// (hand-authored or LLM-generated) overview. Use this script to inspect
// what a given pair will render.
//
// Usage:
//   node scripts/generate-formulaic.js <slug-a> <slug-b>
//   node scripts/generate-formulaic.js            # a few random samples

const path = require('path')

const ROOT = path.join(__dirname, '..')
const { buildOverview } = require('./formulaic-overview')
const { resorts: legacyResorts } = require(path.join(ROOT, 'data', 'resorts'))
const { newResorts } = require(path.join(ROOT, 'data', 'resorts-new'))
const resorts = [...legacyResorts, ...newResorts]
const bySlug = Object.fromEntries(resorts.map(r => [r.slug, r]))

function print(a, b) {
  const [x, y] = a.slug < b.slug ? [a, b] : [b, a]
  console.log(`\n=== ${x.slug}-vs-${y.slug} ===`)
  const o = buildOverview(x, y)
  for (const [k, v] of Object.entries(o)) console.log(`\n${k}:\n${v}`)
}

const [slugA, slugB] = process.argv.slice(2)
if (slugA && slugB) {
  const a = bySlug[slugA], b = bySlug[slugB]
  if (!a || !b) {
    console.error(`Unknown slug: ${!a ? slugA : slugB}`)
    process.exit(1)
  }
  print(a, b)
} else {
  for (let i = 0; i < 3; i++) {
    const a = resorts[Math.floor(Math.random() * resorts.length)]
    let b = a
    while (b === a) b = resorts[Math.floor(Math.random() * resorts.length)]
    print(a, b)
  }
}
