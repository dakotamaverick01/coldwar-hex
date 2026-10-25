# H1: Hex math module with tests (Haiku, about 1-2% of a week)

## Goal
Write tools/hex.js: the hex grid maths for the game board, matching EXACTLY the hex grid the map already draws. Phase B (units that move hex to hex) will import it.

## Context you need (all of it is here)
- Repo: dakotamaverick01/coldwar-hex. Plain JavaScript ES modules, no build tools. Node 20+ is available.
- World units: 1 unit = 12.5 m. Ground is the x/z plane, y is up.
- Hexes are POINTY-TOP (flat sides face left and right, points face +z and -z).
- Hex size: centre-to-centre distance is 10 units (HEX_W = 10). Row spacing is 10 * 0.8660254 = 8.660254 units.
- Hex centres: row r sits at z = r * 8.660254. Even rows (r = ..., -2, 0, 2, ...) have centres at x = c * 10. Odd rows have centres at x = (c + 0.5) * 10. r and c are integers and can be negative.
- The map's shader finds the hex of a point like this (GLSL, uv = worldXZ / 10, mod(a,b) = a - b*floor(a/b)):
    r = (1, 1.7320508); h = r * 0.5
    a = mod(uv, r) - h
    b = mod(uv - h, r) - h
    gv = (dot(a,a) < dot(b,b)) ? a : b
    centre_uv = uv - gv        (multiply by 10 for world units)
  Your pointToHex MUST give the same centre as this for every point.
- The board is the rectangle |x| < 100 and |z| < 121.24. A hex is ON THE BOARD if its centre is strictly inside that rectangle. There are exactly 527 board hexes: rows -13 to 13 (27 rows); even rows have 19 hexes (c = -9..9), odd rows have 20 (c = -10..9, centres x = -95..95).

## What to write
tools/hex.js exporting:
- HEX_W = 10, ROW_DZ = 8.660254
- hexCenter(r, c) -> { x, z }
- pointToHex(x, z) -> { r, c }   (use the shader method above, then convert the centre to r, c: r = Math.round(z / ROW_DZ), c = Math.round(x / 10 - (odd r ? 0.5 : 0)); odd means Math.abs(r) % 2 === 1)
- hexKey(r, c) -> string "r,c"
- neighbors(r, c) -> array of 6 { r, c }: the six hexes whose centres are exactly 10 units away (left, right, and two above, two below). Work them out from the centres; do not hard-code a table without testing it.
- hexDistance(a, b) -> number of steps between two hexes (convert offset coordinates to cube or axial coordinates; pointy-top, "odd rows shifted right by half a hex").
- onBoard(r, c) -> boolean (centre strictly inside |x| < 100, |z| < 121.24)
- boardHexes() -> array of all { r, c, x, z } on the board (must be 527)
- hexRing(r, c, n) and hexesWithin(r, c, n) (all hexes at distance <= n, including the centre)
- line(a, b) -> array of hexes on the straight line from a to b inclusive (standard hex line drawing with cube lerp and rounding, nudge by 1e-6 to avoid ties). This will be used for line of sight.

tools/hex.test.mjs: a plain Node script (no test library) that prints PASS/FAIL per check and exits with code 1 if anything fails. Checks:
1. boardHexes().length === 527, rows -13..13, row 0 has 19 hexes, row 1 has 20.
2. For 20,000 random points with x, z in [-130, 130]: pointToHex matches the shader method (implement the shader method separately inside the test with the exact formula above) and the point is no further than 5.7736 units (10/sqrt(3)) from the returned centre.
3. Every hex's 6 neighbors are at centre distance 10 (within 1e-6) and hexDistance to each is 1; neighbors are symmetric (if B is a neighbor of A then A is a neighbor of B).
4. hexDistance equals the length of the line(a, b) minus 1 for 2,000 random pairs of board hexes; hexDistance is symmetric; hexesWithin(r, c, 2).length === 19.
5. pointToHex(hexCenter(r, c)) returns (r, c) for every board hex.

## Steps
1. git checkout -b handoff/h1-hex-math (from main)
2. Write the two files. Run: node tools/hex.test.mjs  until every line is PASS.
3. Do not touch any other file.
4. git add the two files, commit with a clear message, git push -u origin handoff/h1-hex-math
5. Report: how many checks passed, the branch name, and "Check: open the branch on GitHub and look at tools/hex.test.mjs output in my report".
