#!/usr/bin/env bash
# Seeds the demo backlog in your GitHub repo. Requires the GitHub CLI (gh), logged in.
# Usage: ./scripts/seed-issues.sh            (run from the repo root)
#
# Uses `gh api` for everything so it works with old and new versions of gh.
# Run it once: it refuses to run if the repo already has issues.
set -euo pipefail

repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
echo "Seeding backlog in $repo"

existing=$(gh api "repos/$repo/issues?state=all&per_page=1" --jq 'length')
if [ "$existing" != "0" ]; then
  echo "This repo already has issues. Not seeding again, to avoid duplicates." >&2
  exit 1
fi

label() { # name, colour: create or update
  gh api "repos/$repo/labels" -f name="$1" -f color="$2" >/dev/null 2>&1 ||
    gh api -X PATCH "repos/$repo/labels/$1" -f color="$2" >/dev/null
}
label story 1d76db
label bug d73a4a
label needs-refinement fbca04

issue() { # title, comma-separated labels, body -> prints issue number
  # Build the JSON with node (already required by the repo) so labels are sent as a real array.
  node -e 'const [t, l, b] = process.argv.slice(1);
    process.stdout.write(JSON.stringify({ title: t, body: b, labels: l.split(",") }));' "$1" "$2" "$3" |
    gh api "repos/$repo/issues" --input - --jq .number
}

# --- Open stories: one good, some vague (PM exercise material) ---
issue "See which rooms are free right now" "story" "$(cat <<'EOF'
As an employee walking around the office,
I want to see at a glance which rooms are free right now,
so that I can grab a room for a quick chat without checking every schedule.

**Acceptance criteria**
1. Given a room has no booking covering the current time, when I open Roomly, then it is marked "Free now".
2. Given a room is booked right now, when I open Roomly, then it shows "In use" and when it becomes free.
3. Given the page stays open, when a booking ends, then the status updates within a minute without reloading.
EOF
)" >/dev/null

issue "Make booking better" "story,needs-refinement" "Booking is kind of annoying. Can we make it better? Users complained." >/dev/null

issue "Rooms page is confusing" "story,needs-refinement" "$(cat <<'EOF'
Someone in sales said the rooms page is confusing. Maybe show more info? Or less? Also colours.
EOF
)" >/dev/null

issue "Recurring bookings" "story,needs-refinement" "$(cat <<'EOF'
Teams want to book the same room every week for standups and retros. Should work like calendar recurring events.
EOF
)" >/dev/null

# --- Open bugs: one vague, two well written ---
issue "booking broken sometimes??" "bug,needs-refinement" "$(cat <<'EOF'
Two teams showed up in Aurora at the same time yesterday. Both had bookings. Not sure how. pls fix
EOF
)" >/dev/null

issue "Can't book a room for exactly its capacity" "bug" "$(cat <<'EOF'
**Steps**
1. Open Roomly and choose Aurora (6 seats).
2. Enter 6 people and a free time slot.
3. Click "Book room".

**Expected:** the booking is created (6 people fit in a 6-seat room).
**Actual:** error "Aurora fits 6 people".
EOF
)" >/dev/null

issue "Cancelling a booking removes the wrong one from the list" "bug" "$(cat <<'EOF'
**Steps**
1. In "Today's bookings", set the filter to a single room, e.g. Aurora.
2. Click "Cancel booking" on the second booking shown.

**Expected:** that booking disappears from the list.
**Actual:** a different booking disappears. After a page reload the list is correct, so the right booking was cancelled on the server.
EOF
)" >/dev/null

# --- Closed issues (material for the release-notes skill) ---
for spec in \
  "Show the floor on each room|story|Users asked which floor each room is on." \
  "Support dark mode|story|Follow the operating system's light or dark setting." \
  "Reject bookings that end before they start|bug|Bookings with an end time before the start time were accepted." \
  "Show 'Free now' status on the timeline|story|Mark rooms that are free at the current time." \
  "Upgrade Vite to v5|story|Internal: dependency bump."; do
  IFS='|' read -r title lbl body <<<"$spec"
  n=$(issue "$title" "$lbl" "$body")
  gh api -X PATCH "repos/$repo/issues/$n" -f state=closed -f state_reason=completed >/dev/null
done

echo "Done. Backlog seeded: 7 open issues, 5 closed."
