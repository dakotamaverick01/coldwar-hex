# H2: Terrain table for every board hex (Haiku, about 2-3% of a week; needs H1 merged or on its branch)

## Goal
Make data/bridge_hexes.json: one record per board hex (527) describing the ground, so movement costs, cover and line of sight can be looked up quickly later. Also make a small visual check.

## Context
- The map page mission-bridge.html exposes helper functions on window.__lt once it has loaded (wait until window.__lt.stats().frames > 2):
  height(x, z) -> ground height (world units, y up)
  slopeAt(x, z) -> steepness (rise/run)
  forestAmount(x, z) -> 0..1 how wooded
  roadDistAt(x, z) -> distance (units) to the nearest road or track
  riverDist(x, z) -> distance (units) to the river centre line (river is about 1 unit from the centre to each bank)
  nearLot(x, z, pad) -> true if inside a farm or church lot (buildings)
  lots -> array of { x, z, r, kind } where kind is 'farm' or 'church'
  BX, BZ -> the bridge position
- Hex maths: tools/hex.js from task H1 (boardHexes(), pointToHex, HEX_W = 10). If H1 is not on main yet, branch from handoff/h1-hex-math.
- A headless browser is available: in Python, `from playwright.sync_api import sync_playwright`; chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl']) works with no options needed. Serve the repo with `python3 -m http.server 8765` from the repo root (run it in the background) and open http://localhost:8765/mission-bridge.html?pr=1. Software rendering is slow (a few seconds per frame); allow 4 minutes for loading.
- To get board hexes inside the page, copy the needed hex functions into the page.evaluate script as text (or load tools/hex.js with a dynamic import('./tools/hex.js') inside page.evaluate; the server serves it).

## Per hex, sample a 7 x 7 grid of points spaced 1.2 units around the centre, keep only points inside the hex (distance test with pointToHex), and record:
{ "r", "c", "x", "z",
  "hMean", "hMin", "hMax"       (round to 2 decimals),
  "slopeMax"                    (2 decimals),
  "forest"                      (mean forestAmount, 2 decimals),
  "road"                        (true if any sample has roadDistAt < 0.35),
  "river"                       (fraction of samples with riverDist < 1.0, 2 decimals),
  "bridge"                      (true for the hex containing BX, BZ),
  "buildings"                   (number of lots whose centre is inside this hex),
  "church"                      (true if the church lot centre is in this hex),
  "terrain"                     one word: "river" if river >= 0.3 and not bridge, else "village" if buildings > 0, else "forest" if forest >= 0.45, else "steep" if slopeMax >= 0.35, else "road" if road, else "open"
}
File format: { "note": "...how it was made...", "hexW": 10, "count": 527, "hexes": [ ... ] }

## Visual check
Write tools/hex_terrain_check.py that draws the hexes as a 2D picture (matplotlib, pointy-top hexagons at their x, z; z downward on the image), coloured by terrain (river blue, village red, forest dark green, steep brown, road grey, open light green), and saves it to data/bridge_hexes_check.png. It should look like the overview: a river crossing left to right through the middle, the village just south of the bridge, woods on hills.

## Steps
1. git checkout -b handoff/h2-hex-terrain (from main, or from handoff/h1-hex-math if H1 is not merged)
2. Write tools/make_hex_terrain.py (the Playwright script) and tools/hex_terrain_check.py. Run both.
3. Check: count is 527; at least one "river" hex in every column of hexes the river crosses; exactly one bridge hex; at least 10 village hexes; print a summary of terrain counts.
4. Commit data/bridge_hexes.json, data/bridge_hexes_check.png and the two scripts. Push with -u origin handoff/h2-hex-terrain.
5. Report the terrain counts, the branch name, and "Check: open data/bridge_hexes_check.png on the branch in GitHub".
