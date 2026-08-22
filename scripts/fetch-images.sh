#!/usr/bin/env bash
#
# fetch-images.sh — one-shot image import for the Desmo Shed site.
#
# Pulls photos off the old Wix site and the Google Business listing into
# assets/img/gallery/, de-duplicates them by checksum, renumbers them, and
# writes assets/img/gallery/index.json — which is what the gallery renders from.
# Nothing is hotlinked, so the site keeps working when the Wix account lapses.
#
# Usage:   ./scripts/fetch-images.sh
# Re-run:  safe — the gallery folder is rebuilt from scratch each time.
#
# ─────────────────────────────────────────────────────────────────────────────
# READ THIS BEFORE YOU PUBLISH THE GALLERY
#
# This script can only reach the handful of listing photos that are exposed
# without signing in. It is NOT the full Google gallery, and it never will be —
# Google renders that grid behind a virtualising loader that resists scripting.
#
# The proper source is Google Business Profile, which Desmo Shed owns:
#   business.google.com  ▸  the Desmo Shed listing  ▸  Photos
# From there you can download the business's own photos at full resolution.
#
# That route also settles a copyright question this one does not. Most photos on
# a Google Maps listing were uploaded by CUSTOMERS, and the copyright stays with
# them — the business does not acquire the right to republish them on a
# commercial website just because they appear on its listing. Photos under
# "By owner" are Desmo Shed's own and are safe to use. If you want a customer's
# shot on the site, ask them.
#
# So: treat what this script fetches as a starting set, and replace it with
# owner photos from Business Profile when you can.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
GAL="$ROOT/assets/img/gallery"
SRC="$ROOT/assets/img/source"
TMP="$ROOT/assets/img/_staging"

rm -rf "$TMP" "$GAL"
mkdir -p "$TMP" "$GAL" "$SRC"

UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

# --- Photos from the old Wix site (www.desmoshed.co.uk) ----------------------
WIX=(
  "https://static.wixstatic.com/media/ea73a1_938e756694af462ab41bd0f85664a000~mv2.jpeg"
  "https://static.wixstatic.com/media/ea73a1_84b0d69dce1c42ae8af9561f492eac42~mv2.jpeg"
  "https://static.wixstatic.com/media/ea73a1_966fff7700304c4487ea376965f8e71f~mv2.jpeg"
)

# --- Photos read directly off the Google Maps listing ------------------------
# Requested at 2048px wide. Drop the "=w2048-h1536-k-no" suffix for the original
# (the first of these is 3024×4032), or lower it if you want smaller files.
GOOGLE_DIRECT=(
  "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmdWBRyh0P8RpLm6zsBsHzMWmEirKzcTUeCJEt_8kgRGCl0qQ9Uu3fE5tNgh60MjJILqivS08n_UrlXAFXj_F_RxQw0I-VbHve5AYpkyVBEtALGRsWZOBR-1r-oZH5pbcj9m8oN=w2048-h1536-k-no"
  "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWn1rMZfGF68SeAC_5k2KMLziW8SpDY_mtL2jyhLc5wEk9n5bsH93ogdcaSmHp8Ikit44ldq85Jdhq34acB7taRk1TvpdnsJ-u4axgZBXzRKfB0Ff_4Q2Ivdp1DA4OKHt7rlfYe2IDB5tlFR=w2048-h1536-k-no"
  "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWl3CTPI0ukrEh1rmaVBk-G20OOMuuixblmC5EoouiK_H_Ek6ZKTxwRneFRE9S9M7I4WGv_OVrqX171PDq0q3o92C6K-4itI7SI2rJCryL51-4Jyp_74RWr1YE0Xiep5qbeAYdpYjh60IKQV=w2048-h1536-k-no"
  "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnQj1se093LY3TpPb_x9rVUsm0XhJg5lLtN4t4uhXVq9ZkhbQVdGGgfFCZZidoDxJCmGMa5NKgL_xBEheKvK3yQ5ZXD2kU0HrsZZvj3uuenL_2Sdp0EDQO12CVRZut9QLhjMaTuD2Ugrkfm=w2048-h1536-k-no"
)

# --- The same listing, mirrored by a directory site (lower resolution) --------
# Kept because it covers a couple of shots the direct URLs above do not. Any
# duplicates are removed by the checksum pass below.
GOOGLE_MIRROR=(
  "https://static.where-e.com/United_Kingdom/Desmo-Shed_d22892b3647e3603542161f7c6149858.jpg"
  "https://static.where-e.com/United_Kingdom/Desmo-Shed_2c988ac48b055d5545ff95037a8cbd3b.jpg"
  "https://static.where-e.com/United_Kingdom/Desmo-Shed_bfa4a0a8e884744ec7780bba6346b090.jpg"
  "https://static.where-e.com/United_Kingdom/Desmo-Shed_cd2a530761acdbbbac4ddd4143766346.jpg"
  "https://static.where-e.com/United_Kingdom/Desmo-Shed_d8cb0ed7c8609974a4c19c54813a001d.jpg"
)

