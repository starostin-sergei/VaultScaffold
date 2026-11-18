#!/bin/sh
# Usage: sh sync.sh <vault-dir>
# managed/ is copied over the vault every run. seed/ is copied only where the file is missing.
set -e
V="${1:?usage: sh sync.sh <vault-dir>}"
D="$(cd "$(dirname "$0")" && pwd)"
[ -d "$V" ] || { echo "no such dir: $V" >&2; exit 1; }
cp -R "$D/managed/." "$V/"
(cd "$D/seed" && find . -type f) | while IFS= read -r f; do
  if [ ! -e "$V/$f" ]; then mkdir -p "$(dirname "$V/$f")"; cp "$D/seed/$f" "$V/$f"; echo "seeded $f"; fi
done
echo "synced -> $V"
