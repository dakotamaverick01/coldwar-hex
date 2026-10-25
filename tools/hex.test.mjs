import { HEX_W, ROW_DZ, BOARD, hexCenter, pointToHex, neighbors, hexDistance, onBoard, boardHexes, hexRing, hexesWithin, line } from './hex.js';
let fails = 0; const ok = (n, c, extra = '') => { console.log((c ? 'PASS ' : 'FAIL ') + n + (c ? '' : ' ' + extra)); if (!c) fails++; };
const hexes = boardHexes();
const rows = new Set(hexes.map(h => h.r));
ok('board has 41 rows -20..20', rows.size === 41 && Math.min(...rows) === -20 && Math.max(...rows) === 20);
ok('row 0 has 31 hexes, row 1 has 32', hexes.filter(h => h.r === 0).length === 31 && hexes.filter(h => h.r === 1).length === 32);
ok('hex count 1291', hexes.length === 1291, hexes.length);
// shader method, written separately
const m = (a, b) => a - b * Math.floor(a / b);
function shader(x, z) {
  const u = x / 10, v = z / 10;
  const ax = m(u, 1) - .5, az = m(v, 1.7320508) - .8660254, bx = m(u - .5, 1) - .5, bz = m(v - .8660254, 1.7320508) - .8660254;
  const A = ax * ax + az * az < bx * bx + bz * bz;
  return { x: (u - (A ? ax : bx)) * 10, z: (v - (A ? az : bz)) * 10 };
}
let bad = 0, far = 0;
for (let i = 0; i < 20000; i++) {
  const x = (Math.random() * 2 - 1) * 200, z = (Math.random() * 2 - 1) * 200;
  const h = pointToHex(x, z), c = hexCenter(h.r, h.c), s = shader(x, z);
  if (Math.hypot(c.x - s.x, c.z - s.z) > 1e-6) bad++;
  if (Math.hypot(x - c.x, z - c.z) > 5.7736 + 1e-6) far++;
}
ok('pointToHex matches shader (20000 points)', bad === 0, bad); ok('points within 5.7736 of centre', far === 0, far);
let nb = 0, sym = 0;
for (const h of hexes) for (const n of neighbors(h.r, h.c)) {
  const a = hexCenter(h.r, h.c), b = hexCenter(n.r, n.c);
  if (Math.abs(Math.hypot(a.x - b.x, a.z - b.z) - 10) > 1e-6 || hexDistance(h, n) !== 1) nb++;
  if (!neighbors(n.r, n.c).some(k => k.r === h.r && k.c === h.c)) sym++;
}
ok('neighbours at 10 units, distance 1', nb === 0, nb); ok('neighbours symmetric', sym === 0, sym);
let ld = 0, dsym = 0;
for (let i = 0; i < 2000; i++) {
  const a = hexes[Math.floor(Math.random() * hexes.length)], b = hexes[Math.floor(Math.random() * hexes.length)];
  if (line(a, b).length - 1 !== hexDistance(a, b)) ld++;
  if (hexDistance(a, b) !== hexDistance(b, a)) dsym++;
}
ok('line length = distance + 1', ld === 0, ld); ok('distance symmetric', dsym === 0, dsym);
ok('hexesWithin 2 = 19', hexesWithin(0, 0, 2).length === 19 && hexesWithin(3, -2, 2).length === 19);
ok('hexRing 3 = 18', hexRing(1, 1, 3).length === 18);
let rt = 0; for (const h of hexes) { const p = pointToHex(h.x, h.z); if (p.r !== h.r || p.c !== h.c) rt++; }
ok('centre round trip', rt === 0, rt);
process.exit(fails ? 1 : 0);