# --- Logos / badges from the old site: reference only, not published ---------
BADGES=(
  "https://static.wixstatic.com/media/8d6893330740455c96d218258a458aa4.png"
  "https://static.wixstatic.com/media/e316f544f9094143b9eac01f1f19e697.png"
  "https://static.wixstatic.com/media/84770f_3ebbf7ac3e26427b83ca50c82aabaaf8~mv2.png"
)

hashof() {
  if command -v md5 >/dev/null 2>&1; then md5 -q "$1"
  elif command -v md5sum >/dev/null 2>&1; then md5sum "$1" | cut -d' ' -f1
  else wc -c < "$1" | tr -d ' '
  fi
}

grab() { # grab <url> <dest>
  curl -fsSL --retry 2 --max-time 60 -A "$UA" -o "$2" "$1" 2>/dev/null
}

echo "Downloading…"
i=0; failed=0
for u in "${WIX[@]}" "${GOOGLE_DIRECT[@]}" "${GOOGLE_MIRROR[@]}"; do
  i=$((i+1))
  dest="$(printf '%s/raw-%02d.jpg' "$TMP" "$i")"
  if grab "$u" "$dest"; then
    printf '  ✓ %s\n' "$(basename "$dest")"
  else
    printf '  ✗ failed: %s\n' "${u:0:80}…" >&2
    rm -f "$dest"; failed=$((failed+1))
  fi
done

echo "De-duplicating and renumbering…"
n=0
: > "$TMP/hashes"
for f in "$TMP"/raw-*.jpg; do
  [ -f "$f" ] || continue
  # Ignore anything suspiciously small — usually an error page, not a photo.
  size=$(wc -c < "$f" | tr -d ' ')
  if [ "$size" -lt 8000 ]; then printf '  – skipped (too small): %s\n' "$(basename "$f")"; continue; fi
  h="$(hashof "$f")"
  if grep -qx "$h" "$TMP/hashes" 2>/dev/null; then
    printf '  – duplicate dropped: %s\n' "$(basename "$f")"
    continue
  fi
  echo "$h" >> "$TMP/hashes"
  n=$((n+1))
  mv "$f" "$(printf '%s/gallery-%02d.jpg' "$GAL" "$n")"
done

echo "Writing gallery manifest…"
{
  echo "["
  k=0
  for f in "$GAL"/gallery-*.jpg; do
    [ -f "$f" ] || continue
    k=$((k+1))
    [ "$k" -gt 1 ] && echo ","
    printf '  { "File": "%s", "Caption": "Desmo Shed, New Barnet" }' "$(basename "$f")"
  done
  echo
  echo "]"
} > "$GAL/index.json"

echo "Fetching reference badges…"
j=0
for u in "${BADGES[@]}"; do
  j=$((j+1))
  grab "$u" "$(printf '%s/badge-%02d.png' "$SRC" "$j")" && printf '  ✓ badge-%02d.png\n' "$j" || true
done

# --- Derive the hero background and the Open Graph share image ---------------
HERO_SRC="$GAL/gallery-01.jpg"
if [ -f "$HERO_SRC" ]; then
  echo "Building hero.jpg and og.jpg…"
  cp "$HERO_SRC" "$ROOT/assets/img/hero.jpg"
  cp "$HERO_SRC" "$ROOT/assets/img/og.jpg"
  if command -v sips >/dev/null 2>&1; then                 # macOS
    sips -Z 1920 "$ROOT/assets/img/hero.jpg" >/dev/null 2>&1 || true
    sips -Z 1200 "$ROOT/assets/img/og.jpg"   >/dev/null 2>&1 || true
    sips -c 630 1200 "$ROOT/assets/img/og.jpg" >/dev/null 2>&1 || true
  elif command -v magick >/dev/null 2>&1; then             # ImageMagick 7
    magick "$ROOT/assets/img/hero.jpg" -resize 1920x -quality 82 "$ROOT/assets/img/hero.jpg"
    magick "$ROOT/assets/img/og.jpg" -resize 1200x630^ -gravity center -extent 1200x630 -quality 82 "$ROOT/assets/img/og.jpg"
  else
    echo "  (no sips or magick — hero.jpg/og.jpg copied at full size)"
  fi
fi

rm -rf "$TMP"

cat <<EOF

Done. $n photo(s) in assets/img/gallery/ ($failed download(s) failed).

Next:
  1. Open index.html and look at the gallery.
  2. Edit assets/img/gallery/index.json to give each photo a real caption —
     that file is the gallery's source of truth, so adding, removing or
     reordering entries there changes the page. No JS edit needed.
  3. When you can, replace these with owner photos exported from
     Google Business Profile (see the note at the top of this script).
EOF
