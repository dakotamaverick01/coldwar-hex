# START_HERE: Autumn Forge (Cold War hex strategy game)

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
- Systems in: cover and suppression, garrisoned buildings that take damage, ambush bonus (overwatch removed, see v3), fog of war, hit chance shown before you commit. (2026-10-25)
- Systems out: capture points and resource economy, mid-battle call-ins (beyond a few off-map strikes), escalation/nuclear mechanic. (2026-10-25)
- Missions: varied goals with delay at the heart (hold the bridge, ambush, escape, rescue). 20-30 minutes, 10-15 turns each. (2026-10-25)
- Campaign: one company across 6-8 linked missions in the first 72 hours; named squads, veterancy and losses carry over. (2026-10-25)
- Tone: grounded tension. Quiet beauty broken by violence. (2026-10-25)
- Living screen, three layers: (1) units always show their state (turret scanning, crew in hatch, dug-in, overwatch lock, hunkered, suppressed flinching, garrison muzzles in windows); (2) every action plays out live (bounding moves, dust, tracers, casualties, camera swoops); (3) a cosmetic background war that ignores turns (horizon artillery, jets, flares, burning wrecks, dust from unseen enemies). Layer 1 is built first. (2026-10-25)
- Enemy turn: you watch it, camera follows, overwatch shots in slow motion, fast-forward button. (2026-10-25)
- Soldiers: built in Blender from the start as our own work, period-correct (US 1985 woodland uniform and PASGT helmet; Soviet khaki and steel helmet). Free CC0 animations may be borrowed if the skeleton matches, each logged. Needs the builder's computer on with Blender connected. Far away, cheap stand-in images. Vehicles: rigid-part models (code or Blender). (2026-10-25)

## GAME DESIGN v3 LOCKED (2026-10-25, from the Gemini decision record + builder answers; detail in PLAN.md "DESIGN v3")
- REOPENED AND REPLACED: overwatch is deleted. Instead an AMBUSH BONUS: a unit that is hidden (hunkered/dug in/in cover) and not moved gets a first-shot accuracy bonus when an enemy walks into its sight. Same idea, no reaction-fire rules. (2026-10-25)
- Roster, mission 1 (11 units): 1 command vehicle (M113/M577), 1 M1 + 2 M60A3, 3 M3 Bradley scout vehicles, 2 M901 ITV, 1 engineer squad in an M113. Off-map mortars: 4 fire missions (HE or smoke, 1-turn delay). Bradleys drop 2-3 man scout teams (scout team size to verify). (2026-10-25)
- Board size: BIGGER EVERYWHERE, about 32 x 40 hexes (4 x 5 km) instead of 20 x 27. Tanks must feel fast. (2026-10-25)
- Movement (hexes per action point): fast vehicles (M1, Bradley, BMP, T-80) 3 off road / 5 on road; slower vehicles (M60, ITV, M113, BRDM-2) 2 off road / 4 on road; infantry 1; woods and villages cost 1 hex per point for everyone; dash doubles. Numbers are a starting table, tuned by play. (2026-10-25)
- Turn = about 3 minutes of battle; 12 turns = about 35 minutes; clock ticks 3 min per turn; mortar delay 1 turn. (2026-10-25)
- Building hit points: house 4, barn/stable 5, church 8; at 0 they become rubble (light cover), occupants take no collapse damage. Names: "half-timbered house", not "stone farmhouse". (2026-10-25)
- Campaign: a straight line of about 6 missions first; supply points are earned in a mission and spent ONLY between missions; branching routes later. (2026-10-25)
- Enemy tank types: Claude verifies the history, then proposes waves for the builder's OK (see HISTORY CHECK). (2026-10-25)
- Adopted from the Gemini record (proposals, tunable): 2 AP per unit; flat armour reduction; 3 HP vehicles, 6-man squads; soft vs anti-armour firepower; sight 8 hexes (scouts 12) scaled to the bigger map later; gun/TOW range 16, autocannon/MG 8, small arms 3; cover +0/+1/+2; hit chance shown as a percent; suppression pinned at 50%, broken at 100%; vehicle statuses (immobilised, turret jammed); command aura 5 hexes +10% accuracy; leader-loss penalties; engineers wire a bridge (1 AP a turn, 4 turns) then blow it; smoke 3x3 for 2 turns; hull-down +1; slow-turtle enemy recon; red smoke one turn before enemy artillery; 3-tier grade Decisive/Tactical/Marginal. (2026-10-25)

