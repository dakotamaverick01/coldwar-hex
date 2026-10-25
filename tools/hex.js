// Hex grid maths for Autumn Forge. Matches the hex grid the map shader draws.
// Pointy-top hexes. World units: 1 unit = 12.5 m. Ground is the x/z plane.
export const HEX_W = 10;
export const ROW_DZ = 8.660254;
// Board half-extents (a hex is ON the board if its centre is strictly inside).
// 41 rows (-20..20); even rows c=-15..15 (31 hexes), odd rows c=-16..15 (32 hexes).
export const BOARD = { hx: 160, hz: 177 };

const odd = (r) => Math.abs(r) % 2 === 1;
export const hexCenter = (r, c) => ({ x: (c + (odd(r) ? 0.5 : 0)) * HEX_W, z: r * ROW_DZ });
export const hexKey = (r, c) => r + ',' + c;

const mod = (a, b) => a - b * Math.floor(a / b);
// Same method as the shader: two candidate lattices, pick the nearer centre.
export function pointToHex(x, z) {
  const u = x / HEX_W, v = z / HEX_W;
  const rx = 1, rz = 1.7320508, hx = 0.5, hz = 0.8660254;
  const ax = mod(u, rx) - hx, az = mod(v, rz) - hz;
  const bx = mod(u - hx, rx) - hx, bz = mod(v - hz, rz) - hz;
  const useA = ax * ax + az * az < bx * bx + bz * bz;
  const cu = u - (useA ? ax : bx), cv = v - (useA ? az : bz);
  const r = Math.round((cv * HEX_W) / ROW_DZ);
  const c = Math.round(cu - (odd(r) ? 0.5 : 0));
  return { r, c };
}

// offset (odd rows shifted right) <-> cube
function toCube(r, c) { const q = c - (r - (r & 1)) / 2; return { x: q, z: r, y: -q - r }; }
function fromCube(cu) { const r = cu.z; const c = cu.x + (r - (r & 1)) / 2; return { r, c }; }

export function neighbors(r, c) {
  const o = odd(r) ? 1 : 0;
  // odd rows sit half a hex to the right: their upper/lower neighbours are c and c+1; even rows: c-1 and c
  return [
    { r, c: c + 1 }, { r, c: c - 1 },
    { r: r - 1, c: c - 1 + o }, { r: r - 1, c: c + o },
    { r: r + 1, c: c - 1 + o }, { r: r + 1, c: c + o },
  ];
}

export function hexDistance(a, b) {
  const p = toCube(a.r, a.c), q = toCube(b.r, b.c);
  return Math.max(Math.abs(p.x - q.x), Math.abs(p.y - q.y), Math.abs(p.z - q.z));
}

export function onBoard(r, c) {
  const p = hexCenter(r, c);
  return Math.abs(p.x) < BOARD.hx && Math.abs(p.z) < BOARD.hz;
}

export function boardHexes() {
  const out = [];
  const rmax = Math.ceil(BOARD.hz / ROW_DZ) + 1, cmax = Math.ceil(BOARD.hx / HEX_W) + 1;
  for (let r = -rmax; r <= rmax; r++)
    for (let c = -cmax; c <= cmax; c++)
      if (onBoard(r, c)) { const p = hexCenter(r, c); out.push({ r, c, x: p.x, z: p.z }); }
  return out;
}

export function hexesWithin(r, c, n) {
  const out = [], t = toCube(r, c);
  for (let dx = -n; dx <= n; dx++)
    for (let dy = Math.max(-n, -dx - n); dy <= Math.min(n, -dx + n); dy++) {
      const o = fromCube({ x: t.x + dx, y: t.y + dy, z: t.z - dx - dy });
      out.push(o);
    }
  return out;
}

export function hexRing(r, c, n) {
  if (n === 0) return [{ r, c }];
  return hexesWithin(r, c, n).filter((h) => hexDistance({ r, c }, h) === n);
}

export function line(a, b) {
  const p = toCube(a.r, a.c), q = toCube(b.r, b.c);
  const n = Math.max(Math.abs(p.x - q.x), Math.abs(p.y - q.y), Math.abs(p.z - q.z));
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = n === 0 ? 0 : i / n;
    const fx = p.x + (q.x - p.x) * t + 1e-6, fy = p.y + (q.y - p.y) * t + 2e-6, fz = p.z + (q.z - p.z) * t - 3e-6;
    let rx = Math.round(fx), ry = Math.round(fy), rz = Math.round(fz);
    const dx = Math.abs(rx - fx), dy = Math.abs(ry - fy), dz = Math.abs(rz - fz);
    if (dx > dy && dx > dz) rx = -ry - rz; else if (dy > dz) ry = -rx - rz; else rz = -rx - ry;
    out.push(fromCube({ x: rx, y: ry, z: rz }));
  }
  return out;
}
