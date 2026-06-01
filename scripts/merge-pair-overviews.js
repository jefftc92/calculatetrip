#!/usr/bin/env node
// Merge all pair-overviews-N.json files into data/resorts.js pairOverviews object.

const fs = require('fs')
const path = require('path')

const DATA_FILE = path.join(__dirname, '..', 'data', 'resorts.js')
const BATCH_COUNT = 18

// Load all generated overviews
const generated = {}
for (let i = 1; i <= BATCH_COUNT; i++) {
  const f = `/tmp/pair-overviews-${i}.json`
  if (!fs.existsSync(f)) { console.error(`Missing: ${f}`); process.exit(1) }
  Object.assign(generated, JSON.parse(fs.readFileSync(f, 'utf8')))
}
console.log(`Loaded ${Object.keys(generated).length} generated pair overviews`)

function jsStr(s) {
  return '`' + s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + '`'
}

// Build the new pairOverviews block entries
const newEntries = Object.entries(generated).map(([key, val]) => {
  return `  '${key}': {\n    keyDifferences: ${jsStr(val.keyDifferences)},\n    whoShouldChooseA: ${jsStr(val.whoShouldChooseA)},\n    whoShouldChooseB: ${jsStr(val.whoShouldChooseB)},\n  },`
}).join('\n')

let src = fs.readFileSync(DATA_FILE, 'utf8')

// Find the closing brace of pairOverviews and insert before it
// The existing curated entries are kept; we append the generated ones before the closing }
const MARKER = '\n}\n\nfunction bySlug'
const markerIdx = src.indexOf(MARKER)
if (markerIdx === -1) {
  console.error('Could not find pairOverviews closing marker')
  process.exit(1)
}

// Insert new entries before the closing brace, keeping the rest intact
src = src.slice(0, markerIdx) + '\n' + newEntries + MARKER + src.slice(markerIdx + MARKER.length)

fs.writeFileSync(DATA_FILE, src, 'utf8')
console.log(`Written to ${DATA_FILE}`)