## HISTORY CHECK (2026-10-25, status: PARTLY VERIFIED)
- Confirmed (Wikipedia): 2nd Cavalry Regiment was in West Germany 1958-1991 with bases at Nuremberg, Feucht, Bindlach, Amberg, Bamberg; border mission ended 1 March 1990. M3 Bradley carries a crew of 3 plus a 2-man scout team; first Bradleys fielded March 1983 (to the 2nd Armored Division). GSFG 1987: 1st Guards Tank Army at Dresden (4 tank, 1 motor-rifle division), 8th Guards Army at Weimar-Nohra (1 tank, 3 motor-rifle divisions); majority of GSFG tanks T-72 (about 1987).
- NOT confirmed (web sources thin): exact 2nd ACR M1/M3 fielding dates (my memory: M1 and M3 reached 2nd ACR in the second half of the 1980s, so a late-1985 mix with M60A3 and M113 is plausible but unproven); which Soviet army would hit Hof (1st Guards Tank Army from Dresden is the best guess); whether T-64/T-80 or T-72 would lead there; TOW minimum range (real TOW needs roughly 65 m; game: no shot inside 1 hex); callsign conventions.
- Game rule until proven wrong: label enemy tank types as "T-64A / T-72A / T-80" mix, keep the player mix as stated, and mark every claim in any public page as "approximate".

## SUPERSEDED (kept for history)
- "Dawn at the Narrows", ancient era, one-battle diorama (2026-10-24). Dropped 2026-10-25.
- Battalion-level operational scale (Panzer General style, 1 km hexes, battalion = 3-5 models) and design v1. Replaced 2026-10-25 by company scale.
- Misty cold dawn as the fixed mood; low cinematic default camera; "stylized high-end miniature" land. All replaced 2026-10-25 after the look test and the Field of Command reference.

- LOCKED 2026-10-25: Map data decision. The public OpenStreetMap servers failed twice from the builder's phone (busy, 502). We build Task 2 on the real elevation data only. River, roads, bridge and buildings are labelled stand-ins placed by hand from the terrain. Real OSM data (osm-fetch.html, or an overpass-turbo.eu export from a laptop, or a retry when Europe is asleep) can be swapped in later without redoing the map. Reopen only if the stand-ins block the game.

- LOCKED 2026-10-25: Cavalry troop equipment is a historical mix of older and newer vehicles (for example M60 and M113 alongside some M1 and Bradley). A wide range of unit types is a hallmark of the game. Exact roster is set when units are built.

- LOCKED 2026-10-25: Game name is **Autumn Forge**. It covers the whole series; each battle is a subtitle (first: Hof Gap). Named after the real NATO exercise series, public history, not a clone of any game. Public pages say "not affiliated with NATO" and never mention the builder's profession. Page copy drafted in store/itch_page_autumn_forge.md. Still to check by hand: type "Autumn Forge" into itch.io search before publishing.

## NOT YET (undecided)
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

