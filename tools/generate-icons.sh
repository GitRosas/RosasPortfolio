#!/usr/bin/env bash
set -e

# Run: bash tools/generate-icons.sh (requires ImageMagick installed)

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE="$ROOT_DIR/assets/img/icon-source.svg"
OUT_DIR="$ROOT_DIR/assets/img/icons"

mkdir -p "$OUT_DIR"

if command -v magick >/dev/null 2>&1; then
  IMG_CMD=(magick)
elif command -v convert >/dev/null 2>&1; then
  IMG_CMD=(convert)
else
  echo "ImageMagick is required (magick or convert not found)." >&2
  exit 1
fi

"${IMG_CMD[@]}" "$SOURCE" -resize 192x192 "$OUT_DIR/icon-192.png"
"${IMG_CMD[@]}" "$SOURCE" -resize 512x512 "$OUT_DIR/icon-512.png"
"${IMG_CMD[@]}" "$SOURCE" -resize 180x180 "$OUT_DIR/apple-touch-icon.png"

"${IMG_CMD[@]}" -size 192x192 canvas:'#0a0e1a' \
  \( "$SOURCE" -resize 115x115 \) -gravity center -composite "$OUT_DIR/icon-192-maskable.png"
"${IMG_CMD[@]}" -size 512x512 canvas:'#0a0e1a' \
  \( "$SOURCE" -resize 307x307 \) -gravity center -composite "$OUT_DIR/icon-512-maskable.png"

echo "Icons generated in $OUT_DIR"