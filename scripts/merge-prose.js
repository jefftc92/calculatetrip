#!/usr/bin/env node
// Merge prose JSON files into data/resorts.js.
// Replaces "TODO" placeholder values in description/heroTagline/whatYouNeedToKnow/bestTimeToVisit/activities
// for each resort whose slug appears in any of /tmp/prose-N.json.

const fs = require('fs')
const path = require('path')

const DATA_FILE = path.join(__dirname, '..', 'data', 'resorts.js')
const PROSE_FILES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(n => `/tmp/prose-${n}.json`)

const prose = {}
for (const f of PROSE_FILES) {
  if (!fs.existsSync(f)) {
    console.error(`Missing prose file: ${f}`)
    process.exit(1)
  }
  Object.assign(prose, JSON.parse(fs.readFileSync(f, 'utf8')))
}

let src = fs.readFileSync(DATA_FILE, 'utf8')
const FIELDS = ['description', 'heroTagline', 'whatYouNeedToKnow', 'bestTimeToVisit', 'activities']

function jsString(s) {
  return "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'"
}

let updated = 0
for (const [slug, fields] of Object.entries(prose)) {
  const slugMatch = src.match(new RegExp(`slug: '${slug}',[\\s\\S]*?ratings: \\{`))
  if (!slugMatch) {
    console.warn(`Slug not found in source: ${slug}`)
    continue
  }
  const startIdx = slugMatch.index
  const endIdx = startIdx + slugMatch[0].length
  let block = src.slice(startIdx, endIdx)

  for (const f of FIELDS) {
    if (!fields[f]) continue
    const placeholder = new RegExp(`(${f}: )'TODO'`)
    if (!placeholder.test(block)) {
      console.warn(`No TODO for ${slug}.${f}`)
      continue
    }
    block = block.replace(placeholder, `$1${jsString(fields[f])}`)
  }

  src = src.slice(0, startIdx) + block + src.slice(endIdx)
  updated++
}

fs.writeFileSync(DATA_FILE, src, 'utf8')
console.log(`Updated ${updated} resorts`)

const remaining = (src.match(/'TODO'/g) || []).length
console.log(`Remaining TODO placeholders: ${remaining}`)