## BRIDGE MAP (Task 2, built 2026-10-25 by Sonnet)
- Page: /mission-bridge.html. Real Hof elevation (a rotated 3 x 3.5 km crop of data/hof_heights.bin around a Saale reach near Hof), river line traced from the elevation by code, in look D. Board = 20 x 28 hexes (hex = 10 units = 125 m; 1 unit = 12.5 m). Grid button toggles the hexes; touch the land to light them.
- World frame: +x runs upstream along the river, +z is your bank (WSW), -z is the enemy side. No mirror. River crosses the middle; the bridge is at x = 0.
- STAND-INS (labelled on screen, swap later): the bridge and the roads. (Village and farm are now built by the buildings kit.) Trees and fields are made by code from slope and height, not real land use. Vertical scale is stretched 1.4x so hills read from a tabletop camera.
- Rebuild: tools/make_bridge_map.py makes data/bridge_heights.bin + data/bridge_map.json. mission-bridge.html is assembled by tools/assemble_bridge_page.py from look-test.html pieces plus tools/build_bridge_page_*.js (edit those, then run the script from the repo root). Do not hand-edit mission-bridge.html.
- Tested in a software browser only (about 550k triangles at overview, 60-80 draw calls). iPhone fps not yet confirmed. Real OpenStreetMap roads, bridge and buildings can replace the stand-ins later.
- LOOK PASS 1 (Opus, 2026-10-25), all procedural, no image files, built to carry over to every map:
  - tools/world_look_ground.glsl: the shared ground shader. Farmland parcels (24 units) each with their own direction, cut into long strip fields of varied width/length with grass margins and wider lanes; some parcels are whole meadows. Grass streaks and dry tufts up close; dark mottled forest floor; dirt roads with ruts and a dry verge; macro colour drift. Inputs any map provides: vertex colour, aKind (x open grass, y farmland, z forest), uRoadTex (distance to roads).
  - Terrain vertex pass: baked ambient occlusion (hollows darker, crests lighter); farmland wherever ground is open and gentle; duller olive meadow colours.
  - Water: richer deep colour, sky sheen from above, shallow green-brown edge, foam flecks at the banks.
  - Drifting cloud shadows on everything (uCloud, 0.22); chimney smoke from 8 houses; fruit-tree rows along stretches of road; denser forests (about 17k trees).
  - Hex grid: thin light line with a soft dark halo, fades when zoomed far out. Fog stays clear within 90 units of the camera, hazes beyond.
  - Measured at overview (phone size): contrast 0.39 -> 0.45, saturation 0.16 -> 0.19, mean brightness 0.63 -> 0.51 (less washed out). About 590k triangles, 86 draw calls at overview (the previous version ran 60 fps at 550k / 77).
  - Backup branch before this pass: backup/before-map-look-pass.
- DETAILED TREES (Opus, 2026-10-25): close trees swap to detailed shapes made with EZ-Tree (MIT, copied to tools/ez-tree, used at build time only: node tools/make_trees.mjs -> data/trees.bin + trees.json, 6 shapes, 2.3k-3.9k triangles each). Leaf and bark textures are drawn in code (tools/world_trees_detail.js); the library's own images are NOT used (leaf images have no stated source). Swap happens within about 14-40 units of the view centre when zoomed in, at most 150 spruce and 105 broadleaf, only trees in view. If frames get slow, the page first cuts detailed trees (readout "trees NN%"), then sharpness.
- TREE SWAP SOFTENED + VILLAGE (Opus, 2026-10-25): trees now cross-fade over 0.7 s with a fine dither (no hard pop), and far trees have layered/fuller shapes. The stand-in boxes are replaced by a code-made Franconian village kit (tools/world_buildings.js, shared by every map): courtyard farms laid out along the roads (half-timbered farmhouse gable-on to the road, plank barn with gate, stone stable, woodpile, manure heap, henhouse, outhouse), orchards behind the farms, a church with a slate spire, and one farm on the enemy bank. Timber frames, windows, shutters, doors, tiles, planks and stone are painted by one building shader; all buildings are one mesh. About 23 buildings groups. Overview now about 830k triangles (phone was 60 fps at 1M+ zoomed in).
- PERFORMANCE PASS (Opus, 2026-10-25): builder saw about 35 fps zoomed in. Changes: detailed trees no longer draw their own shadows (the simple tree's solid shadow stays), the land no longer shadows itself, slightly fewer detailed trees, and the speed control now aims for 55+ fps (fewer detailed trees first, then sharpness down to 1.25x; steps back up after 20 s of steady 60). Measured on the same views: village view 1.19M -> 0.89M triangles drawn per frame.
- HANDOFF TASKS (2026-10-25): handoff/ holds self-contained jobs for a cheaper AI: H1 hex maths + tests, H2 terrain table per hex, H3 housekeeping (Haiku, in Claude Code), and ART_PROMPTS.md (Grok/Gemini, art only). Each works on its own branch; Claude reviews and merges. The map page now also exposes forestAmount, roadDistAt, riverDist, slopeAt, waterY, nearLot on window.__lt for H2.
- NOT DONE here: units, action points, enemy, fog of war (Phase B onward in PLAN.md); sound; textures polish; Opus look pass is the next step.

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
