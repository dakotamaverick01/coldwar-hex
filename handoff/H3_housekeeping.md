# H3: Housekeeping and records (Haiku, about 1% of a week)

## Goal
Keep the project tidy by the builder's rules: at most three living docs (START_HERE.md, ASSET_CREDITS.md, PLAN.md), every outside asset logged, START_HERE.md current.

## Steps
1. git checkout -b handoff/h3-housekeeping (from main)
2. List every Markdown file in the repo. Living docs are START_HERE.md, ASSET_CREDITS.md, PLAN.md. Keep README.md (GitHub front page), tools/ez-tree/* (licence files), handoff/* and store/* (itch.io page draft) where they are. Move any OTHER Markdown file into archive/ (create it) with git mv, and list what you moved.
3. Asset audit: list every file in vendor/, data/ and tools/ez-tree/. For each, check that ASSET_CREDITS.md has a row covering it (generated data made by our own scripts counts as covered if its source data is logged). Add any missing row with source and licence if you can find it in the repo; if you cannot, add the row with "SOURCE UNKNOWN - builder to check" and list it in your report. Do not delete anything.
4. In START_HERE.md, only under the "## NEXT" section: make the list match reality. Done: look D, Task 0 elevation, Task 2 bridge map, look pass, detailed trees, village kit, performance pass (see the BRIDGE MAP section). Next: Phase B units (select and move with 2 action points, line of sight, end turn), using tools/hex.js and data/bridge_hexes.json from H1/H2 when merged. Parked: roads and fences (part C), crops and animals (part D), Blender soldier test, OpenStreetMap data. Do not change anything marked LOCKED or SUPERSEDED.
5. Check that https://dakotamaverick01.github.io/coldwar-hex/ index.html links to mission-bridge.html; if not, add one plain link line to index.html ("Bridge mission map (test)").
6. Commit, push with -u origin handoff/h3-housekeeping, report what moved, what was missing from credits, and "Check: read START_HERE.md on the branch".
