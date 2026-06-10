#!/usr/bin/env node
// Batch generator for resort-pair editorial overviews.
//
// Matches the voice of existing hand-authored entries in data/resorts.js.
// Runs in resumable batches (default 5,000 pairs/run) and writes sharded
// output to data/pair-overviews/shard-NNNN.js. build.js merges all shards
// on top of the untouched legacy pairOverviews.
//
// Usage:
//   ANTHROPIC_API_KEY=sk-... node scripts/generate-pair-overviews.js
//   ANTHROPIC_API_KEY=sk-... BATCH_SIZE=5000 MODEL=claude-sonnet-4-6 node scripts/generate-pair-overviews.js
//
// Re-running skips already-completed pairs and processes the next batch.

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const SHARD_DIR = path.join(ROOT, 'data', 'pair-overviews')

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '5000', 10)
const MODEL = process.env.MODEL || 'claude-sonnet-4-6'
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '12', 10)
const API_KEY = process.env.ANTHROPIC_API_KEY
const API_URL = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com') + '/v1/messages'

if (!API_KEY) { console.error('ERROR: set ANTHROPIC_API_KEY'); process.exit(1) }

const { resorts: legacyResorts, pairOverviews: legacyPairOverviews } = require(path.join(ROOT, 'data', 'resorts'))
const { newResorts, shouldGeneratePair } = require(path.join(ROOT, 'data', 'resorts-new'))
const resorts = [...legacyResorts, ...newResorts]

function allPairs() {
  const pairs = []
  for (let i = 0; i < resorts.length; i++) {
    for (let j = i + 1; j < resorts.length; j++) {
      const x = resorts[i], y = resorts[j]
      if (!shouldGeneratePair(x, y)) continue
      const [a, b] = x.slug < y.slug ? [x, y] : [y, x]
      pairs.push({ a, b, key: `${a.slug}-vs-${b.slug}` })
    }
  }
  return pairs
}

function loadDoneKeys() {
  const done = new Set(Object.keys(legacyPairOverviews))
  let maxShard = -1
  if (fs.existsSync(SHARD_DIR)) {
    for (const f of fs.readdirSync(SHARD_DIR)) {
      const m = f.match(/^shard-(\d+)\.js$/)
      if (!m) continue
      maxShard = Math.max(maxShard, parseInt(m[1], 10))
      const obj = require(path.join(SHARD_DIR, f))
      for (const k of Object.keys(obj)) done.add(k)
    }
  }
  return { done, nextShard: maxShard + 1 }
}

function pickExemplars(n = 2) {
  return Object.entries(legacyPairOverviews)
    .filter(([, v]) => v && v.keyDifferences && v.keyDifferences.length > 120)
    .sort((a, b) => b[1].keyDifferences.length - a[1].keyDifferences.length)
    .slice(0, n).map(([, v]) => v)
}

function fmtRatings(r) {
  return Object.entries(r)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => `${k}: ${v}`).join(', ')
}

function resortBlurb(r) {
  return [
    `Name: ${r.name}`,
    `Country: ${r.country}`,
    `Area: ${r.area || 'n/a'}`,
    `Type: ${r.type}`,
    r.ageNote ? `Age policy: ${r.ageNote}` : null,
    r.priceLevel ? `Price level: ${r.priceLevel}` : null,
    `Ratings -- ${fmtRatings(r.ratings)}`,
    r.amenities && r.amenities.length ? `Amenities: ${r.amenities.join(', ')}` : null,
  ].filter(Boolean).join('\n')
}

const EXEMPLARS = pickExemplars(2)

function buildPrompt(a, b) {
  const examples = EXEMPLARS.map(v => JSON.stringify({
    keyDifferences: v.keyDifferences,
    whoShouldChooseA: v.whoShouldChooseA,
    whoShouldChooseB: v.whoShouldChooseB,
    whenToVisit: v.whenToVisit,
    activities: v.activities,
  }, null, 2)).join('\n\n')

  return `You are a discerning all-inclusive resort editor. Write a side-by-side comparison in the same voice as the examples: analytical, specific, grounded in actual ratings, never marketing copy. Resort A is "${a.name}", Resort B is "${b.name}".

RESORT A\n${resortBlurb(a)}\n\nRESORT B\n${resortBlurb(b)}\n\nWrite:\n- keyDifferences: 150-200 words contrasting the two, citing specific rating gaps.\n- whoShouldChooseA: 50-75 words on the ideal guest for A.\n- whoShouldChooseB: 50-75 words on the ideal guest for B.\n- whenToVisit: ~75 words on timing.\n- activities: ~75 words on what guests can do at/near both.\n\nExisting style examples:\n${examples}\n\nRespond with ONLY a JSON object with those five string keys.`
}

async function callModel(prompt, attempt = 0) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 1200, messages: [{ role: 'user', content: prompt }] }),
    })
    if (!res.ok) {
      if ((res.status === 429 || res.status >= 500) && attempt < 5) {
        await sleep(2000 * Math.pow(2, attempt))
        return callModel(prompt, attempt + 1)
      }
      throw new Error(`HTTP ${res.status}: ${await res.text()}`)
    }
    const data = await res.json()
    const text = (data.content || []).map(c => c.text || '').join('').trim()
    return JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ''))
  } catch (e) {
    if (attempt < 5) { await sleep(2000 * Math.pow(2, attempt)); return callModel(prompt, attempt + 1) }
    throw e
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  fs.mkdirSync(SHARD_DIR, { recursive: true })
  const { done, nextShard } = loadDoneKeys()
  const pending = allPairs().filter(p => !done.has(p.key))
  const batch = pending.slice(0, BATCH_SIZE)

  console.log(`Total pairs: ${done.size + pending.length}`)
  console.log(`Already done: ${done.size}`)
  console.log(`Remaining: ${pending.length}`)
  console.log(`This run: ${batch.length} -> shard-${String(nextShard).padStart(4, '0')}`)
  if (!batch.length) { console.log('Nothing to do.'); return }

  const result = {}
  let i = 0, ok = 0, fail = 0
  async function worker() {
    while (i < batch.length) {
      const idx = i++
      const { a, b, key } = batch[idx]
      try { result[key] = await callModel(buildPrompt(a, b)); ok++ }
      catch (e) { fail++; console.error(`  FAILED ${key}: ${e.message}`) }
      if ((ok + fail) % 100 === 0) console.log(`  ${ok + fail}/${batch.length} (ok=${ok} fail=${fail})`)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  const shardFile = path.join(SHARD_DIR, `shard-${String(nextShard).padStart(4, '0')}.js`)
  fs.writeFileSync(shardFile, `// Auto-generated. Do not edit by hand.\nmodule.exports = ${JSON.stringify(result, null, 2)}\n`)
  console.log(`Wrote ${Object.keys(result).length} overviews to ${path.relative(ROOT, shardFile)} (ok=${ok} fail=${fail})`)
}

main().catch(e => { console.error(e); process.exit(1) })
