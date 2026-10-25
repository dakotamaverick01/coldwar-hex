# START_HERE: Cold War hex strategy game (working title TBD)

Read this first every chat. It is the current state and overrides older docs (including claude/working-agreement.md where they disagree).

## LOCKED (decided 2026-10-25)
- Setting: late Cold War, hypothetical 1985 Central Front in West Germany. NATO vs Warsaw Pact. (2026-10-25)
- Scale: operational level. Hex map, units are battalions, Panzer General style. (2026-10-25)
- Play style: turn-based, solo vs computer opponent. (2026-10-25)
- Look: real 3D hex terrain with elevation, not a flat painted map. Beauty comes mainly from lighting, fog, shadows, colour grading and terrain depth. (2026-10-25)
- iPhone first: it must be playable and testable on the builder's iPhone from anywhere, via a private web link set up before features are built. This is the main lesson from CWG3. (2026-10-25)
- Must be postable on itch.io: only own work, CC0 or open-licensed assets, each logged in ASSET_CREDITS.md with source and licence. (2026-10-25)
- iPhone link works (confirmed by builder 2026-10-25): https://dakotamaverick01.github.io/coldwar-hex/ (GitHub Pages, auto-updates on every push to main). (2026-10-25)
- First map: a real region, the Hof Gap in northeast Bavaria (secondary approach, low pressure to be perfect). No more invented places. Real terrain from public-domain elevation data; rivers, forests and towns from OpenStreetMap (credit required, log in ASSET_CREDITS.md). Facts about the region to be verified before locking details. (2026-10-25)
- WORLD LOOK (decided 2026-10-25): a living, immersive 3D map, NOT a painted map. Terrain is one continuous landscape; the hex grid is hidden and fades in softly only when needed (near the finger or a selected unit). (2026-10-25)
- Camera: default high angle, about 50 degrees looking down, close to a tabletop view; swoops down low for action moments. (2026-10-25, after look test)
- Mood: clear, bright autumn morning by default, crisp soft-edged shadows, light haze only far away. Misty dawn comes back later as an occasional weather option. Day/night cycle stays LOW priority. (2026-10-25, after look test)
- Visual reference: Field of Command (an indie WWII game), from builder's screenshots. Reference only: we copy nothing (no assets, names or layouts), and the screenshots are NOT stored in the public repo. What we take from it: high camera, clear light, sandy textured ground, dense small props, clean realistic-leaning models, puffy smoke. (2026-10-25)
- Units on the map: each battalion is shown as 3 to 5 small models (for example 3 tanks), so the map reads up close while rules stay battalion-level. (2026-10-25)
- First wow for the next build: textured ground and props (fences, telegraph poles, railway, hedgerows, grass tufts, tracks, rocks). (2026-10-25)
- Smoke style: big puffy "cotton ball" clouds (cheap on phones, very readable). (2026-10-25)
- Wow factor is the goal. Motion wanted: moving units with dust, tracers and explosions; wind in trees, flowing river, village smoke; ambient life (birds, traffic, sound). Pick a few hero effects per phone budget instead of everything at once. (2026-10-25)
- Sound and music come LAST in this project. Hard rule from the builder. (2026-10-25)
- Hero effects: battle swoop (dust, tracers, puffy smoke), wind in trees, flowing river. (2026-10-25)
- Land style: clean, realistic-leaning diorama: textured ground, lots of small props, readable models. (2026-10-25, replaces "stylized high-end miniature")
- Vehicles: detailed, realistic-leaning models; this now matches the land, so the style clash is settled. Licence rule stands: built in code, or CC0/CC-BY models, each checked and logged. (2026-10-25)
- Before building the map, do a short "look test": 2-3 versions of the same terrain patch on the iPhone link so the builder reacts to pictures. (2026-10-25)
- Source of truth: a GitHub repo. Keep a handoff note in the repo so work can continue if usage runs out. (2026-10-25)
- Budget: steady over a few weeks, about 90% of weekly usage, the rest kept for his job. Haiku for filing and git, Sonnet for building, Opus for look and rules. Tell him before switching. (2026-10-25)
- Public material never mentions the builder's profession. (2026-10-25)
- Other AIs (Grok, Gemini): allowed for art prompts, image generation and overflow brainstorming when Claude usage is low. They do not make decisions; their output goes into the repo and gets reviewed by Claude. Prompts for them must be self-contained and copy-paste ready. This relaxes the old "art only" rule. (2026-10-25)
- Structure: repo is the single source of truth (START_HERE.md, HANDOFF.md, one plan). Haiku acts as chief of staff (status, tasks, decision log, git, work orders). Sonnet builds. Opus only for look and rules calls. (2026-10-25)

