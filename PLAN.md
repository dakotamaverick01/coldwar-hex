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
