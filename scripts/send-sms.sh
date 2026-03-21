#!/usr/bin/env bash
set -euo pipefail

SUPABASE_URL="https://inlrdvzbrglgzxxtfnxj.supabase.co"
SUPABASE_KEY="${SUPABASE_SERVICE_KEY:?Error: SUPABASE_SERVICE_KEY environment variable is required. Find it in your Supabase dashboard under Settings > API.}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MESSAGE_FILE="${SCRIPT_DIR}/sms-message.txt"
FILTER="all"
TEST_MODE=false

usage() {
  echo "Usage: $0 [--filter yes|no|maybe|all] [--message-file path] [--test]"
  echo ""
  echo "Sends personalized SMS messages via ADB to RSVPs from Supabase."
  echo "Message template should contain {name} as placeholder."
  echo ""
  echo "Options:"
  echo "  --filter        Filter by RSVP status (default: all)"
  echo "  --message-file  Path to message template (default: scripts/sms-message.txt)"
  echo "  --test          Send a test message to yourself"
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --filter) FILTER="$2"; shift 2 ;;
    --message-file) MESSAGE_FILE="$2"; shift 2 ;;
    --test) TEST_MODE=true; shift ;;
    -h|--help) usage ;;
    *) echo "Unknown option: $1"; usage ;;
  esac
done

if [[ ! -f "$MESSAGE_FILE" ]]; then
  echo "Error: Message file not found: $MESSAGE_FILE"
  echo "Create it with a {name} placeholder, e.g.:"
  echo "  echo 'Hey {name}, the party is Saturday!' > $MESSAGE_FILE"
  exit 1
fi

TEMPLATE="$(cat "$MESSAGE_FILE")"
if [[ "$TEMPLATE" != *"{name}"* ]]; then
  echo "Warning: Message template does not contain {name} placeholder."
  read -rp "Continue anyway? [y/N] " confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || exit 0
fi

if ! adb devices | grep -q "device$"; then
  echo "Error: No ADB device connected. Plug in your phone and enable USB debugging."
  exit 1
fi

if [[ "$TEST_MODE" == true ]]; then
  echo "Test mode: sending to Kevin at (513) 728-1883"
  RESPONSE='[{"name":"Kevin","phone":"(513) 728-1883"}]'
  COUNT=1
else
  echo "Fetching RSVPs from Supabase (filter: $FILTER)..."

  if [[ "$FILTER" == "all" ]]; then
    QUERY="select=name,phone,rsvp"
  else
    QUERY="select=name,phone,rsvp&rsvp=eq.${FILTER}"
  fi

  RESPONSE=$(curl -s \
    "${SUPABASE_URL}/rest/v1/rsvps?${QUERY}" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}")

  COUNT=$(echo "$RESPONSE" | jq length)
fi

if [[ "$COUNT" -eq 0 ]]; then
  echo "No RSVPs found with filter: $FILTER"
  exit 0
fi

echo "Found $COUNT RSVPs."
echo "Template: $TEMPLATE"
echo "---"

SENT=0
SKIPPED=0

for i in $(seq 0 $((COUNT - 1))); do
  NAME=$(echo "$RESPONSE" | jq -r ".[$i].name" | awk '{print $1}')
  PHONE=$(echo "$RESPONSE" | jq -r ".[$i].phone" | tr -dc '0-9')
  RSVP=$(echo "$RESPONSE" | jq -r ".[$i].rsvp // \"Yes\"")
  MESSAGE="${TEMPLATE//\{name\}/$NAME}"
  if [[ "$RSVP" == "Maybe" ]]; then
    MESSAGE="${MESSAGE//So excited to see you/Hope to see you}"
  fi

  echo ""
  echo "[$((i + 1))/$COUNT] To: $NAME ($PHONE)"
  echo "Message: $MESSAGE"
  echo ""

  while true; do
    read -rp "[s]end / [skip] / [e]dit / [q]uit: " action
    case "$action" in
      s|send)
        adb shell am start -a android.intent.action.SENDTO -d "smsto:${PHONE}" --es sms_body "\"${MESSAGE}\"" --ez exit_on_sent true > /dev/null 2>&1
        sleep 1
        adb shell input keyevent 66 > /dev/null 2>&1
        echo "-> Sent!"
        SENT=$((SENT + 1))
        break
        ;;
      skip)
        echo "-> Skipped."
        SKIPPED=$((SKIPPED + 1))
        break
        ;;
      e|edit)
        read -rp "New message: " MESSAGE
        echo "Updated message: $MESSAGE"
        ;;
      q|quit)
        echo ""
        echo "Quit. Sent: $SENT, Skipped: $SKIPPED, Remaining: $((COUNT - i))"
        exit 0
        ;;
      *)
        echo "Invalid option. Use s/send, skip, e/edit, or q/quit."
        ;;
    esac
  done
done

echo ""
echo "Done! Sent: $SENT, Skipped: $SKIPPED"
