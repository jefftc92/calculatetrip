# Researched resort content

Hotel-specific `activities` and `whatYouNeedToKnow` paragraphs, researched and
written per property (not assembled from the amenities column). Each `.js`
shard exports a map of resort slug -> content object:

```js
module.exports = {
  'resort-slug': {
    activities: 'A paragraph about the actual activities at this hotel...',
    whatYouNeedToKnow: 'A paragraph on setting, getting there, the plan...',
  },
}
```

Merge priority in build.js (highest wins):
1. Hand-authored fields already on the resort record (data/resorts.js) — 125 legacy resorts
2. Researched content in this directory — overrides the formulaic fallback
3. Formulaic fallback (scripts/formulaic-resort.js) — fills anything still blank

Shards are merged in filename order, so a later shard can supersede an earlier
one for the same slug. Keep shard files reasonably sized (a few hundred resorts
each) for readable diffs.
