#!/usr/bin/env bash
# Run ONE pair-overview generation batch and push it on its own branch,
# so each batch becomes a single reviewable PR.
#
# Usage:
#   ANTHROPIC_API_KEY=sk-ant-... ./scripts/run-batch.sh
#
# Re-run repeatedly. Each invocation:
#   1. syncs feature/resort-expansion
#   2. generates the next 5,000-pair shard (resumable; skips done pairs)
#   3. commits the new shard on branch pair-overviews-batch-NNNN
#   4. pushes it, ready for a PR into feature/resort-expansion
set -euo pipefail

BASE_BRANCH="feature/resort-expansion"
SHARD_DIR="data/pair-overviews"

if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
  echo "ERROR: set ANTHROPIC_API_KEY"; exit 1
fi

git fetch origin "$BASE_BRANCH"
git checkout "$BASE_BRANCH"
git pull --ff-only origin "$BASE_BRANCH"

# Next shard number = count of existing shard-*.js files
mkdir -p "$SHARD_DIR"
NEXT=$(ls "$SHARD_DIR"/shard-*.js 2>/dev/null | wc -l | tr -d ' ')
PADDED=$(printf "%04d" "$NEXT")
BRANCH="pair-overviews-batch-$PADDED"

echo "==> Generating shard-$PADDED on branch $BRANCH"
git checkout -b "$BRANCH"

node scripts/generate-pair-overviews.js

NEWFILE="$SHARD_DIR/shard-$PADDED.js"
if [[ ! -f "$NEWFILE" ]]; then
  echo "No new shard produced (nothing left to generate?)."; exit 0
fi

git add "$NEWFILE"
git commit -m "Add pair-overviews shard-$PADDED (batch $NEXT)"

for attempt in 1 2 3 4; do
  if git push -u origin "$BRANCH"; then break; fi
  sleep $((2 ** attempt))
done

echo "==> Pushed $BRANCH. Open a PR into $BASE_BRANCH (or ask Claude to)."
