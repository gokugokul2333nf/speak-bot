#!/bin/zsh
cd "$(dirname "$0")" || exit 1

URL="http://127.0.0.1:5179/"

if lsof -iTCP:5179 -sTCP:LISTEN >/dev/null 2>&1; then
  open "$URL"
  exit 0
fi

(sleep 1 && open "$URL") &
python3 -m http.server 5179 --bind 127.0.0.1
