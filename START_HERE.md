# START_HERE: Cold War hex strategy game (working title TBD)

Read this first every chat. It is the current state and overrides older docs (including claude/working-agreement.md where they disagree).

## LOCKED (decided 2026-10-25)
- Setting: late Cold War, hypothetical 1985 Central Front in West Germany. NATO vs Warsaw Pact. (2026-10-25)
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
- Units on the map: a squad is 4-6 soldier models; vehicles are single models. (2026-10-25)
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

## GAME DESIGN LOCKED (2026-10-25, full design in PLAN.md "GAME DESIGN v2")
- Scale: company level, turn-based "Company of Heroes" feel. You command one NATO company of 10-15 units (squads and single vehicles). Hexes about 100-150 m. Mission maps 2-3 km, real Hof Gap spots. (2026-10-25, replaces battalion scale)
- Player side: NATO first. Enemy outnumbers you 2-3 to 1 and arrives in waves. (2026-10-25)
- Turns: you move all units, then they move. Each unit has 2 action points (move, shoot, dash, hunker down, overwatch, enter building). (2026-10-25)
- Systems in: cover and suppression, garrisoned buildings that take damage, overwatch (reaction fire), fog of war, hit chance shown before you commit. (2026-10-25)
- Systems out: capture points and resource economy, mid-battle call-ins (beyond a few off-map strikes), escalation/nuclear mechanic. (2026-10-25)
- Missions: varied goals with delay at the heart (hold the bridge, ambush, escape, rescue). 20-30 minutes, 10-15 turns each. (2026-10-25)
- Campaign: one company across 6-8 linked missions in the first 72 hours; named squads, veterancy and losses carry over. (2026-10-25)
- Tone: grounded tension. Quiet beauty broken by violence. (2026-10-25)
- Living screen, three layers: (1) units always show their state (turret scanning, crew in hatch, dug-in, overwatch lock, hunkered, suppressed flinching, garrison muzzles in windows); (2) every action plays out live (bounding moves, dust, tracers, casualties, camera swoops); (3) a cosmetic background war that ignores turns (horizon artillery, jets, flares, burning wrecks, dust from unseen enemies). Layer 1 is built first. (2026-10-25)
- Enemy turn: you watch it, camera follows, overwatch shots in slow motion, fast-forward button. (2026-10-25)
- Soldiers: built in Blender from the start as our own work, period-correct (US 1985 woodland uniform and PASGT helmet; Soviet khaki and steel helmet). Free CC0 animations may be borrowed if the skeleton matches, each logged. Needs the builder's computer on with Blender connected. Far away, cheap stand-in images. Vehicles: rigid-part models (code or Blender). (2026-10-25)

## SUPERSEDED (kept for history)
- "Dawn at the Narrows", ancient era, one-battle diorama (2026-10-24). Dropped 2026-10-25.
- Battalion-level operational scale (Panzer General style, 1 km hexes, battalion = 3-5 models) and design v1. Replaced 2026-10-25 by company scale.
- Misty cold dawn as the fixed mood; low cinematic default camera; "stylized high-end miniature" land. All replaced 2026-10-25 after the look test and the Field of Command reference.

## NOT YET (undecided)
- Game name (must be original).
- Tech stack (proposal: Three.js, a free 3D library for web pages; hosted free on GitHub Pages).
- Vehicle models: decide when we reach them. Default plan is simple stylized vehicles built in code, CC0 packs for scenery.
- Exact unit roster and numbers (draft in PLAN.md; historical units in the Hof Gap sector still to be verified), enemy AI details, supply.
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
1. DONE: builder checked look D on his iPhone: steady 59-60 fps, "looks stunning"; wants real textures and shaders later. Performance headroom confirmed.
2. Task 0 (Sonnet) PART 1 DONE 2026-10-25: real Hof Gap elevation saved in /data, check page built. PART 2: the first phone download page failed on both servers (cause unknown; probably the single huge 15 x 15 km request with all buildings). REBUILT 2026-10-25 (Sonnet): /osm-fetch.html now has a Step 0 server test, downloads file 1 in 9 small tiles with automatic retries across 4 servers, plain-English errors, and builds the buildings file only for a 3 km square around the chosen bridge. Tested against a pretend server only; not yet tried by the builder on the real servers. Laptop fallback if it still fails: overpass-turbo.eu export. WAITING ON THE BUILDER: the OpenStreetMap server is blocked in the workspace, so the builder saves two small files from his iPhone with osm-fetch.html and attaches them in chat (steps in the last report). Then Claude shrinks them (file 1 first; buildings only after the bridge location is picked) into data/hof_features.json, adds them to data-check.html, and finishes Task 0.
3. Then Task 2: one 2-3 km mission map (the bridge) on real terrain in look D with small hexes (reuse the ground shader and props code from look-test.html). Then units with 2 action points.

