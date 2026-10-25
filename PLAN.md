# PLAN: Phase 1, "Link on your iPhone" (drafted 2026-10-25, awaiting builder's yes)

Goal: a rough, playable 3D hex map that opens on the builder's iPhone from any location, within the first week.

## Steps (each ends with a check the builder can do alone)
1. Repo + publish link. Empty page saying "hello" published via GitHub Pages. Check: open the link on iPhone.
2. 3D hex map. 12x10 hexes with elevation, forest, river, and town hexes, lit by a low sun. Check: pinch/drag the camera on iPhone.
3. Three unit types as simple stylized markers (armour, infantry, artillery): select and move with terrain costs. Check: tap a unit and move it.
4. Turn and attack. End turn, basic combat, a very simple enemy that moves toward the nearest objective. Check: play 5 turns.
5. First look pass. Fog, soft shadows, colour grading, day/dusk lighting. Check: screenshots at phone size, compared side by side.
Stop after each step for the builder's yes.

## Tech (proposed, needs approval)
- Three.js (free 3D library for web pages), plain files, no build tools needed at first. Hosted on GitHub Pages.
- Test method: Claude opens the page in a browser and takes screenshots at phone size before handing any check back.

## Usage estimate (rough, no exact numbers available)
- Steps 1-2: small to medium (Sonnet). Steps 3-4: medium (Sonnet). Step 5: medium (Opus for look direction, Sonnet to implement).
- Haiku: logs, git, START_HERE updates after every step.
- Stop and report if a step runs beyond the estimate.

## Out of scope for Phase 1
Real vehicle models, campaign, supply, air units, sound, polished UI.

---

# OPUS WORK ORDERS (written 2026-10-25)

Method: the builder pastes one prompt per fresh Opus chat. Each task targets roughly 10% of a weekly $20/mo plan (a guess; calibrate after task 1 by reading Settings > Usage). Each has a hard stop. After each task, update START_HERE.md and stop for the builder's yes.

Order: Task 0 (Sonnet, small) -> Task 1 (Opus, look test) -> builder picks a look -> Task 2 (Opus, terrain engine) -> Task 3 (Opus, battle swoop and effects). Prompts for tasks 2 and 3 are written after task 1, using what it teaches.

## Task 0 (Sonnet, small): real terrain data for the Hof Gap
Goal: try to fetch free elevation (public domain) and OpenStreetMap features for a box around Hof, Bavaria, shrink them to a small file in the repo under /data. If the workspace cannot reach the data, give the builder click-by-click steps to download one small file and attach it. Log sources in ASSET_CREDITS.md (OpenStreetMap needs credit).

## Task 1 (Opus, ~10%): look test, three versions on one page
Full prompt is given to the builder in chat; it is reproduced in docs below if needed.
