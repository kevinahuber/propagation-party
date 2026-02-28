#!/bin/sh
set -e

if [ "$(uname)" = "Darwin" ]; then
  CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
else
  CHROME="google-chrome-stable"
fi

"$CHROME" --headless=new \
  --screenshot="$PWD/public/og-image.png" \
  --window-size=1200,630 \
  --default-background-color=fffdf5 \
  "$PWD/og-image.svg" 2>/dev/null

echo "og-image.png updated"