## DATA (Task 0, 2026-10-25; box not yet confirmed by the builder)
- Box (about 15 x 15 km, centre 50.3325 N, 11.8955 E): south 50.26505, north 50.39995, west 11.78984, east 12.00116. Hof (50.317 N, 11.917 E) is inside, lower right of centre; the Saale valley runs from the lower right to the upper left.
- Local map units: metres east (x) and north (y) of the centre, box is -7500 to +7500 in both. Exact formulas are in data/hof_heights.json.
- Elevation: data/hof_heights.bin (720 KB) and hof_heights.json. 600 x 600 samples, 25 m apart, 449 to 671 m, read with height = base + value * 0.1. Made by tools/make_heights.py from AWS Terrain Tiles (EU-DEM / SRTM). Source resolution is about 24 m, so 25 m is the finest this free source gives.
- Map features: NOT yet in the repo (server blocked in the workspace). Plan: file data/hof_features.json, format {lines:[{t,p,b?}], areas:[{t,p}], buildings:[[[x,y]...]]} in local metres; t is river, stream, road, track, rail, hedge or wall for lines and forest, water or village for areas; b=1 marks a bridge. data-check.html already draws this format.
- Check page: /data-check.html. Phone download page: /osm-fetch.html. Both are read-only helpers; no game code touched.

## HANDOFF (any AI can pick up from here)
- Project: turn-based 3D hex tactics game (company level, Company of Heroes feel), 1985 West Germany, phone-first, web (Three.js).
- Current phase: Phase 1 step 1 DONE (iPhone link confirmed 2026-10-25). Look test (Task 1) BUILT 2026-10-25 at look-test.html; look direction now decided (clear morning, Field of Command reference). Task 1b (look D) DONE 2026-10-25. Next: builder's iPhone check, then Task 0. The backup branch "backup/before-look-test" holds the state before it.
- Builder has never used GitHub or a terminal. Describe only what to click or look at; never say commit, push, branch, repo, or terminal without a plain-language definition first.
- Rules: plain English, define jargon, small playable steps, stop after each phase for a yes, one-line self-check with every change, original names, CC0/own assets only logged in ASSET_CREDITS.md, no mention of the builder's profession anywhere public.
- Next 3 tasks: (1) DONE: iPhone check of look D (59-60 fps), (2) Task 0: elevation DONE; the OpenStreetMap part waits for the builder's two phone-saved files (hof_osm_map.json, hof_osm_buildings.json) from /osm-fetch.html. Then simplify them into data/hof_features.json (target under 2 MB), update the pending row in ASSET_CREDITS.md, add them to data-check.html and compare with a real map. (3) Task 2: the bridge mission map in look D. Then units with 2 action points (Phase B in PLAN.md).
- Workspace network: s3.amazonaws.com (elevation tiles) works; overpass-api.de is blocked (connection closed by the proxy). Do not try other routes around a block.
- Testing tip: look-test.html has a test hook (window.__lt: snapLook, showHexAt, pause) and "?pr=2" in the address locks the resolution for screenshots.

## Housekeeping
- Living docs max three: START_HERE.md, ASSET_CREDITS.md (create at first asset), one plan.
- claude/working-agreement.md is a draft from CWG3; archive once its useful rules are folded in.