## SUPERSEDED (kept for history)
- "Dawn at the Narrows", ancient era, one-battle diorama (2026-10-24). Dropped 2026-10-25.
- Misty cold dawn as the fixed mood; low cinematic default camera; "stylized high-end miniature" land. All replaced 2026-10-25 after the look test and the Field of Command reference.

## NOT YET (undecided)
- Game name (must be original).
- Tech stack (proposal: Three.js, a free 3D library for web pages; hosted free on GitHub Pages).
- Vehicle models: decide when we reach them. Default plan is simple stylized vehicles built in code, CC0 packs for scenery.
- Unit roster, rules, enemy AI, supply, escalation mechanic.
- Camera style and cinematic moments.
- Art palette and mood board.
- CWG3 files: not found here. Builder may drop in a zip or repo link for review.

## LOOK TEST (Task 1, built 2026-10-25)
Result: none of A, B, C chosen; builder pointed to the Field of Command reference instead (see LOCKED). A, B, C stay on the page for comparison.
Task 1b DONE 2026-10-25 (built by Opus in the same chat): look D "Clear morning" is now the first look on the page. Adds: high tabletop camera (35 degree lens), clear light, ground detail drawn per pixel in every look (sandy and grass patches, crop rows, dirt roads with wheel ruts, railway ballast), a railway with sleepers and rails, telegraph poles with sagging wires, a stone arch bridge on a side road, fences and hedgerows on field edges, about 16,000 grass tufts (hidden when zoomed far out), rocks, anti-tank obstacles by the bridge, rounder broadleaf trees, houses with chimneys, placeholder tanks in two groups of 3.
Measured (software browser): about 720,000 triangles and 82 draw calls per frame including shadows. Over the 600k/60 target; the automatic resolution drop covers it for now. First trims if the iPhone struggles: fewer spruces, no tree shadows when zoomed far out.
- Page: https://dakotamaverick01.github.io/coldwar-hex/look-test.html (index.html untouched).
- One code-made stand-in valley shaped like the Hof Gap (forested ridges, river, fields, village with church), about 9,500 trees.
- Three switchable looks: A Misty dawn, B Tilt-shift miniature, C Painterly glow. All share wind in the trees, flowing river, chimney smoke, drifting valley mist, a hex grid that fades in around the finger, two labelled placeholder tank shapes.
- Camera: drag to turn, pinch to zoom (camera swoops lower as it zooms in), two fingers to slide, Overview / Low view buttons.
- Phone safety: resolution drops automatically if frames get slow; a small fps readout shows top right.
- Tested only in a software (no graphics chip) browser at iPhone size; real iPhone smoothness still unconfirmed. Builder checks the fps readout on his phone.
- No new outside assets (all shapes, textures and effects are made by code).

## NEXT
1. Builder opens look-test.html on his iPhone (look D opens first) and reports the fps number and what to change.
2. Then Task 0 (Sonnet, small): real Hof Gap elevation and OpenStreetMap data.
3. Then Task 2: real terrain engine in look D (reuse the ground shader and props code from look-test.html).

## HANDOFF (any AI can pick up from here)
- Project: turn-based 3D hex wargame, 1985 West Germany, phone-first, web (Three.js).
- Current phase: Phase 1 step 1 DONE (iPhone link confirmed 2026-10-25). Look test (Task 1) BUILT 2026-10-25 at look-test.html; look direction now decided (clear morning, Field of Command reference). Task 1b (look D) DONE 2026-10-25. Next: builder's iPhone check, then Task 0. The backup branch "backup/before-look-test" holds the state before it.
- Builder has never used GitHub or a terminal. Describe only what to click or look at; never say commit, push, branch, repo, or terminal without a plain-language definition first.
- Rules: plain English, define jargon, small playable steps, stop after each phase for a yes, one-line self-check with every change, original names, CC0/own assets only logged in ASSET_CREDITS.md, no mention of the builder's profession anywhere public.
- Next 3 tasks: (1) builder's iPhone check of look D, (2) Task 0: real Hof Gap terrain data (Sonnet; ask builder before starting), (3) Task 2: terrain engine in look D. Then three unit types, select and move.
- Testing tip: look-test.html has a test hook (window.__lt: snapLook, showHexAt, pause) and "?pr=2" in the address locks the resolution for screenshots.

## Housekeeping
- Living docs max three: START_HERE.md, ASSET_CREDITS.md (create at first asset), one plan.
- claude/working-agreement.md is a draft from CWG3; archive once its useful rules are folded in.
